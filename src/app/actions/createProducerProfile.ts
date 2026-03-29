'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createProducerProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Debes iniciar sesión para registrarte como productor.' };
    }

    // Check if already has a producer profile
    const { data: existing } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

    if (existing) {
        redirect('/es/productor/dashboard');
    }

    const brandName = formData.get('brand_name') as string;
    const municipality = formData.get('municipality') as string;
    const description = formData.get('description') as string;
    const sanitaryRegistration = formData.get('sanitary_registration') as string;
    const pickupAddress = formData.get('pickup_address') as string;

    const profileImageUrl = formData.get('profile_image_url') as string | null;
    const coverImageUrl = formData.get('cover_image_url') as string | null;

    if (!brandName || !municipality) {
        return { error: 'El nombre de la finca y el municipio son obligatorios.' };
    }

    // Generate slug from brand name
    const slug = brandName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now().toString(36);

    // Update user role to producer
    await supabase
        .from('profiles')
        .update({ role: 'producer' })
        .eq('id', user.id);

    // Create producer record
    const { error } = await supabase
        .from('producers')
        .insert({
            user_id: user.id,
            brand_name: brandName,
            slug,
            municipality,
            description: description || null,
            sanitary_registration: sanitaryRegistration || null,
            profile_image_url: profileImageUrl || null,
            cover_image_url: coverImageUrl || null,
            pickup_address: pickupAddress || null,
            status: 'pending',
        });

    if (error) {
        console.error('[Create Producer Error]', error.message);
        return { error: `Error al crear el perfil: ${error.message}` };
    }

    revalidatePath('/es/productor/dashboard');
    redirect('/es/productor/dashboard');
}
