'use client';

import React, { useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { createProducerProfile } from '@/app/actions/createProducerProfile';
import Image from 'next/image';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'delafinca';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'delafinca';

async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Upload failed');
    return data.secure_url;
}

export default function ProducerOnboardingPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string>('');
    const [coverImageUrl, setCoverImageUrl] = useState<string>('');

    const profileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    async function handleImageChange(
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'profile' | 'cover'
    ) {
        const file = e.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        if (type === 'profile') setProfilePreview(preview);
        else setCoverPreview(preview);

        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            if (type === 'profile') setProfileImageUrl(url);
            else setCoverImageUrl(url);
        } catch {
            setError('Error al subir la imagen. Inténtalo de nuevo.');
        } finally {
            setUploading(false);
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        if (profileImageUrl) formData.set('profile_image_url', profileImageUrl);
        if (coverImageUrl) formData.set('cover_image_url', coverImageUrl);

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

                {/* Cover Photo Upload */}
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Foto de portada
                        <span className="text-brand-text/40 font-normal ml-1">(opcional, aparece en tu perfil público)</span>
                    </label>
                    <div
                        onClick={() => coverInputRef.current?.click()}
                        className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden cursor-pointer hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-colors flex items-center justify-center"
                    >
                        {coverPreview ? (
                            <Image src={coverPreview} alt="Portada" fill className="object-cover" />
                        ) : (
                            <div className="text-center">
                                <span className="text-3xl block mb-1">🏡</span>
                                <span className="text-sm text-brand-text/50">Haz clic para subir tu foto de portada</span>
                                <span className="text-xs text-brand-text/30 block mt-1">JPG, PNG — máx. 5MB</span>
                            </div>
                        )}
                        {coverPreview && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Cambiar foto</span>
                            </div>
                        )}
                    </div>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, 'cover')}
                    />
                </div>

                {/* Profile Photo Upload */}
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Foto de perfil
                        <span className="text-brand-text/40 font-normal ml-1">(opcional, aparece como avatar de tu finca)</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => profileInputRef.current?.click()}
                            className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden cursor-pointer hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-colors flex items-center justify-center flex-shrink-0"
                        >
                            {profilePreview ? (
                                <Image src={profilePreview} alt="Perfil" fill className="object-cover" />
                            ) : (
                                <span className="text-2xl">👨‍🌾</span>
                            )}
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => profileInputRef.current?.click()}
                                className="text-sm text-brand-primary font-medium hover:underline"
                            >
                                {profilePreview ? 'Cambiar foto de perfil' : 'Subir foto de perfil'}
                            </button>
                            <p className="text-xs text-brand-text/40 mt-1">JPG o PNG, mínimo 200×200px</p>
                        </div>
                    </div>
                    <input
                        ref={profileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, 'profile')}
                    />
                </div>

                {uploading && (
                    <p className="text-sm text-brand-accent flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Subiendo imagen...
                    </p>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100 pt-2">
                    <p className="text-xs font-semibold text-brand-text/40 uppercase tracking-wider">Información de la finca</p>
                </div>

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
                        Dirección de recogida *
                        <span className="text-brand-text/40 font-normal ml-1">(donde recogerán los clientes)</span>
                    </label>
                    <input
                        name="pickup_address"
                        type="text"
                        required
                        placeholder="Ej: Mercat Vell, Parada 12, Eivissa"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    />
                    <p className="text-xs text-brand-text/40 mt-1">📍 Esta dirección aparecerá en los pedidos de tus clientes para la recogida.</p>
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

                <Button type="submit" disabled={isPending || uploading} className="w-full">
                    {isPending ? 'Creando perfil...' : 'Crear mi perfil de productor'}
                </Button>

                <p className="text-xs text-brand-text/50 text-center">
                    Tu perfil será revisado por nuestro equipo antes de ser activado.
                </p>
            </form>
        </div>
    );
}
