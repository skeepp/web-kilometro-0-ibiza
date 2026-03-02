import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@supabase/supabase-js';
import { PLATFORM_FEE_RATE, SHIPPING_FLAT_EUR } from '@/lib/constants';
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

    const { producerId, userId, cart } = paymentIntent.metadata;

    if (!producerId || !userId || !cart) {
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

    // Check if order already exists for this payment intent (idempotency)
    const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .maybeSingle();

    if (existingOrder) {
        console.log(`ℹ️ Order already exists for PaymentIntent ${paymentIntent.id}, skipping.`);
        return;
    }

    // Fetch product details from DB for accurate pricing
    const productIds = cartItems.map(item => item.i);
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, unit')
        .in('id', productIds);

    if (!products || products.length === 0) {
        console.error('❌ Products not found for cart items:', productIds);
        return;
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = cartItems.map(cartItem => {
        const product = products.find(p => p.id === cartItem.i);
        if (!product) return null;

        const itemSubtotal = product.price * cartItem.q;
        subtotal += itemSubtotal;

        return {
            product_id: product.id,
            product_name: product.name,
            quantity: cartItem.q,
            unit_price: product.price,
            subtotal: itemSubtotal,
        };
    }).filter(Boolean);

    const shippingCost = SHIPPING_FLAT_EUR;
    const total = subtotal + shippingCost;
    const platformFee = total * PLATFORM_FEE_RATE;

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

    // Insert the order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            consumer_id: userId,
            producer_id: producerId,
            status: 'pending',
            delivery_name: profile?.full_name || 'Cliente',
            delivery_address: address?.full_address || 'Dirección pendiente',
            delivery_phone: profile?.phone || null,
            subtotal: subtotal,
            shipping_cost: shippingCost,
            platform_fee: platformFee,
            total: total,
            stripe_payment_intent_id: paymentIntent.id,
        })
        .select('id')
        .single();

    if (orderError || !order) {
        console.error('❌ Failed to create order:', orderError?.message);
        return;
    }

    // Insert order items
    const itemsWithOrderId = orderItemsData.map(item => ({
        ...item,
        order_id: order.id,
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId);

    if (itemsError) {
        console.error('❌ Failed to insert order items:', itemsError.message);
    }

    console.log(`✅ Order ${order.id} created for PaymentIntent ${paymentIntent.id}`);

    // Send email notifications (fire-and-forget, don't block the response)
    try {
        // Get consumer email from Supabase Auth
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        const consumerEmail = authUser?.user?.email;

        if (consumerEmail) {
            await sendOrderConfirmationConsumer(consumerEmail, order.id, total.toFixed(2));
        }

        // Get producer email
        const { data: producer } = await supabase
            .from('producers')
            .select('user_id')
            .eq('id', producerId)
            .single();

        if (producer) {
            const { data: producerAuth } = await supabase.auth.admin.getUserById(producer.user_id);
            const producerEmail = producerAuth?.user?.email;

            if (producerEmail) {
                await sendOrderNotificationProducer(producerEmail, order.id);
            }
        }
    } catch (emailError) {
        // Don't fail the webhook because of email errors
        console.error('⚠️ Email notification failed (non-critical):', emailError);
    }
}
