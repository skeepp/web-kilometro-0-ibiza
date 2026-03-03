'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';

export function Navbar({ user, avatarUrl }: { user: User | null; avatarUrl: string | null }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                        <Link href="/es/mercado" className="text-brand-text hover:text-brand-primary font-medium transition-colors">
                            Mercado
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

                        {user ? (
                            <Link href="/es/cuenta" className="hidden md:flex items-center justify-center overflow-hidden rounded-full w-9 h-9 border border-brand-primary/20 bg-brand-background shadow-sm hover:ring-2 hover:ring-brand-primary/50 transition-all">
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
                            <Link href="/es/login" className="hidden md:flex px-4 py-2 text-sm font-medium border border-brand-primary/20 bg-transparent text-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors">
                                Login
                            </Link>
                        )}

                        {/* Botón de Menú Móvil */}
                        <div className="flex items-center md:hidden ml-2">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-brand-text hover:text-brand-primary focus:outline-none"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <span className="sr-only">Abrir menú</span>
                                {!isMobileMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menú Móvil Desplegable */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-brand-primary/10 bg-brand-background shadow-lg absolute w-full left-0">
                    <div className="px-4 pt-2 pb-4 space-y-2">
                        <Link
                            href="/es/productores"
                            className="block px-3 py-2 rounded-md text-base font-medium text-brand-text hover:text-brand-primary hover:bg-brand-primary/5"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Productores
                        </Link>

                        <Link
                            href="/es/nosotros"
                            className="block px-3 py-2 rounded-md text-base font-medium text-brand-text hover:text-brand-primary hover:bg-brand-primary/5"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Cómo funciona
                        </Link>

                        <div className="border-t border-brand-primary/10 pt-4 mt-2">
                            {user ? (
                                <Link
                                    href="/es/cuenta"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 text-center border border-brand-primary/20"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Mi Cuenta
                                </Link>
                            ) : (
                                <Link
                                    href="/es/login"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-brand-primary hover:bg-brand-primary/90 text-center"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

