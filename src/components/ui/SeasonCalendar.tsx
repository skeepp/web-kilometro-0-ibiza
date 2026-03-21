'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTHS_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Reference data for Ibiza seasonal products
const SEASONAL_REFERENCE = [
    { name: 'Tomates', category: 'verdura', months: [4, 5, 6, 7, 8, 9], peak: [6, 7, 8], emoji: '🍅' },
    { name: 'Lechugas', category: 'verdura', months: [0, 1, 2, 3, 4, 10, 11], peak: [1, 2, 3], emoji: '🥬' },
    { name: 'Sandías', category: 'fruta', months: [5, 6, 7, 8], peak: [6, 7], emoji: '🍉' },
    { name: 'Melones', category: 'fruta', months: [5, 6, 7, 8], peak: [6, 7], emoji: '🍈' },
    { name: 'Naranjas', category: 'fruta', months: [10, 11, 0, 1, 2, 3], peak: [11, 0, 1], emoji: '🍊' },
    { name: 'Limones', category: 'fruta', months: [10, 11, 0, 1, 2, 3, 4], peak: [0, 1, 2], emoji: '🍋' },
    { name: 'Calabacines', category: 'verdura', months: [3, 4, 5, 6, 7, 8, 9], peak: [5, 6, 7], emoji: '🥒' },
    { name: 'Berenjenas', category: 'verdura', months: [5, 6, 7, 8, 9], peak: [6, 7, 8], emoji: '🍆' },
    { name: 'Pimientos', category: 'verdura', months: [5, 6, 7, 8, 9], peak: [6, 7, 8], emoji: '🌶️' },
    { name: 'Fresas', category: 'fruta', months: [1, 2, 3, 4, 5], peak: [2, 3, 4], emoji: '🍓' },
    { name: 'Higos', category: 'fruta', months: [6, 7, 8, 9], peak: [7, 8], emoji: '🫐' },
    { name: 'Almendras', category: 'fruta', months: [7, 8, 9], peak: [8, 9], emoji: '🌰' },
    { name: 'Patatas', category: 'verdura', months: [3, 4, 5, 6, 9, 10], peak: [4, 5, 10], emoji: '🥔' },
    { name: 'Cebollas', category: 'verdura', months: [3, 4, 5, 6, 7], peak: [4, 5, 6], emoji: '🧅' },
    { name: 'Ajos', category: 'verdura', months: [4, 5, 6], peak: [5, 6], emoji: '🧄' },
    { name: 'Huevos', category: 'huevos', months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], peak: [2, 3, 4, 5], emoji: '🥚' },
    { name: 'Queso Curado', category: 'lacteos', months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], emoji: '🧀' },
];

const CATEGORY_FILTERS = [
    { value: '', label: 'Todos' },
    { value: 'fruta', label: '🍓 Fruta' },
    { value: 'verdura', label: '🥦 Verdura' },
    { value: 'lacteos', label: '🧀 Lácteos' },
    { value: 'huevos', label: '🥚 Huevos' },
];

export function SeasonCalendar({ harvests }: { harvests: HarvestEntry[] }) {
    const [filter, setFilter] = useState('');
    const [expanded, setExpanded] = useState(false);
    const currentMonth = new Date().getMonth();
    const router = useRouter();

    const filtered = SEASONAL_REFERENCE.filter(p =>
        !filter || p.category === filter
    );

    const displayItems = expanded ? filtered : filtered.slice(0, 8);

    // Get active harvests grouped by product
    const activeHarvests = harvests.filter(h => h.status !== 'harvested');

    return (
        <div className="bg-white rounded-2xl border border-brand-primary/10 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-primary flex items-center gap-2">
                            📅 Calendario de Temporada
                        </h2>
                        <p className="text-xs sm:text-sm text-brand-text/50 mt-1">
                            Guía de disponibilidad de productos frescos en Ibiza
                        </p>
                    </div>
                    {/* Current Month indicator */}
                    <div className="bg-brand-primary/5 px-4 py-2 rounded-xl border border-brand-primary/10 text-sm font-medium text-brand-primary flex items-center gap-2 self-start">
                        <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                        Ahora: {MONTHS_FULL[currentMonth]}
                    </div>
                </div>

                {/* Category filter pills */}
                <div className="flex overflow-x-auto pb-3 gap-2 scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0">
                    {CATEGORY_FILTERS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => setFilter(c.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex-shrink-0 ${
                                filter === c.value
                                    ? 'bg-brand-primary text-white border-brand-primary'
                                    : 'bg-white text-brand-text/70 border-gray-200 hover:border-brand-primary/50'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                    {/* Month Headers */}
                    <thead>
                        <tr className="border-t border-b border-gray-100">
                            <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold text-brand-text/40 w-[180px] sm:w-[220px] sticky left-0 bg-white z-10">
                                Producto
                            </th>
                            {MONTHS.map((m, i) => (
                                <th
                                    key={m}
                                    className={`text-center py-3 px-0.5 sm:px-1 text-[10px] sm:text-xs font-medium transition-colors ${
                                        i === currentMonth
                                            ? 'text-brand-primary font-bold bg-brand-primary/5'
                                            : 'text-brand-text/40'
                                    }`}
                                >
                                    {m}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayItems.map((product, idx) => {
                            const imgSrc = getDummyProductImage(product.name, product.name);
                            return (
                                <tr key={product.name} className={`border-b border-gray-50 hover:bg-brand-background/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                    {/* Product Name Cell — clickable */}
                                    <td className="py-2.5 px-4 sm:px-6 sticky left-0 bg-white z-10">
                                        <button
                                            onClick={() => router.push(`/es/mercado?producto=${encodeURIComponent(product.name)}`)}
                                            className="flex items-center gap-2 sm:gap-3 group cursor-pointer text-left w-full"
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm group-hover:border-brand-accent group-hover:shadow-md transition-all">
                                                    <Image
                                                        src={imgSrc}
                                                        alt={product.name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                                <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">
                                                    {product.emoji}
                                                </span>
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-brand-text truncate group-hover:text-brand-accent transition-colors">
                                                {product.name}
                                            </span>
                                            <svg className="w-3 h-3 text-brand-text/20 group-hover:text-brand-accent transition-colors flex-shrink-0 hidden sm:block" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </button>
                                    </td>

                                    {/* Month Cells — clickable product emojis */}
                                    {MONTHS.map((_, monthIdx) => {
                                        const isPeak = product.peak.includes(monthIdx);
                                        const isAvailable = product.months.includes(monthIdx);
                                        const isCurrent = monthIdx === currentMonth;

                                        return (
                                            <td key={monthIdx} className={`text-center py-2.5 px-0 ${isCurrent ? 'bg-brand-primary/5' : ''}`}>
                                                {isPeak ? (
                                                    <button
                                                        onClick={() => router.push(`/es/mercado?producto=${encodeURIComponent(product.name)}`)}
                                                        className="mx-auto w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-accent/15 flex items-center justify-center border border-brand-accent/20 cursor-pointer hover:bg-brand-accent/30 hover:scale-110 transition-all"
                                                        title={`Comprar ${product.name} — Temporada óptima en ${MONTHS_FULL[monthIdx]}`}
                                                    >
                                                        <span className="text-sm sm:text-base">{product.emoji}</span>
                                                    </button>
                                                ) : isAvailable ? (
                                                    <button
                                                        onClick={() => router.push(`/es/mercado?producto=${encodeURIComponent(product.name)}`)}
                                                        className="mx-auto w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:scale-110 transition-all"
                                                        title={`Comprar ${product.name} — Disponible en ${MONTHS_FULL[monthIdx]}`}
                                                    >
                                                        <span className="text-sm sm:text-base opacity-40 grayscale">{product.emoji}</span>
                                                    </button>
                                                ) : (
                                                    <div className="mx-auto w-7 h-7 sm:w-8 sm:h-8"></div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend + Expand */}
            <div className="p-4 sm:p-6 pt-3 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                {/* Legend */}
                <div className="flex items-center gap-5 text-[10px] sm:text-xs text-brand-text/50">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center text-xs">🍅</div>
                        <span>Temporada óptima</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-xs opacity-40 grayscale">🍅</div>
                        <span>Disponible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg border border-dashed border-gray-200"></div>
                        <span className="hidden sm:inline">Fuera de temporada</span>
                    </div>
                </div>

                {/* Show more / less */}
                {filtered.length > 8 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs font-semibold text-brand-accent hover:underline transition-colors"
                    >
                        {expanded ? '▲ Ver menos' : `▼ Ver ${filtered.length - 8} productos más`}
                    </button>
                )}
            </div>

            {/* Live Harvests Section */}
            {activeHarvests.length > 0 && (
                <div className="border-t border-brand-primary/10 p-5 sm:p-6 bg-brand-background/20">
                    <h3 className="text-sm font-bold text-brand-primary mb-3 flex items-center gap-2">
                        🌱 Cosechas en Curso de Nuestros Productores
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeHarvests.slice(0, 6).map(h => {
                            const daysLeft = Math.max(0, Math.ceil((new Date(h.estimated_harvest).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                            const imgSrc = getDummyProductImage(h.product_name, h.product_name);
                            const statusColors: Record<string, string> = {
                                planted: 'bg-blue-50 text-blue-700 border-blue-200',
                                growing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                ready: 'bg-amber-50 text-amber-700 border-amber-200',
                            };
                            const statusLabels: Record<string, string> = {
                                planted: '🌱 Sembrado',
                                growing: '🌿 Creciendo',
                                ready: '✅ ¡Listo!',
                            };

                            return (
                                <div key={h.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-brand-primary/5 shadow-sm">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                        <Image src={imgSrc} alt={h.product_name} width={40} height={40} className="object-cover w-full h-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-brand-text truncate">{h.product_name}</p>
                                        <p className="text-[10px] text-brand-text/50">
                                            {h.status === 'ready' ? '🎉 ¡Disponible ahora!' : `⏳ Listo en ${daysLeft} días`}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColors[h.status] || ''}`}>
                                        {statusLabels[h.status] || h.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
