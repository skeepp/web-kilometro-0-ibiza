'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useCart } from '@/context/CartContext';

export default function GraciasPage() {
    const { clearCart } = useCart();

    // Clear the cart after successful payment
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-[calc(100vh-280px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg text-center">
                <div className="text-6xl mb-6">🎉</div>

                <Card>
                    <CardContent className="p-10">
                        <h1 className="text-3xl font-serif font-bold text-brand-primary mb-4">
                            ¡Gracias por tu pedido!
                        </h1>
                        <p className="text-brand-text/70 mb-2">
                            Tu pago se ha procesado correctamente.
                        </p>
                        <p className="text-brand-text/70 mb-8">
                            El productor recibirá tu pedido y comenzará a prepararlo.
                            Recibirás un email de confirmación en breve.
                        </p>

                        <div className="bg-brand-primary/5 rounded-xl p-4 mb-8 border border-brand-primary/10">
                            <p className="text-sm text-brand-text/60">
                                Puedes revisar el estado de tu pedido en cualquier momento desde tu cuenta.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/es/cuenta">
                                <Button variant="primary">Ver mis pedidos</Button>
                            </Link>
                            <Link href="/es/productores">
                                <Button variant="outline">Seguir comprando</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
