'use client';

import React, { useEffect, useState } from 'react';
import {
    APIProvider,
    Map,
    AdvancedMarker,
    InfoWindow,
    useMap,
} from '@vis.gl/react-google-maps';
import Image from 'next/image';
import Link from 'next/link';
import { getDummyCover } from '@/utils/dummyImages';
import type { RadarProducer } from './page';

interface GoogleMapInnerProps {
    apiKey: string;
    mappableProducers?: RadarProducer[];
    selectedProducer?: RadarProducer | null;
    setSelectedProducer?: (p: RadarProducer) => void;
    IBIZA_CENTER: [number, number];
    DEFAULT_ZOOM: number;
    userPosition?: [number, number] | null;
    radiusKm?: number;
    distances?: Map<string, number>;
}

function MapHandler({
    mappableProducers,
    selectedProducer,
    userPosition,
    setInfoWindowProducer
}: {
    mappableProducers?: RadarProducer[],
    selectedProducer?: RadarProducer | null,
    userPosition?: [number, number] | null,
    setInfoWindowProducer: (p: RadarProducer | null) => void
}) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        
        if (selectedProducer && selectedProducer.lat && selectedProducer.lng) {
            // Use panTo for a smooth, naturally animated transition between points
            // This is the smoothest method available in the standard JS API
            const targetPos = { lat: selectedProducer.lat + 0.005, lng: selectedProducer.lng };
            map.panTo(targetPos);
            
            // Only zoom in if we're currently too far out, otherwise keep current zoom to avoid "jumps"
            if (map.getZoom()! < 13) {
                map.setZoom(14);
            }
            
            setInfoWindowProducer(selectedProducer);
        } else if (mappableProducers && mappableProducers.length > 0) {
            // Keep fitBounds for the general view only
            const bounds = new google.maps.LatLngBounds();
            mappableProducers.forEach(p => bounds.extend({ lat: p.lat!, lng: p.lng! }));
            if (userPosition) bounds.extend({ lat: userPosition[0], lng: userPosition[1] });
            map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
        }
    }, [map, mappableProducers, selectedProducer, userPosition, setInfoWindowProducer]);

    return null;
}

export default function GoogleMapInner({
    apiKey,
    mappableProducers,
    selectedProducer,
    setSelectedProducer,
    IBIZA_CENTER,
    DEFAULT_ZOOM,
    userPosition,
}: GoogleMapInnerProps) {
    const [infoWindowProducer, setInfoWindowProducer] = useState<RadarProducer | null>(null);

    return (
        <APIProvider apiKey={apiKey}>
            <div className="w-full h-full absolute inset-0">
                <Map
                    defaultCenter={{ lat: IBIZA_CENTER[0], lng: IBIZA_CENTER[1] }}
                    defaultZoom={DEFAULT_ZOOM}
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                    mapId={'8d8109d94a974057'}
                    className="w-full h-full"
                >
                    <MapHandler 
                        mappableProducers={mappableProducers}
                        selectedProducer={selectedProducer}
                        userPosition={userPosition}
                        setInfoWindowProducer={setInfoWindowProducer}
                    />
                    {/* User Position Marker */}
                    {userPosition && (
                        <AdvancedMarker
                            position={{ lat: userPosition[0], lng: userPosition[1] }}
                            title="Tu ubicación"
                        >
                            <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg pulse animate-ping absolute opacity-40"></div>
                            <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg relative z-10"></div>
                        </AdvancedMarker>
                    )}

                    {/* Producer Markers */}
                    {mappableProducers?.map((producer) => (
                        <AdvancedMarker
                            key={producer.id}
                            position={{ lat: producer.lat!, lng: producer.lng! }}
                            onClick={() => {
                                setSelectedProducer?.(producer);
                                setInfoWindowProducer(producer);
                            }}
                        >
                            <div className={`p-1 transition-all duration-300 ${selectedProducer?.id === producer.id ? 'scale-125' : 'scale-100'}`}>
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-xl border-2 relative overflow-hidden
                                    ${selectedProducer?.id === producer.id ? 'bg-[#D4A017] border-white z-10' : 'bg-brand-primary border-white'}
                                `}>
                                    {producer.profile_image_url ? (
                                        <Image src={producer.profile_image_url} alt={producer.brand_name} fill className="object-cover" sizes="40px" />
                                    ) : (
                                        "👨‍🌾"
                                    )}
                                </div>
                                <div className={`
                                    absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                                    border-l-[6px] border-l-transparent 
                                    border-r-[6px] border-r-transparent 
                                    ${selectedProducer?.id === producer.id ? 'border-t-[8px] border-t-[#D4A017]' : 'border-t-[8px] border-t-brand-primary'}
                                `}></div>
                            </div>
                        </AdvancedMarker>
                    ))}

                    {/* Info Window */}
                    {infoWindowProducer && (
                        <InfoWindow
                            position={{ lat: infoWindowProducer.lat!, lng: infoWindowProducer.lng! }}
                            onCloseClick={() => setInfoWindowProducer(null)}
                            headerDisabled
                        >
                            <div className="min-w-[200px] max-w-[260px] p-0 overflow-hidden rounded-lg">
                                <div className="w-full h-24 relative">
                                    <Image
                                        src={infoWindowProducer.cover_image_url || getDummyCover(infoWindowProducer.slug)}
                                        alt={infoWindowProducer.brand_name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-sm text-brand-primary leading-tight">{infoWindowProducer.brand_name}</h3>
                                    <p className="text-xs text-brand-text/60 mt-1">📍 {infoWindowProducer.municipality}</p>
                                    <Link
                                        href={`/es/productores/${infoWindowProducer.slug}`}
                                        className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-brand-accent hover:underline"
                                    >
                                        Ver Finca →
                                    </Link>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </APIProvider>
    );
}
