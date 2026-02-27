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
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role={role} activePath={pathname} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
