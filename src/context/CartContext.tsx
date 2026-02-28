'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: string; // product id
    name: string;
    price: number;
    quantity: number;
    producerId: string;
    producerName: string;
    unit: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('delafinca-cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch {
                console.error('Failed to parse cart');
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('delafinca-cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addItem = (item: CartItem) => {
        setItems(current => {
            // Rule: In MVP, a cart can only have products from one producer at a time.
            if (current.length > 0 && current[0].producerId !== item.producerId) {
                // We could alert the user here. For now, we clear the cart to switch producer.
                alert(`Tu carrito contiene productos de ${current[0].producerName}. En esta versión, solo puedes comprar a un productor a la vez. El carrito se vaciará.`);
                return [item];
            }

            const existing = current.find(i => i.id === item.id);
            if (existing) {
                return current.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
            }
            return [...current, item];
        });
    };

    const removeItem = (id: string) => {
        setItems(current => current.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) return removeItem(id);
        setItems(current => current.map(i => i.id === id ? { ...i, quantity } : i));
    };

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) throw new Error('useCart must be used within a CartProvider');
    return context;
};
