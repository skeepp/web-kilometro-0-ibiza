'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { AddToCartButton } from '../productores/[slug]/AddToCartButton';
import { useLocale } from 'next-intl';

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
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [municipality, setMunicipality] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');

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

        return result;
    }, [products, search, category, municipality, maxPrice, sortBy]);

    const hasFilters = search || category || municipality || maxPrice;

    function clearFilters() {
        setSearch('');
        setCategory('');
        setMunicipality('');
        setMaxPrice('');
        setSortBy('newest');
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Search Bar */}
            <div className="relative mb-6">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                    type="text"
                    placeholder="Buscar productos, productores..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary shadow-sm"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text/40 hover:text-brand-text">
                        ✕
                    </button>
                )}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-3 mb-8">
                {/* Category Pills */}
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${category === cat.value
                                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                : 'bg-white text-brand-text border-gray-200 hover:border-brand-primary/50'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Secondary Filters */}
            <div className="flex flex-wrap gap-3 mb-8 items-center">
                {/* Municipality */}
                <select
                    value={municipality}
                    onChange={e => setMunicipality(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                >
                    <option value="">📍 Todos los municipios</option>
                    {municipalities.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>

                {/* Max Price */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white">
                    <span className="text-sm text-brand-text/60">Max. precio</span>
                    <input
                        type="number"
                        placeholder="€"
                        value={maxPrice}
                        min={0}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-16 text-sm font-medium text-brand-primary focus:outline-none"
                    />
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ml-auto"
                >
                    <option value="newest">↕ Más recientes</option>
                    <option value="price_asc">↑ Precio: menor a mayor</option>
                    <option value="price_desc">↓ Precio: mayor a menor</option>
                    <option value="rating">★ Mejor valorados</option>
                </select>
            </div>

            {/* Results header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-primary/10">
                <h2 className="text-lg font-bold text-brand-text">
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
                            <Card key={product.id} className="flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden border border-brand-primary/10 hover:border-brand-primary/30 bg-white">
                                <div className="h-48 bg-brand-background/50 flex items-center justify-center text-4xl relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                    ) : (
                                        <span className="transition-transform duration-300 group-hover:scale-110">🥬</span>
                                    )}
                                    {product.category && (
                                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-brand-primary capitalize z-10 shadow-sm border border-brand-primary/10">
                                            {product.category}
                                        </span>
                                    )}
                                    {product.origin && (
                                        <span className="absolute top-2 right-2 bg-brand-primary/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-white capitalize z-10 shadow-sm flex items-center gap-1">
                                            📍 {product.origin}
                                        </span>
                                    )}
                                </div>
                                <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <Link href={`/${locale}/productos/${product.slug}`} className="after:absolute after:inset-0 after:z-10 cursor-pointer">
                                            <h3 className="font-bold text-base sm:text-lg text-brand-text group-hover:text-brand-accent transition-colors line-clamp-1">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <span className="font-bold text-brand-primary ml-2 whitespace-nowrap relative z-20 text-sm sm:text-base bg-brand-background px-2 py-1 rounded-md shadow-sm border border-brand-primary/10">
                                            {product.price}€<span className="text-xs text-brand-text/50">/{product.unit}</span>
                                        </span>
                                    </div>

                                    {avgRating && (
                                        <div className="flex items-center gap-1 mb-2 text-sm">
                                            <span className="text-yellow-400">★</span>
                                            <span className="font-medium text-brand-text">{avgRating}</span>
                                            <span className="text-brand-text/50">({reviews?.length})</span>
                                        </div>
                                    )}

                                    {producer && (
                                        <Link href={`/${locale}/productores/${producer.slug}`} className="text-sm text-brand-accent hover:underline mb-3 inline-flex items-center gap-1 relative z-20">
                                            👨‍🌾 {producer.brand_name}
                                        </Link>
                                    )}

                                    <p className="text-sm text-brand-text/70 mb-4 flex-1 line-clamp-2">
                                        {product.description || 'Producto fresco y local.'}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-brand-primary/10 relative z-20">
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
