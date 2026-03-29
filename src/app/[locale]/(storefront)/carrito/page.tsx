'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { SHIPPING_FLAT_EUR } from '@/lib/constants';
import { getDummyProductImage } from '@/utils/dummyImages';

export default function CartPage() {
    const { items, updateQuantity, removeItem, cartTotal, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-40 h-40 mb-8 relative mix-blend-multiply">
                    <Image src="/basket-empty.png" alt="Cesta vacía" fill className="object-contain" sizes="160px" />
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-primary mb-6 text-balance">Tu carrito está vacío</h1>
                <p className="text-brand-text/70 text-lg mb-10 text-pretty">Aún no has añadido ningún producto artesanal a tu carrito.</p>
                <Link href="/es/productores">
                    <Button size="lg" className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">Descubrir productores locales</Button>
                </Link>
            </div>
        );
    }

    // Group items by producer
    const groupedByProducer = items.reduce<Record<string, typeof items>>((groups, item) => {
        const key = item.producerId;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
    }, {});

    const producerGroups = Object.entries(groupedByProducer);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary mb-3 text-balance">Tu Carrito</h1>
            <p className="text-brand-text/70 mb-10 text-lg">
                {producerGroups.length === 1
                    ? <>Pedido a: <span className="font-bold text-brand-primary bg-brand-background px-3 py-1 rounded-full border border-brand-primary/10">{producerGroups[0][1][0].producerName}</span></>
                    : <>{producerGroups.length} productores · {items.reduce((acc, i) => acc + i.quantity, 0)} artículos</>
                }
            </p>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-2/3 space-y-6">
                    {producerGroups.map(([producerId, producerItems]) => (
                        <div key={producerId} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-soft border border-brand-primary/10 overflow-hidden">
                            {/* Producer header */}
                            <div className="px-6 py-4 bg-brand-background/40 border-b border-brand-primary/10 flex items-center gap-3">
                                {producerItems[0].producerImage ? (
                                    <div className="relative w-10 h-10 rounded-full border border-brand-primary/20 overflow-hidden shadow-sm flex-shrink-0">
                                        <Image src={producerItems[0].producerImage} alt={producerItems[0].producerName} fill className="object-cover" sizes="40px" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-lg flex-shrink-0">👨‍🌾</div>
                                )}
                                <div>
                                    <h3 className="font-bold text-brand-primary line-clamp-1">{producerItems[0].producerName}</h3>
                                    <p className="text-xs text-brand-text/50">{producerItems.reduce((acc, i) => acc + i.quantity, 0)} artículos · {producerItems.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)}€</p>
                                </div>
                            </div>

                            {/* Products list */}
                            <ul className="divide-y divide-brand-primary/5 overflow-hidden">
                                <AnimatePresence mode="popLayout">
                                    {producerItems.map((item) => (
                                        <motion.li
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, x: -20, transition: { duration: 0.2 } }}
                                            transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
                                            className="p-6 flex items-center justify-between bg-white"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="relative w-16 h-16 bg-brand-background rounded-lg flex items-center justify-center text-2xl overflow-hidden border border-brand-primary/10 flex-shrink-0">
                                                    {item.image || getDummyProductImage(item.name, item.id) ? (
                                                        <Image src={item.image || getDummyProductImage(item.name, item.id)} alt={item.name} fill className="object-cover" sizes="64px" />
                                                    ) : (
                                                        <span>📦</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-brand-text">{item.name}</h3>
                                                    <p className="text-sm text-brand-text/60">{item.price}€ / {item.unit}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                                <div className="flex items-center border border-brand-primary/20 rounded-lg bg-white shadow-sm overflow-hidden">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-4 py-1.5 text-gray-500 hover:text-brand-primary hover:bg-brand-background transition-colors">-</button>
                                                    <span className="px-2 font-medium w-10 text-center border-x border-brand-primary/10">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-4 py-1.5 text-gray-500 hover:text-brand-primary hover:bg-brand-background transition-colors">+</button>
                                                </div>

                                                <div className="font-bold w-full sm:w-20 sm:text-right text-lg text-brand-primary">
                                                    {(item.price * item.quantity).toFixed(2)}€
                                                </div>

                                                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                </button>
                                            </div>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        </div>
                    ))}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
                        <button onClick={clearCart} className="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">Vaciar carrito</button>
                        <Link href="/es/productores" className="text-sm font-medium text-brand-primary hover:text-brand-accent px-4 py-2 hover:bg-white rounded-lg transition-colors border border-transparent shadow-sm bg-white/50">Continuar comprando &rarr;</Link>
                    </div>
                </div>

                <div className="lg:w-1/3">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-brand-primary/10 p-6 md:p-8 sticky top-24">
                        <h2 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                            <span className="text-2xl">🧾</span> Resumen
                        </h2>

                        <div className="space-y-4 mb-6">
                            {/* Per-producer subtotals */}
                            {producerGroups.map(([producerId, producerItems]) => (
                                <div key={producerId} className="flex justify-between text-sm text-brand-text/70 pb-2">
                                    <span className="truncate mr-2">👨‍🌾 {producerItems[0].producerName}</span>
                                    <span className="font-medium whitespace-nowrap">{producerItems.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)}€</span>
                                </div>
                            ))}

                            <div className="flex justify-between text-brand-text border-t border-brand-primary/5 pt-4">
                                <span>Subtotal <span className="text-brand-text/50">({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span></span>
                                <span className="font-medium">{cartTotal.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-brand-text pb-2">
                                <span>Envío <span className="text-xs bg-brand-background text-brand-primary px-2 py-0.5 rounded-full ml-1">Fijo</span></span>
                                <span className="font-medium">{SHIPPING_FLAT_EUR.toFixed(2)}€</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xl font-bold text-brand-primary mb-8 pt-6 border-t border-brand-primary/10">
                            <span>Total</span>
                            <span className="text-2xl">{(cartTotal + SHIPPING_FLAT_EUR).toFixed(2)}€</span>
                        </div>

                        <Link href="/es/checkout" className="block w-full">
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
