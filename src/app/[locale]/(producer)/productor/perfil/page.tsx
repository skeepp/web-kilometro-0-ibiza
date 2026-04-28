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

    return <ProducerProfileForm producer={producer} />;
}
