'use client';

import React, { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { updateProfile } from '@/app/actions/updateProfile';
import { Button } from '@/components/ui/Button';

interface ProfileCardProps {
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
}

export function ProfileCard({ fullName, email, phone, avatarUrl }: ProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState(fullName);
    const [tel, setTel] = useState(phone || '');
    const [avatar, setAvatar] = useState(avatarUrl);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setFeedback({ type: 'error', message: 'Solo se permiten archivos de imagen.' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setFeedback({ type: 'error', message: 'La imagen no puede superar 5MB.' });
            return;
        }

        setUploadingAvatar(true);
        setFeedback(null);

        try {
            // Upload to Supabase Storage
            const { createClient } = await import('@/utils/supabase/client');
            const supabase = createClient();

            const fileExt = file.name.split('.').pop();
            const fileName = `avatar-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const imageUrl = urlData.publicUrl;

            // Save to database
            const result = await updateProfile({ avatar_url: imageUrl });
            if (result.success) {
                setAvatar(imageUrl);
                setFeedback({ type: 'success', message: '¡Foto actualizada!' });
            } else {
                setFeedback({ type: 'error', message: result.error || 'Error al guardar.' });
            }
        } catch {
            setFeedback({ type: 'error', message: 'Error al subir la imagen. Inténtalo de nuevo.' });
        } finally {
            setUploadingAvatar(false);
        }
    }

    function handleSave() {
        setFeedback(null);
        startTransition(async () => {
            const result = await updateProfile({ full_name: name, phone: tel || undefined });
            if (result.success) {
                setFeedback({ type: 'success', message: '¡Perfil actualizado!' });
                setIsEditing(false);
            } else {
                setFeedback({ type: 'error', message: result.error || 'Error al guardar.' });
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 border-3 border-brand-primary/20 shadow-md">
                        {avatar ? (
                            <Image
                                src={avatar}
                                alt="Avatar"
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl text-brand-primary/50">
                                {fullName ? fullName.charAt(0).toUpperCase() : '👤'}
                            </div>
                        )}
                    </div>

                    {/* Upload overlay */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                        <span className="text-white text-xs font-medium">
                            {uploadingAvatar ? '⏳' : '📷 Cambiar'}
                        </span>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                    />
                </div>

                <p className="text-xs text-brand-text/50 mt-2">
                    {uploadingAvatar ? 'Subiendo...' : 'Haz clic para cambiar'}
                </p>
            </div>

            {/* Profile Info */}
            {isEditing ? (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-brand-text/70 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-brand-text/70 mb-1">Teléfono</label>
                        <input
                            type="tel"
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                            placeholder="+34 600 000 000"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="primary" onClick={handleSave} disabled={isPending}>
                            {isPending ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setName(fullName); setTel(phone || ''); }}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className="font-medium text-brand-text mb-1">{name || 'Usuario'}</p>
                    <p className="text-sm text-brand-text/70 mb-1">{email}</p>
                    <p className="text-sm text-brand-text/70 mb-4">{tel || 'Sin teléfono'}</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-brand-primary text-sm font-medium hover:underline"
                    >
                        Editar perfil
                    </button>
                </div>
            )}

            {/* Feedback */}
            {feedback && (
                <p className={`text-xs ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {feedback.message}
                </p>
            )}
        </div>
    );
}
