'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const images = [
    '/images/home_hero_bg.png',    // Original farm image
    '/images/tomatoes_hero.png',   // Tomatoes
    '/images/es_vedra_hero.png',   // Es Vedra
    '/images/puig_demissa_hero.png' // Puig de Missa
];

export function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-0 bg-gray-950">
            {images.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                    <Image
                        src={src}
                        alt="Fondo de Baleares"
                        fill
                        sizes="100vw"
                        quality={100}
                        className="object-cover object-center"
                        priority={index === 0}
                    />
                </div>
            ))}
            {/* Gradient Overlays for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-900/40 to-transparent z-20"></div>
        </div>
    );
}
