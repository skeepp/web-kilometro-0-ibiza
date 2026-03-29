import React from 'react';
import { requireProducer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PRODUCER_PAYOUT_RATE } from '@/lib/constants';
import { ProducerOrdersClient } from './ProducerOrdersClient';

export default async function ProducerOrders() {
    const { supabase, producer } = await requireProducer();

    if (!producer) redirect('/es/productor/dashboard');

    const { data: orders } = await supabase
        .from('orders')
        .select(`
            *,
            profiles!orders_consumer_id_fkey(full_name, phone),
            order_items(product_name, quantity, unit_price, subtotal)
        `)
        .eq('producer_id', producer.id)
        .order('created_at', { ascending: false });

    // Serialize with payout rate for client
    const ordersWithPayout = (orders || []).map(o => ({
        ...o,
        producer_payout: Number((Number(o.total) * PRODUCER_PAYOUT_RATE).toFixed(2)),
    }));

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Gestión de Pedidos</h1>
                    <p className="text-sm text-brand-text/60 mt-1">Click & Collect — Recogida en tu puesto</p>
                </div>
            </div>

            <ProducerOrdersClient orders={ordersWithPayout} />
        </div>
    );
}
