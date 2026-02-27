'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
    role: 'producer' | 'admin';
    activePath: string;
}

export function Sidebar({ role, activePath }: SidebarProps) {
    const producerNav = [
        { name: 'Dashboard', href: '/productor/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Mis Productos', href: '/productor/productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'Pedidos', href: '/productor/pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Mi Perfil', href: '/productor/perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ];

    const adminNav = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
        { name: 'Productores', href: '/admin/productores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Pedidos', href: '/admin/pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Usuarios', href: '/admin/usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Comisiones', href: '/admin/comisiones', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    const navigation = role === 'admin' ? adminNav : producerNav;

    return (
        <div className="flex flex-col w-64 border-r border-brand-primary/10 bg-white min-h-screen">
            <div className="flex items-center h-20 px-6 border-b border-brand-primary/10">
                <span className="text-xl font-serif font-bold text-brand-primary">
                    {role === 'admin' ? 'De la Finca | Panel Admin' : 'Panel de Productor'}
                </span>
            </div>
            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-2 px-4">
                    {navigation.map((item) => {
                        const isActive = activePath === item.href || (activePath.startsWith(item.href) && item.href !== '/admin');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive
                                    ? 'bg-brand-primary/10 text-brand-primary'
                                    : 'text-brand-text hover:bg-gray-50 hover:text-brand-primary'
                                    }`}
                            >
                                <svg
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-brand-primary' : 'text-gray-400 group-hover:text-brand-primary'
                                        }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-brand-primary/10">
                <Button variant="ghost" fullWidth className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}
