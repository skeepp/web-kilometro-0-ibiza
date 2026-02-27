'use client';

import React, { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateProducerProfile } from './actions';
import { CldUploadWidget, CldImage } from 'next-cloudinary';

interface Producer {
    id: string;
    brand_name: string | null;
    municipality: string | null;
    description: string | null;
    sanitary_registration: string | null;
    lat: number | null;
    lng: number | null;
    profile_image_url: string | null;
    cover_image_url: string | null;
}

interface ProducerProfileFormProps {
    producer: Producer;
}

export function ProducerProfileForm({ producer }: ProducerProfileFormProps) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [profileImageUrl, setProfileImageUrl] = useState(producer.profile_image_url || '');
    const [coverImageUrl, setCoverImageUrl] = useState(producer.cover_image_url || '');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);

        const formData = new FormData(event.currentTarget);
        const data = {
            brand_name: formData.get('brand_name') as string,
            municipality: formData.get('municipality') as string,
            description: formData.get('description') as string,
            sanitary_registration: formData.get('sanitary_registration') as string,
            lat: formData.get('lat') as string,
            lng: formData.get('lng') as string,
            profile_image_url: profileImageUrl,
            cover_image_url: coverImageUrl,
        };

        startTransition(async () => {
            const result = await updateProducerProfile(data);
            if (result.success) {
                setMessage({ type: 'success', text: '✅ Perfil actualizado correctamente.' });
            } else {
                setMessage({ type: 'error', text: `❌ Error: ${result.error}` });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile & Cover Images */}
            <div className="border border-brand-primary/10 rounded-2xl p-6 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-brand-primary mb-6">Imágenes del Perfil</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-brand-primary/10 flex items-center justify-center border-2 border-brand-primary/20">
                            {profileImageUrl ? (
                                <CldImage
                                    src={profileImageUrl}
                                    width={128}
                                    height={128}
                                    alt="Foto de perfil"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span className="text-4xl">🌿</span>
                            )}
                        </div>
                        <CldUploadWidget
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                            onSuccess={(result) => {
                                if (result.info && typeof result.info === 'object' && 'public_id' in result.info) {
                                    setProfileImageUrl(result.info.public_id as string);
                                }
                            }}
                        >
                            {({ open }) => (
                                <Button type="button" variant="outline" size="sm" onClick={() => open()}>
                                    Cambiar foto de perfil
                                </Button>
                            )}
                        </CldUploadWidget>
                    </div>

                    {/* Cover Image */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-brand-primary/10 flex items-center justify-center border-2 border-brand-primary/20">
                            {coverImageUrl ? (
                                <CldImage
                                    src={coverImageUrl}
                                    width={400}
                                    height={128}
                                    alt="Foto de portada"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span className="text-4xl">🏡</span>
                            )}
                        </div>
                        <CldUploadWidget
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                            onSuccess={(result) => {
                                if (result.info && typeof result.info === 'object' && 'public_id' in result.info) {
                                    setCoverImageUrl(result.info.public_id as string);
                                }
                            }}
                        >
                            {({ open }) => (
                                <Button type="button" variant="outline" size="sm" onClick={() => open()}>
                                    Cambiar foto de portada
                                </Button>
                            )}
                        </CldUploadWidget>
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="border border-brand-primary/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-brand-primary mb-6">Información Básica</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Input
                        name="brand_name"
                        label="Nombre de la Finca / Marca"
                        defaultValue={producer.brand_name || ''}
                        required
                    />
                    <Input
                        name="municipality"
                        label="Municipio (Ibiza)"
                        defaultValue={producer.municipality || ''}
                        placeholder="Ej: Santa Eulalia"
                    />
                    <Input
                        name="sanitary_registration"
                        label="Registro Sanitario (RGSEAA)"
                        defaultValue={producer.sanitary_registration || ''}
                        placeholder="Ej: 07.1234.1/C"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Descripción de la finca
                    </label>
                    <textarea
                        name="description"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all h-36 resize-none"
                        defaultValue={producer.description || ''}
                        placeholder="Cuéntanos sobre tu finca, tus métodos de cultivo y tus productos..."
                    />
                </div>
            </div>

            {/* Location */}
            <div className="border border-brand-primary/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-brand-primary mb-2">Ubicación (opcional)</h2>
                <p className="text-sm text-brand-text/60 mb-6">Coordenadas para mostrar tu finca en el mapa de productores.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Input
                        name="lat"
                        label="Latitud"
                        defaultValue={producer.lat?.toString() || ''}
                        placeholder="Ej: 38.9067"
                        type="number"
                        step="any"
                    />
                    <Input
                        name="lng"
                        label="Longitud"
                        defaultValue={producer.lng?.toString() || ''}
                        placeholder="Ej: 1.4206"
                        type="number"
                        step="any"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
                {message && (
                    <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </p>
                )}
                <div className="ml-auto">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
