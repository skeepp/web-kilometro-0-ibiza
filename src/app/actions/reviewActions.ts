'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Debes iniciar sesión para publicar una reseña.' };

    const productId = formData.get('productId') as string;
    const rating = parseInt(formData.get('rating') as string, 10);
    const comment = formData.get('comment') as string;

    if (!productId || isNaN(rating) || rating < 1 || rating > 5) {
        return { error: 'Datos de valoración no válidos.' };
    }

    const { error } = await supabase
        .from('product_reviews')
        .insert({
            product_id: productId,
            user_id: user.id,
            rating,
            comment: comment || null,
        });

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { error: 'Ya has valorado este producto.' };
        }
        console.error('[Submit Review Error]', error.message);
        return { error: 'Error al enviar la valoración.' };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}
