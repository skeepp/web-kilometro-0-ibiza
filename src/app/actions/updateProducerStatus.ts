'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type ProducerStatus = 'pending' | 'active' | 'suspended';

export async function updateProducerStatus(
    producerId: string,
    newStatus: ProducerStatus
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Verify the caller is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'No autenticado.' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return { success: false, error: 'Solo los administradores pueden cambiar el estado de los productores.' };
    }

    // Update the producer status
    const { error } = await supabase
        .from('producers')
        .update({ status: newStatus })
        .eq('id', producerId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/es/admin/productores');
    return { success: true };
}
