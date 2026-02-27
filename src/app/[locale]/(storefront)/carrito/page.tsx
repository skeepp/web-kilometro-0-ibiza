'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { SHIPPING_FLAT_EUR } from '@/lib/constants';

export default function CartPage() {
    const { items, updateQuantity, removeItem, cartTotal, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center">
                <div className="text-6xl mb-6">🛒</div>
                <h1 className="text-3xl font-serif font-bold text-brand-primary mb-4">Tu carrito está vacío</h1>
                <p className="text-brand-text/70 mb-8">Aún no has añadido ningún producto artesanal a tu carrito.</p>
                <Link href="/productores">
                    <Button>Descubrir productores locales</Button>
                </Link>
            </div>
        );
    }

    const producerName = items[0]?.producerName;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-serif font-bold text-brand-primary mb-2">Tu Carrito</h1>
            <p className="text-brand-text/70 mb-8">Pedido a: <span className="font-bold text-brand-primary">{producerName}</span></p>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-2xl shadow-sm border border-brand-primary/10 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <li key={item.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-brand-background rounded-lg flex items-center justify-center text-2xl">
                                            📦
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-brand-text">{item.name}</h3>
                                            <p className="text-sm text-brand-text/60">{item.price}€ / {item.unit}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-gray-500 hover:text-brand-primary transition-colors">-</button>
                                            <span className="px-2 font-medium w-8 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-gray-500 hover:text-brand-primary transition-colors">+</button>
                                        </div>

                                        <div className="font-bold w-16 text-right">
                                            {(item.price * item.quantity).toFixed(2)}€
                                        </div>

                                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                            <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Vaciar carrito</button>
                            <Link href="/productores" className="text-sm text-brand-primary hover:underline">Continuar comprando</Link>
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/3">
                    <div className="bg-white rounded-2xl shadow-sm border border-brand-primary/10 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-brand-primary mb-6">Resumen del pedido</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-brand-text/80">
                                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} productos)</span>
                                <span>{cartTotal.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-brand-text/80">
                                <span>Gastos de envío estimados</span>
                                <span>{SHIPPING_FLAT_EUR.toFixed(2)}€</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-lg font-bold text-brand-text mb-8 pt-4 border-t border-gray-100">
                            <span>Total</span>
                            <span>{(cartTotal + SHIPPING_FLAT_EUR).toFixed(2)}€</span>
                        </div>

                        <Link href="/checkout" className="block w-full">
                            <Button fullWidth size="lg">Ir al pago</Button>
                        </Link>

                        <p className="text-xs text-center text-brand-text/50 mt-4">
                            Impuestos incluidos. Envío calculado en el checkout.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
