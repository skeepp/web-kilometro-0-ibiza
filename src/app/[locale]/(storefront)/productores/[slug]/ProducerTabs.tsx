'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { AddToCartButton } from './AddToCartButton';
import { getDummyProductImage } from '@/utils/dummyImages';
import { HarvestTimeline } from '@/components/ui/HarvestTimeline';

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

// Mock Feed Data
const MOCK_POSTS = [
    {
        id: 1,
        date: 'Hace 2 días',
        content: '¡Acabamos de recolectar los primeros tomates de la temporada! 🍅 Ya disponibles en la tienda. Su sabor es espectacular este año gracias al sol de las últimas semanas.',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
        likes: 24,
        comments: 3
    },
    {
        id: 2,
        date: 'Hace 1 semana',
        content: 'Preparando la tierra para la siembra de invierno. 🚜 Es fundamental dejar descansar ciertas parcelas para mantener los nutrientes naturales sin químicos.',
        likes: 56,
        comments: 12
    }
];

export function ProducerTabs({ products, producerId, producerName, harvests, producerImage }: { products: Product[]; producerId: string; producerName: string; harvests?: HarvestEntry[]; producerImage?: string | null }) {
    const [activeTab, setActiveTab] = useState<'products' | 'feed' | 'harvests'>('products');

    return (
        <div className="w-full">
            {/* Tab Headers */}
            <div className="flex gap-8 border-b border-brand-primary/10 mb-8 mx-4 sm:mx-0">
                <button 
                    onClick={() => setActiveTab('products')}
                    className={`pb-4 text-lg font-bold transition-all border-b-2 ${activeTab === 'products' ? 'text-brand-primary border-brand-primary' : 'text-gray-400 border-transparent hover:text-brand-text/80'}`}
                >
                    Productos ({products?.length || 0})
                </button>
                <button 
                    onClick={() => setActiveTab('harvests')}
                    className={`pb-4 text-lg font-bold transition-all border-b-2 ${activeTab === 'harvests' ? 'text-brand-primary border-brand-primary' : 'text-gray-400 border-transparent hover:text-brand-text/80'}`}
                >
                    🌱 Cosechas
                </button>
                <button 
                    onClick={() => setActiveTab('feed')}
                    className={`pb-4 text-lg font-bold transition-all border-b-2 ${activeTab === 'feed' ? 'text-brand-primary border-brand-primary' : 'text-gray-400 border-transparent hover:text-brand-text/80'}`}
                >
                    Publicaciones
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'harvests' ? (
                <HarvestTimeline harvests={harvests || []} />
            ) : activeTab === 'products' ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6 px-4 sm:px-0">
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
                <div className="flex flex-col gap-6 px-4 sm:px-0">
                    {MOCK_POSTS.map(post => (
                        <div key={post.id} className="bg-white border text-sm sm:text-base border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                            <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-gray-50">
                                {producerImage ? (
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-brand-primary/20">
                                        <Image src={producerImage} alt={producerName} fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-brand-background flex items-center justify-center text-xl">👨‍🌾</div>
                                )}
                                <div>
                                    <h4 className="font-bold text-brand-primary">{producerName}</h4>
                                    <span className="text-xs text-gray-500">{post.date}</span>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5">
                                <p className="text-gray-700 leading-relaxed">{post.content}</p>
                            </div>
                            {post.image && (
                                <div className="w-full h-64 relative">
                                    <Image src={post.image} alt="Publicación" fill className="object-cover" />
                                </div>
                            )}
                            <div className="px-5 py-3 bg-gray-50 flex items-center gap-6 border-t border-gray-100 text-gray-500 text-sm font-medium">
                                <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                    {post.likes}
                                </button>
                                <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    {post.comments}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
