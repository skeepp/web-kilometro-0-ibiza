'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { updateProduct } from '@/app/actions/productActions';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { createClient } from '@/utils/supabase/client';

interface Product {
    id: string;
    name: string;
    category: string;
    unit: string;
    price: number;
    stock: number;
    origin: string | null;
    description: string | null;
    available: boolean;
    images: string[] | null;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        async function fetchProduct() {
            const supabase = createClient();
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single();

            if (data) {
                setProduct(data as Product);
                setImageUrl(data.images?.[0] || '');
            }
            setLoading(false);
        }
        fetchProduct();
    }, [params.id]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        formData.set('image_url', imageUrl);
        formData.set('product_id', params.id);

        startTransition(async () => {
            const result = await updateProduct(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/es/productor/productos');
            }
        });
    }

    if (loading) {
        return (
            <div className="p-8 max-w-3xl mx-auto flex items-center justify-center h-64">
                <p className="text-brand-text/60">Cargando producto...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-8 max-w-3xl mx-auto text-center">
                <h1 className="text-2xl font-bold text-red-500">Producto no encontrado</h1>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.push('/es/productor/productos')}
                    className="text-brand-text/60 hover:text-brand-primary transition-colors"
                >
                    ← Volver
                </button>
                <h1 className="text-3xl font-bold text-brand-primary">Editar Producto</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                {/* Image Upload */}
                <div className="border border-brand-primary/10 rounded-2xl p-6 bg-gray-50/50">
                    <h2 className="text-sm font-medium text-brand-text mb-4 text-center">Foto Principal del Producto</h2>
                    <ImageUpload
                        currentUrl={imageUrl || null}
                        onUpload={(url) => setImageUrl(url)}
                        bucket="images"
                        folder="products"
                        label="Cambiar foto del producto"
                        shape="rectangle"
                        width={400}
                        height={300}
                    />
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">Nombre del producto *</label>
                    <input
                        name="name"
                        type="text"
                        required
                        defaultValue={product.name}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />
                </div>

                {/* Category & Origin */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">Origen *</label>
                        <select
                            name="origin"
                            required
                            defaultValue={product.origin || ''}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-white"
                        >
                            <option value="">Selecciona origen</option>
                            <option value="Andalucía">Andalucía</option>
                            <option value="Aragón">Aragón</option>
                            <option value="Asturias">Asturias</option>
                            <option value="Canarias">Canarias</option>
                            <option value="Cantabria">Cantabria</option>
                            <option value="Castilla y León">Castilla y León</option>
                            <option value="Castilla-La Mancha">Castilla-La Mancha</option>
                            <option value="Cataluña">Cataluña</option>
                            <option value="Comunidad de Madrid">Comunidad de Madrid</option>
                            <option value="Comunidad Foral de Navarra">Navarra</option>
                            <option value="Comunidad Valenciana">Comunidad Valenciana</option>
                            <option value="Extremadura">Extremadura</option>
                            <option value="Galicia">Galicia</option>
                            <option value="Islas Baleares">Islas Baleares (General)</option>
                            <option value="Ibiza">Ibiza</option>
                            <option value="Mallorca">Mallorca</option>
                            <option value="Menorca">Menorca</option>
                            <option value="Formentera">Formentera</option>
                            <option value="La Rioja">La Rioja</option>
                            <option value="País Vasco">País Vasco</option>
                            <option value="Región de Murcia">Región de Murcia</option>
                            <option value="Ceuta">Ceuta</option>
                            <option value="Melilla">Melilla</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">Categoría *</label>
                        <select
                            name="category"
                            required
                            defaultValue={product.category}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-white"
                        >
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
                            defaultValue={product.unit}
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
                            defaultValue={product.price}
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
                            defaultValue={product.stock}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">Descripción</label>
                    <textarea
                        name="description"
                        rows={3}
                        defaultValue={product.description || ''}
                        placeholder="Describe tu producto..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                    />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

                <div className="flex gap-3">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push('/es/productor/productos')}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
}
