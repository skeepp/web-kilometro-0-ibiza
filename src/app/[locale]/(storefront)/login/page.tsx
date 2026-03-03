'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'consumer' | 'producer'>('consumer');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // A redirect is happening from the server action, or we can handle it here if it returns success
            // If the server action redirects using Next.js `redirect`, the execution here will just halt as an error is thrown internally by Next.js.
            // But to be safe in case it returns without error or redirect:
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-280px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 rounded-2xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-brand-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-brand-primary">Iniciar Sesión</h1>
                    <p className="text-brand-muted mt-2">
                        Accede a tu cuenta de De la Finca {activeTab === 'producer' ? 'como Productor' : ''}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('consumer')}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${activeTab === 'consumer' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-brand-primary'}`}
                    >
                        🧺 Comprador
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('producer')}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${activeTab === 'producer' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-brand-primary'}`}
                    >
                        👨‍🌾 Productor
                    </button>
                </div>

                {/* Form Card */}
                <Card>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-1">
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
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {error}
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
                                        Iniciando sesión...
                                    </span>
                                ) : (
                                    'Login'
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
