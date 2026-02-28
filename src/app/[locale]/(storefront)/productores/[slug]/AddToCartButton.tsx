'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';

export type ProductToCart = { id: string; name: string; price: number; producerId: string; producerName: string; unit: string };
export function AddToCartButton({ product }: { product: ProductToCart }) {
    const { addItem, items } = useCart();

    const inCart = items.find(i => i.id === product.id)?.quantity || 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a Link wrapper
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

    return (
        <Button
            variant={inCart > 0 ? 'secondary' : 'primary'}
            fullWidth
            onClick={handleAdd}
        >
            {inCart > 0 ? `Añadido (${inCart})` : 'Añadir al carrito'}
        </Button>
    );
}
