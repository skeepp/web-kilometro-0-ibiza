'use client';

import React, { useState, useCallback } from 'react';
import { useCart } from '@/context/CartContext';

/* ── Unit configuration ── */

/** Determines the step increment for quantity based on the unit */
function getStep(unit: string): number {
    switch (unit.toLowerCase()) {
        case 'kg': return 0.5;
        case 'g': return 100;
        case 'l': return 0.5;
        case 'ml': return 100;
        default: return 1; // unidad, manojo, cuña, etc.
    }
}

/** Determines minimum quantity */
function getMin(unit: string): number {
    switch (unit.toLowerCase()) {
        case 'kg': return 0.5;
        case 'g': return 100;
        case 'l': return 0.5;
        case 'ml': return 100;
        default: return 1;
    }
}

/** Format quantity + unit nicely */
function fmtQty(qty: number, unit: string): string {
    const u = unit.toLowerCase();
    if (u === 'kg' || u === 'l') {
        return qty % 1 === 0 ? `${qty} ${unit}` : `${qty.toFixed(1)} ${unit}`;
    }
    if (u === 'g' || u === 'ml') {
        return `${Math.round(qty)} ${unit}`;
    }
    return `${qty} ${unit}${qty !== 1 ? (unit === 'unidad' ? 'es' : '') : ''}`;
}



/* ── Props ── */
export type ProductToCart = {
    id: string;
    name: string;
    price: number;
    producerId: string;
    producerName: string;
    unit: string;
    image?: string | null;
    producerImage?: string | null;
};

type AddToCartButtonProps = {
    product: ProductToCart;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addItem, items, updateQuantity, removeItem } = useCart();
    const unit = product.unit || 'unidad';
    const step = getStep(unit);
    const min = getMin(unit);

    const [localQty, setLocalQty] = useState(min);
    const [feedback, setFeedback] = useState<'idle' | 'adding' | 'added'>('idle');

    const inCart = items.find(i => i.id === product.id);
    const cartQty = inCart?.quantity || 0;

    // Total price for the selected quantity
    const totalPrice = (product.price * localQty);

    const handleAdd = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFeedback('adding');

        // Small delay for feedback
        setTimeout(() => {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: localQty,
                producerId: product.producerId,
                producerName: product.producerName,
                unit,
                image: product.image,
                producerImage: product.producerImage,
            });
            setFeedback('added');
            setTimeout(() => {
                setFeedback('idle');
                setLocalQty(min);
            }, 1500);
        }, 300);
    }, [addItem, product, localQty, unit, min]);

    const increment = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLocalQty(prev => Math.round((prev + step) * 100) / 100);
    };

    const decrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLocalQty(prev => Math.max(min, Math.round((prev - step) * 100) / 100));
    };

    /* ── Cart quantity controls (when already in cart) ── */
    const cartIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, Math.round((cartQty + step) * 100) / 100);
    };

    const cartDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const next = Math.round((cartQty - step) * 100) / 100;
        if (next < min) {
            removeItem(product.id);
        } else {
            updateQuantity(product.id, next);
        }
    };

    /* ═══ ALREADY IN CART STATE ═══ */
    if (cartQty > 0 && feedback === 'idle') {
        return (
            <div className="flex items-center gap-2 w-full" onClick={e => e.preventDefault()}>
                {/* Quantity controls */}
                <div className="flex items-center border border-brand-primary/20 rounded-xl bg-brand-background/40 h-[42px] flex-shrink-0">
                    <button
                        onClick={cartDecrement}
                        className="w-[42px] h-full flex items-center justify-center text-brand-primary hover:bg-brand-primary/10 rounded-l-xl transition-colors text-lg font-bold active:scale-90"
                    >
                        −
                    </button>
                    <span className="px-2 text-xs font-bold text-brand-primary select-none min-w-[44px] text-center whitespace-nowrap">
                        {fmtQty(cartQty, unit)}
                    </span>
                    <button
                        onClick={cartIncrement}
                        className="w-[42px] h-full flex items-center justify-center text-brand-primary hover:bg-brand-primary/10 rounded-r-xl transition-colors text-lg font-bold active:scale-90"
                    >
                        +
                    </button>
                </div>
                {/* In-cart badge */}
                <div className="flex-1 h-[42px] flex items-center justify-center bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    En cesta · {(product.price * cartQty).toFixed(2)}€
                </div>
            </div>
        );
    }

    /* ═══ FEEDBACK: ADDING ═══ */
    if (feedback === 'adding') {
        return (
            <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-[42px] flex items-center justify-center bg-brand-accent/10 border border-brand-accent/30 rounded-xl">
                    <div className="w-5 h-5 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    /* ═══ FEEDBACK: JUST ADDED ═══ */
    if (feedback === 'added') {
        return (
            <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-[42px] flex items-center justify-center bg-emerald-500 text-white rounded-xl text-sm font-bold gap-2 animate-pulse">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Añadido!
                </div>
            </div>
        );
    }

    /* ═══ DEFAULT STATE: Quantity selector + Add button ═══ */
    return (
        <div className="flex flex-col gap-2 w-full" onClick={e => e.preventDefault()}>
            {/* Row: Qty selector + Add button */}
            <div className="flex items-center gap-2 w-full">
                {/* Quantity selector — 42px touch targets */}
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/80 h-[42px] flex-shrink-0">
                    <button
                        onClick={decrement}
                        disabled={localQty <= min}
                        className="w-[42px] h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-l-xl transition-colors text-lg font-bold active:scale-90"
                    >
                        −
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-800 select-none min-w-[44px] text-center whitespace-nowrap">
                        {fmtQty(localQty, unit)}
                    </span>
                    <button
                        onClick={increment}
                        className="w-[42px] h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-xl transition-colors text-lg font-bold active:scale-90"
                    >
                        +
                    </button>
                </div>

                {/* Add to Cart button with live total */}
                <button
                    onClick={handleAdd}
                    className="flex-1 h-[42px] flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-emerald-700 hover:from-emerald-700 hover:to-brand-primary text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.97]"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    <span className="font-extrabold text-sm">{totalPrice.toFixed(2)}€</span>
                </button>
            </div>
        </div>
    );
}
