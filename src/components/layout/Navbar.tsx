'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Navbar() {
    return (
        <nav className="w-full bg-brand-background border-b border-brand-primary/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-serif font-bold text-brand-primary">
                            De la Finca
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/productores" className="text-brand-text hover:text-brand-primary font-medium transition-colors">
                            Productores
                        </Link>
                        <Link href="/nosotros" className="text-brand-text hover:text-brand-primary font-medium transition-colors">
                            Cómo funciona
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/carrito" className="text-brand-text hover:text-brand-primary transition-colors p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" size="sm">Entrar</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
