'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

import { User } from '@supabase/supabase-js';

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        const fetchProfile = async (userId: string) => {
            const { data } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
            setAvatarUrl(data?.avatar_url || null);
        };

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) {
                fetchProfile(user.id);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setAvatarUrl(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <nav className="w-full bg-brand-background border-b border-brand-primary/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/es" className="text-2xl font-serif font-bold text-brand-primary">
                            De la Finca
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/es/productores" className="text-brand-text hover:text-brand-primary font-medium transition-colors">
                            Productores
                        </Link>
                        <Link href="/es/nosotros" className="text-brand-text hover:text-brand-primary font-medium transition-colors">
                            Cómo funciona
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/es/carrito" className="text-brand-text hover:text-brand-primary transition-colors p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </Link>

                        {!loading ? (
                            user ? (
                                <Link href="/es/cuenta" className="flex items-center justify-center overflow-hidden rounded-full w-9 h-9 border border-brand-primary/20 bg-brand-background shadow-sm hover:ring-2 hover:ring-brand-primary/50 transition-all">
                                    {avatarUrl ? (
                                        <Image
                                            src={avatarUrl}
                                            alt="Perfil del usuario"
                                            width={36}
                                            height={36}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-brand-text/50">
                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </Link>
                            ) : (
                                <Link href="/es/login" className="px-4 py-2 text-sm font-medium border border-brand-primary/20 bg-transparent text-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors">
                                    Entrar
                                </Link>
                            )
                        ) : (
                            <div className="w-[83px] h-[36px]"></div> /* Placeholder to prevent layout shift */
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
