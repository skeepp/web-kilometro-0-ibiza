import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { MarketClient } from './MarketClient';

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
                municipality
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

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="bg-brand-earth/10 py-16 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary mb-4">
                        Mercado Local
                    </h1>
                    <p className="text-xl text-brand-text/80 max-w-2xl mx-auto">
                        Descubre y compra productos frescos directamente de los productores de nuestra isla.
                    </p>
                </div>
            </div>

            {/* Client-side filters + product grid */}
            <MarketClient
                products={products || []}
                municipalities={municipalities}
            />
        </div>
    );
}
