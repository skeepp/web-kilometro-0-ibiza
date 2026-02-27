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
                return_url: `${window.location.origin}/checkout/gracias`,
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
            {error && <div className="text-sm text-red-500 mt-2 p-3 bg-red-50 rounded-xl">{error}</div>}
            <Button
                type="submit"
                fullWidth
                disabled={!stripe || isLoading}
                variant="primary"
            >
                {isLoading ? 'Procesando...' : `Pagar ${amount.toFixed(2)}€`}
            </Button>
        </form>
    );
}
