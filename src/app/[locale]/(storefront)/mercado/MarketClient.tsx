'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { AddToCartButton } from '../productores/[slug]/AddToCartButton';
import { useLocale } from 'next-intl';
import { getDummyProductImage } from '@/utils/dummyImages';
import { useSearchParams } from 'next/navigation';

// Seasonal reference — products in peak season by month
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

interface Producer {
    id: string;
    brand_name: string | null;
    slug: string;
    municipality?: string | null;
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
    producers: Producer | null;
    product_reviews: { rating: number }[] | null;
}

interface MarketClientProps {
    products: Product[];
    municipalities: string[];
}

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

    // Update search when coming from calendar link
    useEffect(() => {
        if (productoParam) {
            setSearch(productoParam);
        }
    }, [productoParam]);

    // Current month's peak products
    const currentMonth = new Date().getMonth();
    const peakProducts = PEAK_SEASON_BY_MONTH[currentMonth] || [];

    const filtered = useMemo(() => {
        let result = [...products];

        // Text search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.producers?.brand_name?.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (category) {
            result = result.filter(p => p.category === category);
        }

        // Municipality filter
        if (municipality) {
            result = result.filter(p => p.producers?.municipality === municipality);
        }

        // Max price filter
        if (maxPrice && !isNaN(Number(maxPrice))) {
            result = result.filter(p => p.price <= Number(maxPrice));
        }

        // Sort
        if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') {
            result.sort((a, b) => {
                const avgA = a.product_reviews?.length
                    ? a.product_reviews.reduce((s, r) => s + r.rating, 0) / a.product_reviews.length : 0;
                const avgB = b.product_reviews?.length
                    ? b.product_reviews.reduce((s, r) => s + r.rating, 0) / b.product_reviews.length : 0;
                return avgB - avgA;
            });
        }

        // Seasonal filter
        if (showOnlySeason && peakProducts.length > 0) {
            result = result.filter(p => {
                const name = p.name.toLowerCase();
                return peakProducts.some(sp => name.includes(sp.toLowerCase()));
            });
        }

        return result;
    }, [products, search, category, municipality, maxPrice, sortBy, showOnlySeason, peakProducts]);

    const hasFilters = search || category || municipality || maxPrice || showOnlySeason;

    function clearFilters() {
        setSearch('');
        setCategory('');
        setMunicipality('');
        setMaxPrice('');
        setSortBy('newest');
        setShowOnlySeason(false);
        // Clear URL params
        if (productoParam) {
            window.history.replaceState({}, '', '/es/mercado');
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-brand-text/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Buscar productos, productores..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary shadow-sm"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text/40 hover:text-brand-text p-1">
                        ✕
                    </button>
                )}
            </div>

            {/* Filter Row: Horizontal scroll on mobile */}
            <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap gap-2">
                    {/* Productos de Temporada - special button */}
                    <button
                        onClick={() => { setShowOnlySeason(!showOnlySeason); setCategory(''); }}
                        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all border flex-shrink-0 ${showOnlySeason
                            ? 'bg-gradient-to-r from-brand-accent to-brand-primary text-white border-brand-accent shadow-md'
                            : 'bg-gradient-to-r from-brand-accent/10 to-brand-primary/10 text-brand-primary border-brand-accent/30 hover:border-brand-accent/60'
                            }`}
                    >
                        🌿 De Temporada
                    </button>
                    
                    {/* Separator */}
                    <div className="w-px bg-gray-200 flex-shrink-0 hidden sm:block"></div>

                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => { setCategory(cat.value); setShowOnlySeason(false); }}
                            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border flex-shrink-0 ${category === cat.value && !showOnlySeason
                                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                : 'bg-white text-brand-text border-gray-200 hover:border-brand-primary/50'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Secondary Filters: Grid for mobile, flex for desktop */}
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3 mb-8 items-center">
                {/* Municipality */}
                <select
                    value={municipality}
                    onChange={e => setMunicipality(e.target.value)}
                    className="col-span-2 lg:col-span-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary w-full"
                >
                    <option value="">📍 Todos los municipios</option>
                    {municipalities.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>

                {/* Max Price */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white">
                    <span className="text-xs sm:text-sm text-brand-text/60">Máx €</span>
                    <input
                        type="number"
                        placeholder="0"
                        value={maxPrice}
                        min={0}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-full sm:w-16 text-sm font-medium text-brand-primary focus:outline-none bg-transparent"
                    />
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary lg:ml-auto"
                >
                    <option value="newest">↕ Recientes</option>
                    <option value="price_asc">↑ Precio min</option>
                    <option value="price_desc">↓ Precio max</option>
                    <option value="rating">★ Valoración</option>
                </select>
            </div>

            {/* Seasonal Banner */}
            {showOnlySeason && (
                <div className="mb-6 bg-gradient-to-r from-brand-accent/10 via-brand-primary/5 to-brand-accent/10 rounded-xl border border-brand-accent/20 p-4 flex items-center gap-3">
                    <span className="text-2xl">🌿</span>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-brand-primary">Productos de Temporada</p>
                        <p className="text-xs text-brand-text/60">
                            Mostrando productos en su mejor momento de recolección este mes: {peakProducts.join(', ')}
                        </p>
                    </div>
                    <Link href="/es/calendario" className="text-xs font-semibold text-brand-accent hover:underline flex-shrink-0">
                        Ver calendario →
                    </Link>
                </div>
            )}

            {/* Product from Calendar Banner */}
            {productoParam && !showOnlySeason && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-brand-background rounded-xl border border-blue-100 p-4 flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-brand-primary">Buscando: {productoParam}</p>
                        <p className="text-xs text-brand-text/60">
                            Has llegado desde el Calendario de Temporada
                        </p>
                    </div>
                    <button onClick={clearFilters} className="text-xs font-semibold text-brand-accent hover:underline flex-shrink-0">
                        Ver todos ✕
                    </button>
                </div>
            )}

            {/* Results header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-primary/10">
                <h2 className="text-sm sm:text-lg font-bold text-brand-text">
                    {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
                    {hasFilters && <span className="text-brand-text/50 font-normal"> encontrados</span>}
                </h2>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-brand-accent hover:underline flex items-center gap-1"
                    >
                        ✕ Limpiar filtros
                    </button>
                )}
            </div>

            {/* Products Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-brand-background/30 rounded-2xl border border-brand-primary/10">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <h3 className="text-xl font-bold text-brand-primary mb-2">Sin resultados</h3>
                    <p className="text-brand-text/70">Prueba a cambiar los filtros o buscador.</p>
                    <button onClick={clearFilters} className="mt-4 text-sm text-brand-accent hover:underline">
                        Limpiar todos los filtros
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {filtered.map((product) => {
                        const producer = product.producers;
                        const reviews = product.product_reviews;
                        const avgRating = reviews && reviews.length > 0
                            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                            : null;

                        return (
                            <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 relative group overflow-hidden border border-brand-primary/10 bg-white rounded-2xl">
                                <Link href={`/${locale}/productos/${product.slug}`} className="block relative h-36 sm:h-48 overflow-hidden bg-brand-background/50">
                                    {(product.images?.[0] || getDummyProductImage(product.name, product.slug)) ? (
                                        <Image
                                            src={product.images?.[0] || getDummyProductImage(product.name, product.slug)}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110">🥬</div>
                                    )}
                                    {product.category && (
                                        <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full text-brand-primary capitalize z-10 shadow-sm border border-brand-primary/5">
                                            {product.category}
                                        </span>
                                    )}
                                </Link>

                                <CardContent className="p-3 sm:p-5 flex flex-col flex-1">
                                    <div className="flex flex-col mb-2">
                                        <div className="flex justify-between items-start gap-1 mb-1">
                                            <h3 className="font-bold text-sm sm:text-base text-brand-text line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <div className="font-bold text-brand-primary whitespace-nowrap text-xs sm:text-sm bg-brand-background px-1.5 py-0.5 rounded border border-brand-primary/5">
                                                {product.price}€<span className="text-[10px] text-brand-text/40 opacity-70">/{product.unit}</span>
                                            </div>
                                        </div>

                                        {avgRating && (
                                            <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                                                <span className="text-yellow-400">★</span>
                                                <span className="font-medium text-brand-text">{avgRating}</span>
                                                <span className="text-brand-text/40">({reviews?.length})</span>
                                            </div>
                                        )}
                                    </div>

                                    {producer && (
                                        <Link href={`/${locale}/productores/${producer.slug}`} className="text-[10px] sm:text-xs text-brand-accent hover:underline mb-2 line-clamp-1 inline-block">
                                            👨‍🌾 {producer.brand_name}
                                        </Link>
                                    )}

                                    <p className="hidden sm:block text-xs text-brand-text/60 mb-4 flex-1 line-clamp-2">
                                        {product.description || 'Producto fresco y local.'}
                                    </p>

                                    <div className="mt-auto pt-3 border-t border-brand-primary/5">
                                        <AddToCartButton
                                            product={{
                                                ...product,
                                                unit: product.unit || 'unidad',
                                                producerId: producer?.id || '',
                                                producerName: producer?.brand_name || ''
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
