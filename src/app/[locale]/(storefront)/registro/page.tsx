'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { register } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setPasswordError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        const result = await register(formData);

        if (result && 'success' in result && result.success) {
            setSuccessMsg(result.error || '¡Cuenta creada correctamente!');
            setLoading(false);
        } else if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-280px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/10 rounded-2xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-brand-accent">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-brand-primary">Crear Cuenta</h1>
                    <p className="text-brand-muted mt-2">Únete a la comunidad de De la Finca</p>
                </div>

                {/* Form Card */}
                <Card>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-1">
                            <Input
                                label="Nombre completo"
                                name="fullName"
                                type="text"
                                placeholder="María García"
                                required
                                autoComplete="name"
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="tu@email.com"
                                required
                                autoComplete="email"
                            />
                            <Input
                                label="Contraseña"
                                name="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                required
                                autoComplete="new-password"
                                error={passwordError || undefined}
                            />
                            <Input
                                label="Confirmar contraseña"
                                name="confirmPassword"
                                type="password"
                                placeholder="Repite tu contraseña"
                                required
                                autoComplete="new-password"
                            />

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {successMsg && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                                    {successMsg}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                disabled={loading}
                                className="!mt-6"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creando cuenta...
                                    </span>
                                ) : (
                                    'Crear mi cuenta'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-xs text-brand-muted text-center">
                                Al crear una cuenta, aceptas nuestros términos y condiciones y nuestra política de privacidad.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Login Link */}
                <p className="text-center text-sm text-brand-muted mt-6">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-brand-primary font-semibold hover:text-brand-accent transition-colors">
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
