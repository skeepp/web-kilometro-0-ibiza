import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AddToCartButton } from './AddToCartButton'; // We will create this client component
import Image from 'next/image';

export default async function ProducerProfilePage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();

    const { data: producer } = await supabase
        .from('producers')
        .select('*, products(*, product_reviews(rating))')
        .eq('slug', params.slug)
        .single();

    if (!producer) return notFound();

    return (
        <div className="w-full">
            {/* Cover Image */}
            <div className="h-64 sm:h-96 w-full bg-brand-earth/20 relative">
                {producer.cover_image_url ? (
                    <Image src={producer.cover_image_url} alt="Cover" fill className="object-cover" sizes="100vw" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">🏡</div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-12">

                    {/* Producer Info Sidebar */}
                    <div className="md:w-1/3">
                        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl -mt-24 relative z-10 border border-brand-primary/10 transition-all hover:shadow-2xl">
                            <div className="w-24 h-24 rounded-full bg-brand-background mb-6 flex items-center justify-center border-4 border-white shadow-md overflow-hidden text-3xl relative">
                                {producer.profile_image_url ? (
                                    <Image src={producer.profile_image_url} alt="Profile" fill className="object-cover" sizes="96px" />
                                ) : '👨‍🌾'}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-2 text-balance">{producer.brand_name}</h1>
                            <p className="text-brand-text/60 font-medium mb-6 flex items-center">
                                <span className="mr-2">📍</span> {producer.municipality}, Mallorca
                            </p>

                            <div className="prose text-brand-text/80 text-sm mb-8">
                                <p>{producer.description || 'Productor tradicional de Mallorca.'}</p>
                            </div>

                            {/* Fake Map Placeholder */}
                            <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-sm text-gray-500 mb-6 border border-gray-200">
                                [Mapa interactivo de Mapbox]
                            </div>

                            <div className="text-center">
                                <Button variant="outline" fullWidth>Contactar productor</Button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="md:w-2/3">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-8 border-b border-brand-primary/10 pb-4 text-balance">
                            Nuestros Productos ({producer.products?.length || 0})
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6">
                            {producer.products?.map((product: { id: string; slug: string; name: string; price: number; unit: string; description?: string; images?: string[]; product_reviews?: { rating: number }[] }) => {
                                const reviews = product.product_reviews;
                                const avgRating = reviews && reviews.length > 0
                                    ? (reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / reviews.length).toFixed(1)
                                    : null;

                                return (
                                    <Card key={product.id} className="flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden border border-brand-primary/10 hover:border-brand-primary/30 bg-white">
                                        <div className="h-48 bg-brand-background/50 flex items-center justify-center text-4xl relative overflow-hidden">
                                            {product.images?.[0] ? (
                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
                                            ) : (
                                                <span className="transition-transform duration-300 group-hover:scale-110">🥬</span>
                                            )}
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <CardContent className="p-6 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-3">
                                                <Link href={`/es/productos/${product.slug}`} className="after:absolute after:inset-0 after:z-10 cursor-pointer">
                                                    <h3 className="font-bold text-lg text-brand-text group-hover:text-brand-accent transition-colors">{product.name}</h3>
                                                </Link>
                                                <span className="font-bold text-brand-primary ml-2 whitespace-nowrap relative z-20 bg-brand-background px-2 py-1 rounded-md shadow-sm border border-brand-primary/10">{product.price}€<span className="text-xs text-brand-text/50">/{product.unit}</span></span>
                                            </div>

                                            {avgRating && (
                                                <div className="flex items-center gap-1 mb-2 text-sm">
                                                    <span className="text-yellow-400">★</span>
                                                    <span className="font-medium text-brand-text">{avgRating}</span>
                                                    <span className="text-brand-text/50">({reviews?.length})</span>
                                                </div>
                                            )}

                                            <p className="text-sm text-brand-text/70 mb-4 flex-1 line-clamp-2">{product.description}</p>

                                            <div className="mt-auto pt-4 border-t border-brand-primary/10 relative z-20">
                                                <AddToCartButton
                                                    product={{ ...product, producerId: producer.id, producerName: producer.brand_name }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
