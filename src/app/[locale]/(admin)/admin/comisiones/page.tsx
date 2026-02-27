import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { PLATFORM_FEE_RATE } from '@/lib/constants';

export default async function AdminCommissions() {
    const { supabase } = await requireAdmin();

    const { data: orders } = await supabase.from('orders')
        .select('*, producers(brand_name)')
        .order('created_at', { ascending: false });

    const totalGmv = orders?.reduce((acc, o) => acc + Number(o.total), 0) || 0;
    const totalCommissions = orders?.reduce((acc, o) => acc + Number(o.platform_fee || o.total * PLATFORM_FEE_RATE), 0) || 0;

    const columns = [
        {
            key: 'id', header: 'ID Pedido / Fecha', render: (o: any) => (
                <div>
                    <div className="font-medium text-gray-900">#{o.id.split('-')[0]}</div>
                    <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString('es-ES')}</div>
                </div>
            )
        },
        { key: 'producer', header: 'Productor', render: (o: any) => <span className="text-sm text-brand-primary font-medium">{o.producers?.brand_name}</span> },
        { key: 'gmv', header: 'GMV Total', headerClassName: 'text-right', cellClassName: 'text-right', render: (o: any) => <span className="text-sm text-gray-900">{Number(o.total).toFixed(2)}€</span> },
        {
            key: 'commission', header: `Comisión (${PLATFORM_FEE_RATE * 100}%)`, headerClassName: 'text-right text-green-600', cellClassName: 'text-right',
            render: (o: any) => {
                const commission = Number(o.platform_fee || o.total * PLATFORM_FEE_RATE);
                return <span className="text-sm text-green-600 font-bold">+{commission.toFixed(2)}€</span>;
            }
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary">Comisiones Generadas</h1>
                    <p className="text-brand-text/60 mt-2">Rentabilidad bruta de la plataforma. (Fee: {PLATFORM_FEE_RATE * 100}%)</p>
                </div>
                <select className="px-4 py-2 border rounded-xl text-sm font-medium">
                    <option>Este mes</option>
                    <option>Mes anterior</option>
                    <option>Año actual</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-brand-primary/5 border-brand-primary/20">
                    <CardContent className="p-8 flex items-center justify-between">
                        <div>
                            <p className="text-brand-text/70 mb-2 font-medium">GMV Total Procesado</p>
                            <h2 className="text-4xl font-bold text-brand-primary">{totalGmv.toFixed(2)}€</h2>
                        </div>
                        <div className="text-5xl opacity-20 text-brand-primary">💰</div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-8 flex items-center justify-between">
                        <div>
                            <p className="text-green-800/70 mb-2 font-medium">Ingresos de Plataforma (Comisiones)</p>
                            <h2 className="text-4xl font-bold text-green-600">{totalCommissions.toFixed(2)}€</h2>
                        </div>
                        <div className="text-5xl opacity-20 text-green-600">📈</div>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                keyExtractor={(o) => o.id}
                emptyMessage="No hay pedidos con comisiones aún."
            />
        </div>
    );
}
