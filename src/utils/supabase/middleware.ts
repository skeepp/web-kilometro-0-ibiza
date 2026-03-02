import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options: _options }) =>
                        supabaseResponse.cookies.set(name, value, _options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Here we can enforce auth guards based on the request URL
    const pathname = request.nextUrl.pathname

    // Check if it's an admin or producer route, accounting for locale prefix (e.g., /es/admin)
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/es/admin')
    const isProducerRoute = pathname.startsWith('/productor') || pathname.startsWith('/es/productor')

    if (!user && (isAdminRoute || isProducerRoute)) {
        const url = request.nextUrl.clone()
        // Extract locale if present in the path, default to 'es'
        const locale = pathname.startsWith('/es') ? 'es' : 'es'
        url.pathname = `/${locale}/login`
        return NextResponse.redirect(url)
    }

    // Basic check for roles via Supabase profiles table can be complex in Edge middleware
    // We can just rely on RLS for data protection and protect basic UI access at component level if required

    return supabaseResponse
}
