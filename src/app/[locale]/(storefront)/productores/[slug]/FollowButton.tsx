'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { toggleFollow, getFollowStatus, getFollowerCount } from '@/app/actions/followActions';
import { toast } from 'sonner';

export function FollowButton({ producerId }: { producerId: string }) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await getFollowStatus(producerId);
                const count = await getFollowerCount(producerId);
                setIsFollowing(status);
                setFollowerCount(count);
            } catch (error) {
                console.error('Error fetching follow status', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [producerId]);

    const handleToggleFollow = async () => {
        // Optimistic update
        const previousState = isFollowing;
        const previousCount = followerCount;

        setIsFollowing(!previousState);
        setFollowerCount(!previousState ? previousCount + 1 : Math.max(0, previousCount - 1));

        try {
            const result = await toggleFollow(producerId);
            setIsFollowing(result.following);
            setFollowerCount(await getFollowerCount(producerId));
            
            if (result.following) {
                toast.success('¡Ahora sigues a este productor!');
            } else {
                toast.info('Has dejado de seguir a este productor.');
            }
        } catch (error: any) {
            // Revert on error
            setIsFollowing(previousState);
            setFollowerCount(previousCount);
            toast.error(error.message || 'Error al actualizar el seguimiento. ¿Estás conectado?');
        }
    };

    if (isLoading) {
        return (
            <Button variant="outline" className="w-full sm:w-auto shadow-sm opacity-50" disabled>
                Cargando...
            </Button>
        );
    }

    return (
        <Button 
            variant={isFollowing ? "outline" : "primary"} 
            className={`w-full sm:w-auto shadow-sm transition-all ${isFollowing ? 'border-brand-primary text-brand-primary hover:bg-gray-50' : 'bg-brand-primary text-white hover:bg-brand-primary/90 hover:-translate-y-0.5'}`}
            onClick={handleToggleFollow}
        >
            {isFollowing ? '✓ Siguiendo' : '+ Seguir'} 
            {followerCount > 0 && <span className="ml-2 bg-black/10 px-2 py-0.5 rounded-full text-xs">{followerCount}</span>}
        </Button>
    );
}
