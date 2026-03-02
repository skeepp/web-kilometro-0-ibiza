import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@/utils/supabase/server';
import { SHIPPING_FLAT_EUR, PLATFORM_FEE_RATE } from '@/lib/constants';

export async function POST(request: Request) {
    try {
        const { items, producerId } = await request.json();

        if (!items || items.length === 0 || !producerId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Ensure user is authenticated, though we could allow guest checkout. Brief implies consumer registration.
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Debes iniciar sesión para comprar' }, { status: 401 });
        }

        // In a real app we'd verify item prices against DB. For MVP we'll trust the client total or re-calculate.
        // Let's re-calculate from DB to be safe
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

        // Split logic: Platform takes commission
        const applicationFeeAmount = Math.round(totalAmount * PLATFORM_FEE_RATE * 100);

        // Fetch producer's Stripe configuration
        const { data: producer } = await supabase.from('producers').select('stripe_account_id').eq('id', producerId).single();

        if (!producer || !producer.stripe_account_id) {
            return NextResponse.json({ error: 'El productor no puede recibir pagos actualmente.' }, { status: 400 });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // in cents
            currency: 'eur',
            application_fee_amount: applicationFeeAmount,
            transfer_data: {
                destination: producer.stripe_account_id,
            },
            metadata: {
                producerId,
                userId: user.id,
                cart: JSON.stringify(items.map((i: { id: string; quantity: number }) => ({ i: i.id, q: i.quantity }))).slice(0, 500)
            }
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: unknown) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
