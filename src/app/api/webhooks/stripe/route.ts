import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@supabase/supabase-js';
import { getRetailPrice, generatePickupCode } from '@/lib/constants';
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

    // Fetch all producer details (including pickup_address)
    const { data: allProducers } = await supabase
        .from('producers')
        .select('id, brand_name, stripe_account_id, user_id, pickup_address, municipality')
        .in('id', producerIds);

    // Process each producer's order
    for (const producerId of producerIds) {
        const producerCartItems = itemsByProducer[producerId];
        const producerData = allProducers?.find(p => p.id === producerId);
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
                unit_price: retailItemPrice,
                subtotal: retailItemSubtotal,
            };
        });

        const platformFee = Number((producerRetailSubtotal - producerNetSubtotal).toFixed(2));
        const total = Number(producerRetailSubtotal.toFixed(2)); // No shipping in Click & Collect!
        const pickupCode = generatePickupCode();
        const pickupAddress = producerData?.pickup_address || producerData?.municipality || 'Dirección pendiente';

        // Insert the order for this specific producer
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                consumer_id: userId,
                producer_id: producerId,
                status: 'paid', // Click & Collect: starts as 'paid'
                delivery_name: profile?.full_name || 'Cliente',
                delivery_address: pickupAddress, // Store pickup address
                delivery_phone: profile?.phone || null,
                subtotal: Number(producerNetSubtotal.toFixed(2)),
                shipping_cost: 0, // No shipping in Click & Collect
                platform_fee: platformFee,
                total: total,
                stripe_payment_intent_id: paymentIntent.id,
                pickup_code: pickupCode,
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

        console.log(`✅ Order ${order.id} created for Producer ${producerId} | Pickup Code: ${pickupCode}`);

        // NOTE: Stripe transfers are now DEFERRED until status changes to 'ready_pickup'
        // This is handled in updateOrderStatus.ts

        // Fire and forget email notifications
        try {
            // Get consumer email
            const { data: authUser } = await supabase.auth.admin.getUserById(userId);
            if (authUser?.user?.email) {
                await sendOrderConfirmationConsumer(
                    authUser.user.email,
                    order.id,
                    total.toFixed(2),
                    pickupCode,
                    pickupAddress,
                    producerData?.brand_name || 'Productor'
                );
            }

            if (producerData?.user_id) {
                const { data: producerAuth } = await supabase.auth.admin.getUserById(producerData.user_id);
                if (producerAuth?.user?.email) {
                    await sendOrderNotificationProducer(producerAuth.user.email, order.id);
                }
            }
        } catch (emailError) {
            console.error('⚠️ Email notification failed (non-critical):', emailError);
        }
    }
}
