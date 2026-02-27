import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';

export default async function AdminProducers() {
    const { supabase } = await requireAdmin();

    const { data: producers } = await supabase.from('producers')
        .select('*, profiles!producers_user_id_fkey(email, full_name, phone)')
        .order('created_at', { ascending: false });

    const columns = [
        {
            key: 'name', header: 'Productor', render: (p: any) => (
                <div>
                    <div className="font-bold text-brand-primary">{p.brand_name}</div>
                    <div className="text-xs text-brand-text/50">ID: {p.id.split('-')[0]}</div>
                </div>
            )
        },
        {
            key: 'contact', header: 'Contacto', render: (p: any) => (
                <div>
                    <div className="text-sm text-gray-900">{p.profiles?.full_name}</div>
                    <div className="text-xs text-gray-500">{p.profiles?.email}</div>
                </div>
            )
        },
        { key: 'municipality', header: 'Municipio', render: (p: any) => <span className="text-sm text-gray-900">{p.municipality}</span> },
        {
            key: 'stripe', header: 'Estado Stripe', render: (p: any) =>
                p.stripe_account_id
                    ? <span className="text-xs font-medium text-green-600">Conectado</span>
                    : <span className="text-xs font-medium text-red-500">Pendiente</span>
        },
        {
            key: 'status', header: 'Verificación', render: (p: any) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-800' : p.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {p.status}
                </span>
            )
        },
        {
            key: 'actions', header: 'Acciones', headerClassName: 'text-right', render: (p: any) => (
                <div className="text-right text-sm font-medium">
                    {p.status === 'pending' && <Button size="sm" variant="outline" className="mr-2">Aprobar</Button>}
                    {p.status === 'active' && <button className="text-red-500 hover:text-red-700 text-xs font-bold">Suspender</button>}
                </div>
            )
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-brand-primary">Gestión de Productores</h1>
                <input type="text" placeholder="Buscar productor..." className="px-4 py-2 border rounded-xl text-sm" />
            </div>

            <DataTable
                columns={columns}
                data={producers}
                keyExtractor={(p) => p.id}
                emptyMessage="No hay productores registrados."
            />
        </div>
    );
}
