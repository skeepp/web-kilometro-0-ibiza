import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let avatarUrl = null;
    let role = null;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('avatar_url, role').eq('id', user.id).single();
        avatarUrl = profile?.avatar_url || null;
        role = profile?.role || null;
    }

    return (
        <CartProvider>
            <div className="flex flex-col min-h-screen">
                <Navbar user={user} avatarUrl={avatarUrl} role={role} />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </CartProvider>
    );
}
