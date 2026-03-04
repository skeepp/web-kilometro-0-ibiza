'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface UpdateProducerProfileData {
    brand_name: string;
    municipality: string;
    description: string;
    sanitary_registration: string;
    lat?: string;
    lng?: string;
    profile_image_url?: string;
    cover_image_url?: string;
}

export async function updateProducerProfile(data: UpdateProducerProfileData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'No autenticado.' };
    }

    const { data: producer } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!producer) {
        return { success: false, error: 'Perfil de productor no encontrado.' };
    }

    const updatePayload: Record<string, unknown> = {
        brand_name: data.brand_name,
        municipality: data.municipality,
        description: data.description,
        sanitary_registration: data.sanitary_registration,
    };

    if (data.lat) updatePayload.lat = parseFloat(data.lat);
    if (data.lng) updatePayload.lng = parseFloat(data.lng);
    if (data.profile_image_url) updatePayload.profile_image_url = data.profile_image_url;
    if (data.cover_image_url) updatePayload.cover_image_url = data.cover_image_url;

    const { error } = await supabase
        .from('producers')
        .update(updatePayload)
        .eq('id', producer.id);

    if (error) {
        return { success: false, error: error.message };
    }

    // Si se subió una nueva foto de perfil, sincronizarla con el avatar_url global del usuario
    // para que el Navbar muestre la misma foto
    if (data.profile_image_url) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ avatar_url: data.profile_image_url })
            .eq('id', user.id);

        if (profileError) {
            console.error('[Profile Avatar Sync Error]', profileError.message);
        }
    }

    revalidatePath('/productor/perfil');
    return { success: true };
}
