'use server';

import { createClient } from '@/utils/supabase/server';
import { requireProducer } from '@/lib/auth';

export async function promoteProduct(productId: string) {
    try {
        const { supabase, producer } = await requireProducer();

        // 1. Validate ownership and get product details
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('name, slug, images')
            .eq('id', productId)
            .eq('producer_id', producer.id)
            .single();

        if (productError || !product) {
            throw new Error('Producto no encontrado o no autorizado');
        }

        // 2. Check 24h cooldown
        const { data: recentPromotion } = await supabase
            .from('notifications')
            .select('created_at')
            .eq('type', 'promotion')
            .eq('producer_name', producer.brand_name)
            .eq('product_name', product.name)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (recentPromotion) {
            const hoursSince = (new Date().getTime() - new Date(recentPromotion.created_at).getTime()) / (1000 * 60 * 60);
            if (hoursSince < 24) {
                throw new Error('Solo puedes promocionar el mismo producto una vez cada 24 horas');
            }
        }

        // 3. Get all followers
        const { data: follows, error: followsError } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('producer_id', producer.id);

        if (followsError) {
            throw new Error('Error al obtener seguidores');
        }

        if (!follows || follows.length === 0) {
            return { success: true, notifiedCount: 0, message: 'No tienes seguidores a los que notificar aún' };
        }

        const followersToNotify = follows.map(f => f.follower_id);
        const productImageUrl = product.images && product.images.length > 0 ? product.images[0] : producer.profile_image_url;

        // 4. Create in-app notifications in batch
        const notifications = followersToNotify.map(userId => ({
            user_id: userId,
            type: 'promotion',
            title: `Nueva Promoción de ${producer.brand_name}`,
            body: `¡${producer.brand_name} acaba de lanzar una oferta en ${product.name}!`,
            image_url: productImageUrl,
            action_url: `/es/productos/${product.slug}`,
            producer_name: producer.brand_name,
            product_name: product.name,
            read: false
        }));

        const { error: insertError } = await supabase
            .from('notifications')
            .insert(notifications);

        if (insertError) {
            console.error('Error insertando notificaciones:', insertError);
            throw new Error('Error al crear las notificaciones');
        }

        // 5. Trigger n8n Webhook for emails/push (background)
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            // We don't await this so it happens strictly in the background without blocking the UI response
            fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    producer_id: producer.id,
                    producer_name: producer.brand_name,
                    product_id: productId,
                    product_name: product.name,
                    product_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://web-kilometro-0-ibiza.vercel.app'}/es/productos/${product.slug}`,
                    image_url: productImageUrl,
                    follower_ids: followersToNotify
                })
            }).catch(e => console.error('Error triggering n8n webhook:', e));
        }

        return { 
            success: true, 
            notifiedCount: followersToNotify.length,
            message: `¡Notificación enviada a ${followersToNotify.length} seguidores!`
        };

    } catch (error: any) {
        console.error('Error promoting product:', error);
        return { success: false, error: error.message || 'Error desconocido' };
    }
}
