'use client';

import React, { useState } from 'react';
import { createHarvest, updateHarvestStatus, deleteHarvest } from '@/app/actions/harvestActions';

interface Harvest {
    id: string;
    product_name: string;
    category: string;
    planted_at: string;
    estimated_harvest: string;
    duration_days: number;
    status: string;
    notes: string | null;
}

const CATEGORIES = [
    { value: 'fruta', label: '🍓 Fruta' },
    { value: 'verdura', label: '🥦 Verdura' },
    { value: 'carne', label: '🥩 Carne' },
    { value: 'lacteos', label: '🧀 Lácteos' },
    { value: 'huevos', label: '🥚 Huevos' },
    { value: 'conservas', label: '🫙 Conservas' },
];

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    planted: { label: 'Sembrado', icon: '🌱', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    growing: { label: 'Creciendo', icon: '🌿', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    ready: { label: '¡Listo!', icon: '✅', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    harvested: { label: 'Cosechado', icon: '🧺', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
};

const NEXT_STATUS: Record<string, string> = {
    planted: 'growing',
    growing: 'ready',
    ready: 'harvested',
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

export default function HarvestManager({ harvests: initial }: { harvests: Harvest[] }) {
    const [harvests, setHarvests] = useState(initial);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const form = new FormData(e.currentTarget);
        const result = await createHarvest(form);
        if (result.error) {
            setError(result.error);
        } else {
            setShowForm(false);
            // Reload page to get fresh data
            window.location.reload();
        }
        setLoading(false);
    }

    async function handleStatusChange(id: string, newStatus: string) {
        const result = await updateHarvestStatus(id, newStatus);
        if (!result.error) {
            setHarvests(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Eliminar esta cosecha?')) return;
        const result = await deleteHarvest(id);
        if (!result.error) {
            setHarvests(prev => prev.filter(h => h.id !== id));
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary flex items-center gap-3">
                        🌱 Calendario de Cosechas
                    </h1>
                    <p className="text-brand-text/60 mt-2">Planifica y comparte tus cultivos con tus clientes.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-sm flex items-center gap-2"
                >
                    {showForm ? '✕ Cerrar' : '+ Nueva cosecha'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-primary/10 shadow-soft space-y-5">
                    <h2 className="text-xl font-bold text-brand-primary">Registrar nueva cosecha</h2>

                    {error && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-brand-text/70 mb-1.5">Nombre del cultivo *</label>
                            <input name="product_name" required placeholder="Ej. Tomates Cherry"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-text/70 mb-1.5">Categoría *</label>
                            <select name="category" required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary bg-white">
                                <option value="">Seleccionar...</option>
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-text/70 mb-1.5">Fecha de siembra *</label>
                            <input name="planted_at" type="date" required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-brand-text/70 mb-1.5">Días hasta cosecha *</label>
                            <input name="duration_days" type="number" required min="1" max="365" placeholder="Ej. 90"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-brand-text/70 mb-1.5">Notas (opcional)</label>
                        <textarea name="notes" rows={3} placeholder="Ej. Variedad Raf, riego por goteo..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-50 text-sm">
                        {loading ? 'Guardando...' : '🌱 Registrar Cosecha'}
                    </button>
                </form>
            )}

            {/* Harvest Cards */}
            {harvests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-brand-primary/10">
                    <span className="text-5xl mb-4 block">🌾</span>
                    <h3 className="text-xl font-bold text-brand-primary mb-2">Sin cosechas aún</h3>
                    <p className="text-brand-text/60">Registra tu primera cosecha para que tus clientes vean qué les espera.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {harvests.map(h => {
                        const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.planted;
                        const progress = getProgress(h.planted_at, h.estimated_harvest);
                        const daysLeft = getDaysRemaining(h.estimated_harvest);
                        const nextStatus = NEXT_STATUS[h.status];

                        return (
                            <div key={h.id} className={`rounded-2xl border p-5 sm:p-6 transition-all ${cfg.bg}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-brand-text">{h.product_name}</h3>
                                        <span className="text-xs text-brand-text/50 capitalize">{h.category}</span>
                                    </div>
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-[11px] text-brand-text/50 mb-1">
                                        <span>Siembra: {new Date(h.planted_at).toLocaleDateString('es')}</span>
                                        <span>Cosecha: {new Date(h.estimated_harvest).toLocaleDateString('es')}</span>
                                    </div>
                                    <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden border border-white">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-brand-text/60 mt-1.5 font-medium">
                                        {h.status === 'ready' ? '🎉 ¡Listo para cosechar!' :
                                         h.status === 'harvested' ? '✅ Cosechado' :
                                         daysLeft > 0 ? `⏳ Faltan ${daysLeft} días` : '🎉 ¡Listo!'}
                                    </p>
                                </div>

                                {h.notes && (
                                    <p className="text-xs text-brand-text/60 mb-4 italic">"{h.notes}"</p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-black/5">
                                    {nextStatus && (
                                        <button
                                            onClick={() => handleStatusChange(h.id, nextStatus)}
                                            className="flex-1 py-2 text-xs font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-all"
                                        >
                                            Avanzar a: {STATUS_CONFIG[nextStatus]?.icon} {STATUS_CONFIG[nextStatus]?.label}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(h.id)}
                                        className="px-3 py-2 text-xs font-medium text-red-500 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
