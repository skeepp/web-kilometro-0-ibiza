'use client';

import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useState } from 'react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function ProducerMapInner({ lat, lng, name }: { lat: number; lng: number; name: string }) {
    const [open, setOpen] = useState(false);

    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-sm text-gray-400 p-4 text-center">
                Falta configurar la clave API de Google Maps
            </div>
        );
    }

    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div className="w-full h-full">
                <Map
                    defaultCenter={{ lat, lng }}
                    defaultZoom={15}
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                    mapId={'8d8109d94a974057'}
                    className="w-full h-full"
                >
                    <AdvancedMarker
                        position={{ lat, lng }}
                        title={name}
                        onClick={() => setOpen(true)}
                    >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-xl border-2 border-white bg-brand-primary relative overflow-hidden">
                            <span>🌱</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-brand-primary"></div>
                    </AdvancedMarker>

                    {open && (
                        <InfoWindow
                            position={{ lat, lng }}
                            onCloseClick={() => setOpen(false)}
                            headerDisabled
                        >
                            <div className="flex flex-col gap-2 p-1 min-w-[140px]">
                                <div className="font-bold text-brand-primary">{name}</div>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-white bg-brand-primary hover:bg-brand-primary/90 text-xs px-3 py-1.5 rounded-md text-center font-medium transition-colors cursor-pointer block"
                                >
                                    Abrir Google Maps
                                </a>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </APIProvider>
    );
}
