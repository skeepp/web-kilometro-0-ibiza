import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { SeasonCalendar } from '@/components/ui/SeasonCalendar';

export const metadata = {
    title: 'Calendario de Temporada | De la Finca',
    description: 'Consulta cuándo están disponibles los productos frescos de Ibiza. Guía de temporada para frutas, verduras y más.',
};

export default async function CalendarioPage() {
    const supabase = await createClient();

    const { data: harvests } = await supabase
        .from('harvest_calendar')
        .select('*')
        .neq('status', 'harvested')
        .order('estimated_harvest', { ascending: true });

    return (
        <div className="w-full">
            {/* Thin Hero Banner */}
            <div className="relative w-full aspect-[2/1] sm:aspect-[3/1] md:aspect-[4/1] lg:aspect-[5/1] xl:aspect-[6/1] overflow-hidden group min-h-[220px]">
                {/* Background Image w/ micro-interaction */}
                <div className="absolute inset-0">
                    <img
                        src="/banners/calendario_hero_thin.png"
                        alt="Campos de cultivo de Ibiza con cosechas frescas"
                        className="w-full h-full object-cover object-center transform transition-transform duration-[4000ms] ease-out group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-black/20 sm:hidden"></div>
                </div>

                {/* Content vertically centered */}
                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-end">
                        <div className="max-w-lg text-right">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-2 leading-tight drop-shadow-md">
                                ¡Planifica tu mesa con lo mejor de cada mes!
                            </h1>
                            <p className="text-sm md:text-base text-white/90 mb-4 ml-auto max-w-sm drop-shadow hidden sm:block">
                                El mejor punto de sabor y frescura directamente de la tierra.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-end">
                                <a
                                    href="/es/mercado"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-accent to-brand-primary text-white font-bold text-sm px-6 py-2.5 rounded-full hover:scale-105 transition-all duration-300 shadow-md shadow-brand-accent/30"
                                >
                                    🛒 Ir al Mercado
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <SeasonCalendar harvests={harvests || []} />
            </div>
        </div>
    );
}
