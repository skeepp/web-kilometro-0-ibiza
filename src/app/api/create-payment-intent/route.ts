import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@/utils/supabase/server';
import { getRetailPrice } from '@/lib/constants';

import Stripe from 'stripe';

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

        let subtotalRetail = 0;
        
        items.forEach((item: { id: string, quantity: number }) => {
            const dbProd = dbProducts.find(p => p.id === item.id);
            if (dbProd) {
                // Retail amount (+ markup)
                subtotalRetail += getRetailPrice(dbProd.price) * item.quantity;
            }
        });

        // Click & Collect: no shipping, customer pays retail price only
        const totalAmount = subtotalRetail;
        
        // Generate a unique transfer group for this multi-vendor cart
        const transferGroup = `CART_${Date.now()}_${user.id.slice(0, 8)}`;

        // Build PaymentIntent params
        const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
            amount: Math.round(totalAmount * 100), // in cents
            currency: 'eur',
            transfer_group: transferGroup,
            metadata: {
                producerIds: producerIds.join(','),
                userId: user.id,
                cart: JSON.stringify(items.map((i: { id: string; quantity: number }) => ({ i: i.id, q: i.quantity }))).slice(0, 500)
            }
        };

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: unknown) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
