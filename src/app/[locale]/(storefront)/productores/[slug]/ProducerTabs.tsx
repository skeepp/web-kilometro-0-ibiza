'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { AddToCartButton } from './AddToCartButton';
import { getDummyProductImage } from '@/utils/dummyImages';
import { HarvestTimeline } from '@/components/ui/HarvestTimeline';
import ProducerMap from './ProducerMap';

interface ProductReview {
    rating: number;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    unit: string;
    images?: string[];
    product_reviews?: ProductReview[];
}

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



interface Producer {
    id: string;
    brand_name: string;
    profile_image_url?: string | null;
    description?: string | null;
    municipality?: string | null;
    lat?: number | null;
    lng?: number | null;
}

export function ProducerTabs({ products, producer, harvests }: { products: Product[]; producer: Producer; harvests?: HarvestEntry[] }) {
    const [activeTab, setActiveTab] = useState<'products' | 'harvests' | 'info'>('products');

    const producerId = producer.id;
    const producerName = producer.brand_name;
    const producerImage = producer.profile_image_url;

    return (
        <div className="w-full">
            {/* Sticky Tab Headers */}
            <div className="sticky top-[56px] sm:top-0 z-40 bg-slate-50 pt-2 pb-0 mb-8 mx-0 flex gap-4 sm:gap-8 border-b border-brand-primary/10 overflow-x-auto hide-scrollbar">
                <button 
                    onClick={() => setActiveTab('products')}
                    className={`pb-4 text-sm sm:text-lg font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'products' ? 'text-brand-primary border-brand-primary' : 'text-gray-400 border-transparent hover:text-brand-text/80'}`}
                >
                    Productos ({products?.length || 0})
                </button>
                <button 
                    onClick={() => setActiveTab('harvests')}
                    className={`pb-4 text-sm sm:text-lg font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'harvests' ? 'text-brand-primary border-brand-primary' : 'text-gray-400 border-transparent hover:text-brand-text/80'}`}
                >
                    🌱 Cosechas
                </button>
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`pb-4 text-sm sm:text-lg font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'info' ? 'text-brand-primary border-brand-primary' : 'text-gray-400 border-transparent hover:text-brand-text/80'}`}
                >
                    Sobre la Finca
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'harvests' ? (
                <HarvestTimeline harvests={harvests || []} />
            ) : activeTab === 'products' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 px-1 lg:px-0">
                    {products?.length ? products.map((product) => {
                        const reviews = product.product_reviews;
                        const avgRating = reviews && reviews.length > 0
                            ? (reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / reviews.length).toFixed(1)
                            : null;

                        return (
                            <Card key={product.id} className="flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden border border-brand-primary/10 hover:border-brand-primary/30 bg-white">
                                <div className="h-40 sm:h-48 bg-brand-background/50 flex items-center justify-center text-4xl relative overflow-hidden">
                                    {(product.images?.[0] || getDummyProductImage(product.name, product.slug)) ? (
                                        <Image src={product.images?.[0] || getDummyProductImage(product.name, product.slug)} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
                                    ) : (
                                        <span className="transition-transform duration-300 group-hover:scale-110">🥬</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                                        <Link href={`/es/productos/${product.slug}`} className="after:absolute after:inset-0 after:z-10 cursor-pointer">
                                            <h3 className="font-bold text-base sm:text-lg text-brand-text group-hover:text-brand-accent transition-colors line-clamp-1">{product.name}</h3>
                                        </Link>
                                        <span className="font-bold text-brand-primary ml-2 whitespace-nowrap relative z-20 bg-brand-background px-2 py-0.5 sm:py-1 rounded-md shadow-sm border border-brand-primary/10 text-sm sm:text-base">{product.price}€<span className="text-[10px] sm:text-xs text-brand-text/50">/{product.unit}</span></span>
                                    </div>

                                    {avgRating && (
                                        <div className="flex items-center gap-1 mb-2 text-xs sm:text-sm">
                                            <span className="text-yellow-400">★</span>
                                            <span className="font-medium text-brand-text">{avgRating}</span>
                                            <span className="text-brand-text/50">({reviews?.length})</span>
                                        </div>
                                    )}

                                    <p className="text-xs sm:text-sm text-brand-text/70 mb-4 flex-1 line-clamp-2">{product.description}</p>

                                    <div className="mt-auto pt-4 border-t border-brand-primary/10 relative z-20">
                                        <AddToCartButton
                                            product={{ 
                                                ...product, 
                                                producerId, 
                                                producerName,
                                                image: product.images?.[0] || getDummyProductImage(product.name, product.slug),
                                                producerImage 
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }) : (
                        <div className="col-span-2 py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                            <p className="text-gray-500">Este productor aún no tiene productos disponibles.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-brand-primary/10">
                        <h3 className="font-bold text-xl text-brand-primary mb-6">Nuestra historia</h3>
                        
                        <div className="prose text-brand-text/80 max-w-none text-sm sm:text-base leading-relaxed mb-8">
                            <p>{producer.description || 'Productor tradicional enfocado en métodos sostenibles y productos de proximidad (Km 0).'}</p>
                        </div>

                        <div className="space-y-4 text-sm sm:text-base text-brand-text/80 mb-8 border-t border-brand-primary/10 pt-6">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🌾</span>
                                <p>Cultivo 100% natural, respetando los ciclos de la tierra.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🤝</span>
                                <p>Venta directa del agricultor al consumidor en {producer.municipality || 'Ibiza'}.</p>
                            </div>
                        </div>

                        {/* Interactive Map */}
                        {(producer.lat && producer.lng) ? (
                            <div className="mt-8">
                                <h4 className="font-bold text-lg text-brand-primary mb-4">¿Dónde estamos?</h4>
                                <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0 bg-gray-50">
                                    <ProducerMap lat={producer.lat} lng={producer.lng} name={producer.brand_name} />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
