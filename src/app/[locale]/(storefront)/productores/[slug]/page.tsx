import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AddToCartButton } from './AddToCartButton'; // We will create this client component

export default async function ProducerProfilePage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();

    const { data: producer } = await supabase
        .from('producers')
        .select('*, products(*)')
        .eq('slug', params.slug)
        .single();

    if (!producer) return notFound();

    return (
        <div className="w-full">
            {/* Cover Image */}
            <div className="h-64 sm:h-96 w-full bg-brand-earth/20 relative">
                {producer.cover_image_url ? (
                    <img src={producer.cover_image_url} alt="Cover" className="object-cover w-full h-full" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">🏡</div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-12">

                    {/* Producer Info Sidebar */}
                    <div className="md:w-1/3">
                        <div className="bg-white p-8 rounded-2xl shadow-soft -mt-24 relative z-10 border border-brand-primary/10">
                            <div className="w-24 h-24 rounded-full bg-brand-background mb-6 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden text-3xl">
                                {producer.profile_image_url ? (
                                    <img src={producer.profile_image_url} alt="Profile" className="object-cover w-full h-full" />
                                ) : '👨‍🌾'}
                            </div>
                            <h1 className="text-3xl font-serif font-bold text-brand-primary mb-2">{producer.brand_name}</h1>
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
                        <h2 className="text-2xl font-serif font-bold text-brand-primary mb-8 border-b border-brand-primary/10 pb-4">
                            Nuestros Productos ({producer.products?.length || 0})
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {producer.products?.map((product: any) => (
                                <Card key={product.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                    <div className="h-48 bg-brand-background/50 flex items-center justify-center text-4xl">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                                        ) : '🥬'}
                                    </div>
                                    <CardContent className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link href={`/productos/${product.slug}`}>
                                                <h3 className="font-bold text-lg text-brand-text hover:text-brand-primary">{product.name}</h3>
                                            </Link>
                                            <span className="font-bold text-brand-primary ml-2">{product.price}€<span className="text-xs text-brand-text/50">/{product.unit}</span></span>
                                        </div>
                                        <p className="text-sm text-brand-text/70 mb-4 flex-1 line-clamp-2">{product.description}</p>

                                        <div className="mt-auto pt-4 border-t border-brand-primary/10">
                                            <AddToCartButton
                                                product={{ ...product, producerId: producer.id, producerName: producer.brand_name }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
