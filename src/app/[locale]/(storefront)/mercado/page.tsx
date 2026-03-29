import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { MarketClient } from './MarketClient';
import { getRetailPrice } from '@/lib/constants';

export const metadata = {
    title: 'Mercado | De la Finca',
    description: 'Explora todos los productos de nuestros productores locales.',
};

export default async function MarketPage() {
    const supabase = await createClient();

    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            producers (
                id,
                brand_name,
                slug,
                municipality,
                profile_image_url
            ),
            product_reviews (
                rating
            )
        `)
        .eq('available', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products for market:', error);
    }

    // Extract unique municipalities from producers
    const municipalities = Array.from(
        new Set(
            (products || [])
                .map(p => p.producers?.municipality)
                .filter(Boolean) as string[]
        )
    ).sort();

    const productsWithRetailPrice = (products || []).map(p => ({
        ...p,
        price: getRetailPrice(p.price)
    }));

    return (
        <div className="w-full">
            {/* Thin Hero Banner */}
            <div className="relative w-full aspect-[2/1] sm:aspect-[3/1] md:aspect-[4/1] lg:aspect-[5/1] xl:aspect-[6/1] overflow-hidden group min-h-[220px]">
                {/* Background Image w/ micro-interaction */}
                <div className="absolute inset-0">
                    <img
                        src="/banners/mercado_hero_thin.png"
                        alt="Productos frescos del mercado local"
                        className="w-full h-full object-cover transform transition-transform duration-[4000ms] ease-out group-hover:scale-110"
                    />
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-black/20 sm:hidden"></div>
                </div>

                {/* Content vertically centered */}
                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="max-w-lg">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-2 leading-tight drop-shadow-md">
                                ¡Las mejores cosechas, directas a tu mesa!
                            </h1>
                            <p className="text-sm md:text-base text-white/90 mb-4 max-w-sm drop-shadow hidden sm:block">
                                Seleccionados hoy por agricultores de Ibiza.
                            </p>
                            <a
                                href="#productos"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-accent to-brand-primary text-white font-bold text-sm px-6 py-2.5 rounded-full hover:scale-105 transition-all duration-300 shadow-md shadow-brand-accent/30"
                            >
                                🛒 Explorar Productos
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client-side filters + product grid */}
            <MarketClient
                products={productsWithRetailPrice}
                municipalities={municipalities}
            />
        </div>
    );
}
