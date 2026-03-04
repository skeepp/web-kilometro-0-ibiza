'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleProductAvailability(productId: string, available: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'No autenticado.' };

    // Verify ownership
    const { data: product } = await supabase
        .from('products')
        .select('producer_id')
        .eq('id', productId)
        .single();

    if (!product) return { error: 'Producto no encontrado.' };

    const { data: producer } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', user.id)
        .eq('id', product.producer_id)
        .single();

    if (!producer) return { error: 'No tienes permiso.' };

    const { error } = await supabase
        .from('products')
        .update({ available })
        .eq('id', productId);

    if (error) return { error: error.message };

    revalidatePath('/es/productor/productos');
    return { success: true };
}

export async function createProduct(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'No autenticado.' };

    const { data: producer } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!producer) return { error: 'No tienes un perfil de productor.' };

    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const unit = formData.get('unit') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const description = formData.get('description') as string;
    const imageUrl = formData.get('image_url') as string;

    if (!name || !category || !unit || isNaN(price) || isNaN(stock)) {
        return { error: 'Todos los campos obligatorios deben estar completos.' };
    }

    // Generate slug
    const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now().toString(36);

    const { error } = await supabase
        .from('products')
        .insert({
            producer_id: producer.id,
            name,
            slug,
            category,
            unit,
            price,
            stock,
            description: description || null,
            available: true,
            images: imageUrl ? [imageUrl] : [],
        });

    if (error) {
        console.error('[Create Product Error]', error.message);
        return { error: error.message };
    }

    revalidatePath('/es/productor/productos');
    return { success: true };
}

export async function updateProduct(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'No autenticado.' };

    const productId = formData.get('product_id') as string;
    if (!productId) return { error: 'ID de producto no válido.' };

    // Verify the producer owns this product
    const { data: producer } = await supabase
        .from('producers')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!producer) return { error: 'No tienes un perfil de productor.' };

    const { data: product } = await supabase
        .from('products')
        .select('producer_id')
        .eq('id', productId)
        .single();

    if (!product || product.producer_id !== producer.id) {
        return { error: 'No tienes permiso para editar este producto.' };
    }

    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const unit = formData.get('unit') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const description = formData.get('description') as string;
    const imageUrl = formData.get('image_url') as string;

    if (!name || !category || !unit || isNaN(price) || isNaN(stock)) {
        return { error: 'Todos los campos obligatorios deben estar completos.' };
    }

    const updatePayload: Record<string, unknown> = {
        name,
        category,
        unit,
        price,
        stock,
        description: description || null,
    };

    if (imageUrl) {
        updatePayload.images = [imageUrl];
    }

    const { error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', productId);

    if (error) {
        console.error('[Update Product Error]', error.message);
        return { error: error.message };
    }

    revalidatePath('/es/productor/productos');
    return { success: true };
}
