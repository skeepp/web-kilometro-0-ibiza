'use client';

import React, { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateProducerProfile } from './actions';
import { createClient } from '@/utils/supabase/client';

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
interface Producer {
    id: string;
    slug: string;
    brand_name: string | null;
    municipality: string | null;
    description: string | null;
    sanitary_registration: string | null;
    lat: number | null;
    lng: number | null;
    profile_image_url: string | null;
    cover_image_url: string | null;
    phone?: string | null;
    contact_email?: string | null;
    instagram?: string | null;
    website?: string | null;
    status?: string | null;
}

/* ═══════════════════════════════════════════
   Inline image upload helper
   ═══════════════════════════════════════════ */
function useImageUpload(bucket: string, folder: string) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    async function upload(file: File): Promise<string | null> {
        if (!file.type.startsWith('image/')) return null;
        if (file.size > 5 * 1024 * 1024) return null;
        setUploading(true);
        try {
            const supabase = createClient();
            const ext = file.name.split('.').pop();
            const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase.storage.from(bucket).upload(name, file, { upsert: true });
            if (error) throw error;
            const { data } = supabase.storage.from(bucket).getPublicUrl(name);
            return data.publicUrl;
        } catch {
            return null;
        } finally {
            setUploading(false);
        }
    }

    return { upload, uploading, inputRef };
}

/* ═══════════════════════════════════════════
   Pending badge for empty fields
   ═══════════════════════════════════════════ */
function PendingBadge({ value }: { value: string | null | undefined }) {
    if (value && value.trim().length > 0) return null;
    return (
        <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded border border-amber-200">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            Pendiente
        </span>
    );
}

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */
export function ProducerProfileForm({ producer }: { producer: Producer }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Image state
    const [profileImg, setProfileImg] = useState(producer.profile_image_url || '');
    const [coverImg, setCoverImg] = useState(producer.cover_image_url || '');

    // Upload hooks
    const profileUpload = useImageUpload('avatars', 'producers');
    const coverUpload = useImageUpload('avatars', 'covers');

    // Handle cover file change
    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await coverUpload.upload(file);
        if (url) setCoverImg(url);
    };

    // Handle profile file change
    const handleProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await profileUpload.upload(file);
        if (url) setProfileImg(url);
    };

    // Form submit
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);

        const fd = new FormData(event.currentTarget);
        const data = {
            brand_name: fd.get('brand_name') as string,
            municipality: fd.get('municipality') as string,
            description: fd.get('description') as string,
            sanitary_registration: fd.get('sanitary_registration') as string,
            lat: fd.get('lat') as string,
            lng: fd.get('lng') as string,
            phone: fd.get('phone') as string,
            contact_email: fd.get('contact_email') as string,
            instagram: fd.get('instagram') as string,
            website: fd.get('website') as string,
            profile_image_url: profileImg,
            cover_image_url: coverImg,
        };

        startTransition(async () => {
            const result = await updateProducerProfile(data);
            if (result.success) {
                setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
                setTimeout(() => setMessage(null), 4000);
            } else {
                setMessage({ type: 'error', text: `Error: ${result.error}` });
            }
        });
    }

    // Completion percentage
    const fields = [
        producer.brand_name, producer.municipality, producer.description,
        producer.sanitary_registration, profileImg, coverImg,
        producer.phone, producer.contact_email
    ];
    const filled = fields.filter(f => f && String(f).trim().length > 0).length;
    const completionPct = Math.round((filled / fields.length) * 100);

    return (
        <form onSubmit={handleSubmit} className="max-w-[1100px] mx-auto space-y-5">

            {/* ═══ SUCCESS / ERROR TOAST ═══ */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300 ${
                    message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    {message.type === 'success' ? '✓' : '✕'} {message.text}
                </div>
            )}

            {/* ═══ HEADER ROW: Title + Actions ═══ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Mi Perfil Público</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Esta información aparecerá en tu página pública de la tienda</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Completion badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                style={{ width: `${completionPct}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{completionPct}%</span>
                    </div>
                    {/* Preview button */}
                    <Link
                        href={`/es/productores/${producer.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver tienda pública
                    </Link>
                    {/* Save button */}
                    <Button type="submit" disabled={isPending} size="sm" className="text-xs font-bold">
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Guardando...
                            </span>
                        ) : 'Guardar cambios'}
                    </Button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                SECTION 1: COVER + PROFILE IMAGE (Social Media style)
               ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Cover Banner — 3:1 aspect ratio */}
                <div className="relative w-full" style={{ aspectRatio: '3.5 / 1' }}>
                    {coverImg ? (
                        <Image src={coverImg} alt="Foto de portada" fill className="object-cover" sizes="1100px" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-emerald-100 via-emerald-50 to-amber-50 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-3xl">🏡</span>
                                <p className="text-xs text-gray-400 mt-1">Añade una foto de tu finca</p>
                            </div>
                        </div>
                    )}
                    {/* Gradient overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
                    {/* Cover upload button */}
                    <button
                        type="button"
                        onClick={() => coverUpload.inputRef.current?.click()}
                        disabled={coverUpload.uploading}
                        className="absolute bottom-3 right-3 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-lg transition-all z-10"
                        title="Cambiar foto de portada"
                    >
                        {coverUpload.uploading ? (
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>
                    <input ref={coverUpload.inputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

                    {/* Profile image — overlapping the cover */}
                    <div className="absolute -bottom-10 left-6 z-20">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                                {profileImg ? (
                                    <Image src={profileImg} alt="Logo" width={96} height={96} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-3xl">🌿</div>
                                )}
                            </div>
                            {/* Profile upload icon */}
                            <button
                                type="button"
                                onClick={() => profileUpload.inputRef.current?.click()}
                                disabled={profileUpload.uploading}
                                className="absolute -bottom-1 -right-1 p-1.5 bg-brand-primary hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all"
                                title="Cambiar logo"
                            >
                                {profileUpload.uploading ? (
                                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                ) : (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                )}
                            </button>
                            <input ref={profileUpload.inputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileChange} />
                        </div>
                    </div>
                </div>

                {/* Name + status under cover */}
                <div className="pl-[120px] pr-6 pt-3 pb-5 flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900">{producer.brand_name || 'Tu Finca'}</h2>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        producer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${producer.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        {producer.status === 'active' ? 'Verificada' : 'Pendiente'}
                    </span>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                SECTION 2: TWO-COLUMN FORM (Identity + Contact)
               ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ─── LEFT: Identity ─── */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Datos de identidad
                    </h3>

                    <Input
                        name="brand_name"
                        label="Nombre de la Finca / Marca"
                        defaultValue={producer.brand_name || ''}
                        placeholder="Ej: Can Salchichón"
                        required
                    />

                    <Input
                        name="municipality"
                        label="Municipio"
                        defaultValue={producer.municipality || ''}
                        placeholder="Ej: Santa Eulària des Riu"
                    />

                    {/* Registro Sanitario — highlighted */}
                    <div className="mb-4">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-800 mb-1.5">
                            Registro Sanitario (RGSEAA)
                            <PendingBadge value={producer.sanitary_registration} />
                            <span className="relative group">
                                <svg className="w-3.5 h-3.5 text-gray-400 hover:text-brand-primary cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[10px] rounded-lg w-52 text-center shadow-lg z-30 leading-relaxed">
                                    Obligatorio para vender productos alimentarios. Lo puedes solicitar en tu ayuntamiento o gobierno balear.
                                </span>
                            </span>
                        </label>
                        <input
                            name="sanitary_registration"
                            defaultValue={producer.sanitary_registration || ''}
                            placeholder="Ej: 26.000123/IB"
                            className="block w-full rounded-xl border-2 border-amber-200 bg-amber-50/30 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:bg-white outline-none transition-all"
                        />
                    </div>
                </div>

                {/* ─── RIGHT: Contact & Social ─── */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contacto y redes sociales
                    </h3>

                    <Input
                        name="phone"
                        label="Teléfono"
                        defaultValue={producer.phone || ''}
                        placeholder="Ej: 600 123 456"
                        type="tel"
                    />

                    <Input
                        name="contact_email"
                        label="Email de contacto"
                        defaultValue={producer.contact_email || ''}
                        placeholder="Ej: hola@mifinca.com"
                        type="email"
                    />

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-800 mb-1.5">Instagram</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                            <input
                                name="instagram"
                                defaultValue={producer.instagram || ''}
                                placeholder="tu.finca.ibiza"
                                className="block w-full rounded-xl border border-gray-200 bg-white pl-8 pr-4 py-3 text-sm text-gray-900 shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <Input
                        name="website"
                        label="Página web"
                        defaultValue={producer.website || ''}
                        placeholder="Ej: https://www.mifinca.com"
                        type="url"
                    />
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                SECTION 3: DESCRIPTION (full-width)
               ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Descripción de la finca
                    <PendingBadge value={producer.description} />
                </h3>
                <p className="text-[11px] text-gray-400 mb-3">Cuenta tu historia, métodos de cultivo y qué te hace especial. Se mostrará en tu página pública.</p>
                <textarea
                    name="description"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all h-32 resize-none leading-relaxed"
                    defaultValue={producer.description || ''}
                    placeholder="Somos una finca familiar en Santa Eulària dedicada al cultivo ecológico de cítricos y hortalizas de temporada. Nuestros campos se riegan con agua de pozo y no utilizamos pesticidas químicos..."
                />
            </div>

            {/* ═══════════════════════════════════════════
                SECTION 4: LOCATION
               ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ubicación en el mapa
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium">Aparecerá en el Radar de productores</span>
                </div>
                <p className="text-[11px] text-gray-400 mb-4">Coordenadas GPS de tu finca. Puedes obtenerlas desde Google Maps haciendo clic derecho en tu ubicación.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
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

            {/* ═══ BOTTOM STICKY SAVE BAR (mobile) ═══ */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40">
                <Button type="submit" disabled={isPending} fullWidth className="text-sm font-bold">
                    {isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </div>
        </form>
    );
}
