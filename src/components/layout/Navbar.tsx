'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { useCart } from '@/context/CartContext';
import { AnimatedBasket } from '@/components/ui/AnimatedBasket';

export function Navbar({ user, avatarUrl, role }: { user: User | null; avatarUrl: string | null; role: string | null }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { items } = useCart();
    const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

    let profileUrl = '/es/cuenta';
    if (role === 'producer') {
        profileUrl = '/es/productor/dashboard';
    } else if (role === 'admin') {
        profileUrl = '/es/admin';
    }

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/es/mercado', label: 'Mercado', icon: '🛒' },
        { href: '/es/productores', label: 'Productores', icon: '👨‍🌾' },
        { href: '/es/radar', label: 'Radar', icon: '📡' },
        { href: '/es/calendario', label: 'Calendario', icon: '📅' },
        { href: '/es/noticias', label: 'Noticias', icon: '📰' },
        { href: '/es/nosotros', label: 'Cómo funciona', icon: '💡' },
    ];

    const isActive = (href: string) => pathname?.startsWith(href);

    return (
        <nav className={`w-full sticky top-0 z-50 transition-all duration-500 ${
            scrolled
                ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_20px_rgba(45,106,79,0.08)] border-b border-brand-primary/5'
                : 'bg-brand-background/95 backdrop-blur-sm border-b border-brand-primary/10'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-[72px]">
                    <div className="flex-shrink-0 flex items-center min-w-0">
                        <Link href="/es" className="group flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl flex shrink-0 items-center justify-center text-white font-serif font-bold text-lg shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                                F
                            </div>
                            <span className="text-lg sm:text-xl font-serif font-bold text-brand-primary group-hover:text-brand-accent transition-colors duration-300 truncate">
                                De la Finca
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group flex items-center gap-1.5 ${
                                    isActive(link.href)
                                        ? 'text-brand-primary bg-brand-primary/8'
                                        : 'text-brand-text/70 hover:text-brand-primary hover:bg-brand-primary/5'
                                }`}
                            >
                                <span className="text-base group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                                <span>{link.label}</span>
                                {isActive(link.href) && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-gradient-to-r from-brand-primary to-brand-accent rounded-full" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2">
                        {/* Cart Button */}
                        <Link
                            href="/es/carrito"
                            className={`relative p-2.5 rounded-xl transition-all duration-300 group ${
                                isActive('/es/carrito')
                                    ? 'bg-brand-primary/10 text-brand-primary'
                                    : 'text-brand-text/60 hover:text-brand-primary hover:bg-brand-primary/5'
                            }`}
                        >
                            <AnimatedBasket count={cartCount} />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-brand-accent to-brand-primary text-white rounded-full px-1.5 shadow-sm animate-in zoom-in-50 duration-200">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Avatar / Login */}
                        {user ? (
                            <Link
                                href={profileUrl}
                                className="hidden md:flex items-center justify-center overflow-hidden rounded-xl w-10 h-10 border-2 border-brand-primary/15 bg-white shadow-sm hover:border-brand-accent hover:shadow-md hover:scale-105 transition-all duration-300"
                            >
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt="Perfil del usuario"
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-brand-primary/50">
                                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </Link>
                        ) : (
                            <Link
                                href="/es/login"
                                className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-2 border-brand-primary/20 bg-white text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z" clipRule="evenodd" />
                                </svg>
                                Entrar
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <div className="flex items-center md:hidden ml-1">
                            <button
                                type="button"
                                className={`p-2.5 rounded-xl transition-all duration-300 ${
                                    isMobileMenuOpen
                                        ? 'bg-brand-primary/10 text-brand-primary'
                                        : 'text-brand-text/60 hover:text-brand-primary hover:bg-brand-primary/5'
                                }`}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <span className="sr-only">Abrir menú</span>
                                {!isMobileMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-y-auto transition-all duration-500 ease-in-out ${
                isMobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="bg-white/95 backdrop-blur-xl border-t border-brand-primary/5 shadow-lg">
                    <div className="px-4 pt-3 pb-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                                    isActive(link.href)
                                        ? 'text-brand-primary bg-brand-primary/8'
                                        : 'text-brand-text/70 hover:text-brand-primary hover:bg-brand-primary/5'
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="text-xl">{link.icon}</span>
                                <span>{link.label}</span>
                                {isActive(link.href) && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-brand-accent" />
                                )}
                            </Link>
                        ))}

                        <div className="border-t border-brand-primary/10 pt-3 mt-2">
                            {user ? (
                                <Link
                                    href={profileUrl}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-brand-primary bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 border border-brand-primary/10 hover:border-brand-accent/30 transition-all"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className="text-xl">👤</span>
                                    Mi Cuenta
                                </Link>
                            ) : (
                                <Link
                                    href="/es/login"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:shadow-lg transition-all"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
