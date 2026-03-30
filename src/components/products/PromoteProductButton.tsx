'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { promoteProduct } from '@/app/actions/promoteProduct';
import { getFollowerCount } from '@/app/actions/followActions';
import { toast } from 'sonner';

interface PromoteButtonProps {
    productId: string;
    productName: string;
    producerId: string;
}

export function PromoteProductButton({ productId, productName, producerId }: PromoteButtonProps) {
    const [status, setStatus] = useState<'idle' | 'confirming' | 'sending' | 'sent'>('idle');
    const [followerCount, setFollowerCount] = useState<number | null>(null);

    const handleInitialClick = async () => {
        setStatus('confirming');
        if (followerCount === null) {
            const count = await getFollowerCount(producerId);
            setFollowerCount(count);
        }
    };

    const handleCancel = () => {
        setStatus('idle');
    };

    const handleConfirm = async () => {
        setStatus('sending');
        try {
            const result = await promoteProduct(productId);
            
            if (result.success) {
                setStatus('sent');
                toast.success(result.message || 'Notificaciones enviadas con éxito.');
            } else {
                setStatus('idle');
                toast.error(result.error || 'No se pudo completar la promoción.');
            }
        } catch (error: any) {
            setStatus('idle');
            toast.error(error.message || 'Error inesperado al promocionar.');
        }
    };

    if (status === 'confirming') {
        return (
            <div className="absolute right-0 top-0 mt-8 sm:-ml-48 z-10 w-64 bg-white p-4 rounded-xl shadow-xl border border-brand-primary/20 text-left text-brand-text">
                <p className="text-sm font-semibold mb-2">¿Enviar notificación sobre {productName}?</p>
                <p className="text-xs text-brand-text/70 mb-4">
                    Esto enviará un aviso a tus <strong>{followerCount || 0} seguidores</strong>.
                    Solo puedes hacer esto una vez al día.
                </p>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={handleCancel}>Cancelar</Button>
                    <Button variant="primary" size="sm" onClick={handleConfirm}>Enviar</Button>
                </div>
            </div>
        );
    }

    if (status === 'sent') {
        return (
            <button disabled className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full cursor-not-allowed">
                <span>✓</span> Enviado
            </button>
        );
    }

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={handleInitialClick}
                disabled={status === 'sending'}
                className="text-xs font-semibold text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all bg-brand-background/30 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            >
                {status === 'sending' ? (
                    <span className="animate-spin w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full block"></span>
                ) : (
                    <span className="text-sm">📢</span>
                )}
                {status === 'sending' ? 'Enviando...' : 'Promocionar'}
            </button>
        </div>
    );
}
