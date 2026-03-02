'use client';

import React, { useState, useTransition } from 'react';
import { updateProducerStatus } from '@/app/actions/updateProducerStatus';
import { Button } from '@/components/ui/Button';

interface ProducerStatusButtonsProps {
    producerId: string;
    currentStatus: string;
}

export function ProducerStatusButtons({ producerId, currentStatus }: ProducerStatusButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    function handleStatusChange(newStatus: 'active' | 'suspended') {
        setFeedback(null);
        startTransition(async () => {
            const result = await updateProducerStatus(producerId, newStatus);
            if (result.success) {
                setFeedback({
                    type: 'success',
                    message: newStatus === 'active' ? 'Productor aprobado' : 'Productor suspendido',
                });
            } else {
                setFeedback({ type: 'error', message: result.error || 'Error desconocido' });
            }
        });
    }

    return (
        <div className="text-right">
            <div className="flex items-center justify-end gap-2">
                {(currentStatus === 'pending' || currentStatus === 'suspended') && (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleStatusChange('active')}
                        className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                        {isPending ? '...' : 'Aprobar'}
                    </Button>
                )}
                {(currentStatus === 'active' || currentStatus === 'pending') && (
                    <button
                        disabled={isPending}
                        onClick={() => handleStatusChange('suspended')}
                        className="text-red-500 hover:text-red-700 text-xs font-bold disabled:opacity-50"
                    >
                        {isPending ? '...' : 'Suspender'}
                    </button>
                )}
            </div>
            {feedback && (
                <p className={`text-xs mt-1 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {feedback.message}
                </p>
            )}
        </div>
    );
}
