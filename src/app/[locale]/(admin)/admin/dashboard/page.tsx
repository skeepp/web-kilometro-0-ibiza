import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { PLATFORM_FEE_RATE } from '@/lib/constants';

export default async function AdminDashboard() {
    const { supabase } = await requireAdmin();

    // Global KPIs
    const { count: totalProducers } = await supabase.from('producers').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: totalConsumers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'consumer');
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });

    // GMV this month
    const { data: orders } = await supabase.from('orders').select('total').gte('created_at', new Date(new Date().setDate(1)).toISOString());
    const gmv = orders?.reduce((acc, order) => acc + Number(order.total), 0) || 0;
    const commissions = gmv * PLATFORM_FEE_RATE;

    // Recent Orders
    const { data: recentOrders } = await supabase.from('orders')
        .select('*, profiles!orders_consumer_id_fkey(full_name), producers(brand_name)')
        .order('created_at', { ascending: false })
        .limit(5);

    const kpis = [
        { label: 'GMV Mes Actual', value: `${gmv.toFixed(2)}€`, color: 'text-brand-primary' },
        { label: `Comisiones (${PLATFORM_FEE_RATE * 100}%)`, value: `${commissions.toFixed(2)}€`, color: 'text-green-600' },
        { label: 'Productores Activos', value: totalProducers || 0, color: 'text-brand-primary' },
        { label: 'Total Pedidos', value: totalOrders || 0, color: 'text-brand-primary' },
    ];

    const columns = [
        { key: 'id', header: 'ID', render: (o: any) => <span className="font-mono text-sm text-gray-900">#{o.id.split('-')[0]}</span> },
        { key: 'client', header: 'Cliente', render: (o: any) => <span className="text-sm text-gray-500">{o.profiles?.full_name || 'Desconocido'}</span> },
        { key: 'producer', header: 'Productor', render: (o: any) => <span className="text-sm text-brand-primary font-medium">{o.producers?.brand_name}</span> },
        { key: 'total', header: 'Total', render: (o: any) => <span className="text-sm text-gray-900">{o.total}€</span> },
        { key: 'status', header: 'Estado', render: (o: any) => <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{o.status}</span> },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-primary mb-8">Dashboard Global</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardContent className="p-6">
                            <h3 className="text-brand-text/60 text-sm font-medium mb-2">{kpi.label}</h3>
                            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mb-4 flex justify-between items-center">
                <h2 className="font-bold text-brand-primary">Últimos Pedidos Plataforma</h2>
                <a href="/admin/pedidos" className="text-sm font-medium text-brand-primary hover:underline">Ver todos</a>
            </div>

            <DataTable
                columns={columns}
                data={recentOrders}
                keyExtractor={(o) => o.id}
                emptyMessage="No hay pedidos registrados aún."
            />
        </div>
    );
}
