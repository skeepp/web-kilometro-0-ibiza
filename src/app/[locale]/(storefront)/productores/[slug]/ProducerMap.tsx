'use client';

import dynamic from 'next/dynamic';

import type { ComponentType } from 'react';

const DynamicMap = dynamic(
    () => import('./ProducerMapInner') as Promise<{ default: ComponentType<{ lat: number; lng: number; name: string }> }>,
    { ssr: false, loading: () => <div className="w-full h-full bg-slate-50 animate-pulse" /> }
);

interface Props {
    lat?: number | null;
    lng?: number | null;
    name: string;
}

export default function ProducerMap({ lat, lng, name }: Props) {
    if (!lat || !lng) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-sm text-gray-400">
                Ubicación no disponible
            </div>
        );
    }

    return (
        <div className="w-full h-full relative z-0">
            <DynamicMap lat={lat} lng={lng} name={name} />
        </div>
    );
}
