'use client';

import React, { useState, useTransition } from 'react';
import { updateOrderStatus } from '@/app/actions/updateOrderStatus';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/constants';

interface OrderItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface OrderRow {
    id: string;
    created_at: string;
    total: number;
    producer_payout: number;
    status: OrderStatus;
    delivery_name: string;
    delivery_address: string;
    delivery_phone?: string;
    pickup_code?: string;
    profiles?: { full_name: string; phone?: string };
    order_items?: OrderItem[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: string; bg: string; text: string }> = {
    paid: { label: 'Nuevo Pedido', icon: '💰', bg: 'bg-yellow-50 border-yellow-300', text: 'text-yellow-800' },
    preparing: { label: 'En Preparación', icon: '📦', bg: 'bg-blue-50 border-blue-300', text: 'text-blue-800' },
    ready_pickup: { label: 'Listo para Recoger', icon: '✅', bg: 'bg-green-50 border-green-300', text: 'text-green-800' },
    picked_up: { label: 'Recogido', icon: '🤝', bg: 'bg-gray-50 border-gray-300', text: 'text-gray-600' },
    cancelled: { label: 'Cancelado', icon: '❌', bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
};

const TAB_FILTERS = [
    { key: 'all', label: 'Todos', icon: '📋' },
    { key: 'paid', label: 'Nuevos', icon: '💰' },
    { key: 'preparing', label: 'Preparando', icon: '📦' },
    { key: 'ready_pickup', label: 'Listos', icon: '✅' },
    { key: 'picked_up', label: 'Recogidos', icon: '🤝' },
];

function OrderCard({ order, onStatusUpdate }: { order: OrderRow; onStatusUpdate: (id: string, status: OrderStatus) => void }) {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
    const config = STATUS_CONFIG[order.status];

    const handleAction = (newStatus: OrderStatus) => {
        setFeedback('idle');
        startTransition(async () => {
            const result = await updateOrderStatus(order.id, newStatus);
            if (result.success) {
                onStatusUpdate(order.id, newStatus);
                setFeedback('success');
                setTimeout(() => setFeedback('idle'), 2000);
            } else {
                setFeedback('error');
                setTimeout(() => setFeedback('idle'), 3000);
            }
        });
    };

    return (
        <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${config.bg}`}>
            {/* Header */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                        <span className={`text-xs font-bold ${config.text} uppercase tracking-wide`}>{config.label}</span>
                        <div className="text-sm text-gray-500 font-mono">#{order.id.split('-')[0].toUpperCase()} · {new Date(order.created_at).toLocaleDateString('es-ES')}</div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-brand-primary">{order.producer_payout.toFixed(2)}€ <span className="text-xs text-gray-400 font-normal">neto</span></p>
                    <p className="text-xs text-gray-400">Total: {Number(order.total).toFixed(2)}€</p>
                </div>
            </div>

            {/* Client info */}
            <div className="px-5 py-3 bg-white/80 border-b border-gray-50">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">👤</span>
                    <span className="font-medium text-gray-800">{order.delivery_name || order.profiles?.full_name}</span>
                    {(order.delivery_phone || order.profiles?.phone) && (
                        <a href={`tel:${order.delivery_phone || order.profiles?.phone}`} className="text-brand-primary hover:underline ml-2">
                            📞 {order.delivery_phone || order.profiles?.phone}
                        </a>
                    )}
                </div>
            </div>

            {/* Order items */}
            {order.order_items && order.order_items.length > 0 && (
                <div className="px-5 py-3 bg-white">
                    <table className="w-full text-sm">
                        <tbody>
                            {order.order_items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-50 last:border-0">
                                    <td className="py-1.5 text-gray-700">{item.product_name}</td>
                                    <td className="py-1.5 text-gray-500 text-right">x{item.quantity}</td>
                                    <td className="py-1.5 font-medium text-right text-gray-800">{Number(item.subtotal).toFixed(2)}€</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pickup code */}
            {order.pickup_code && (
                <div className="px-5 py-3 bg-brand-background/30 border-t border-brand-primary/10 flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Código de recogida</span>
                    <span className="font-mono font-bold text-lg text-brand-primary tracking-widest">{order.pickup_code}</span>
                </div>
            )}

            {/* Actions */}
            <div className="px-5 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                {order.status === 'paid' && (
                    <button
                        onClick={() => handleAction('preparing')}
                        disabled={isPending}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
                    >
                        📦 Empezar a Preparar
                    </button>
                )}
                {order.status === 'preparing' && (
                    <button
                        onClick={() => handleAction('ready_pickup')}
                        disabled={isPending}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md animate-pulse hover:animate-none"
                    >
                        🔔 Notificar Recogida
                    </button>
                )}
                {order.status === 'ready_pickup' && (
                    <button
                        onClick={() => handleAction('picked_up')}
                        disabled={isPending}
                        className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                        ✅ Confirmar Entrega
                    </button>
                )}
                {(order.status === 'paid' || order.status === 'preparing') && (
                    <button
                        onClick={() => handleAction('cancelled')}
                        disabled={isPending}
                        className="px-4 py-3 text-red-500 hover:bg-red-50 border border-red-200 rounded-xl transition-all disabled:opacity-50 text-sm font-medium"
                    >
                        Cancelar
                    </button>
                )}

                {/* Status selector for advanced users */}
                <select
                    value={order.status}
                    onChange={(e) => handleAction(e.target.value as OrderStatus)}
                    disabled={isPending}
                    className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 disabled:opacity-50 sm:ml-auto"
                >
                    {ORDER_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                    ))}
                </select>

                {isPending && <div className="w-5 h-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin self-center" />}
                {feedback === 'success' && <span className="text-green-600 text-sm self-center font-medium">✓ Actualizado</span>}
                {feedback === 'error' && <span className="text-red-600 text-sm self-center font-medium">✗ Error</span>}
            </div>
        </div>
    );
}

export function ProducerOrdersClient({ orders: initialOrders }: { orders: OrderRow[] }) {
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState(initialOrders);

    const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

    const counts: Record<string, number> = {
        all: orders.length,
        paid: orders.filter(o => o.status === 'paid').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready_pickup: orders.filter(o => o.status === 'ready_pickup').length,
        picked_up: orders.filter(o => o.status === 'picked_up').length,
    };

    const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    return (
        <div>
            {/* Tab filters */}
            <div className="flex overflow-x-auto pb-2 gap-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                {TAB_FILTERS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                            activeTab === tab.key
                                ? 'bg-brand-primary text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-primary/30'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                        {counts[tab.key] > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
                            }`}>
                                {counts[tab.key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Orders */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <span className="text-5xl mb-4 block">📦</span>
                    <p className="text-gray-500 font-medium">No hay pedidos en esta categoría.</p>
                    <p className="text-gray-400 text-sm mt-1">Los nuevos pedidos aparecerán aquí automáticamente.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(order => (
                        <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
                    ))}
                </div>
            )}
        </div>
    );
}
