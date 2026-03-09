'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

/**
 * Unified layout for admin and producer panels.
 * Pass the `role` prop to determine which sidebar navigation to show.
 */
export default function DashboardLayout({
    children,
    role,
}: {
    children: React.ReactNode;
    role: 'admin' | 'producer';
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-brand-background/30 selection:bg-brand-accent selection:text-white">
            <Sidebar role={role} activePath={pathname} />
            <main className="flex-1 overflow-y-auto w-full transition-all duration-300">
                <div className="min-h-full pb-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
