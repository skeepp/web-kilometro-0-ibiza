import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { getDummyCover } from '@/utils/dummyImages';
import { ProducerTabs } from './ProducerTabs';
import { FollowButton } from './FollowButton';
import { ContactButton } from './ContactButton';
import { getRetailPrice } from '@/lib/constants';

export default async function ProducerProfilePage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();

    const { data: producer } = await supabase
        .from('producers')
        .select('*, products(*, product_reviews(rating))')
        .eq('slug', params.slug)
        .single();

    if (!producer) return notFound();

    // Fetch harvest calendar entries for this producer
    const { data: harvests } = await supabase
        .from('harvest_calendar')
        .select('*')
        .eq('producer_id', producer.id)
        .order('estimated_harvest', { ascending: true });

    return (
        <div className="w-full bg-slate-50 min-h-screen">
            {/* Mobile Sticky Top Bar (shows when scrolling past header) */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sm:hidden shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 relative flex-shrink-0">
                        {producer.profile_image_url ? <Image src={producer.profile_image_url} alt="Profile" fill className="object-cover" sizes="32px" /> : <span className="text-xs">👨‍🌾</span>}
                    </div>
                    <span className="font-bold text-sm text-brand-primary truncate max-w-[140px]">{producer.brand_name}</span>
                </div>
                <div className="flex-shrink-0 scale-90 origin-right">
                    <FollowButton producerId={producer.id} />
                </div>
            </div>

            {/* Cover Image */}
            <div className="h-[140px] md:h-[180px] w-full bg-brand-earth/20 relative">
                {(producer.cover_image_url || getDummyCover(producer.slug)) ? (
                    <>
                        <Image src={producer.cover_image_url || getDummyCover(producer.slug)} alt="Cover" fill className="object-cover" sizes="(max-width:640px) 640px, 1280px" />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">🏡</div>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                {/* Header Row: Avatar & Actions */}
                <div className="flex justify-between items-end -mt-10 mb-4">
                    {/* Avatar */}
                    <div className="w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center border-4 border-white shadow-sm overflow-hidden text-3xl relative flex-shrink-0 z-10 pointer-events-auto">
                        {(producer.profile_image_url || getDummyCover(producer.slug)) ? (
                            <Image src={producer.profile_image_url || getDummyCover(producer.slug)} alt="Profile" fill className="object-cover" sizes="80px" />
                        ) : '👨‍🌾'}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 relative z-10 sm:pb-2 pointer-events-auto">
                        <div className="hidden sm:block">
                            <FollowButton producerId={producer.id} />
                        </div>
                        <ContactButton 
                            phone={producer.phone} 
                            email={producer.email} 
                            brandName={producer.brand_name} 
                        />
                    </div>
                </div>
                
                {/* Info Section */}
                <div className="mb-8">
                    <h1 className="text-xl font-semibold text-brand-primary mb-1">{producer.brand_name}</h1>
                    <p className="text-brand-text/60 font-medium flex items-center text-sm mb-3">
                        <span className="mr-1">📍</span> {producer.municipality}, Ibiza
                    </p>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1">🌿 Ecológico</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">📍 Km 0</span>
                    </div>

                    {/* Desc */}
                    <div className="text-brand-text/80 text-sm max-w-3xl line-clamp-2">
                        <p>{producer.description || 'Productor tradicional enfocado en métodos sostenibles y productos de proximidad (Km 0).'}</p>
                    </div>
                </div>

                {/* Main Content Area (Tabs) */}
                <div className="w-full">
                    <ProducerTabs 
                        products={producer.products?.map((p: Record<string, unknown> & { price: number }) => ({ ...p, price: getRetailPrice(p.price) })) || []} 
                        producer={producer}
                        harvests={harvests || []} 
                    />
                </div>
            </div>
        </div>
    );
}
