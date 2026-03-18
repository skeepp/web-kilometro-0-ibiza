import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AddToCartButton } from './AddToCartButton'; // We will create this client component
import Image from 'next/image';
import { getDummyCover } from '@/utils/dummyImages';
import ProducerMap from './ProducerMap';
import { ProducerTabs } from './ProducerTabs';
import { FollowButton } from './FollowButton';

export default async function ProducerProfilePage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();

    const { data: producer } = await supabase
        .from('producers')
        .select('*, products(*, product_reviews(rating))')
        .eq('slug', params.slug)
        .single();

    if (!producer) return notFound();

    return (
        <div className="w-full bg-slate-50 min-h-screen pb-12">
            {/* Cover Image */}
            <div className="h-64 sm:h-80 w-full bg-brand-earth/20 relative">
                {(producer.cover_image_url || getDummyCover(producer.slug)) ? (
                    <Image src={producer.cover_image_url || getDummyCover(producer.slug)} alt="Cover" fill className="object-cover" sizes="100vw" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">🏡</div>
                )}
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="bg-white rounded-b-2xl shadow-sm border border-brand-primary/10 -mt-0 relative z-10 px-6 sm:px-10 pb-8 rounded-t-none sm:rounded-2xl sm:-mt-16 pt-0 sm:pt-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-20 mb-6 relative">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md overflow-hidden text-5xl relative flex-shrink-0">
                            {(producer.profile_image_url || getDummyCover(producer.slug)) ? (
                                <Image src={producer.profile_image_url || getDummyCover(producer.slug)} alt="Profile" fill className="object-cover" sizes="128px" />
                            ) : '👨‍🌾'}
                        </div>
                        
                        {/* Title & Info */}
                        <div className="flex-1 pb-2 mt-4 sm:mt-0">
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-1">{producer.brand_name}</h1>
                            <p className="text-brand-text/60 font-medium flex items-center text-sm">
                                <span className="mr-1">📍</span> {producer.municipality}, Ibiza
                            </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-3 pb-2 w-full sm:w-auto mt-4 sm:mt-0">
                            <FollowButton producerId={producer.id} />
                            <a 
                                href={producer.phone ? `tel:${producer.phone}` : `mailto:${producer.email || 'info@delafinca.com'}?subject=Contacto: ${producer.brand_name}`}
                            >
                                <Button variant="outline" className="w-full sm:w-auto shadow-sm">
                                    Contactar
                                </Button>
                            </a>
                        </div>
                    </div>
                    
                    {/* Description */}
                    <div className="prose text-brand-text/80 text-sm max-w-3xl">
                        <p>{producer.description || 'Productor tradicional enfocado en métodos sostenibles y productos de proximidad (Km 0).'}</p>
                    </div>
                </div>

                {/* Main Content Two-Column */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar: About & Map */}
                    <div className="lg:w-[35%] xl:w-[30%] flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-primary/10">
                            <h3 className="font-bold text-lg text-brand-primary mb-5">Sobre la finca</h3>
                            
                            <div className="space-y-4 text-sm text-brand-text/80 mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-lg">🌾</span>
                                    <p>Cultivo 100% natural, respetando los ciclos de la tierra.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-lg">🤝</span>
                                    <p>Venta directa del agricultor al consumidor en Ibiza.</p>
                                </div>
                            </div>

                            {/* Interactive Map */}
                            <div className="w-full h-48 rounded-xl overflow-hidden mb-2 border border-slate-200 shadow-sm relative z-0 bg-gray-50">
                                <ProducerMap lat={producer.lat} lng={producer.lng} name={producer.brand_name} />
                            </div>
                        </div>
                    </div>

                    {/* Right Area: Tabs (Products / Feed) */}
                    <div className="lg:w-[65%] xl:w-[70%]">
                        <ProducerTabs products={producer.products} producerId={producer.id} producerName={producer.brand_name} />
                    </div>
                </div>
            </div>
        </div>
    );
}
