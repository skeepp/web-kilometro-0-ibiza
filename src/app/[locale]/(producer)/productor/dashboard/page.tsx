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
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 p-6 md:p-8 rounded-2xl border border-brand-primary/10 shadow-sm backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-2 text-balance">Hola, {producer.brand_name} <span className="text-2xl">👋</span></h1>
                    <p className="text-brand-text/70 text-lg">Aquí tienes un resumen de tu actividad.</p>
                </div>
                <div className="bg-white px-5 py-3 rounded-xl shadow-soft border border-brand-primary/10 text-sm font-semibold flex items-center transition-all hover:shadow-md">
                    <span className={`w-2.5 h-2.5 rounded-full mr-3 ${producer.status === 'active' ? 'bg-brand-accent animate-pulse' : 'bg-yellow-500'}`}></span>
                    {producer.status === 'active' ? 'Cuenta Activa' : 'Pendiente Verificación'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} className="border border-brand-primary/10 shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <h3 className="text-brand-text/60 text-sm font-medium mb-3">{kpi.label}</h3>
                            <p className="text-4xl font-bold text-brand-primary">{kpi.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!producer.stripe_account_id && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex">
                        <div className="flex-shrink-0 text-xl">⚠️</div>
                        <div className="ml-4">
                            <p className="text-sm text-yellow-800 font-bold">Configuración de pagos incompleta.</p>
                            <p className="text-sm text-yellow-700 mt-1">Debes conectar tu cuenta de Stripe para poder recibir pagos y activar tus ventas.</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-serif font-bold text-brand-primary mb-6 flex items-center gap-2">
                    ⚡ Acciones Rápidas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Link href="/es/productor/productos" className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-all duration-300 group hover:shadow-soft">
                        <div className="w-12 h-12 rounded-full bg-brand-background text-brand-primary flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📦</div>
                        <span className="font-semibold text-brand-primary group-hover:text-brand-accent">Añadir nuevo producto</span>
                        <p className="text-xs text-brand-text/50 mt-2 text-center">Publica un nuevo artículo en tu escaparate</p>
                    </Link>
                    <Link href="/es/productor/pedidos" className="bg-white p-8 rounded-2xl border border-brand-primary/10 shadow-soft flex flex-col items-center justify-center cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-brand-background text-brand-primary flex items-center justify-center text-2xl mb-4 group-hover:rotate-180 transition-transform duration-500">↻</div>
                        <span className="font-semibold text-brand-primary group-hover:text-brand-accent">Revisar últimos pedidos</span>
                        <p className="text-xs text-brand-text/50 mt-2 text-center">Gestiona ventas y envíos pendientes</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
