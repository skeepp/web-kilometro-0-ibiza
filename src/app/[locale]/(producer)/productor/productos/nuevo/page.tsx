'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { createProduct } from '@/app/actions/productActions';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createProduct(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/es/productor/productos');
            }
        });
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-primary mb-8">Nuevo Producto</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre del producto *</label>
                    <input
                        name="name"
                        type="text"
                        required
                        placeholder="Ej: Tomates cherry ecológicos"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">Categoría *</label>
                        <select
                            name="category"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-white"
                        >
                            <option value="">Selecciona</option>
                            <option value="verdura">🥬 Verdura</option>
                            <option value="fruta">🍎 Fruta</option>
                            <option value="carne">🥩 Carne</option>
                            <option value="lacteos">🧀 Lácteos</option>
                            <option value="huevos">🥚 Huevos</option>
                            <option value="conservas">🍯 Conservas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">Unidad *</label>
                        <select
                            name="unit"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-white"
                        >
                            <option value="kg">kg</option>
                            <option value="unidad">unidad</option>
                            <option value="docena">docena</option>
                            <option value="litro">litro</option>
                            <option value="manojo">manojo</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">Precio (€) *</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="3.50"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">Stock disponible *</label>
                        <input
                            name="stock"
                            type="number"
                            min="0"
                            required
                            placeholder="50"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">Descripción</label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="Describe tu producto..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                    />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

                <div className="flex gap-3">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Creando...' : 'Crear Producto'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push('/es/productor/productos')}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
}
