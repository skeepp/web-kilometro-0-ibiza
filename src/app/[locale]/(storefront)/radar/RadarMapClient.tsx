'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDummyCover } from '@/utils/dummyImages';
import type { RadarProducer } from './page';

import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

const DynamicMapInner = dynamic(
    () => import('./MapInner').then((mod) => mod.default),
    { ssr: false }
);

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
    const [mapReady, setMapReady] = useState(false);

    /* ── Icons ── */
    const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);
    const [selectedIcon, setSelectedIcon] = useState<L.Icon | null>(null);
    const [userIcon, setUserIcon] = useState<L.Icon | null>(null);

    /* ── The active center for distance calculations ── */
    const activeCenter = searchCenter ?? userPos ?? IBIZA_CENTER;

    /* ── Geolocation ── */
    useEffect(() => {
        setMapReady(true);
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

    /* ── Create Leaflet icons ── */
    useEffect(() => {
        if (typeof window === 'undefined') return;
        import('leaflet').then((L) => {
            setCustomIcon(
                new L.Icon({
                    iconUrl:
                        'data:image/svg+xml;charset=utf-8,' +
                        encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
                                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#2D6A4F"/>
                                <circle cx="12" cy="11" r="5" fill="white"/>
                                <text x="12" y="14" text-anchor="middle" font-size="8" fill="#2D6A4F">🌱</text>
                            </svg>
                        `),
                    iconSize: [32, 48],
                    iconAnchor: [16, 48],
                    popupAnchor: [0, -48],
                })
            );
            setSelectedIcon(
                new L.Icon({
                    iconUrl:
                        'data:image/svg+xml;charset=utf-8,' +
                        encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="40" height="56">
                                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#D4A017"/>
                                <circle cx="12" cy="11" r="5" fill="white"/>
                                <text x="12" y="14" text-anchor="middle" font-size="8" fill="#D4A017">🌱</text>
                            </svg>
                        `),
                    iconSize: [40, 56],
                    iconAnchor: [20, 56],
                    popupAnchor: [0, -56],
                })
            );
            setUserIcon(
                new L.Icon({
                    iconUrl:
                        'data:image/svg+xml;charset=utf-8,' +
                        encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
                                <circle cx="14" cy="14" r="13" fill="#4A90D9" stroke="white" stroke-width="2.5"/>
                                <circle cx="14" cy="14" r="5" fill="white"/>
                            </svg>
                        `),
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                    popupAnchor: [0, -14],
                })
            );
        });
    }, []);

    /* ── Producers with coordinates ── */
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
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Baleares, España')}&limit=5`
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
        <div className="flex flex-col w-full min-h-[calc(100vh-4rem)]">
            {/* ── TOP BAR: Search + Distance ── */}
            <div className="bg-white shadow-md border-b border-gray-100 z-20 relative">
                <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4">
                    {/* Title row */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-primary flex items-center gap-2">
                            📡 Radar de Agricultores
                        </h1>
                        <Link href="/es/productores">
                            <span className="text-sm font-medium text-brand-accent hover:underline flex items-center gap-1">
                                👁️ Ver lista
                            </span>
                        </Link>
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="relative flex items-center">
                        <svg className="w-5 h-5 text-gray-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="¿Dónde? Ej. Santa Eulària, Ibiza..."
                            className="w-full pl-10 pr-24 py-3 bg-white border border-gray-200 shadow-sm focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-xl text-sm transition-all outline-none text-gray-800 placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchCenter && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-16 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="absolute right-2 px-3 py-1.5 text-xs font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSearching ? '...' : 'Buscar'}
                        </button>
                    </form>

                    {/* Distance slider */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-fit">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Radio</span>
                            <span className="text-lg font-bold text-brand-primary">+{radiusKm}km</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="200"
                            value={radiusKm}
                            onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent hover:accent-brand-primary transition-colors"
                        />
                        <div className="flex gap-2 text-[10px] text-gray-400 font-medium">
                            <span>1km</span>
                            <span>200km</span>
                        </div>
                    </div>

                    {/* Geo status message */}
                    {geoStatus === 'loading' && (
                        <p className="text-xs text-gray-400 flex items-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-brand-primary/30 border-t-brand-accent rounded-full animate-spin inline-block" />
                            Obteniendo tu ubicación…
                        </p>
                    )}
                    {geoStatus === 'denied' && !searchCenter && (
                        <p className="text-xs text-amber-600 flex items-center gap-1.5">
                            ⚠️ No se pudo obtener tu ubicación. Usa el buscador o permite la geolocalización.
                        </p>
                    )}
                </div>
            </div>

            {/* ── MAIN AREA: Map + Producer List ── */}
            <div className={`max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex gap-6 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                {/* Map */}
                <div className={`relative rounded-xl overflow-hidden border border-slate-200 shadow-sm ${isMobile ? 'h-[45vh]' : 'w-[65%] max-h-[75vh] min-h-[500px]'}`}>
                    {mapReady && customIcon && selectedIcon && userIcon ? (
                        <DynamicMapInner
                            mappableProducers={filteredProducers}
                            selectedProducer={selectedProducer}
                            setSelectedProducer={setSelectedProducer}
                            IBIZA_CENTER={activeCenter as [number, number]}
                            DEFAULT_ZOOM={DEFAULT_ZOOM}
                            isMobile={isMobile}
                            customIcon={customIcon}
                            selectedIcon={selectedIcon}
                            userPosition={activeCenter as [number, number]}
                            radiusKm={radiusKm}
                            userIcon={userIcon}
                            distances={distances}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-background min-h-[300px]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-accent rounded-full animate-spin" />
                                <p className="text-sm text-brand-text/60 font-medium">Cargando mapa...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Producer list sidebar */}
                <aside className={`
                    bg-white border text-sm border-slate-200 rounded-xl overflow-y-auto shadow-sm max-h-[75vh]
                    ${isMobile ? 'flex-1 w-full' : 'w-[35%]'}
                `}>
                    {/* Count header */}
                    <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold text-brand-primary">
                            {filteredProducers.length} productor{filteredProducers.length !== 1 ? 'es' : ''}
                            <span className="font-normal text-brand-text/50"> en {radiusKm} km</span>
                        </p>
                    </div>

                    {/* List */}
                    <div className="flex flex-col">
                        {filteredProducers.map((producer) => {
                            const isSelected = selectedProducer?.id === producer.id;
                            const coverImg = producer.cover_image_url || getDummyCover(producer.slug);
                            const dist = distances.get(producer.id);

                            return (
                                <div
                                    key={producer.id}
                                    onClick={() => handleSelectProducer(producer)}
                                    className={`
                                        w-full text-left p-6 transition-all duration-300 flex gap-4 items-start border-b border-gray-50 cursor-pointer
                                        ${isSelected
                                            ? 'bg-brand-background/30 ring-inset ring-2 ring-brand-accent shadow-sm'
                                            : 'hover:bg-brand-background/10 hover:-translate-y-0.5 hover:shadow-md'
                                        }
                                    `}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
                                        {coverImg ? (
                                            <Image
                                                src={coverImg}
                                                alt={producer.brand_name}
                                                width={80}
                                                height={80}
                                                className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">🌾</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className={`font-bold text-base truncate ${isSelected ? 'text-brand-accent' : 'text-gray-900'}`}>
                                                {producer.brand_name}
                                            </h3>
                                            {/* Distance badge */}
                                            {dist != null && (
                                                <span className="flex-shrink-0 text-xs font-semibold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full whitespace-nowrap">
                                                    {fmtDist(dist)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {producer.municipality}
                                        </p>
                                        {/* Expandable Content container */}
                                        <div className={`overflow-hidden transition-all duration-300 ${isSelected ? 'max-h-[300px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
                                            {producer.description && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{producer.description}</p>
                                            )}
                                            <Link
                                                href={`/es/productores/${producer.slug}`}
                                                className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
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
