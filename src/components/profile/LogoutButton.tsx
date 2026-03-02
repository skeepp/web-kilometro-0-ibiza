'use client';

import React from 'react';
import { logout } from '@/app/actions/auth';

export function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="w-full text-center text-sm text-red-500 hover:text-red-700 font-medium py-2 px-4 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
        >
            Cerrar sesión
        </button>
    );
}
