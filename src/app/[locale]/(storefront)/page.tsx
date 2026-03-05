import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { createClient } from '@/utils/supabase/server';
import { AddToCartButton } from './productores/[slug]/AddToCartButton';
import Image from 'next/image';

export default async function LandingPage() {
    const t = await getTranslations('Index');
    const supabase = await createClient();

    type ProducerSummaryRow = { id: string; brand_name: string; slug: string; municipality: string; description?: string; cover_image_url?: string };
    let producers: ProducerSummaryRow[] = [];
    try {
        const { data } = await supabase.from('producers').select('id, brand_name, slug, municipality, description, cover_image_url').limit(6);
        if (data) producers = data;
    } catch (error) {
        console.error('Failed to fetch producers. Is local Supabase running?', error);
    }

    type FeaturedProductRow = {
        id: string;
        name: string;
        slug: string;
        price: number;
        unit: string;
        description?: string;
        images?: string[];
        producers?: {
            id: string;
            brand_name: string;
            slug: string;
        };
        product_reviews?: { rating: number }[];
    };
    let featuredProducts: FeaturedProductRow[] = [];
    try {
        const { data: products } = await supabase
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
            .order('created_at', { ascending: false })
            .limit(4);

        if (products) featuredProducts = products as FeaturedProductRow[];
    } catch (error) {
        console.error('Error fetching featured products:', error);
    }

    const categories = [
        { name: 'Fruta', icon: '🍎' },
        { name: 'Verdura', icon: '🥬' },
        { name: 'Carne', icon: '🥩' },
        { name: 'Lácteos', icon: '🧀' },
        { name: 'Huevos', icon: '🥚' },
        { name: 'Conservas', icon: '🍯' },
    ];

    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative bg-brand-primary w-full py-24 md:py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-background leading-tight mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-brand-background/90 mb-10 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-center">
                        <Link href="/es/productores">
                            <Button size="lg" className="bg-brand-background text-brand-primary hover:bg-white">{t('cta')}</Button>
                        </Link>
                    </div>
                </div>
            </section>


            {/* Categories */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-serif font-bold mb-12 text-center">Categorías destacadas</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Link key={cat.name} href={`/es/productores?category=${cat.name.toLowerCase()}`}>
                                <Card className="hover:border-brand-primary cursor-pointer text-center py-8">
                                    <div className="text-4xl mb-4">{cat.icon}</div>
                                    <h3 className="font-medium text-brand-text">{cat.name}</h3>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Producers */}
            <section className="py-20 bg-brand-background border-t border-brand-primary/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-brand-primary">Productores Destacados</h2>
                            <p className="text-brand-text/70 mt-2">Apoya el comercio local en Mallorca.</p>
                        </div>
                        <Link href="/es/productores">
                            <Button variant="ghost">Ver todos &rarr;</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                        {producers.length > 0 ? producers.map((producer) => (
                            <Link key={producer.id} href={`/productores/${producer.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-all group">
                                    <div className="h-48 w-full bg-brand-earth/20 relative overflow-hidden">
                                        {producer.cover_image_url ? (
                                            <Image
                                                src={producer.cover_image_url}
                                                alt={`Portada de ${producer.brand_name}`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl">🌾</div>
                                        )}
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="font-bold text-xl text-brand-primary mb-2 group-hover:underline">{producer.brand_name}</h3>
                                        <p className="text-sm text-brand-text/60 mb-4 font-medium flex items-center">
                                            <span className="mr-1">📍</span> {producer.municipality}
                                        </p>
                                        <p className="text-brand-text/80 line-clamp-2 text-sm">{producer.description || 'Productor de alimentación local.'}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        )) : (
                            <div className="col-span-3 py-12 text-center border-2 border-dashed border-brand-primary/20 rounded-2xl">
                                <p className="text-brand-text/60">Aún no hay productores disponibles en la plataforma.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 bg-white border-t border-brand-primary/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-brand-primary">Recién cosechado</h2>
                            <p className="text-brand-text/70 mt-2">Los últimos productos subidos por nuestros agricultores locales.</p>
                        </div>
                        <Link href="/es/mercado">
                            <Button variant="ghost">Ir al Mercado &rarr;</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {featuredProducts.length > 0 ? featuredProducts.map((product) => {
                            const producer = product.producers;
                            const reviews = product.product_reviews as { rating: number }[] | undefined;
                            const avgRating = reviews && reviews.length > 0
                                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                                : null;

                            return (
                                <Card key={product.id} className="flex flex-col h-full hover:shadow-md transition-shadow bg-brand-background/10 relative group">
                                    <div className="h-48 bg-brand-background/50 flex items-center justify-center text-4xl relative overflow-hidden rounded-t-xl">
                                        {product.images?.[0] ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                                                    producerId: producer?.id || '',
                                                    producerName: producer?.brand_name || ''
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        }) : (
                            <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-12 text-center border-2 border-dashed border-brand-primary/20 rounded-2xl">
                                <p className="text-brand-text/60">Aún no hay productos en el mercado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 bg-brand-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-serif font-bold text-center mb-16">¿Cómo funciona?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-brand-primary/10 pt-16 mt-8 relative">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-2xl mb-4">📍</div>
                            <h3 className="font-bold text-lg mb-2 text-brand-primary">1. Elige tu productor</h3>
                            <p className="text-brand-text/70">Encuentra fincas locales en tu zona con productos de proximidad reales y trazables.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-2xl mb-4">🛒</div>
                            <h3 className="font-bold text-lg mb-2 text-brand-primary">2. Haz tu pedido</h3>
                            <p className="text-brand-text/70">Compra directamente sin intermediarios. Recibe producto fresco garantizado.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-2xl mb-4">🚚</div>
                            <h3 className="font-bold text-lg mb-2 text-brand-primary">3. Recibe en casa</h3>
                            <p className="text-brand-text/70">El productor prepara y entrega tu pedido para asegurar la mayor frescura.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
