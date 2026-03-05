import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { AddToCartButton } from '../productores/[slug]/AddToCartButton';
import Image from 'next/image';

export const metadata = {
    title: 'Mercado | De la Finca',
    description: 'Explora todos los productos de nuestros productores locales.',
};

export default async function MarketPage() {
    const supabase = await createClient();

    // Fetch all products with their producer information and reviews
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            producers (
                id,
                brand_name,
                slug
            ),
            product_reviews (
                rating
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products for market:', error);
    }

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

            {/* Products Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-primary/10">
                    <h2 className="text-xl font-bold text-brand-text">
                        Todos los productos ({products?.length || 0})
                    </h2>
                    {/* Placeholder for future filtering/sorting */}
                    <div className="text-sm text-brand-text/60">
                        Mostrando todos los resultados
                    </div>
                </div>

                {!products || products.length === 0 ? (
                    <div className="text-center py-20 bg-brand-background/30 rounded-2xl border border-brand-primary/10">
                        <span className="text-6xl mb-4 block">🛒</span>
                        <h3 className="text-xl font-bold text-brand-primary mb-2">Aún no hay productos</h3>
                        <p className="text-brand-text/70">
                            Nuestros productores están preparando sus mejores cosechas. ¡Vuelve pronto!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {products.map((product) => {
                            const producer = product.producers;
                            const reviews = product.product_reviews as { rating: number }[] | undefined;
                            const avgRating = reviews && reviews.length > 0
                                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                                : null;

                            return (
                                <Card key={product.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative group">
                                    <div className="h-48 bg-brand-background/50 flex items-center justify-center text-4xl relative">
                                        {product.images?.[0] ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        ) : (
                                            '🥬'
                                        )}
                                    </div>
                                    <CardContent className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link href={`/productos/${product.slug}`} className="after:absolute after:inset-0 after:z-10 cursor-pointer">
                                                <h3 className="font-bold text-lg text-brand-text group-hover:text-brand-primary line-clamp-1">
                                                    {product.name}
                                                </h3>
                                            </Link>
                                            <span className="font-bold text-brand-primary ml-2 whitespace-nowrap relative z-20">
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
                                            <Link href={`/productores/${producer.slug}`} className="text-sm text-brand-accent hover:underline mb-3 inline-flex items-center gap-1 relative z-20">
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
                                                    producerId: producer?.id,
                                                    producerName: producer?.brand_name
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
        </div>
    );
}
