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
        console.error('[Login Error]', error.message);
        if (error.message.includes('Invalid login credentials')) {
            return { error: 'Credenciales incorrectas. Revisa tu email y contraseña.' };
        }
        if (error.message.includes('Email not confirmed')) {
            return { error: 'Tu email aún no ha sido confirmado. Revisa tu bandeja de entrada.' };
        }
        return { error: `Error de autenticación: ${error.message}` };
    }

    revalidatePath('/', 'layout');
    redirect('/es/cuenta');
}

export async function register(formData: FormData) {
    const supabase = await createClient();

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const roleInput = formData.get('role') as string;
    const role = roleInput === 'producer' ? 'producer' : 'consumer';

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
        console.error('[Register Error]', error.message, error.status);
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
            return { error: 'Este email ya está registrado. Prueba a iniciar sesión.' };
        }
        if (error.message.includes('not authorized') || error.message.includes('Signups not allowed')) {
            return { error: 'El registro de nuevos usuarios está deshabilitado en este momento.' };
        }
        return { error: `Error al crear la cuenta: ${error.message}` };
    }

    // Handle email confirmation requirement
    // When email confirmation is enabled, signUp succeeds but user.identities may be empty
    if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { error: 'Este email ya está registrado. Prueba a iniciar sesión.' };
    }

    // If Supabase requires email confirmation, the user won't be logged in yet
    if (data.user && !data.session) {
        return {
            success: true,
            error: '¡Cuenta creada! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.'
        };
    }

    // Insert profile record (only if user was auto-confirmed and we have a session)
    if (data.user) {
        try {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: fullName,
                role: role,
            });
            if (profileError) {
                console.error('[Profile Upsert Error]', profileError.message);
                // Don't block the registration - the profile can be created later
            }
        } catch (err) {
            console.error('[Profile Upsert Exception]', err);
        }
    }

    revalidatePath('/', 'layout');
    redirect('/es/cuenta');
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/es');
}

