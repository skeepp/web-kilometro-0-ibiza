import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';

import Image from 'next/image';

export default async function ProductoresPage() {
    const supabase = await createClient();
    const query = supabase.from('producers').select('*, products(count)').in('status', ['active', 'pending']);

    const { data: producers } = await query;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary mb-4 text-balance">
                        Nuestros Productores
                    </h1>
                    <p className="text-brand-text/70 text-lg text-pretty max-w-2xl">
                        Encuentra alimento local directamente de la finca a tu mesa.
                    </p>
                </div>

                {/* Simple filters placeholder */}
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Todo Ibiza</Button>
                    <Button variant="outline" size="sm">Filtros</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                {producers && producers.length > 0 ? producers.map((producer: { id: string; slug: string; cover_image_url?: string; brand_name: string; municipality: string; description?: string; products?: { count: number }[] }) => (
                    <Link key={producer.id} href={`/es/productores/${producer.slug}`}>
                        <Card className="h-full overflow-hidden border border-brand-primary/10 hover:border-brand-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer bg-white">
                            <div className="h-48 w-full bg-brand-earth/10 relative overflow-hidden flex items-center justify-center">
                                {producer.cover_image_url ? (
                                    <Image src={producer.cover_image_url} alt={producer.brand_name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                ) : (
                                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🚜</span>
                                )}
                                <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl text-brand-primary mb-2 group-hover:text-brand-accent transition-colors">{producer.brand_name}</h3>
                                <p className="text-sm text-brand-text/60 mb-4 font-medium flex items-center">
                                    <span className="mr-1 text-brand-accent">📍</span> {producer.municipality}
                                </p>
                                <p className="text-brand-text/80 text-sm line-clamp-3 mb-6">{producer.description}</p>

                                <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-brand-primary/10 mt-auto">
                                    <span className="text-brand-accent group-hover:underline">Ver tienda &rarr;</span>
                                    <span className="bg-brand-background text-brand-primary px-3 py-1 rounded-full text-xs font-semibold border border-brand-primary/10">
                                        {producer.products?.[0]?.count || 0} productos
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                )) : (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                        <h3 className="text-lg font-medium text-brand-primary mb-2">No hay productores disponibles</h3>
                        <p className="text-brand-text/70">Por el momento no encontramos productores con los filtros seleccionados.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
