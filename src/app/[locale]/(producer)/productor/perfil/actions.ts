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
    phone?: string;
    contact_email?: string;
    instagram?: string;
    website?: string;
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
        phone: data.phone || null,
        contact_email: data.contact_email || null,
        instagram: data.instagram || null,
        website: data.website || null,
    };

    let parsedLat = data.lat ? parseFloat(data.lat) : null;
    let parsedLng = data.lng ? parseFloat(data.lng) : null;

    if ((!parsedLat || !parsedLng) && data.municipality) {
        try {
            const searchQuery = encodeURIComponent(data.municipality + ', Ibiza, España');
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`);
            const geoData = await res.json();
            if (geoData && geoData[0]) {
                parsedLat = parseFloat(geoData[0].lat);
                parsedLng = parseFloat(geoData[0].lon);
            }
        } catch (e) {
            console.error("Geocoding failed:", e);
        }
    }

    updatePayload.lat = parsedLat;
    updatePayload.lng = parsedLng;
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
