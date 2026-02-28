import React from 'react';
import { requireProducer } from '@/lib/auth';
import { ProducerProfileForm } from './ProducerProfileForm';

export default async function ProducerProfile() {
    const { producer } = await requireProducer();

    if (!producer) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Perfil no encontrado</h1>
                <p className="text-brand-text/70">No tienes un perfil de productor asociado a esta cuenta. Contacta con el administrador.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brand-primary">Mi Perfil Público</h1>
                <p className="text-brand-text/60 mt-2">Esta información aparecerá en tu página pública de la tienda.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-brand-primary/10 p-8">
                <ProducerProfileForm producer={producer} />
            </div>
        </div>
    );
}
