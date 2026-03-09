'use client';

import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/utils/stripe/client';
import { useCart } from '@/context/CartContext';
import { CheckoutForm } from './CheckoutForm';
import { useRouter } from 'next/navigation';
import { SHIPPING_FLAT_EUR } from '@/lib/constants';

export default function CheckoutPage() {
    const { items, cartTotal } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (items.length === 0) {
            router.push('/es/carrito');
            return;
        }

        const producerId = items[0].producerId;

        // Fetch intent
        fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, producerId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else if (data.error) {
                    console.error('Error:', data.error);
                }
            })
            .catch(err => console.error(err));
    }, [items, router]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#2D6A4F',
            colorBackground: '#ffffff',
            colorText: '#1A1A1A',
        },
    };

    const totalAmount = cartTotal + SHIPPING_FLAT_EUR;

    return (
        <div className="min-h-[calc(100vh-100px)] bg-gradient-to-b from-brand-background/30 to-white py-12 md:py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/5 blur-[100px] pointer-events-none rounded-full" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-primary text-balance mb-3">Finalizar Compra</h1>
                    <p className="text-brand-text/70 text-lg">Completa tu pago de forma segura a través de Stripe.</p>
                </div>

                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 border border-brand-primary/10">
                    <h2 className="text-xl font-bold mb-6 text-brand-primary flex items-center gap-2">
                        <span className="text-2xl">🔒</span> Resumen del Pedido
                    </h2>
                    <div className="flex justify-between items-center bg-brand-background/30 p-4 rounded-xl mb-8 border border-brand-primary/10">
                        <span className="font-medium text-brand-text/80">{items.reduce((a, b) => a + b.quantity, 0)} artículos + envío</span>
                        <span className="text-xl font-bold text-brand-primary">{totalAmount.toFixed(2)}€</span>
                    </div>

                    {clientSecret ? (
                        <Elements options={{ clientSecret, appearance }} stripe={getStripe()}>
                            <CheckoutForm amount={totalAmount} />
                        </Elements>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-16 gap-4">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-brand-accent border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-brand-text/50 font-medium">Preparando pago seguro...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
