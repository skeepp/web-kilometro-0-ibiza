import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const intlMiddleware = createMiddleware({
    locales: ['es'],
    defaultLocale: 'es'
});

export async function middleware(request: NextRequest) {
    // 1. Run the next-intl middleware first (handles locale routing)
    const intlResponse = intlMiddleware(request);

    // 2. Refresh Supabase session on every request (keeps auth alive)
    //    We call updateSession but only use the Supabase response if it's a redirect (auth guard)
    const supabaseResponse = await updateSession(request);

    // If the Supabase middleware decided to redirect (e.g., unauthenticated user on /admin), use that
    if (supabaseResponse.headers.get('location')) {
        return supabaseResponse;
    }

    // Otherwise return the intl response (which handles locale rewrites)
    return intlResponse;
}

export const config = {
    matcher: ['/', '/(es)/:path*']
};
