'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

export default function ProducerMapInner({ lat, lng, name }: { lat: number; lng: number; name: string }) {
    const [icon, setIcon] = useState<L.Icon | null>(null);

    useEffect(() => {
        const svgIcon = L.icon({
            iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
                    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#2D6A4F"/>
                    <circle cx="12" cy="11" r="5" fill="white"/>
                    <text x="12" y="14" text-anchor="middle" font-size="8" fill="#2D6A4F">🌱</text>
                </svg>
            `),
            iconSize: [32, 48],
            iconAnchor: [16, 48],
            popupAnchor: [0, -48]
        });
        setIcon(svgIcon);
    }, []);

    if (!icon) return null;

    return (
        <MapContainer 
            center={[lat, lng]} 
            zoom={15} 
            className="w-full h-full z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={icon}>
                <Popup>
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
                </Popup>
            </Marker>
        </MapContainer>
    );
}
