'use client';

import React, { useState, useTransition } from 'react';
import { updateOrderStatus } from '@/app/actions/updateOrderStatus';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/constants';

const STATUS_COLORS: Record<OrderStatus, string> = {
    paid: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready_pickup: 'bg-green-100 text-green-800',
    picked_up: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-800',
};

interface OrderStatusSelectProps {
    orderId: string;
    currentStatus: OrderStatus;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
    const [status, setStatus] = useState<OrderStatus>(currentStatus);
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newStatus = e.target.value as OrderStatus;
        setFeedback('idle');

        startTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                setStatus(newStatus);
                setFeedback('success');
                setTimeout(() => setFeedback('idle'), 2000);
            } else {
                setFeedback('error');
                setTimeout(() => setFeedback('idle'), 3000);
            }
        });
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            <select
                value={status}
                onChange={handleChange}
                disabled={isPending}
                className={`text-xs font-semibold rounded-lg border-0 px-3 py-1.5 focus:ring-2 focus:ring-brand-primary outline-none transition-all cursor-pointer disabled:opacity-60 ${STATUS_COLORS[status]}`}
            >
                {ORDER_STATUSES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                    </option>
                ))}
            </select>
            {isPending && (
                <div className="w-4 h-4 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
            )}
            {feedback === 'success' && <span className="text-green-600 text-xs">✓</span>}
            {feedback === 'error' && <span className="text-red-600 text-xs">✗</span>}
        </div>
    );
}

export { STATUS_COLORS };
