import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@/utils/supabase/server';
import { SHIPPING_FLAT_EUR, PLATFORM_FEE_RATE } from '@/lib/constants';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items } = body;

        // Support both single producerId (legacy) and array producerIds
        const producerIds: string[] = body.producerIds || (body.producerId ? [body.producerId] : []);

        if (!items || items.length === 0 || producerIds.length === 0) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Ensure user is authenticated
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Debes iniciar sesión para comprar' }, { status: 401 });
        }

        // Re-calculate totals from DB to be safe
        const productIds = items.map((i: { id: string }) => i.id);
        const { data: dbProducts } = await supabase.from('products').select('*').in('id', productIds);

        if (!dbProducts) throw new Error('Products not found');

        let subtotal = 0;
        items.forEach((item: { id: string, quantity: number }) => {
            const dbProd = dbProducts.find(p => p.id === item.id);
            if (dbProd) {
                subtotal += dbProd.price * item.quantity;
            }
        });

        const shipping = SHIPPING_FLAT_EUR;
        const totalAmount = subtotal + shipping;

        // Build PaymentIntent params
        const paymentIntentParams: {
            amount: number;
            currency: string;
            metadata: Record<string, string>;
            application_fee_amount?: number;
            transfer_data?: { destination: string };
        } = {
            amount: Math.round(totalAmount * 100), // in cents
            currency: 'eur',
            metadata: {
                producerIds: producerIds.join(','),
                userId: user.id,
                cart: JSON.stringify(items.map((i: { id: string; quantity: number }) => ({ i: i.id, q: i.quantity }))).slice(0, 500)
            }
        };

        // If there is only one producer and they have Stripe Connect, use split payments
        // For multi-producer orders, platform collects and distributes manually (or via separate transfers)
        if (producerIds.length === 1) {
            const { data: producer } = await supabase.from('producers').select('stripe_account_id').eq('id', producerIds[0]).single();

            if (producer?.stripe_account_id) {
                const applicationFeeAmount = Math.round(totalAmount * PLATFORM_FEE_RATE * 100);
                paymentIntentParams.application_fee_amount = applicationFeeAmount;
                paymentIntentParams.transfer_data = {
                    destination: producer.stripe_account_id,
                };
            }
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: unknown) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
