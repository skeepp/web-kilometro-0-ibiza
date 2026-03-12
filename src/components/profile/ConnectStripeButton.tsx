'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function ConnectStripeButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/stripe/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                setError(data.error);
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Error connecting Stripe:', err);
            setError('Error de conexión. Inténtalo de nuevo.');
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <Button
                onClick={handleConnect}
                disabled={isLoading}
                variant="primary"
                size="sm"
                className="bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Conectando...
                    </span>
                ) : (
                    '💳 Conectar con Stripe'
                )}
            </Button>
            {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
        </div>
    );
}
