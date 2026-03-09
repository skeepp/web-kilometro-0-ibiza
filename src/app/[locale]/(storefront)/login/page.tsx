'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else if (result?.success && result.redirectPath) {
            router.push(result.redirectPath);
        } else {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-background via-white to-brand-background/50 relative overflow-hidden">
            {/* Ambient decorative blurs */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white shadow-soft rounded-2xl mb-6 relative overflow-hidden border border-brand-primary/10">
                        <div className="absolute inset-0 bg-brand-primary/5" />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-brand-primary relative z-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary text-balance">Iniciar Sesión</h1>
                    <p className="text-brand-text/70 mt-3 text-lg">
                        Accede a tu cuenta de De la Finca
                    </p>
                </div>

                {/* Form Card */}
                <Card className="border border-brand-primary/10 shadow-2xl bg-white/80 backdrop-blur-xl">
                    <CardContent className="p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="tu@email.com"
                                required
                                autoComplete="email"
                                className="bg-white"
                            />
                            <Input
                                label="Contraseña"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                className="bg-white"
                            />

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                disabled={loading}
                                className="!mt-8 shadow-md hover:shadow-lg transition-all"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Iniciando sesión...
                                    </span>
                                ) : (
                                    'Acceder'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Register Link */}
                <p className="text-center text-sm text-brand-muted mt-6">
                    ¿No tienes cuenta?{' '}
                    <Link href="/es/registro" className="text-brand-primary font-semibold hover:text-brand-accent transition-colors">
                        Crear una cuenta
                    </Link>
                </p>
            </div>
        </div>
    );
}
