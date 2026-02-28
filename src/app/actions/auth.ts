'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email y contraseña son obligatorios' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { error: 'Credenciales incorrectas. Revisa tu email y contraseña.' };
    }

    revalidatePath('/', 'layout');
    redirect('/cuenta');
}

export async function register(formData: FormData) {
    const supabase = await createClient();

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!fullName || !email || !password) {
        return { error: 'Todos los campos son obligatorios' };
    }

    if (password.length < 6) {
        return { error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        if (error.message.includes('already registered')) {
            return { error: 'Este email ya está registrado. Prueba a iniciar sesión.' };
        }
        return { error: 'Error al crear la cuenta. Inténtalo de nuevo.' };
    }

    // Insert profile record
    if (data.user) {
        await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: 'consumer',
        });
    }

    revalidatePath('/', 'layout');
    redirect('/cuenta');
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/');
}
