import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { createClient } from '@/utils/supabase/server';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let avatarUrl = null;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
        avatarUrl = profile?.avatar_url || null;
    }

    return (
        <CartProvider>
            <div className="flex flex-col min-h-screen">
                <Navbar user={user} avatarUrl={avatarUrl} />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </CartProvider>
    );
}
