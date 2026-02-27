import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AddToCartButton } from '../../productores/[slug]/AddToCartButton'; // Reusing the same button

export default async function ProductProfilePage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select('*, producers(id, brand_name, slug)')
        .eq('slug', params.slug)
        .single();

    if (!product) return notFound();

    const producer = product.producers;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumbs */}
            <nav className="text-sm font-medium text-brand-text/60 mb-8">
                <Link href="/" className="hover:text-brand-primary">Inicio</Link>
                <span className="mx-2">/</span>
                <Link href={`/productores/${producer.slug}`} className="hover:text-brand-primary">{producer.brand_name}</Link>
                <span className="mx-2">/</span>
                <span className="text-brand-text">{product.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Gallery placeholder */}
                <div className="md:w-1/2">
                    <div className="bg-brand-background/30 rounded-3xl aspect-square flex items-center justify-center text-8xl border border-brand-primary/10 overflow-hidden">
                        {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                        ) : '🥦'}
                    </div>
                </div>

                {/* Product Details */}
                <div className="md:w-1/2 flex flex-col justify-center">
                    <span className="uppercase tracking-wider text-xs font-bold text-brand-accent mb-2">{product.category}</span>
                    <h1 className="text-4xl font-serif font-bold text-brand-primary mb-4">{product.name}</h1>
                    <p className="text-2xl font-bold text-brand-text mb-6">
                        {product.price}€<span className="text-lg text-brand-text/50">/{product.unit}</span>
                    </p>

                    <div className="prose text-brand-text/80 mb-8">
                        <p>{product.description || 'Producto fresco de cultivo de nuestros productores.'}</p>
                    </div>

                    <div className="bg-brand-background/50 rounded-xl p-6 mb-8 border border-brand-primary/5">
                        <h3 className="font-bold text-brand-primary mb-2">Información del productor</h3>
                        <p className="font-medium text-brand-text group mb-2">
                            <Link href={`/productores/${producer.slug}`} className="hover:underline">
                                👩‍🌾 {producer.brand_name}
                            </Link>
                        </p>
                        <div className="flex text-sm text-brand-text/70 gap-4 mt-4 border-t border-brand-primary/10 pt-4">
                            <div className="flex items-center"><span className="mr-2">🚚</span> Envío local</div>
                            <div className="flex items-center"><span className="mr-2">🌱</span> Temporada</div>
                        </div>
                    </div>

                    <div className="max-w-sm">
                        <AddToCartButton
                            product={{ ...product, producerId: producer.id, producerName: producer.brand_name }}
                        />
                    </div>
                    <p className="text-xs text-brand-text/50 mt-4">
                        Stock disponible: {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Agotado'}
                    </p>
                </div>
            </div>
        </div>
    );
}
