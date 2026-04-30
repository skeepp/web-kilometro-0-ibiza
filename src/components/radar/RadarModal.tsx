'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically load the Google map so it doesn't break SSR
const DynamicGoogleMapInner = dynamic(
    () => import('@/app/[locale]/(storefront)/radar/GoogleMapInner').then((mod) => mod.default),
    { ssr: false }
);

interface RadarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: { lat: number; lng: number; radiusKm: number } | null) => void;
    initialDistance?: number;
    initialCenter?: { lat: number; lng: number } | null;
}

const IBIZA_CENTER = { lat: 38.98, lng: 1.43 };

export function RadarModal({ isOpen, onClose, onApply, initialDistance = 50, initialCenter = null }: RadarModalProps) {
    const defaultCenter = initialCenter || IBIZA_CENTER;
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [center, setCenter] = useState(defaultCenter);
    const [radiusKm, setRadiusKm] = useState(initialDistance);

    // If modal is closed, don't render anything
    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            // Nominatim OpenStreetMap API for geocoding
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Baleares, España')}&limit=5`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                // Auto-select the first result and move map
                const first = data[0];
                setCenter({ lat: parseFloat(first.lat), lng: parseFloat(first.lon) });
            } else {
                alert('No se encontró la ubicación. Prueba con un municipio de Baleares.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleApply = () => {
        onApply({
            lat: center.lat,
            lng: center.lng,
            radiusKm
        });
        onClose();
    };

    const handleClear = () => {
        setSearchQuery('');
        setCenter(IBIZA_CENTER);
        onApply(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Search Bar Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    
                    <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
                        <svg className="w-5 h-5 text-gray-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="¿Dónde? Ej. Santa Eulària, Ibiza..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 rounded-xl text-sm transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isSearching && (
                            <div className="absolute right-3 w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </form>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative min-h-[300px] sm:min-h-[400px] bg-gray-100">
                    <DynamicGoogleMapInner
                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                        IBIZA_CENTER={[center.lat, center.lng] as [number, number]}
                        userPosition={[center.lat, center.lng] as [number, number]}
                        DEFAULT_ZOOM={10}
                        radiusKm={radiusKm}
                    />
                </div>

                {/* Slider and Range Section */}
                <div className="p-5 border-t border-gray-100 bg-white">
                    <div className="flex justify-between items-end mb-4">
                        <div className="text-sm font-medium text-gray-700">Distancia</div>
                        <div className="text-2xl font-bold text-brand-primary">+{radiusKm}km</div>
                    </div>
                    
                    <div className="relative pt-1">
                        <input 
                            type="range" 
                            min="1" 
                            max="200" 
                            value={radiusKm}
                            onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent hover:accent-brand-primary transition-colors"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium px-1">
                            <span>1km</span>
                            <span>200km</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-50">
                        <button 
                            onClick={handleClear}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors flex-1"
                        >
                            Borrar
                        </button>
                        <button 
                            onClick={handleApply}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-xl transition-colors flex-[2] shadow-sm flex justify-center items-center"
                        >
                            Aplicar filtros
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
