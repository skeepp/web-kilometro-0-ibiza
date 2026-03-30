'use server';

import { createClient } from '@/utils/supabase/server';
import { requireAuth } from '@/lib/auth';

export async function toggleFollow(producerId: string) {
    try {
        const { supabase, user } = await requireAuth();

        // Check if currently following
        const { data: existing } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('producer_id', producerId)
            .single();

        if (existing) {
            // Unfollow
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('id', existing.id);

            if (error) throw error;
            return { following: false };
        } else {
            // Follow
            const { error } = await supabase
                .from('follows')
                .insert({
                    follower_id: user.id,
                    producer_id: producerId
                });

            if (error) throw error;
            return { following: true };
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        throw new Error('No se pudo actualizar el seguimiento');
    }
}

export async function getFollowStatus(producerId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return false;

        const { data } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('producer_id', producerId)
            .single();

        return !!data;
    } catch {
        return false;
    }
}

export async function getFollowerCount(producerId: string) {
    try {
        const supabase = await createClient();
        
        const { count, error } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('producer_id', producerId);

        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('Error getting follower count:', error);
        return 0;
    }
}
