'use client';

import React from 'react';
import Image from 'next/image';
import { getDummyProductImage } from '@/utils/dummyImages';

interface HarvestEntry {
    id: string;
    product_name: string;
    category: string;
    planted_at: string;
    estimated_harvest: string;
    duration_days: number;
    status: string;
    notes: string | null;
    image_url?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; dot: string }> = {
    planted: { label: 'Sembrado', icon: '🌱', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-400' },
    growing: { label: 'Creciendo', icon: '🌿', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
    ready: { label: '¡Listo para comprar!', icon: '✅', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400 animate-pulse' },
    harvested: { label: 'Cosechado', icon: '🧺', color: 'text-gray-500', bg: 'bg-gray-50', dot: 'bg-gray-400' },
};

const CATEGORY_EMOJI: Record<string, string> = {
    fruta: '🍓',
    verdura: '🥦',
    carne: '🥩',
    lacteos: '🧀',
    huevos: '🥚',
    conservas: '🫙',
};

function getProgress(planted_at: string, estimated_harvest: string): number {
    const start = new Date(planted_at).getTime();
    const end = new Date(estimated_harvest).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
}

function getDaysRemaining(estimated_harvest: string): number {
    const diff = new Date(estimated_harvest).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function HarvestTimeline({ harvests }: { harvests: HarvestEntry[] }) {
    if (!harvests || harvests.length === 0) {
        return (
            <div className="text-center py-16">
                <span className="text-5xl block mb-4">🌱</span>
                <h3 className="text-lg font-bold text-brand-primary mb-2">Sin cosechas planificadas</h3>
                <p className="text-sm text-brand-text/50">Este productor aún no ha registrado su calendario de cosechas.</p>
            </div>
        );
    }

    // Sort: ready first, then by estimated harvest
    const sorted = [...harvests].sort((a, b) => {
        const priority: Record<string, number> = { ready: 0, growing: 1, planted: 2, harvested: 3 };
        const pa = priority[a.status] ?? 4;
        const pb = priority[b.status] ?? 4;
        if (pa !== pb) return pa - pb;
        return new Date(a.estimated_harvest).getTime() - new Date(b.estimated_harvest).getTime();
    });

    return (
        <div className="relative px-4 sm:px-0">
            {/* Vertical timeline line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-primary/20 via-brand-accent/20 to-transparent"></div>

            <div className="space-y-6">
                {sorted.map((h) => {
                    const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.planted;
                    const progress = getProgress(h.planted_at, h.estimated_harvest);
                    const daysLeft = getDaysRemaining(h.estimated_harvest);
                    const emoji = CATEGORY_EMOJI[h.category] || '🌾';

                    return (
                        <div key={h.id} className="relative flex gap-4 sm:gap-6">
                            {/* Timeline Dot */}
                            <div className="relative z-10 flex-shrink-0 w-12 sm:w-16 flex flex-col items-center">
                                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${cfg.dot}`}></div>
                            </div>

                            {/* Card */}
                            <div className={`flex-1 rounded-2xl border p-4 sm:p-5 ${cfg.bg} border-black/5 shadow-sm hover:shadow-md transition-shadow`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {/* Product Image with Category Emoji Badge */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-[52px] h-[52px] rounded-xl overflow-hidden border-2 border-white shadow-sm">
                                                <Image
                                                    src={h.image_url || getDummyProductImage(h.product_name, h.product_name)}
                                                    alt={h.product_name}
                                                    width={52}
                                                    height={52}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            {/* Category emoji badge */}
                                            <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-black/5">
                                                {emoji}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base text-brand-text">{h.product_name}</h4>
                                            <span className="text-[11px] text-brand-text/40 capitalize">{h.category}</span>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} border border-black/5`}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                </div>

                                {/* Progress */}
                                <div className="mb-2">
                                    <div className="w-full bg-white/80 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-700"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-[10px] text-brand-text/40">
                                        <span>Siembra: {new Date(h.planted_at).toLocaleDateString('es')}</span>
                                        <span>Cosecha: {new Date(h.estimated_harvest).toLocaleDateString('es')}</span>
                                    </div>
                                </div>

                                {/* Status message */}
                                <p className="text-sm font-medium mt-2">
                                    {h.status === 'ready' && (
                                        <span className="text-amber-600">🎉 ¡Disponible para comprar ahora!</span>
                                    )}
                                    {h.status === 'growing' && (
                                        <span className="text-emerald-600">⏳ Listo en {daysLeft} día{daysLeft !== 1 ? 's' : ''}</span>
                                    )}
                                    {h.status === 'planted' && (
                                        <span className="text-blue-600">🌱 Recién sembrado · {daysLeft} días restantes</span>
                                    )}
                                    {h.status === 'harvested' && (
                                        <span className="text-gray-500">✅ Cosecha completada</span>
                                    )}
                                </p>

                                {h.notes && (
                                    <p className="text-xs text-brand-text/50 mt-2 italic">&quot;{h.notes}&quot;</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
