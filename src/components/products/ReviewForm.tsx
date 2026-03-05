'use client';

import React, { useState } from 'react';
import { submitReview } from '@/app/actions/reviewActions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-brand-primary text-white font-medium py-2 rounded-lg hover:bg-brand-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? 'Enviando...' : 'Publicar Valoración'}
        </button>
    );
}

export function ReviewForm({ productId }: { productId: string }) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function action(formData: FormData) {
        const result = await submitReview(formData);
        if (result?.error) {
            setMessage({ type: 'error', text: result.error });
        } else if (result?.success) {
            setMessage({ type: 'success', text: '¡Gracias por tu valoración!' });
            // Reset form optionally, but a unique constraint prevents multiple anyway
        }
    }

    return (
        <form action={action} className="bg-brand-background/30 border border-brand-primary/10 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-brand-primary text-xl mb-4">Añadir una valoración</h3>

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message.text}
                </div>
            )}

            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="rating" value={rating} />

            <div className="mb-4">
                <label className="block text-sm font-medium text-brand-text/80 mb-2">Puntuación</label>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            className={`text-2xl transition-colors ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-brand-text/80 mb-2">Comentario (opcional)</label>
                <textarea
                    id="comment"
                    name="comment"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-brand-primary/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-brand-text"
                    placeholder="¿Qué te ha parecido este producto?"
                />
            </div>

            <SubmitButton />
        </form>
    );
}
