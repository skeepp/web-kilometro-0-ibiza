'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function GravityRadarCTA() {
    const locale = useLocale();

    return (
        <div className="relative group">
            {/* Subtler Pulse Waves (Background) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[180%] pointer-events-none z-0">
                <div className="absolute inset-0 animate-gravity-waves border-2 border-brand-primary/20 rounded-[2rem]"></div>
                <div className="absolute inset-0 animate-gravity-waves border-2 border-brand-accent/10 rounded-[2rem]" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Main Button */}
            <Link 
                href={`/${locale}/mercado`}
                className="relative z-10 block animate-gravity-pulse"
            >
                <div className="
                    relative overflow-hidden
                    flex items-center gap-4 sm:gap-6
                    px-6 py-4 sm:px-10 sm:py-6
                    bg-gradient-to-br from-brand-primary to-brand-accent
                    rounded-2xl sm:rounded-3xl
                    border-2 sm:border-4 border-white/30
                    shadow-[0_10px_30px_rgba(45,106,79,0.2)]
                    hover:shadow-[0_15px_45px_rgba(45,106,79,0.3)]
                    hover:scale-[1.02] hover:-translate-y-1
                    active:scale-95
                    transition-all duration-300 ease-out
                ">
                    {/* Subtle Shimmer */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>

                    {/* Icon: Market Basket with subtle pulse */}
                    <div className="relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center p-2 border border-white/30 group-hover:rotate-3 transition-transform">
                        <span className="text-3xl sm:text-4xl">🧺</span>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent rounded-full animate-ping opacity-75"></div>
                    </div>

                    {/* Text Content */}
                    <div className="text-left flex flex-col gap-0.5 sm:gap-1">
                        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                            Mercado
                        </h2>
                        <p className="text-xs sm:text-base font-medium text-white/90">
                            Explora y compra productos locales directos de la finca
                        </p>
                    </div>

                    {/* Small Arrow Icon */}
                    <div className="flex items-center justify-center ml-2 border-l border-white/20 pl-4">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </Link>
        </div>
    );
}
