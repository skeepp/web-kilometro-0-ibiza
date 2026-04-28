import React from 'react';
import { requireProducer } from '@/lib/auth';
import { PRODUCER_PAYOUT_RATE } from '@/lib/constants';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ConnectStripeButton } from '@/components/profile/ConnectStripeButton';
import { WeeklyRevenueChart } from './WeeklyRevenueChart';

export default async function ProducerDashboard() {
    const { supabase, producer } = await requireProducer();

    if (!producer) {
        redirect('/es/productor/onboarding');
    }

    /* ═══ Data fetching ═══ */
    let pendingOrders = 0;
    let activeProducts = 0;
    let monthRevenue = 0;
    let todayOrders = 0;

    // Recent orders for activity feed
    type RecentOrder = {
        id: string;
        status: string;
        total: number;
        pickup_code: string | null;
        created_at: string;
        profiles: { full_name: string | null } | null;
    };
    let recentOrders: RecentOrder[] = [];

    // Weekly revenue data (last 7 days)
    let weeklyData: { day: string; revenue: number }[] = [];

    try {
        // Pending orders count
        const { count: pCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('producer_id', producer.id)
            .in('status', ['paid', 'preparing']);
        pendingOrders = pCount || 0;

        // Active products count
        const { count: aCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('producer_id', producer.id)
            .eq('available', true);
        activeProducts = aCount || 0;

        // Month revenue
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { data: monthOrders } = await supabase
            .from('orders')
            .select('total')
            .eq('producer_id', producer.id)
            .gte('created_at', monthStart)
            .not('status', 'eq', 'cancelled');
        monthRevenue = monthOrders?.reduce((acc, o) => acc + (Number(o.total) * PRODUCER_PAYOUT_RATE), 0) || 0;

        // Today's orders
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count: tCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('producer_id', producer.id)
            .gte('created_at', todayStart.toISOString());
        todayOrders = tCount || 0;

        // Recent orders (last 5, for activity feed)
        const { data: rOrders } = await supabase
            .from('orders')
            .select('id, status, total, pickup_code, created_at, profiles(full_name)')
            .eq('producer_id', producer.id)
            .order('created_at', { ascending: false })
            .limit(5);
        recentOrders = (rOrders || []) as RecentOrder[];

        // Weekly revenue (last 7 days)
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const dayDate = new Date(now);
            dayDate.setDate(now.getDate() - i);
            const dayStart = new Date(dayDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayDate);
            dayEnd.setHours(23, 59, 59, 999);

            const { data: dayOrders } = await supabase
                .from('orders')
                .select('total')
                .eq('producer_id', producer.id)
                .gte('created_at', dayStart.toISOString())
                .lte('created_at', dayEnd.toISOString())
                .not('status', 'eq', 'cancelled');

            const dayRevenue = dayOrders?.reduce((acc, o) => acc + (Number(o.total) * PRODUCER_PAYOUT_RATE), 0) || 0;
            weeklyData.push({ day: days[dayDate.getDay()], revenue: Number(dayRevenue.toFixed(2)) });
        }
    } catch (e) {
        console.error('[Dashboard] Error fetching stats:', e);
    }

    /* ═══ Status helpers ═══ */
    const statusConfig: Record<string, { label: string; icon: string; color: string }> = {
        paid: { label: 'Pagado', icon: '💰', color: 'text-amber-600 bg-amber-50' },
        preparing: { label: 'Preparando', icon: '📦', color: 'text-blue-600 bg-blue-50' },
        ready_pickup: { label: 'Listo', icon: '✅', color: 'text-emerald-600 bg-emerald-50' },
        picked_up: { label: 'Recogido', icon: '🤝', color: 'text-gray-600 bg-gray-100' },
        cancelled: { label: 'Cancelado', icon: '❌', color: 'text-red-600 bg-red-50' },
    };

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Ahora';
        if (mins < 60) return `Hace ${mins} min`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `Hace ${hrs}h`;
        const days = Math.floor(hrs / 24);
        return `Hace ${days}d`;
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-5">

            {/* ═══ STRIPE ALERT BANNER (top-level, impossible to miss) ═══ */}
            {!producer.stripe_account_id && (
                <div className="relative overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">
                                💳
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-900">Activa tus ventas</p>
                                <p className="text-xs text-amber-700/80">Conecta Stripe para recibir pagos de tus clientes</p>
                            </div>
                        </div>
                        <ConnectStripeButton />
                    </div>
                </div>
            )}

            {/* ═══ COMPACT HEADER ═══ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary to-emerald-700 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-brand-primary/20">
                        {producer.brand_name?.charAt(0)?.toUpperCase() || '🌿'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                                Hola, {producer.brand_name}
                            </h1>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                producer.status === 'active' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${producer.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                {producer.status === 'active' ? 'Activa' : 'Pendiente'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">Resumen de tu actividad · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                </div>
                <Link
                    href="/es/productor/productos"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Producto
                </Link>
            </div>

            {/* ═══ KPI METRICS ROW ═══ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Pending Orders */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        {pendingOrders > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">Pendientes</span>
                        )}
                    </div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{pendingOrders}</p>
                    <p className="text-xs text-gray-400 mt-1">Pedidos por gestionar</p>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Este mes</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{monthRevenue.toFixed(0)}<span className="text-lg text-gray-400">€</span></p>
                    <p className="text-xs text-gray-400 mt-1">Ingresos netos</p>
                </div>

                {/* Active Products */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <Link href="/es/productor/productos" className="text-[10px] text-brand-primary font-bold hover:underline">Ver todos</Link>
                    </div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{activeProducts}</p>
                    <p className="text-xs text-gray-400 mt-1">Productos activos</p>
                </div>

                {/* Today's Orders */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Hoy</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{todayOrders}</p>
                    <p className="text-xs text-gray-400 mt-1">Pedidos hoy</p>
                </div>
            </div>

            {/* ═══ BENTO GRID: Chart + Activity + Quick Actions ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

                {/* Weekly Revenue Chart (spans 2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Ingresos esta semana</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Últimos 7 días · Neto productor</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-extrabold text-brand-primary">
                                {weeklyData.reduce((a, b) => a + b.revenue, 0).toFixed(2)}€
                            </p>
                            <p className="text-[10px] text-gray-400">Total semana</p>
                        </div>
                    </div>
                    <WeeklyRevenueChart data={weeklyData} />
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-900">Últimos movimientos</h2>
                        <Link href="/es/productor/pedidos" className="text-[11px] font-bold text-brand-primary hover:underline">
                            Ver todos →
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                            <div className="text-3xl mb-2">📋</div>
                            <p className="text-sm text-gray-400">Sin pedidos todavía</p>
                            <p className="text-xs text-gray-300 mt-1">Cuando llegue tu primer pedido, lo verás aquí</p>
                        </div>
                    ) : (
                        <div className="space-y-3 flex-1">
                            {recentOrders.map((order) => {
                                const status = statusConfig[order.status] || { label: order.status, icon: '📄', color: 'text-gray-600 bg-gray-100' };
                                return (
                                    <Link
                                        key={order.id}
                                        href="/es/productor/pedidos"
                                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <span className="text-lg">{status.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-gray-800 truncate">
                                                    {order.profiles?.full_name || 'Cliente'}
                                                </p>
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {(Number(order.total) * PRODUCER_PAYOUT_RATE).toFixed(2)}€ · {timeAgo(order.created_at)}
                                            </p>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ QUICK ACTIONS ROW ═══ */}
            <div>
                <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Acciones rápidas
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link
                        href="/es/productor/productos"
                        className="group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 hover:border-brand-primary/30 hover:shadow-md transition-all duration-300"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                            📦
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-brand-primary transition-colors">Añadir producto</p>
                            <p className="text-[10px] text-gray-400 truncate">Publica en tu escaparate</p>
                        </div>
                    </Link>

                    <Link
                        href="/es/productor/pedidos"
                        className="group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                            📋
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Gestionar pedidos</p>
                            <p className="text-[10px] text-gray-400 truncate">Notifica recogidas</p>
                        </div>
                    </Link>

                    <Link
                        href="/es/productor/cosechas"
                        className="group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 hover:border-amber-200 hover:shadow-md transition-all duration-300"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                            🌱
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-amber-600 transition-colors">Calendario</p>
                            <p className="text-[10px] text-gray-400 truncate">Planifica cosechas</p>
                        </div>
                    </Link>

                    <Link
                        href="/es/productor/perfil"
                        className="group bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 hover:border-violet-200 hover:shadow-md transition-all duration-300"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                            👤
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-violet-600 transition-colors">Mi Perfil</p>
                            <p className="text-[10px] text-gray-400 truncate">Edita tu información</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
