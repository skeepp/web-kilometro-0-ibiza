import { createClient } from '@/utils/supabase/server';
import RadarMapClient from './RadarMapClient';

export const metadata = {
    title: 'Radar de Agricultores | Kilómetro 0',
    description: 'Encuentra productores locales cerca de ti en un mapa interactivo de Baleares.',
};

export type RadarProducer = {
    id: string;
    brand_name: string;
    slug: string;
    municipality: string;
    description?: string;
    cover_image_url?: string;
    profile_image_url?: string;
    lat: number | null;
    lng: number | null;
};

export default async function RadarPage() {
    const supabase = await createClient();

    const { data: producers } = await supabase
        .from('producers')
        .select('id, brand_name, slug, municipality, description, cover_image_url, profile_image_url, lat, lng')
        .in('status', ['active', 'pending']);

    const allProducers: RadarProducer[] = (producers || []) as RadarProducer[];

    return (
        <div className="flex flex-col w-full min-h-[calc(100vh-4rem)]">
            <RadarMapClient producers={allProducers} />
        </div>
    );
}
