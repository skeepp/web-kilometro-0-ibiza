'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AddToCartButton } from '../productores/[slug]/AddToCartButton';
import { useLocale } from 'next-intl';
import { getDummyProductImage } from '@/utils/dummyImages';
import { useSearchParams } from 'next/navigation';

/* ═══════════════════════════════════════════
   Season data
   ═══════════════════════════════════════════ */
const PEAK_SEASON_BY_MONTH: Record<number, string[]> = {
    0: ['Naranjas', 'Limones'],
    1: ['Lechugas', 'Naranjas', 'Limones', 'Fresas'],
    2: ['Lechugas', 'Limones', 'Fresas'],
    3: ['Lechugas', 'Fresas'],
    4: ['Patatas', 'Cebollas', 'Fresas', 'Huevos'],
    5: ['Calabacines', 'Cebollas', 'Ajos', 'Huevos'],
    6: ['Tomates', 'Sandías', 'Melones', 'Calabacines', 'Berenjenas', 'Pimientos', 'Cebollas', 'Ajos'],
    7: ['Tomates', 'Sandías', 'Melones', 'Berenjenas', 'Pimientos', 'Higos'],
    8: ['Tomates', 'Berenjenas', 'Pimientos', 'Higos', 'Almendras'],
    9: ['Almendras'],
    10: ['Patatas'],
    11: ['Naranjas'],
};

const CATEGORIES = [
    { value: '', label: '🌿 Todos' },
    { value: 'fruta', label: '🍓 Fruta' },
    { value: 'verdura', label: '🥦 Verdura' },
    { value: 'carne', label: '🥩 Carne' },
    { value: 'lacteos', label: '🧀 Lácteos' },
    { value: 'huevos', label: '🥚 Huevos' },
    { value: 'conservas', label: '🫙 Conservas' },
];

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
interface Producer {
    id: string;
    brand_name: string | null;
    slug: string;
    municipality?: string | null;
    profile_image_url?: string | null;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    unit: string | null;
    category: string | null;
    origin: string | null;
    images: string[] | null;
    stock?: number | null;
    created_at?: string;
    producers: Producer | null;
    product_reviews: { rating: number }[] | null;
}

interface MarketClientProps {
    products: Product[];
    municipalities: string[];
}

/* ═══════════════════════════════════════════
   Badge helpers
   ═══════════════════════════════════════════ */
function getBadge(product: Product, peakProducts: string[]): { label: string; color: string; icon: string } | null {
    const isTemporada = peakProducts.some(sp => product.name.toLowerCase().includes(sp.toLowerCase()));
    const stock = product.stock ?? 999;
    let harvestedDaysAgo: number | null = null;
    if (product.created_at) {
        const days = Math.floor((Date.now() - new Date(product.created_at).getTime()) / (1000 * 3600 * 24));
        if (days >= 0 && days < 3) harvestedDaysAgo = days;
    }

    // Priority order: low stock > just harvested > best seller (seasonal + good reviews)
    if (stock > 0 && stock <= 5) {
        const unitLabel = product.unit || 'ud';
        return { label: `¡Solo quedan ${stock} ${unitLabel}!`, color: 'bg-red-500/90 text-white', icon: '⚡' };
    }
    if (harvestedDaysAgo !== null && harvestedDaysAgo <= 2) {
        return { label: 'Recién Cosechado', color: 'bg-emerald-500/90 text-white', icon: '🌱' };
    }
    const reviews = product.product_reviews || [];
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    if (isTemporada && avgRating >= 4) {
        return { label: 'Más Vendido', color: 'bg-amber-500/90 text-white', icon: '🔥' };
    }
    if (isTemporada) {
        return { label: 'De Temporada', color: 'bg-emerald-500/90 text-white', icon: '🌿' };
    }
    return null;
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
export function MarketClient({ products, municipalities }: MarketClientProps) {
    const locale = useLocale();
    const searchParams = useSearchParams();
    const productoParam = searchParams.get('producto') || '';

    const [search, setSearch] = useState(productoParam);
    const [category, setCategory] = useState('');
    const [municipality, setMunicipality] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showOnlySeason, setShowOnlySeason] = useState(false);

    useEffect(() => { if (productoParam) setSearch(productoParam); }, [productoParam]);

    const searchPlaceholders = useMemo(() => [
        "Busca tomates...", "Queso de Can Bufí...", "Miel de azahar...", "Huevos ecológicos...", "Sobrasada ibicenca..."
    ], []);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setPlaceholderIdx(prev => (prev + 1) % searchPlaceholders.length), 3000);
        return () => clearInterval(interval);
    }, [searchPlaceholders]);

    const currentMonth = new Date().getMonth();
    const peakProducts = PEAK_SEASON_BY_MONTH[currentMonth] || [];
    const inSeasonCount = useMemo(() => products.filter(p => peakProducts.some(sp => p.name.toLowerCase().includes(sp.toLowerCase()))).length, [products, peakProducts]);

    const filtered = useMemo(() => {
        let result = [...products];
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.producers?.brand_name?.toLowerCase().includes(q));
        }
        if (category) result = result.filter(p => p.category === category);
        if (municipality) result = result.filter(p => p.producers?.municipality === municipality);
        if (maxPrice && !isNaN(Number(maxPrice))) result = result.filter(p => p.price <= Number(maxPrice));
        if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') {
            result.sort((a, b) => {
                const avgA = a.product_reviews?.length ? a.product_reviews.reduce((s, r) => s + r.rating, 0) / a.product_reviews.length : 0;
                const avgB = b.product_reviews?.length ? b.product_reviews.reduce((s, r) => s + r.rating, 0) / b.product_reviews.length : 0;
                return avgB - avgA;
            });
        }
        if (showOnlySeason && peakProducts.length > 0) {
            result = result.filter(p => peakProducts.some(sp => p.name.toLowerCase().includes(sp.toLowerCase())));
        }
        return result;
    }, [products, search, category, municipality, maxPrice, sortBy, showOnlySeason, peakProducts]);

    const hasFilters = search || category || municipality || maxPrice || showOnlySeason;
    function clearFilters() {
        setSearch(''); setCategory(''); setMunicipality(''); setMaxPrice(''); setSortBy('newest'); setShowOnlySeason(false);
        if (productoParam) window.history.replaceState({}, '', '/es/mercado');
    }

    /* ═══════════════════ RENDER ═══════════════════ */
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* ── Search Bar ── */}
            <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-brand-text/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder={searchPlaceholders[placeholderIdx]}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary shadow-sm transition-all"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text/40 hover:text-brand-text p-1">✕</button>
                )}
            </div>

            {/* ── Category Chips ── */}
            <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap gap-2">
                    <button
                        onClick={() => { setShowOnlySeason(!showOnlySeason); setCategory(''); }}
                        className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border flex items-center gap-1.5 flex-shrink-0 ${showOnlySeason
                            ? 'bg-gradient-to-r from-brand-accent to-brand-primary text-white border-brand-accent shadow-md shadow-brand-accent/20'
                            : 'bg-gradient-to-r from-brand-accent/10 to-brand-primary/10 text-brand-primary border-brand-accent/30 hover:border-brand-accent/60'
                        }`}
                    >
                        🌿 De Temporada
                        <span className="bg-white/30 text-brand-primary px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs leading-none">{inSeasonCount}</span>
                    </button>
                    <div className="w-px bg-gray-200 flex-shrink-0 hidden sm:block"></div>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => { setCategory(cat.value); setShowOnlySeason(false); }}
                            className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all border flex-shrink-0 ${category === cat.value && !showOnlySeason
                                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                : 'bg-white text-brand-text border-gray-200 hover:border-brand-primary/50'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Secondary Filters ── */}
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3 mb-8 items-center">
                <select value={municipality} onChange={e => setMunicipality(e.target.value)}
                    className="col-span-2 lg:col-span-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary w-full">
                    <option value="">📍 Todos los municipios</option>
                    {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white">
                    <span className="text-xs sm:text-sm text-brand-text/60">Máx €</span>
                    <input type="number" placeholder="0" value={maxPrice} min={0} onChange={e => setMaxPrice(e.target.value)}
                        className="w-full sm:w-16 text-sm font-medium text-brand-primary focus:outline-none bg-transparent" />
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary lg:ml-auto">
                    <option value="newest">↕ Recientes</option>
                    <option value="price_asc">↑ Precio min</option>
                    <option value="price_desc">↓ Precio max</option>
                    <option value="rating">★ Valoración</option>
                </select>
            </div>

            {/* ── Seasonal Banner ── */}
            {showOnlySeason && (
                <div className="mb-6 bg-gradient-to-r from-brand-accent/10 via-brand-primary/5 to-brand-accent/10 rounded-xl border border-brand-accent/20 p-4 flex items-center gap-3">
                    <span className="text-2xl">🌿</span>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-brand-primary">Productos de Temporada</p>
                        <p className="text-xs text-brand-text/60">Mostrando productos en su mejor momento: {peakProducts.join(', ')}</p>
                    </div>
                    <Link href="/es/calendario" className="text-xs font-semibold text-brand-accent hover:underline flex-shrink-0">Ver calendario →</Link>
                </div>
            )}

            {/* ── Calendar Banner ── */}
            {productoParam && !showOnlySeason && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-brand-background rounded-xl border border-blue-100 p-4 flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-brand-primary">Buscando: {productoParam}</p>
                        <p className="text-xs text-brand-text/60">Has llegado desde el Calendario de Temporada</p>
                    </div>
                    <button onClick={clearFilters} className="text-xs font-semibold text-brand-accent hover:underline flex-shrink-0">Ver todos ✕</button>
                </div>
            )}

            {/* ── Results Header ── */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-primary/10">
                <h2 className="text-sm sm:text-lg font-bold text-brand-text">
                    {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
                    {hasFilters && <span className="text-brand-text/50 font-normal"> encontrados</span>}
                </h2>
                {hasFilters && (
                    <button onClick={clearFilters} className="text-sm text-brand-accent hover:underline flex items-center gap-1">✕ Limpiar filtros</button>
                )}
            </div>

            {/* ═══════════════════ PRODUCT GRID ═══════════════════ */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-brand-background/30 rounded-2xl border border-brand-primary/10">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <h3 className="text-xl font-bold text-brand-primary mb-2">Sin resultados</h3>
                    <p className="text-brand-text/70">Prueba a cambiar los filtros o buscador.</p>
                    <button onClick={clearFilters} className="mt-4 text-sm text-brand-accent hover:underline">Limpiar todos los filtros</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6" id="productos">
                    {filtered.map((product) => {
                        const producer = product.producers;
                        const reviews = product.product_reviews;
                        const avgRating = reviews && reviews.length > 0
                            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : null;
                        const badge = getBadge(product, peakProducts);

                        const categoryColors: Record<string, string> = {
                            fruta: 'bg-rose-50 text-rose-500 border-rose-100',
                            verdura: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                            carne: 'bg-red-50 text-red-500 border-red-100',
                            lacteos: 'bg-amber-50 text-amber-600 border-amber-100',
                            huevos: 'bg-orange-50 text-orange-500 border-orange-100',
                            conservas: 'bg-stone-50 text-stone-500 border-stone-200',
                        };
                        const catColor = categoryColors[product.category || ''] || 'bg-gray-50 text-gray-500 border-gray-100';

                        return (
                            <div
                                key={product.id}
                                className="flex flex-col h-full group relative overflow-hidden bg-white rounded-3xl border border-gray-100/80 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.14)] hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* ── Image ── */}
                                <Link href={`/${locale}/productos/${product.slug}`} className="block relative h-48 sm:h-52 overflow-hidden bg-brand-background/20">
                                    {(product.images?.[0] || getDummyProductImage(product.name, product.slug)) ? (
                                        <Image
                                            src={product.images?.[0] || getDummyProductImage(product.name, product.slug)}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">🥬</div>
                                    )}
                                    {/* Gradient overlay at bottom */}
                                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                                    {/* ── Status Badge (top-left) ── */}
                                    {badge && (
                                        <span className={`absolute top-3 left-3 ${badge.color} backdrop-blur-md text-[11px] font-bold px-2.5 py-1 rounded-full z-10 shadow-lg flex items-center gap-1`}>
                                            {badge.icon} {badge.label}
                                        </span>
                                    )}

                                    {/* ── Category badge (top-right) ── */}
                                    {product.category && (
                                        <span className={`absolute top-3 right-3 backdrop-blur-md text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize z-10 border ${catColor}`}>
                                            {product.category}
                                        </span>
                                    )}
                                </Link>

                                {/* ── Card Body ── */}
                                <div className="p-4 sm:p-5 flex flex-col flex-1">
                                    {/* Product name */}
                                    <Link href={`/${locale}/productos/${product.slug}`} className="block mb-1">
                                        <h3 className="font-bold text-[15px] sm:text-base text-gray-900 line-clamp-2 leading-snug hover:text-brand-primary transition-colors">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    {/* Rating */}
                                    {avgRating && (
                                        <div className="flex items-center gap-1 text-xs mb-2">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(Number(avgRating)) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="font-semibold text-gray-700">{avgRating}</span>
                                            <span className="text-gray-400">({reviews?.length})</span>
                                        </div>
                                    )}

                                    {/* Producer link — highlighted */}
                                    {producer && (
                                        <Link
                                            href={`/${locale}/productores/${producer.slug}`}
                                            className="flex items-center gap-2 mb-3 group/producer hover:bg-brand-primary/5 -mx-1 px-1 py-1 rounded-lg transition-colors"
                                        >
                                            {producer.profile_image_url ? (
                                                <img src={producer.profile_image_url} alt={producer.brand_name || ''} className="w-6 h-6 rounded-full object-cover border-2 border-brand-primary/20 group-hover/producer:border-brand-primary/50 transition-colors" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-[10px] border-2 border-brand-primary/20">
                                                    {producer.brand_name?.charAt(0) || '🌿'}
                                                </div>
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold text-xs text-brand-primary group-hover/producer:text-brand-accent transition-colors truncate">{producer.brand_name}</span>
                                                {producer.municipality && (
                                                    <span className="text-[10px] text-gray-400 truncate">📍 {producer.municipality}</span>
                                                )}
                                            </div>
                                        </Link>
                                    )}

                                    {/* Description */}
                                    <p className="hidden lg:block text-xs text-gray-400 mb-3 flex-1 line-clamp-2 leading-relaxed">
                                        {product.description || 'Producto fresco y local de kilómetro cero.'}
                                    </p>

                                    {/* ── Price + Unit Display ── */}
                                    <div className="flex items-baseline gap-1.5 mb-3">
                                        <span className="text-xl sm:text-2xl font-extrabold text-brand-primary tracking-tight">
                                            {product.price.toFixed(2)}€
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">
                                            / {product.unit || 'ud'}
                                        </span>
                                    </div>

                                    {/* ── Add to Cart ── */}
                                    <div className="mt-auto pt-1">
                                        <AddToCartButton
                                            product={{
                                                ...product,
                                                unit: product.unit || 'unidad',
                                                producerId: producer?.id || '',
                                                producerName: producer?.brand_name || '',
                                                image: product.images?.[0] || getDummyProductImage(product.name, product.slug),
                                                producerImage: producer?.profile_image_url || null
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
