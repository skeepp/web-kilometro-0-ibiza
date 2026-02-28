import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Handles the Supabase email confirmation callback.
 * When a user clicks the confirmation link in their email,
 * Supabase redirects them here with a `code` query parameter.
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/cuenta';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // If there's no code or an error occurred, redirect to login
    return NextResponse.redirect(`${origin}/login`);
}
