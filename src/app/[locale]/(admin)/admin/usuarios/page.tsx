import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { DataTable } from '@/components/ui/DataTable';

export default async function AdminUsers() {
    const { supabase } = await requireAdmin();

    const { data: users } = await supabase.from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    const columns = [
        {
            key: 'user', header: 'Usuario', render: (u: any) => (
                <div>
                    <div className="font-bold text-brand-primary">{u.full_name || 'Sin nombre'}</div>
                    <div className="text-xs text-brand-text/50">{u.id.split('-')[0]}</div>
                </div>
            )
        },
        {
            key: 'role', header: 'Rol', render: (u: any) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'producer' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {u.role}
                </span>
            )
        },
        { key: 'phone', header: 'Teléfono', render: (u: any) => <span className="text-sm text-gray-900">{u.phone || '-'}</span> },
        { key: 'date', header: 'Fecha Registro', render: (u: any) => <span className="text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString('es-ES')}</span> },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-brand-primary">Usuarios Registrados</h1>
                <input type="text" placeholder="Buscar por email o nombre..." className="px-4 py-2 border rounded-xl text-sm" />
            </div>

            <DataTable
                columns={columns}
                data={users}
                keyExtractor={(u) => u.id}
                emptyMessage="No hay usuarios registrados."
            />
        </div>
    );
}
