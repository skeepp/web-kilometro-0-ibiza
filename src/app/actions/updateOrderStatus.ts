'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@/lib/constants';

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'No autenticado.' };
    }

    // Verify the caller is either the producer who owns this order or an admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    let canUpdate = false;

    if (profile?.role === 'admin') {
        canUpdate = true;
    } else if (profile?.role === 'producer') {
        // Ensure this producer owns the order
        const { data: order } = await supabase
            .from('orders')
            .select('producer_id, producers!inner(user_id)')
            .eq('id', orderId)
            .single();

        if (order) {
            const producers = order.producers as unknown as { user_id: string } | { user_id: string }[];
            const producerData = Array.isArray(producers) ? producers[0] : producers;
            canUpdate = producerData?.user_id === user.id;
        }
    }

    if (!canUpdate) {
        return { success: false, error: 'No autorizado para actualizar este pedido.' };
    }

    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/productor/pedidos');
    revalidatePath('/admin/pedidos');
    return { success: true };
}
