import { createClient } from '@/utils/supabase/server';
import RadarMapClient from './RadarMapClient';
import { isOnIsland } from '@/utils/geoValidation';

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

    // Filter out producers whose coordinates fall in the sea (off-island)
    const allProducers: RadarProducer[] = ((producers || []) as RadarProducer[]).map((p) => {
        if (p.lat != null && p.lng != null && !isOnIsland(p.lat, p.lng)) {
            // Nullify coordinates so the producer still appears in the list
            // but NOT as a marker on the map
            return { ...p, lat: null, lng: null };
        }
        return p;
    });

    return <RadarMapClient producers={allProducers} />;
}
