import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { PLATFORM_MARKUP_RATE } from '@/lib/constants';
import Image from 'next/image';

export default async function AdminDashboard() {
    const { supabase } = await requireAdmin();

    // Global KPIs
    const { count: totalProducers } = await supabase.from('producers').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });

    // GMV this month
    const { data: orders } = await supabase.from('orders').select('total, platform_fee').gte('created_at', new Date(new Date().setDate(1)).toISOString());
    const gmv = orders?.reduce((acc, order) => acc + Number(order.total), 0) || 0;
    const commissions = orders?.reduce((acc, order) => acc + Number(order.platform_fee), 0) || 0;

    // Recent Orders
    const { data: recentOrders } = await supabase.from('orders')
        .select('*, profiles!orders_consumer_id_fkey(full_name), producers(brand_name)')
        .order('created_at', { ascending: false })
        .limit(5);

    const kpis = [
        { label: 'GMV Mes Actual', value: `${gmv.toFixed(2)}€`, color: 'text-brand-primary' },
        { label: `Comisiones (${PLATFORM_MARKUP_RATE * 100}%)`, value: `${commissions.toFixed(2)}€`, color: 'text-green-600' },
        { label: 'Productores Activos', value: totalProducers || 0, color: 'text-brand-primary' },
        { label: 'Total Pedidos', value: totalOrders || 0, color: 'text-brand-primary' },
    ];

    type OrderRow = { id: string; profiles?: { full_name: string }; producers?: { brand_name: string }; total: string | number; status: string };

    const columns = [
        { key: 'id', header: 'ID', render: (o: OrderRow) => <span className="font-mono text-sm text-gray-900">#{o.id.split('-')[0]}</span> },
        { key: 'client', header: 'Cliente', render: (o: OrderRow) => <span className="text-sm text-gray-500">{o.profiles?.full_name || 'Desconocido'}</span> },
        { key: 'producer', header: 'Productor', render: (o: OrderRow) => <span className="text-sm text-brand-primary font-medium">{o.producers?.brand_name}</span> },
        { key: 'total', header: 'Total', render: (o: OrderRow) => <span className="text-sm text-gray-900">{o.total}€</span> },
        { key: 'status', header: 'Estado', render: (o: OrderRow) => <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{o.status}</span> },
    ];

    return (
        <div className="p-8 md:p-10 max-w-7xl mx-auto space-y-10">
            <div className="relative rounded-3xl overflow-hidden shadow-soft border border-brand-primary/10">
                <div className="absolute inset-0 z-0">
                    <Image src="/images/dashboards/admin_bg.png" alt="Admin Background" fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
                </div>
                <div className="relative z-10 p-8 md:p-12">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-primary mb-3 text-balance">Dashboard Global</h1>
                    <p className="text-brand-text/80 text-lg max-w-xl text-pretty">Resumen y control de mando de toda la actividad en la plataforma De la Finca.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} className="border border-brand-primary/10 shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h3 className="text-brand-text/60 text-sm font-medium mb-2">{kpi.label}</h3>
                            <p className={`text-3xl md:text-4xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-soft border border-brand-primary/10 p-6 md:p-8">
                <div className="mb-6 flex justify-between items-center border-b border-brand-primary/10 pb-4">
                    <h2 className="text-xl font-bold text-brand-primary flex items-center gap-2">
                        <span className="text-2xl">📋</span> Últimos Pedidos
                    </h2>
                    <a href="/es/admin/pedidos" className="text-sm font-medium text-brand-accent hover:underline flex items-center gap-1 transition-colors">Ver todos &rarr;</a>
                </div>

                <DataTable
                    columns={columns}
                    data={recentOrders}
                    keyExtractor={(o) => o.id}
                    emptyMessage="No hay pedidos registrados aún."
                />
            </div>
        </div>
    );
}
