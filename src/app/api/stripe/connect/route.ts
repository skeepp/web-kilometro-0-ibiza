import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // Get the producer record for this user
        const { data: producer } = await supabase
            .from('producers')
            .select('id, stripe_account_id, brand_name')
            .eq('user_id', user.id)
            .single();

        if (!producer) {
            return NextResponse.json({ error: 'No eres un productor registrado' }, { status: 403 });
        }

        let accountId = producer.stripe_account_id;

        // Create a Stripe Connect Express account if not already created
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'ES',
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
                metadata: {
                    producer_id: producer.id,
                    user_id: user.id,
                },
            });

            accountId = account.id;

            // Save the Stripe account ID to the producer record
            await supabase
                .from('producers')
                .update({ stripe_account_id: accountId })
                .eq('id', producer.id);
        }

        // Create an Account Link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'http://localhost:3000' : 'http://localhost:3000'}/api/stripe/connect/refresh?producer_id=${producer.id}`,
            return_url: `http://localhost:3000/es/productor/dashboard?stripe_onboarding=complete`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: unknown) {
        console.error('Error creating Stripe Connect account:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error desconocido' },
            { status: 500 }
        );
    }
}
