import React from 'react';
import { requireProducer } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/Card';
import { PRODUCER_PAYOUT_RATE } from '@/lib/constants';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProducerDashboard() {
    const { supabase, producer } = await requireProducer();

    if (!producer) {
        redirect('/es/productor/onboarding');
    }

    let pendingOrders = 0;
    let activeProducts = 0;
    let monthRevenue = 0;

    try {
        const { count: pCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('producer_id', producer.id)
            .eq('status', 'pending');
        pendingOrders = pCount || 0;

        const { count: aCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('producer_id', producer.id)
            .eq('available', true);
        activeProducts = aCount || 0;

        const { data: recentOrders } = await supabase
            .from('orders')
            .select('total')
            .eq('producer_id', producer.id)
            .gte('created_at', new Date(new Date().setDate(1)).toISOString());
        monthRevenue = recentOrders?.reduce((acc, order) => acc + (Number(order.total) * PRODUCER_PAYOUT_RATE), 0) || 0;
    } catch (e) {
        console.error('[Dashboard] Error fetching stats:', e);
    }

    const kpis = [
        { label: 'Pedidos Pendientes', value: pendingOrders },
        { label: 'Ingresos del Mes (Neto)', value: `${monthRevenue.toFixed(2)}€` },
        { label: 'Productos Activos', value: activeProducts },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary">Hola, {producer.brand_name}</h1>
                    <p className="text-brand-text/60 mt-1">Aquí tienes un resumen de tu actividad.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-sm font-medium flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${producer.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    {producer.status === 'active' ? 'Cuenta Activa' : 'Pendiente Verificación'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardContent className="p-6">
                            <h3 className="text-brand-text/60 text-sm font-medium mb-2">{kpi.label}</h3>
                            <p className="text-4xl font-bold text-brand-primary">{kpi.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!producer.stripe_account_id && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">⚠️</div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 font-medium">Configuración de pagos incompleta.</p>
                            <p className="text-sm text-yellow-600 mt-1">Debes conectar tu cuenta de Stripe para poder recibir pagos y activar tus ventas.</p>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold text-brand-primary mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link href="/es/productor/productos" className="bg-white p-6 rounded-xl border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-brand-primary">+ Añadir nuevo producto</span>
                </Link>
                <Link href="/es/productor/pedidos" className="bg-white p-6 rounded-xl border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-brand-primary">↻ Revisar últimos pedidos</span>
                </Link>
            </div>
        </div>
    );
}
