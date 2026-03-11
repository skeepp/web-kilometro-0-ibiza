'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { logout } from '@/app/actions/auth';

interface SidebarProps {
    role: 'producer' | 'admin';
    activePath: string;
}

export function Sidebar({ role, activePath }: SidebarProps) {
    const producerNav = [
        { name: 'Dashboard', href: '/es/productor/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Mis Productos', href: '/es/productor/productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'Pedidos', href: '/es/productor/pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Mi Perfil', href: '/es/productor/perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ];

    const adminNav = [
        { name: 'Dashboard', href: '/es/admin/dashboard', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
        { name: 'Productores', href: '/es/admin/productores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Pedidos', href: '/es/admin/pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Usuarios', href: '/es/admin/usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Comisiones', href: '/es/admin/comisiones', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    const navigation = role === 'admin' ? adminNav : producerNav;

    return (
        <div className="flex flex-col w-full md:w-72 border-b md:border-r border-brand-primary/10 bg-white/80 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:min-h-screen z-20 sticky top-0">
            <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6 border-b border-brand-primary/10 bg-white/50 backdrop-blur-md sticky top-0 z-10 transition-colors hover:bg-white/80">
                <Link href="/es" className="text-xl font-serif font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-2">
                    <span className="text-2xl">🌿</span>
                    <span className="truncate">{role === 'admin' ? 'Panel Admin' : 'Mi Finca'}</span>
                </Link>
                <div className="md:hidden">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-auto" onClick={() => logout()}>
                        Salir
                    </Button>
                </div>
            </div>
            <div className="md:flex-1 overflow-x-auto md:overflow-y-auto py-2 md:py-6 hide-scrollbar">
                <nav className="flex md:flex-col gap-2 md:gap-0 md:space-y-2 px-4 whitespace-nowrap min-w-max md:min-w-0 pb-1 md:pb-0">
                    {navigation.map((item) => {
                        const isActive = activePath === item.href || (activePath.startsWith(item.href) && item.href !== '/es/admin');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 md:px-4 py-2 md:py-3 text-sm font-medium rounded-xl transition-all duration-200 border border-transparent ${isActive
                                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-[1.02]'
                                    : 'text-brand-text/70 hover:bg-brand-primary/5 hover:text-brand-primary hover:border-brand-primary/10'
                                    }`}
                            >
                                <svg
                                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200 ${isActive ? 'text-white' : 'text-brand-text/40 group-hover:text-brand-primary group-hover:scale-110'
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
            <div className="hidden md:block p-4 border-t border-brand-primary/10">
                <Button variant="ghost" fullWidth className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => logout()}>
                    Cerrar Sesión
                </Button>
            </div>
            <div className="hidden md:block px-4 pb-4">
                <Link href="/es" className="text-xs text-brand-text/50 hover:text-brand-primary transition-colors">
                    ← Volver a la tienda
                </Link>
            </div>
        </div>
    );
}

