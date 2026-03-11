import React from 'react';
import { requireProducer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DataTable } from '@/components/ui/DataTable';
import Link from 'next/link';
import { ToggleProductButton } from '@/components/products/ToggleProductButton';

export default async function ProducerProducts() {
    const { supabase, producer } = await requireProducer();

    if (!producer) redirect('/es/productor/onboarding');

    const { data: products } = await supabase.from('products').select('*').eq('producer_id', producer.id).order('created_at', { ascending: false });

    const categoryIcons: Record<string, string> = { verdura: '🥬', fruta: '🍎', carne: '🥩', lacteos: '🧀', huevos: '🥚', conservas: '🍯' };

    type ProductRow = { id: string; name: string; category: string; price: number | string; unit: string; stock: number; available: boolean };

    const columns = [
        {
            key: 'product', header: 'Producto', render: (p: ProductRow) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-brand-background rounded-md flex items-center justify-center text-xl">
                        {categoryIcons[p.category] || '📦'}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'category', header: 'Categoría', render: (p: ProductRow) => (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-primary/10 text-brand-primary">
                    {p.category}
                </span>
            )
        },
        { key: 'price', header: 'Precio', render: (p: ProductRow) => <span className="text-sm text-gray-500">{p.price}€ / {p.unit}</span> },
        { key: 'stock', header: 'Stock', render: (p: ProductRow) => <span className="text-sm text-gray-500">{p.stock}</span> },
        {
            key: 'status', header: 'Estado', render: (p: ProductRow) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.available ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
        {
            key: 'actions', header: 'Acciones', headerClassName: 'text-right', cellClassName: 'text-right text-sm font-medium',
            render: (p: ProductRow) => (
                <div className="flex justify-end gap-3">
                    <Link href={`/es/productor/productos/${p.id}/editar`} className="text-brand-primary hover:text-brand-accent">Editar</Link>
                    <ToggleProductButton productId={p.id} available={p.available} />
                </div>
            )
        },
    ];

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Mis Productos</h1>
                <Link href="/es/productor/productos/nuevo" className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-medium hover:bg-brand-primary/90 transition-colors w-full sm:w-auto justify-center">
                    + Nuevo Producto
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={products}
                keyExtractor={(p) => p.id}
                emptyMessage="Aún no tienes productos registrados."
            />
        </div>
    );
}

