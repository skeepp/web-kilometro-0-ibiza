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
            router.push('/carrito');
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-serif font-bold text-brand-primary mb-8">Checkout Seguro</h1>

            <div className="bg-white rounded-2xl shadow-soft p-8 border border-brand-primary/10">
                <h2 className="text-xl font-bold mb-4">Resumen</h2>
                <div className="flex justify-between font-medium text-brand-text mb-8">
                    <span>{items.length} artículos + envío</span>
                    <span>{totalAmount.toFixed(2)}€</span>
                </div>

                {clientSecret ? (
                    <Elements options={{ clientSecret, appearance }} stripe={getStripe()}>
                        <CheckoutForm amount={totalAmount} />
                    </Elements>
                ) : (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
