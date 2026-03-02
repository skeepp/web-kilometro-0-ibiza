'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { createProducerProfile } from '@/app/actions/createProducerProfile';

export default function ProducerOnboardingPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createProducerProfile(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 inline-block">🌿</span>
                <h1 className="text-3xl font-serif font-bold text-brand-primary">
                    Conviértete en Productor
                </h1>
                <p className="text-brand-text/60 mt-2">
                    Completa los datos de tu finca para empezar a vender en De la Finca.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Nombre de la Finca / Marca *
                    </label>
                    <input
                        name="brand_name"
                        type="text"
                        required
                        placeholder="Ej: Finca Es Olivar"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Municipio *
                    </label>
                    <select
                        name="municipality"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary bg-white"
                    >
                        <option value="">Selecciona tu municipio</option>
                        <option value="Eivissa">Eivissa</option>
                        <option value="Santa Eulària des Riu">Santa Eulària des Riu</option>
                        <option value="Sant Joan de Labritja">Sant Joan de Labritja</option>
                        <option value="Sant Antoni de Portmany">Sant Antoni de Portmany</option>
                        <option value="Sant Josep de sa Talaia">Sant Josep de sa Talaia</option>
                        <option value="Formentera">Formentera</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Descripción de tu finca
                    </label>
                    <textarea
                        name="description"
                        rows={4}
                        placeholder="Cuéntanos qué cultivas, tus métodos de producción, qué te hace especial..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Registro Sanitario (opcional)
                    </label>
                    <input
                        name="sanitary_registration"
                        type="text"
                        placeholder="Ej: 07.1234.1/C"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
                )}

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? 'Creando perfil...' : 'Crear mi perfil de productor'}
                </Button>

                <p className="text-xs text-brand-text/50 text-center">
                    Tu perfil será revisado por nuestro equipo antes de ser activado.
                </p>
            </form>
        </div>
    );
}
