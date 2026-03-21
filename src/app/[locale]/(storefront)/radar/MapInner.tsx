'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import Image from 'next/image';
import Link from 'next/link';
import { getDummyCover } from '@/utils/dummyImages';
import type { RadarProducer } from './page';
import { useEffect, useRef } from 'react';

import L from 'leaflet';

/* ── Helper: Map logic for bounds and flyTo ── */
function MapController({ 
    center, 
    zoom,
    producers,
    selectedProducer,
    userPosition
}: { 
    center: [number, number]; 
    zoom?: number;
    producers?: RadarProducer[];
    selectedProducer?: RadarProducer | null;
    userPosition?: [number, number] | null;
}) {
    const map = useMap();
    
    useEffect(() => {
        if (selectedProducer && selectedProducer.lat && selectedProducer.lng) {
            // Smooth fly-to towards selected producer with a more relaxed zoom (14 instead of 16)
            // Added a small offset to the latitude (+0.01) so the popup is more centered in the view
            map.flyTo([selectedProducer.lat + 0.01, selectedProducer.lng], 14, { duration: 1.5 });
        } else if (producers && producers.length > 0) {
            // Auto-zoom exclusively to active markers with 20px padding
            const bounds = L.latLngBounds(producers.map(p => [p.lat!, p.lng!]));
            if (userPosition) bounds.extend(userPosition);
            map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14, duration: 1.0 });
        } else {
            // Fallback to center
            map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.8 });
        }
    }, [center, zoom, producers, selectedProducer, userPosition, map]);
    return null;
}

/* ── Props ── */
interface MapInnerProps {
    mappableProducers?: RadarProducer[];
    selectedProducer?: RadarProducer | null;
    setSelectedProducer?: (p: RadarProducer) => void;
    IBIZA_CENTER: [number, number];
    DEFAULT_ZOOM: number;
    isMobile?: boolean;
    customIcon?: L.Icon;
    selectedIcon?: L.Icon;
    /* new props for user location & radius */
    userPosition?: [number, number] | null;
    radiusKm?: number;
    userIcon?: L.Icon;
    /* distances map */
    distances?: Map<string, number>;
}

export default function MapInner({
    mappableProducers,
    selectedProducer,
    setSelectedProducer,
    IBIZA_CENTER,
    DEFAULT_ZOOM,
    isMobile,
    customIcon,
    selectedIcon,
    userPosition,
    radiusKm,
    userIcon,
    distances,
}: MapInnerProps) {
    const center = userPosition ?? IBIZA_CENTER;
    const markerRefs = useRef<Record<string, L.Marker | null>>({});

    useEffect(() => {
        if (selectedProducer && markerRefs.current[selectedProducer.id]) {
            markerRefs.current[selectedProducer.id]?.openPopup();
        }
    }, [selectedProducer]);

    return (
        <MapContainer
            center={center}
            zoom={DEFAULT_ZOOM}
            className="w-full h-full absolute inset-0"
            zoomControl={!isMobile}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Re-center and bounds logic */}
            <MapController 
                center={center} 
                producers={mappableProducers}
                selectedProducer={selectedProducer}
                userPosition={userPosition}
            />

            {/* User position marker */}
            {userPosition && userIcon && (
                <Marker position={userPosition} icon={userIcon}>
                    <Popup>
                        <p className="text-sm font-semibold text-brand-primary">📍 Tu ubicación</p>
                    </Popup>
                </Marker>
            )}

            {/* Search radius circle */}
            {userPosition && radiusKm && (
                <Circle
                    center={userPosition}
                    radius={radiusKm * 1000}
                    pathOptions={{
                        color: '#2D6A4F',
                        fillColor: '#2D6A4F',
                        fillOpacity: 0.08,
                        weight: 2,
                        dashArray: '6 4',
                    }}
                />
            )}

            {/* Producer markers */}
            {mappableProducers && mappableProducers.map((producer: RadarProducer) => {
                const isSelected = selectedProducer?.id === producer.id;
                const coverImg = producer.cover_image_url || getDummyCover(producer.slug);
                const dist = distances?.get(producer.id);

                return (
                    <Marker
                        key={producer.id}
                        position={[producer.lat!, producer.lng!]}
                        icon={isSelected ? (selectedIcon ?? customIcon!) : customIcon!}
                        eventHandlers={{
                            click: () => setSelectedProducer?.(producer),
                        }}
                        ref={(ref) => {
                            markerRefs.current[producer.id] = ref;
                        }}
                    >
                        <Popup>
                            <div className="min-w-[200px] max-w-[260px] -m-1">
                                {coverImg && (
                                    <div className="w-full h-28 relative rounded-t-lg overflow-hidden -mt-1 -mx-0">
                                        <Image
                                            src={coverImg}
                                            alt={producer.brand_name}
                                            fill
                                            className="object-cover"
                                            sizes="260px"
                                        />
                                    </div>
                                )}
                                <div className="p-2">
                                    <h3 className="font-bold text-sm text-brand-primary">{producer.brand_name}</h3>
                                    <p className="text-xs text-brand-text/60 mt-0.5 flex items-center gap-1">
                                        <span>📍</span> {producer.municipality}
                                        {dist != null && (
                                            <span className="ml-auto text-[10px] font-semibold text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded-full">
                                                {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)} km`}
                                            </span>
                                        )}
                                    </p>
                                    {producer.description && (
                                        <p className="text-xs text-brand-text/70 mt-1 line-clamp-2">{producer.description}</p>
                                    )}
                                    <Link
                                        href={`/es/productores/${producer.slug}`}
                                        className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-brand-accent hover:underline"
                                    >
                                        Ver productor →
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
