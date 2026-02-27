import React from 'react';
import { requireProducer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OrderStatusSelect, STATUS_COLORS } from '@/components/orders/OrderStatusSelect';
import { DataTable } from '@/components/ui/DataTable';
import { PRODUCER_PAYOUT_RATE } from '@/lib/constants';

export default async function ProducerOrders() {
    const { supabase, producer } = await requireProducer();

    if (!producer) redirect('/productor/dashboard');

    const { data: orders } = await supabase
        .from('orders')
        .select('*, profiles!orders_consumer_id_fkey(full_name, phone)')
        .eq('producer_id', producer.id)
        .order('created_at', { ascending: false });

    const columns = [
        {
            key: 'id', header: 'ID Pedido / Fecha', render: (o: any) => (
                <div>
                    <div className="text-sm font-mono font-medium text-gray-900">#{o.id.split('-')[0].toUpperCase()}</div>
                    <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString('es-ES')}</div>
                </div>
            )
        },
        {
            key: 'client', header: 'Cliente', render: (o: any) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{o.delivery_name || o.profiles?.full_name}</div>
                    <div className="text-xs text-gray-500">{o.delivery_address}</div>
                    {o.profiles?.phone && <div className="text-xs text-brand-primary mt-0.5">📞 {o.profiles.phone}</div>}
                </div>
            )
        },
        {
            key: 'total', header: 'Total (Neto)', render: (o: any) => (
                <div>
                    <div className="text-sm font-bold text-gray-900">{(Number(o.total) * PRODUCER_PAYOUT_RATE).toFixed(2)}€</div>
                    <div className="text-xs text-gray-400">Total: {Number(o.total).toFixed(2)}€</div>
                </div>
            )
        },
        {
            key: 'currentStatus', header: 'Estado Actual', render: (o: any) => (
                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[o.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-800'}`}>
                    {o.status}
                </span>
            )
        },
        {
            key: 'updateStatus', header: 'Actualizar Estado', headerClassName: 'text-right',
            render: (o: any) => <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-primary mb-8">Gestión de Pedidos</h1>

            <DataTable
                columns={columns}
                data={orders}
                keyExtractor={(o) => o.id}
                emptyIcon="📦"
                emptyMessage="No has recibido pedidos aún."
                emptySubMessage="Los nuevos pedidos aparecerán aquí."
            />
        </div>
    );
}
