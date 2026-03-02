'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

interface ImageUploadProps {
    currentUrl: string | null;
    onUpload: (url: string) => void;
    bucket?: string;
    folder?: string;
    label: string;
    shape?: 'circle' | 'rectangle';
    width?: number;
    height?: number;
}

export function ImageUpload({
    currentUrl,
    onUpload,
    bucket = 'images',
    folder = 'uploads',
    label,
    shape = 'rectangle',
    width = 400,
    height = 128,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentUrl);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten imágenes.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no puede superar 5MB.');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw new Error(uploadError.message);

            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            setPreviewUrl(urlData.publicUrl);
            onUpload(urlData.publicUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al subir la imagen.');
        } finally {
            setUploading(false);
        }
    }

    const isCircle = shape === 'circle';

    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className={`overflow-hidden bg-brand-primary/10 flex items-center justify-center border-2 border-brand-primary/20 ${isCircle ? 'w-32 h-32 rounded-full' : 'w-full h-32 rounded-xl'
                    }`}
            >
                {previewUrl ? (
                    <Image
                        src={previewUrl}
                        width={width}
                        height={height}
                        alt={label}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <span className="text-4xl">{isCircle ? '🌿' : '🏡'}</span>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
            />

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? 'Subiendo...' : label}
            </Button>

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
