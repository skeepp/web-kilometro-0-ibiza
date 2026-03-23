import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { OrderStatusSelect } from '@/components/orders/OrderStatusSelect';
import { DataTable } from '@/components/ui/DataTable';
import { PLATFORM_MARKUP_RATE } from '@/lib/constants';

export default async function AdminOrders() {
    const { supabase } = await requireAdmin();

    const { data: orders } = await supabase
        .from('orders')
        .select('*, profiles!orders_consumer_id_fkey(full_name, phone), producers(brand_name)')
        .order('created_at', { ascending: false });

    type OrderRow = { id: string; created_at: string; total: string | number; platform_fee: string | number; status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'; profiles?: { full_name: string; phone?: string }; producers?: { brand_name: string } };

    const columns = [
        {
            key: 'id', header: 'ID / Fecha', render: (o: OrderRow) => (
                <div>
                    <div className="font-mono font-bold text-gray-900 text-sm">#{o.id.split('-')[0].toUpperCase()}</div>
                    <div className="text-xs text-brand-text/50">{new Date(o.created_at).toLocaleDateString('es-ES')}</div>
                </div>
            )
        },
        {
            key: 'client', header: 'Cliente', render: (o: OrderRow) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{o.profiles?.full_name ?? '—'}</div>
                    {o.profiles?.phone && <div className="text-xs text-gray-400">📞 {o.profiles.phone}</div>}
                </div>
            )
        },
        { key: 'producer', header: 'Productor', render: (o: OrderRow) => <span className="text-sm text-brand-primary font-medium">{o.producers?.brand_name ?? '—'}</span> },
        {
            key: 'total', header: 'Importe', render: (o: OrderRow) => (
                <div>
                    <div className="text-sm font-bold text-gray-900">{Number(o.total).toFixed(2)}€</div>
                    <div className="text-xs text-green-600">+{(Number(o.platform_fee)).toFixed(2)}€ markup</div>
                </div>
            )
        },
        {
            key: 'status', header: 'Estado', headerClassName: 'text-right',
            render: (o: OrderRow) => <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-brand-primary">Todos los Pedidos</h1>
                <div className="text-sm text-brand-text/60">{orders?.length ?? 0} pedidos en total</div>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                keyExtractor={(o) => o.id}
                emptyIcon="📋"
                emptyMessage="No hay pedidos registrados aún."
            />
        </div>
    );
}
