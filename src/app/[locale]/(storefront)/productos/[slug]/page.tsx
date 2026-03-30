import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AddToCartButton } from '../../productores/[slug]/AddToCartButton';
import Image from 'next/image';
import { ReviewForm } from '@/components/products/ReviewForm';
import { getRetailPrice } from '@/lib/constants';

export default async function ProductProfilePage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select('*, producers(id, brand_name, slug, profile_image_url)')
        .eq('slug', params.slug)
        .single();

    if (!product) return notFound();

    const producer = product.producers;

    // Apply exact retail price 
    product.price = getRetailPrice(product.price);

    // Fetch reviews
    const { data: reviews } = await supabase
        .from('product_reviews')
        .select('id, rating, comment, created_at, profiles(full_name)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

    const avgRating = reviews && reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumbs */}
            <nav className="text-sm font-medium text-brand-text/60 mb-8">
                <Link href="/" className="hover:text-brand-primary">Inicio</Link>
                <span className="mx-2">/</span>
                <Link href={`/es/productores/${producer.slug}`} className="hover:text-brand-primary">{producer.brand_name}</Link>
                <span className="mx-2">/</span>
                <span className="text-brand-text">{product.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Gallery placeholder */}
                <div className="md:w-1/2">
                    <div className="bg-brand-background/30 rounded-3xl aspect-square flex items-center justify-center text-8xl border border-brand-primary/10 overflow-hidden relative mb-8">
                        {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                        ) : '🥦'}
                    </div>

                    {/* Section: Reviews List */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-serif font-bold text-brand-primary mb-6">Valoraciones</h2>
                        {reviews && reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white p-4 rounded-xl border border-brand-primary/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-brand-text text-sm">
                                                {/* @ts-expect-error - Supabase join typing returns array instead of single object */}
                                                {review.profiles?.full_name || 'Usuario Anónimo'}
                                            </span>
                                            <span className="text-sm text-brand-text/50">
                                                {new Date(review.created_at).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        <div className="flex text-yellow-400 text-sm mb-2">
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                        {review.comment && (
                                            <p className="text-brand-text/80 text-sm">{review.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-brand-text/60 italic">Aún no hay valoraciones para este producto.</p>
                        )}
                    </div>
                </div>

                {/* Product Details */}
                <div className="md:w-1/2 flex flex-col justify-start">
                    <div className="flex items-center gap-3 mb-2">
                        {product.category && (
                            <span className="uppercase tracking-wider text-xs font-bold text-brand-accent">{product.category}</span>
                        )}
                        {product.origin && (
                            <span className="bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                                📍 {product.origin}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-brand-primary mb-2">{product.name}</h1>

                    {avgRating && reviews && (
                        <div className="flex items-center gap-2 mb-4">
                            <div className="text-yellow-400 text-lg">★</div>
                            <span className="font-medium text-brand-text">{avgRating}</span>
                            <span className="text-brand-text/50 text-sm">({reviews.length} valoraciones)</span>
                        </div>
                    )}

                    <p className="text-2xl font-bold text-brand-text mb-6">
                        {product.price}€<span className="text-lg text-brand-text/50">/{product.unit}</span>
                    </p>

                    <div className="prose text-brand-text/80 mb-8">
                        <p>{product.description || 'Producto fresco de cultivo de nuestros productores.'}</p>
                    </div>

                    <div className="bg-brand-background/50 rounded-xl p-6 mb-8 border border-brand-primary/5">
                        <h3 className="font-bold text-brand-primary mb-2">Información del productor</h3>
                        <div className="font-medium text-brand-text group mb-2 flex items-center gap-3">
                            {producer.profile_image_url ? (
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-brand-primary/20 flex-shrink-0">
                                    <Image src={producer.profile_image_url} alt={producer.brand_name} fill className="object-cover" sizes="32px" />
                                </div>
                            ) : (
                                <span className="text-xl">👩‍🌾</span>
                            )}
                            <Link href={`/es/productores/${producer.slug}`} className="hover:underline flex items-center">
                                {producer.brand_name}
                            </Link>
                        </div>
                        <div className="flex text-sm text-brand-text/70 gap-4 mt-4 border-t border-brand-primary/10 pt-4">
                            <div className="flex items-center"><span className="mr-2">📍</span> Recogida local</div>
                            <div className="flex items-center"><span className="mr-2">🌱</span> Temporada</div>
                        </div>
                    </div>

                    <div className="max-w-sm">
                        <AddToCartButton
                            product={{ 
                                ...product, 
                                producerId: producer.id, 
                                producerName: producer.brand_name,
                                image: product.image_url,
                                producerImage: producer.profile_image_url
                            }}
                        />
                    </div>
                    <p className="text-xs text-brand-text/50 mt-4 mb-8">
                        Stock disponible: {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Agotado'}
                    </p>

                    {/* Section: Add Review Form */}
                    <ReviewForm productId={product.id} />
                </div>
            </div>
        </div>
    );
}
