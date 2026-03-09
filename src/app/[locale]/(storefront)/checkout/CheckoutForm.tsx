'use client';

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';

export function CheckoutForm({ amount }: { amount: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);
        setError(null);

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL where the customer should be redirected after the payment completes.
                return_url: `${window.location.origin}/es/checkout/gracias`,
            },
        });

        if (submitError) {
            setError(submitError.message || 'Ocurrió un error inesperado con el pago.');
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement options={{ layout: 'tabs' }} />
            {error && (
                <div className="text-sm text-red-600 mt-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2 flex items-start gap-3">
                    <span className="text-lg mt-0.5">⚠️</span>
                    <p>{error}</p>
                </div>
            )}
            <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={!stripe || isLoading}
                variant="primary"
                className="!mt-8 text-lg font-medium shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 relative overflow-hidden group"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        `Pagar Seguro • ${amount.toFixed(2)}€`
                    )}
                </span>
                <div className="absolute inset-0 h-full w-full scale-[0] rounded-2xl transition-all duration-300 group-hover:scale-[2.5] group-hover:bg-white/10 z-0"></div>
            </Button>
        </form>
    );
}
