'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createHarvest(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado.' };

    const { data: producer } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!producer) return { error: 'No tienes un perfil de productor.' };

    const product_name = formData.get('product_name') as string;
    const category = formData.get('category') as string;
    const planted_at = formData.get('planted_at') as string;
    const duration_days = parseInt(formData.get('duration_days') as string);
    const notes = formData.get('notes') as string;

    if (!product_name || !category || !planted_at || isNaN(duration_days)) {
        return { error: 'Todos los campos obligatorios deben estar completos.' };
    }

    // Calculate estimated harvest date
    const plantDate = new Date(planted_at);
    const harvestDate = new Date(plantDate);
    harvestDate.setDate(harvestDate.getDate() + duration_days);

    const { error } = await supabase.from('harvest_calendar').insert({
        producer_id: producer.id,
        product_name,
        category,
        planted_at,
        estimated_harvest: harvestDate.toISOString().split('T')[0],
        duration_days,
        status: 'planted',
        notes: notes || null,
    });

    if (error) {
        console.error('[Create Harvest Error]', error.message);
        return { error: error.message };
    }

    revalidatePath('/es/productor/cosechas');
    return { success: true };
}

export async function updateHarvestStatus(harvestId: string, status: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado.' };

    const { data: producer } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!producer) return { error: 'No tienes permiso.' };

    // Verify ownership
    const { data: harvest } = await supabase
        .from('harvest_calendar')
        .select('producer_id')
        .eq('id', harvestId)
        .single();

    if (!harvest || harvest.producer_id !== producer.id) {
        return { error: 'No tienes permiso para editar esta cosecha.' };
    }

    const validStatuses = ['planted', 'growing', 'ready', 'harvested'];
    if (!validStatuses.includes(status)) {
        return { error: 'Estado no válido.' };
    }

    const { error } = await supabase
        .from('harvest_calendar')
        .update({ status })
        .eq('id', harvestId);

    if (error) return { error: error.message };

    revalidatePath('/es/productor/cosechas');
    return { success: true };
}

export async function deleteHarvest(harvestId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado.' };

    const { data: producer } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!producer) return { error: 'No tienes permiso.' };

    const { data: harvest } = await supabase
        .from('harvest_calendar')
        .select('producer_id')
        .eq('id', harvestId)
        .single();

    if (!harvest || harvest.producer_id !== producer.id) {
        return { error: 'No tienes permiso para eliminar esta cosecha.' };
    }

    const { error } = await supabase
        .from('harvest_calendar')
        .delete()
        .eq('id', harvestId);

    if (error) return { error: error.message };

    revalidatePath('/es/productor/cosechas');
    return { success: true };
}
