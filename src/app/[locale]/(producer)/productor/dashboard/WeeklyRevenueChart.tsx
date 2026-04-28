'use client';

import React from 'react';

interface WeeklyRevenueChartProps {
    data: { day: string; revenue: number }[];
}

/**
 * Simple bar chart for weekly revenue. Pure CSS + HTML — no chart library needed.
 * Each bar is proportional to the max revenue of the week.
 */
export function WeeklyRevenueChart({ data }: WeeklyRevenueChartProps) {
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1); // avoid division by 0
    const hasData = data.some(d => d.revenue > 0);

    return (
        <div className="w-full">
            {/* Bars */}
            <div className="flex items-end gap-2 sm:gap-3 h-36 sm:h-44">
                {data.map((item, idx) => {
                    const heightPct = hasData ? (item.revenue / maxRevenue) * 100 : 0;
                    const isToday = idx === data.length - 1;
                    const isEmpty = item.revenue === 0;

                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            {/* Value tooltip on hover */}
                            <div className="relative">
                                <span className={`text-[10px] font-bold transition-opacity duration-200 ${
                                    isEmpty ? 'text-gray-300' : 'text-gray-600 opacity-0 group-hover:opacity-100'
                                }`}>
                                    {isEmpty ? '—' : `${item.revenue.toFixed(0)}€`}
                                </span>
                            </div>
                            
                            {/* Bar */}
                            <div
                                className={`w-full rounded-lg transition-all duration-500 ease-out cursor-pointer relative ${
                                    isToday
                                        ? 'bg-gradient-to-t from-brand-primary to-emerald-400 shadow-sm shadow-brand-primary/20'
                                        : isEmpty 
                                            ? 'bg-gray-100'
                                            : 'bg-gradient-to-t from-brand-primary/60 to-brand-primary/30 hover:from-brand-primary/80 hover:to-brand-primary/50'
                                }`}
                                style={{
                                    height: isEmpty ? '4px' : `${Math.max(heightPct, 8)}%`,
                                    animationDelay: `${idx * 80}ms`,
                                }}
                            >
                                {/* Shine effect on today's bar */}
                                {isToday && !isEmpty && (
                                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Day labels */}
            <div className="flex gap-2 sm:gap-3 mt-2">
                {data.map((item, idx) => {
                    const isToday = idx === data.length - 1;
                    return (
                        <div key={idx} className="flex-1 text-center">
                            <span className={`text-[10px] sm:text-xs font-medium ${
                                isToday ? 'text-brand-primary font-bold' : 'text-gray-400'
                            }`}>
                                {isToday ? 'Hoy' : item.day}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {!hasData && (
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-400">Sin ventas esta semana</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">Las barras se llenarán con cada venta</p>
                </div>
            )}
        </div>
    );
}
