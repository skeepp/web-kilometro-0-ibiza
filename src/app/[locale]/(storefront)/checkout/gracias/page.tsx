'use client';

import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { useCart } from '@/context/CartContext';

export default function GraciasPage() {
    const { clearCart } = useCart();
    const params = useParams();
    const locale = params?.locale as string || 'es';
    const hasCleared = useRef(false);

    // Clear the cart after successful payment (only once)
    useEffect(() => {
        if (!hasCleared.current) {
            hasCleared.current = true;
            clearCart();
        }
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
                            Cada productor recibirá tu pedido y empezará a prepararlo.
                            Te avisaremos por email cuando esté listo para recoger.
                        </p>

                        <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
                            <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-2">
                                <span>📍</span> Recogida en Tienda
                            </div>
                            <p className="text-xs text-green-600">
                                Recibirás un código QR de recogida por email. Preséntalo al productor cuando vayas a recoger.
                            </p>
                        </div>

                        <div className="bg-brand-primary/5 rounded-xl p-4 mb-8 border border-brand-primary/10">
                            <p className="text-sm text-brand-text/60">
                                Puedes revisar el estado y código de recogida de cada pedido en tu cuenta.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href={`/${locale}/cuenta`}
                                className="inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-background bg-brand-primary text-brand-background hover:bg-brand-accent shadow-soft focus:ring-brand-accent h-11 px-6 text-base"
                            >
                                Ver mis pedidos
                            </Link>
                            <Link
                                href={`/${locale}/productores`}
                                className="inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-background border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-background focus:ring-brand-primary h-11 px-6 text-base"
                            >
                                Seguir comprando
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
