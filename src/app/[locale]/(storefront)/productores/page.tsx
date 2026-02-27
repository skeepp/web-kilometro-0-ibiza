import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';

export default async function ProductoresPage({ searchParams }: { searchParams: { category?: string } }) {
    const supabase = await createClient();
    let query = supabase.from('producers').select('*, products(count)').eq('status', 'active');

    // If we had a complex category filter we could join it, but for MVP let's just fetch all or filter basic.
    // In a real scenario we could filter directly by products if categories were mapped.

    const { data: producers } = await query;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-brand-primary mb-2">Nuestros Productores</h1>
                    <p className="text-brand-text/70">Encuentra alimento local directamente de la finca a tu mesa.</p>
                </div>

                {/* Simple filters placeholder */}
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Todo Mallorca</Button>
                    <Button variant="outline" size="sm">Filtros</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {producers && producers.length > 0 ? producers.map((producer: any) => (
                    <Link key={producer.id} href={`/productores/${producer.slug}`}>
                        <Card className="h-full hover:shadow-lg transition-all group cursor-pointer">
                            <div className="h-48 w-full bg-brand-earth/10 relative overflow-hidden flex items-center justify-center">
                                {producer.cover_image_url ? (
                                    <img src={producer.cover_image_url} alt={producer.brand_name} className="object-cover w-full h-full" />
                                ) : (
                                    <span className="text-4xl">🚜</span>
                                )}
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl text-brand-primary mb-1 group-hover:underline">{producer.brand_name}</h3>
                                <p className="text-sm text-brand-text/60 mb-4 font-medium flex items-center">
                                    <span className="mr-1">📍</span> {producer.municipality}
                                </p>
                                <p className="text-brand-text/80 text-sm line-clamp-3 mb-4">{producer.description}</p>

                                <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-brand-primary/10">
                                    <span className="text-brand-accent">Ver tienda</span>
                                    <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs">
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
