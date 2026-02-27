import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </CartProvider>
    );
}
