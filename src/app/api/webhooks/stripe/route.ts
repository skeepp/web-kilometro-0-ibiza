import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@supabase/supabase-js';
import { SHIPPING_FLAT_EUR, getRetailPrice } from '@/lib/constants';
import { sendOrderConfirmationConsumer, sendOrderNotificationProducer } from '@/utils/resend/emails';
import Stripe from 'stripe';

// Use Supabase service role for webhook (no user session available)
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function POST(request: Request) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
        return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('⚠️ Stripe webhook signature verification failed:', message);
        return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            await handlePaymentSucceeded(paymentIntent);
            break;
        }
        default:
            // Unhandled event type — log and acknowledge
            console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const supabase = getSupabaseAdmin();

    const { userId, cart } = paymentIntent.metadata;

    if (!userId || !cart) {
        console.error('❌ Missing metadata on PaymentIntent:', paymentIntent.id);
        return;
    }

    // Parse the cart items from metadata
    let cartItems: { i: string; q: number }[];
    try {
        cartItems = JSON.parse(cart);
    } catch {
        console.error('❌ Failed to parse cart metadata:', cart);
        return;
    }

    // Check if an order already exists for this payment intent (idempotency)
    const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .limit(1);

    if (existingOrder && existingOrder.length > 0) {
        console.log(`ℹ️ Orders already exist for PaymentIntent ${paymentIntent.id}, skipping.`);
        return;
    }

    // Fetch product details from DB for accurate pricing
    const productIds = cartItems.map(item => item.i);
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, unit, producer_id')
        .in('id', productIds);

    if (!products || products.length === 0) {
        console.error('❌ Products not found for cart items:', productIds);
        return;
    }

    // Fetch user profile for delivery info
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', userId)
        .single();

    // Fetch the default address for the user
    const { data: address } = await supabase
        .from('addresses')
        .select('full_address')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

    // Group items by producer
    const itemsByProducer: Record<string, typeof cartItems> = {};
    cartItems.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.i);
        if (product && product.producer_id) {
            if (!itemsByProducer[product.producer_id]) itemsByProducer[product.producer_id] = [];
            itemsByProducer[product.producer_id].push(cartItem);
        }
    });

    const producerIds = Object.keys(itemsByProducer);
    
    // Distribute flat shipping cost evenly among producers for accounting
    const splitShipping = SHIPPING_FLAT_EUR / producerIds.length;

    // Process each producer's order
    for (const producerId of producerIds) {
        const producerCartItems = itemsByProducer[producerId];
        let producerNetSubtotal = 0;
        let producerRetailSubtotal = 0;

        const orderItemsData = producerCartItems.map(cartItem => {
            const product = products.find(p => p.id === cartItem.i)!;

            const netItemSubtotal = product.price * cartItem.q;
            const retailItemPrice = getRetailPrice(product.price);
            const retailItemSubtotal = retailItemPrice * cartItem.q;

            producerNetSubtotal += netItemSubtotal;
            producerRetailSubtotal += retailItemSubtotal;

            return {
                product_id: product.id,
                product_name: product.name,
                quantity: cartItem.q,
                unit_price: retailItemPrice, // Store retail price for customer view
                subtotal: retailItemSubtotal,
            };
        });

        const platformFee = Number((producerRetailSubtotal - producerNetSubtotal).toFixed(2));
        const total = Number((producerRetailSubtotal + splitShipping).toFixed(2));

        // Insert the order for this specific producer
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                consumer_id: userId,
                producer_id: producerId,
                status: 'pending',
                delivery_name: profile?.full_name || 'Cliente',
                delivery_address: address?.full_address || 'Dirección pendiente',
                delivery_phone: profile?.phone || null,
                subtotal: Number(producerNetSubtotal.toFixed(2)),
                shipping_cost: Number(splitShipping.toFixed(2)),
                platform_fee: platformFee, // This is the markup added
                total: total,
                stripe_payment_intent_id: paymentIntent.id,
            })
            .select('id')
            .single();

        if (orderError || !order) {
            console.error(`❌ Failed to create order for producer ${producerId}:`, orderError?.message);
            continue;
        }

        // Insert order items
        const itemsWithOrderId = orderItemsData.map(item => ({ ...item, order_id: order.id }));
        await supabase.from('order_items').insert(itemsWithOrderId);

        console.log(`✅ Order ${order.id} created for Producer ${producerId} (PaymentIntent ${paymentIntent.id})`);

        // Handle SEPARATE TRANSFERS via Stripe Connect using the transfer_group
        if (paymentIntent.transfer_group) {
            const { data: producer } = await supabase
                .from('producers')
                .select('stripe_account_id, user_id')
                .eq('id', producerId)
                .single();

            if (producer?.stripe_account_id) {
                try {
                    await stripe.transfers.create({
                        amount: Math.round(producerNetSubtotal * 100), // Transfer ONLY the pure net value to the producer
                        currency: 'eur',
                        destination: producer.stripe_account_id,
                        transfer_group: paymentIntent.transfer_group,
                        metadata: {
                            orderId: order.id,
                        }
                    });
                    console.log(`💸 Successfully transferred ${producerNetSubtotal}€ to account ${producer.stripe_account_id}`);
                } catch (transferErr) {
                    console.error(`❌ Failed to transfer funds to producer ${producerId}:`, transferErr);
                }
            }

            // Fire and forget email notifications
            try {
                // Get consumer email
                const { data: authUser } = await supabase.auth.admin.getUserById(userId);
                if (authUser?.user?.email) {
                    await sendOrderConfirmationConsumer(authUser.user.email, order.id, total.toFixed(2));
                }

                if (producer?.user_id) {
                    const { data: producerAuth } = await supabase.auth.admin.getUserById(producer.user_id);
                    if (producerAuth?.user?.email) {
                        await sendOrderNotificationProducer(producerAuth.user.email, order.id);
                    }
                }
            } catch (emailError) {
                console.error('⚠️ Email notification failed (non-critical):', emailError);
            }
        }
    }
}
