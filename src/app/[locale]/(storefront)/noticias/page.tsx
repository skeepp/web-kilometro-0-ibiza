import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export default async function NoticiasPage() {
    const t = await getTranslations('Index');

    // Placeholder news articles — in the future these would come from a CMS or database
    const newsArticles = [
        {
            id: '1',
            title: 'Temporada de cítricos: Los mejores naranjos de Sóller',
            excerpt: 'La temporada de cítricos ha comenzado con fuerza en el Valle de Sóller. Este año, nuestros productores locales reportan una cosecha extraordinaria gracias a las condiciones climáticas ideales.',
            category: 'Temporada',
            date: '12 Mar 2026',
            emoji: '🍊',
            color: 'from-orange-500/10 to-amber-500/10',
            borderColor: 'border-orange-500/20',
            tagColor: 'bg-orange-500/10 text-orange-700',
        },
        {
            id: '2',
            title: 'Nuevos productores se unen a De la Finca',
            excerpt: 'Damos la bienvenida a 5 nuevos productores de Ibiza y Formentera que se suman a nuestra plataforma, ofreciendo productos únicos de la isla.',
            category: 'Plataforma',
            date: '10 Mar 2026',
            emoji: '🎉',
            color: 'from-brand-primary/10 to-brand-accent/10',
            borderColor: 'border-brand-accent/20',
            tagColor: 'bg-brand-accent/10 text-brand-primary',
        },
        {
            id: '3',
            title: 'Guía: Cómo conservar tus productos frescos más tiempo',
            excerpt: 'Aprende los mejores trucos de nuestros agricultores para mantener tus frutas y verduras frescas durante más tiempo. Desde técnicas de almacenamiento hasta recetas de aprovechamiento.',
            category: 'Consejos',
            date: '8 Mar 2026',
            emoji: '📖',
            color: 'from-blue-500/10 to-indigo-500/10',
            borderColor: 'border-blue-500/20',
            tagColor: 'bg-blue-500/10 text-blue-700',
        },
        {
            id: '4',
            title: 'Feria Agrícola de Ibiza 2026',
            excerpt: 'Este sábado se celebra la gran feria agrícola anual de Ibiza. Más de 30 productores locales exhibirán sus productos. ¡No te lo pierdas! Entrada gratuita.',
            category: 'Eventos',
            date: '5 Mar 2026',
            emoji: '🎪',
            color: 'from-purple-500/10 to-pink-500/10',
            borderColor: 'border-purple-500/20',
            tagColor: 'bg-purple-500/10 text-purple-700',
        },
        {
            id: '5',
            title: 'El aceite de oliva ibicenco conquista mercados internacionales',
            excerpt: 'La producción artesanal de aceite de oliva en Ibiza ha recibido reconocimiento internacional en las últimas catas de aceite virgen extra celebradas en Italia.',
            category: 'Productores',
            date: '1 Mar 2026',
            emoji: '🫒',
            color: 'from-green-600/10 to-emerald-500/10',
            borderColor: 'border-green-500/20',
            tagColor: 'bg-green-500/10 text-green-700',
        },
        {
            id: '6',
            title: 'Receta: Ensalada payesa con productos km0',
            excerpt: 'Descubre cómo preparar la auténtica ensalada payesa ibicenca utilizando ingredientes frescos de nuestros productores locales. Una receta sencilla y deliciosa.',
            category: 'Recetas',
            date: '25 Feb 2026',
            emoji: '🥗',
            color: 'from-lime-500/10 to-green-500/10',
            borderColor: 'border-lime-500/20',
            tagColor: 'bg-lime-500/10 text-lime-700',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-brand-primary/5 via-brand-background to-brand-background overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <ScrollReveal>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-brand-primary/10 rounded-full text-sm font-semibold text-brand-primary mb-6 shadow-sm">
                            <span className="text-lg">📰</span> Últimas novedades
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-primary mb-6 text-balance">
                            Noticias del Campo
                        </h1>
                        <p className="text-lg md:text-xl text-brand-text/70 max-w-2xl mx-auto text-pretty">
                            Mantente al día con las últimas novedades del mundo agrícola local, temporadas, eventos y consejos de nuestros productores.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Featured Article */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16 relative z-20">
                <ScrollReveal>
                    <div className="bg-white rounded-3xl shadow-xl border border-brand-primary/10 overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-0">
                            <div className="bg-gradient-to-br from-brand-primary to-brand-accent p-8 md:p-12 flex flex-col justify-center">
                                <span className="text-6xl mb-4">🌿</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white w-fit mb-4">DESTACADO</span>
                                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 text-balance">
                                    De la Finca lanza el Radar de Agricultores
                                </h2>
                                <p className="text-white/85 mb-6 text-pretty">
                                    Ahora puedes descubrir productores cerca de ti con nuestro nuevo mapa interactivo. Filtra por distancia, categoría y encuentra producto fresco de kilómetro cero en tiempo real.
                                </p>
                                <Link
                                    href="/es/radar"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-primary font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-fit"
                                >
                                    <span>📡</span> Explorar el Radar
                                </Link>
                            </div>
                            <div className="bg-gradient-to-br from-brand-background/80 to-white p-8 md:p-12 flex flex-col justify-center gap-6">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">📍</span>
                                    <div>
                                        <h3 className="font-bold text-brand-primary mb-1">Geolocalización</h3>
                                        <p className="text-sm text-brand-text/60">Encuentra productores a tu alrededor usando GPS</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">🗺️</span>
                                    <div>
                                        <h3 className="font-bold text-brand-primary mb-1">Mapa interactivo</h3>
                                        <p className="text-sm text-brand-text/60">Visualiza todos los productores en un mapa dinámico</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">🎯</span>
                                    <div>
                                        <h3 className="font-bold text-brand-primary mb-1">Radio de búsqueda</h3>
                                        <p className="text-sm text-brand-text/60">Ajusta la distancia para ver solo lo más cercano</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* Articles Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <ScrollReveal>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-10">Últimas Noticias</h2>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsArticles.map((article, index) => (
                        <ScrollReveal key={article.id} delay={index * 80}>
                            <article className={`group bg-white rounded-2xl border ${article.borderColor} overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col`}>
                                <div className={`bg-gradient-to-br ${article.color} p-6 flex items-center justify-between`}>
                                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{article.emoji}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${article.tagColor}`}>
                                        {article.category}
                                    </span>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <time className="text-xs font-medium text-brand-text/40 mb-2">{article.date}</time>
                                    <h3 className="text-lg font-bold text-brand-text mb-3 group-hover:text-brand-primary transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-brand-text/60 line-clamp-3 flex-1">
                                        {article.excerpt}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-brand-primary/5">
                                        <span className="text-sm font-semibold text-brand-accent group-hover:text-brand-primary transition-colors flex items-center gap-1">
                                            Leer más
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </ScrollReveal>
                    ))}
                </div>
            </section>
        </div>
    );
}
