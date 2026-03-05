'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

/**
 * Ensures the current user is authenticated.
 * Redirects to /login if not.
 * Returns { supabase, user }.
 */
export async function requireAuth() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/es/login');
    }

    return { supabase, user };
}

/**
 * Ensures the current user has the 'admin' role.
 * Redirects to /login if not authenticated or not admin.
 * Returns { supabase, user, profile }.
 */
export async function requireAdmin() {
    const { supabase, user } = await requireAuth();

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        redirect('/es/login');
    }

    return { supabase, user, profile };
}

/**
 * Ensures the current user is a producer and has a producer profile.
 * Redirects to /login if not authenticated.
 * Redirects to /cuenta if the user is not a producer.
 * Returns { supabase, user, producer }.
 */
export async function requireProducer() {
    const { supabase, user } = await requireAuth();

    // Check the user's role in the profiles table first
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // If user is NOT a producer, redirect them to the buyer dashboard
    if (!profile || profile.role !== 'producer') {
        redirect('/es/cuenta');
    }

    const { data: producer } = await supabase
        .from('producers')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return { supabase, user, producer };
}
