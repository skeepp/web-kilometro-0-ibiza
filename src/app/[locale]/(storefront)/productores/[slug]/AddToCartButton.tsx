'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';

export type ProductToCart = { id: string; name: string; price: number; producerId: string; producerName: string; unit: string };
export function AddToCartButton({ product }: { product: ProductToCart }) {
    const { addItem, items } = useCart();

    const inCart = items.find(i => i.id === product.id)?.quantity || 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            producerId: product.producerId,
            producerName: product.producerName,
            unit: product.unit
        });
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        // The CartContext removes the item or decrements if we pass quantity: -1 
        // We'll use addItem with negative quantity to decrement
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: -1,
            producerId: product.producerId,
            producerName: product.producerName,
            unit: product.unit
        });
    };

    if (inCart > 0) {
        return (
            <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
                <div className="flex items-center justify-between border border-brand-primary/20 rounded-xl px-2 h-9 sm:h-11 bg-brand-background/30">
                    <button
                        onClick={handleRemove}
                        className="w-8 sm:w-10 h-full flex items-center justify-center text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors text-lg"
                    >
                        -
                    </button>
                    <span className="text-sm sm:text-base font-medium text-brand-text select-none">{inCart}</span>
                    <button
                        onClick={handleAdd}
                        className="w-8 sm:w-10 h-full flex items-center justify-center text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors text-lg"
                    >
                        +
                    </button>
                </div>
                {/* Link to cart */}
                <a href="/es/carrito" className="w-full">
                    <Button variant="outline" fullWidth className="text-[10px] sm:text-sm h-8 sm:h-10 border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white">
                        Ir al carrito
                    </Button>
                </a>
            </div>
        );
    }

    return (
        <Button
            variant="primary"
            fullWidth
            onClick={handleAdd}
            className="h-9 sm:h-11 text-xs sm:text-base"
        >
            Añadir
        </Button>
    );
}
