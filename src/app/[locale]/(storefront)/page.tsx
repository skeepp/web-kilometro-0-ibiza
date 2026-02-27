import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { createClient } from '@/utils/supabase/server';

export default async function LandingPage() {
    const t = await getTranslations('Index');
    const supabase = await createClient();

    let producers: any[] = [];
    try {
        const { data } = await supabase.from('producers').select('*').limit(6);
        if (data) producers = data;
    } catch (error) {
        console.error('Failed to fetch producers. Is local Supabase running?', error);
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
                        <Link href="/productores">
                            <Button size="lg" className="bg-brand-background text-brand-primary hover:bg-white">{t('cta')}</Button>
                        </Link>
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

            {/* Categories */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-serif font-bold mb-12 text-center">Categorías destacadas</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Link key={cat.name} href={`/productores?category=${cat.name.toLowerCase()}`}>
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
                        <Link href="/productores">
                            <Button variant="ghost">Ver todos &rarr;</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {producers.length > 0 ? producers.map((producer) => (
                            <Link key={producer.id} href={`/productores/${producer.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-all group">
                                    <div className="h-48 w-full bg-brand-earth/20 relative overflow-hidden">
                                        {/* Placeholder image layer */}
                                        <div className="absolute inset-0 flex items-center justify-center text-4xl">🌾</div>
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
        </div>
    );
}
