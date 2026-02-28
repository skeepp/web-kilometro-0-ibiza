import React from 'react';
import { requireProducer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';

export default async function ProducerProducts() {
    const { supabase, producer } = await requireProducer();

    if (!producer) redirect('/productor/dashboard');

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
            render: () => (
                <>
                    <a href="#" className="text-brand-primary hover:text-brand-accent mr-4">Editar</a>
                    <a href="#" className="text-red-600 hover:text-red-900">Ocultar</a>
                </>
            )
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-brand-primary">Mis Productos</h1>
                <Button>+ Nuevo Producto</Button>
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
