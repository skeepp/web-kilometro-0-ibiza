'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDummyCover } from '@/utils/dummyImages';
import type { RadarProducer } from './page';

import dynamic from 'next/dynamic';

const MapLoading = () => (
    <div className="w-full h-full flex items-center justify-center bg-brand-background min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-accent rounded-full animate-spin" />
            <p className="text-sm text-brand-text/60 font-medium">Cargando mapa interactivo...</p>
        </div>
    </div>
);

const DynamicGoogleMapInner = dynamic(
    () => import('./GoogleMapInner').then((mod) => mod.default),
    { ssr: false, loading: MapLoading }
);

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/* ── Constants ── */
const IBIZA_CENTER: [number, number] = [38.98, 1.43];
const DEFAULT_ZOOM = 11;

/* ── Haversine distance (km) ── */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Props = { producers: RadarProducer[] };

export default function RadarMapClient({ producers }: Props) {
    /* ── State ── */
    const [userPos, setUserPos] = useState<[number, number] | null>(null);
    const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
    const [radiusKm, setRadiusKm] = useState(50);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [geoStatus, setGeoStatus] = useState<'loading' | 'granted' | 'denied'>('loading');
    const [selectedProducer, setSelectedProducer] = useState<RadarProducer | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    /* ── The active center for distance calculations ── */
    const activeCenter = searchCenter ?? userPos ?? IBIZA_CENTER;

    /* ── Geolocation ── */
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserPos([pos.coords.latitude, pos.coords.longitude]);
                    setGeoStatus('granted');
                },
                () => {
                    setGeoStatus('denied');
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            setGeoStatus('denied');
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);



    /* ── Producers with valid coordinates (already pre-filtered server-side) ── */
    const mappableProducers = useMemo(
        () => producers.filter((p) => p.lat != null && p.lng != null),
        [producers]
    );

    /* ── Distance map ── */
    const distances = useMemo(() => {
        const m = new Map<string, number>();
        for (const p of mappableProducers) {
            m.set(p.id, haversineKm(activeCenter[0], activeCenter[1], p.lat!, p.lng!));
        }
        return m;
    }, [activeCenter, mappableProducers]);

    /* ── Filtered & sorted by distance ── */
    const filteredProducers = useMemo(() => {
        return mappableProducers
            .filter((p) => (distances.get(p.id) ?? Infinity) <= radiusKm)
            .sort((a, b) => (distances.get(a.id) ?? 0) - (distances.get(b.id) ?? 0));
    }, [mappableProducers, distances, radiusKm]);

    /* ── Search ── */
    const handleSearch = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!searchQuery.trim()) return;
            setIsSearching(true);
            try {
                if (GOOGLE_MAPS_API_KEY) {
                    // Use Google Geocoding with component restrictions for accuracy
                    const res = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                            searchQuery
                        )}&components=country:ES&bounds=38.6,1.1|39.2,1.65&key=${GOOGLE_MAPS_API_KEY}`
                    );
                    const data = await res.json();
                    if (data?.results?.[0]?.geometry?.location) {
                        const { lat, lng } = data.results[0].geometry.location;
                        setSearchCenter([lat, lng]);
                        return;
                    }
                }

                // Fallback to Nominatim (OpenStreetMap) — bounded to Ibiza area
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        searchQuery + ', Ibiza, España'
                    )}&viewbox=1.1,38.6,1.65,39.2&bounded=1&limit=5`
                );
                const data = await res.json();
                if (data?.[0]) {
                    const c: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                    setSearchCenter(c);
                }
            } catch (err) {
                console.error('Geocoding error:', err);
            } finally {
                setIsSearching(false);
            }
        },
        [searchQuery]
    );

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchCenter(null);
    };

    /* ── Format distance ── */
    const fmtDist = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

    /* ── Producer click ── */
    const handleSelectProducer = (p: RadarProducer) => {
        setSelectedProducer(p);
    };

    /* ═══════════════════════════════════ RENDER ═══════════════════════════════════ */
    return (
        /* Full-height dashboard layout: fills viewport below the navbar (72px) */
        <div className="flex flex-col w-full overflow-hidden" style={{ height: 'calc(100vh - 72px)' }}>

            {/* ── COMPACT TOP BAR: Search + Distance ── */}
            <div className="bg-white shadow-sm border-b border-gray-100 z-20 relative flex-shrink-0">
                <div className="max-w-[1920px] mx-auto px-4 py-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">

                        {/* Title */}
                        <div className="flex items-center justify-between md:justify-start gap-3 flex-shrink-0">
                            <h1 className="text-lg font-serif font-bold text-brand-primary flex items-center gap-2">
                                📡 Radar
                            </h1>
                            <Link href="/es/productores">
                                <span className="text-xs font-medium text-brand-accent hover:underline flex items-center gap-1">
                                    👁️ Ver lista
                                </span>
                            </Link>
                        </div>

                        {/* Search bar */}
                        <form onSubmit={handleSearch} className="relative flex items-center flex-1 max-w-md">
                            <svg className="w-4 h-4 text-gray-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="¿Dónde? Ej. Santa Eulària..."
                                className="w-full pl-9 pr-20 py-2 bg-white border border-gray-200 shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 rounded-lg text-sm transition-all outline-none text-gray-800 placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchCenter && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-14 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="absolute right-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isSearching ? '...' : 'Buscar'}
                            </button>
                        </form>

                        {/* Distance slider — compact inline */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Radio</span>
                            <span className="text-sm font-bold text-brand-primary whitespace-nowrap min-w-[52px]">+{radiusKm}km</span>
                            <input
                                type="range"
                                min="1"
                                max="200"
                                value={radiusKm}
                                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                                className="w-24 md:w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                            />
                        </div>

                        {/* Geo status */}
                        {geoStatus === 'loading' && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                                <span className="w-3 h-3 border-2 border-brand-primary/30 border-t-brand-accent rounded-full animate-spin inline-block" />
                                Ubicando…
                            </p>
                        )}
                        {geoStatus === 'denied' && !searchCenter && (
                            <p className="text-xs text-amber-600 flex items-center gap-1 flex-shrink-0">
                                ⚠️ Sin ubicación
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MAIN AREA: Map + Producer List — fills all remaining space ── */}
            <div className={`flex-1 flex min-h-0 ${isMobile ? 'flex-col' : 'flex-row'}`}>

                {/* Map — takes all available width, overflow-hidden prevents layout shift */}
                <div className={`relative overflow-hidden ${isMobile ? 'h-[50%] w-full' : 'flex-1'}`}>
                    {GOOGLE_MAPS_API_KEY ? (
                        <DynamicGoogleMapInner
                            apiKey={GOOGLE_MAPS_API_KEY}
                            mappableProducers={filteredProducers}
                            selectedProducer={selectedProducer}
                            setSelectedProducer={setSelectedProducer}
                            IBIZA_CENTER={activeCenter as [number, number]}
                            DEFAULT_ZOOM={DEFAULT_ZOOM}
                            userPosition={activeCenter as [number, number]}
                            radiusKm={radiusKm}
                            distances={distances}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gray-50 p-4 text-center text-sm text-gray-500">
                            Falta configurar la clave API de Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
                        </div>
                    )}
                </div>

                {/* Producer list sidebar — independent scroll */}
                <aside className={`
                    bg-white border-l border-gray-100 flex flex-col
                    ${isMobile ? 'h-[50%] w-full' : 'w-[340px] xl:w-[380px]'}
                `}>
                    {/* Sticky count header */}
                    <div className="flex-shrink-0 bg-white/95 backdrop-blur-md z-10 px-5 py-3 border-b border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-brand-primary">
                            {filteredProducers.length} productor{filteredProducers.length !== 1 ? 'es' : ''}
                            <span className="font-normal text-brand-text/50"> en {radiusKm} km</span>
                        </p>
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                        {filteredProducers.map((producer) => {
                            const isSelected = selectedProducer?.id === producer.id;
                            const coverImg = producer.cover_image_url || getDummyCover(producer.slug);
                            const dist = distances.get(producer.id);

                            return (
                                <div
                                    key={producer.id}
                                    onClick={() => handleSelectProducer(producer)}
                                    className={`
                                        w-full text-left px-5 py-4 transition-all duration-200 flex gap-3 items-start border-b border-gray-50 cursor-pointer
                                        ${isSelected
                                            ? 'bg-brand-background/30 ring-inset ring-2 ring-brand-accent/40'
                                            : 'hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
                                        {coverImg ? (
                                            <Image
                                                src={coverImg}
                                                alt={producer.brand_name}
                                                width={64}
                                                height={64}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">🌾</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className={`font-bold text-sm truncate leading-tight ${isSelected ? 'text-brand-accent' : 'text-gray-900'}`}>
                                                {producer.brand_name}
                                            </h3>
                                            {dist != null && (
                                                <span className="flex-shrink-0 text-[11px] font-semibold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    {fmtDist(dist)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {producer.municipality}
                                        </p>
                                        {/* Expandable detail */}
                                        <div className={`overflow-hidden transition-all duration-300 ${isSelected ? 'max-h-[200px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
                                            {producer.description && (
                                                <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">{producer.description}</p>
                                            )}
                                            <Link
                                                href={`/es/productores/${producer.slug}`}
                                                className="inline-flex items-center justify-center w-full py-2 px-3 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Ver Finca →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredProducers.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-3">🔍</div>
                                <p className="text-brand-text/60 text-sm font-medium">
                                    No hay productores en este radio.
                                </p>
                                <p className="text-brand-text/40 text-xs mt-1">
                                    Prueba a ampliar la distancia con el slider.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
