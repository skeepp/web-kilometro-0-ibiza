import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { DataTable } from '@/components/ui/DataTable';
import { ProducerStatusButtons } from '@/components/admin/ProducerStatusButtons';

export default async function AdminProducers() {
    const { supabase } = await requireAdmin();

    const { data: producers } = await supabase.from('producers')
        .select('*, profiles!producers_user_id_fkey(email, full_name, phone)')
        .order('created_at', { ascending: false });

    type ProducerRow = { id: string; brand_name: string; municipality: string; stripe_account_id?: string | null; status: string; profiles?: { email: string; full_name: string; phone?: string } };

    const columns = [
        {
            key: 'name', header: 'Productor', render: (p: ProducerRow) => (
                <div>
                    <div className="font-bold text-brand-primary">{p.brand_name}</div>
                    <div className="text-xs text-brand-text/50">ID: {p.id.split('-')[0]}</div>
                </div>
            )
        },
        {
            key: 'contact', header: 'Contacto', render: (p: ProducerRow) => (
                <div>
                    <div className="text-sm text-gray-900">{p.profiles?.full_name}</div>
                    <div className="text-xs text-gray-500">{p.profiles?.email}</div>
                </div>
            )
        },
        { key: 'municipality', header: 'Municipio', render: (p: ProducerRow) => <span className="text-sm text-gray-900">{p.municipality}</span> },
        {
            key: 'stripe', header: 'Estado Stripe', render: (p: ProducerRow) =>
                p.stripe_account_id
                    ? <span className="text-xs font-medium text-green-600">Conectado</span>
                    : <span className="text-xs font-medium text-red-500">Pendiente</span>
        },
        {
            key: 'status', header: 'Verificación', render: (p: ProducerRow) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-800' : p.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {p.status === 'active' ? 'Activo' : p.status === 'suspended' ? 'Suspendido' : 'Pendiente'}
                </span>
            )
        },
        {
            key: 'actions', header: 'Acciones', headerClassName: 'text-right', render: (p: ProducerRow) => (
                <ProducerStatusButtons producerId={p.id} currentStatus={p.status} />
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

