'use server';

import { requireAuth } from '@/lib/auth';

export async function getUnreadNotificationCount() {
    try {
        const { supabase, user } = await requireAuth();

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('read', false);

        if (error) throw error;
        return count || 0;
    } catch {
        return 0;
    }
}

export async function getUserNotifications(limit = 10) {
    try {
        const { supabase, user } = await requireAuth();

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

export async function markNotificationRead(id: string) {
    try {
        const { supabase, user } = await requireAuth();

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw new Error('No se pudo actualizar la notificación');
    }
}

export async function markAllNotificationsRead() {
    try {
        const { supabase, user } = await requireAuth();

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw new Error('No se pudieron actualizar las notificaciones');
    }
}
