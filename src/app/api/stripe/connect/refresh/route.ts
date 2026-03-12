import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const producerId = request.nextUrl.searchParams.get('producer_id');

        if (!producerId) {
            return NextResponse.redirect(new URL('/es/productor/dashboard', request.url));
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL('/es/login', request.url));
        }

        // Verify this user owns the producer record
        const { data: producer } = await supabase
            .from('producers')
            .select('id, stripe_account_id')
            .eq('id', producerId)
            .eq('user_id', user.id)
            .single();

        if (!producer || !producer.stripe_account_id) {
            return NextResponse.redirect(new URL('/es/productor/dashboard', request.url));
        }

        // Generate a new onboarding link
        const accountLink = await stripe.accountLinks.create({
            account: producer.stripe_account_id,
            refresh_url: `http://localhost:3000/api/stripe/connect/refresh?producer_id=${producer.id}`,
            return_url: `http://localhost:3000/es/productor/dashboard?stripe_onboarding=complete`,
            type: 'account_onboarding',
        });

        return NextResponse.redirect(accountLink.url);
    } catch (error) {
        console.error('Error refreshing Stripe onboarding link:', error);
        return NextResponse.redirect(new URL('/es/productor/dashboard?stripe_error=true', request.url));
    }
}
