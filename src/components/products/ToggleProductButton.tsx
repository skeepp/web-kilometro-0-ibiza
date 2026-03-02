'use client';

import React, { useTransition } from 'react';
import { toggleProductAvailability } from '@/app/actions/productActions';

export function ToggleProductButton({ productId, available }: { productId: string; available: boolean }) {
    const [isPending, startTransition] = useTransition();

    function handleToggle() {
        startTransition(async () => {
            await toggleProductAvailability(productId, !available);
        });
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`text-sm font-medium transition-colors ${available
                    ? 'text-red-600 hover:text-red-900'
                    : 'text-green-600 hover:text-green-900'
                }`}
        >
            {isPending ? '...' : available ? 'Ocultar' : 'Activar'}
        </button>
    );
}
