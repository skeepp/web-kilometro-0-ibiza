'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function FollowButton({ producerId }: { producerId: string }) {
    const [isFollowing, setIsFollowing] = useState(false);

    const toggleFollow = () => {
        setIsFollowing(!isFollowing);
        // In a real app we would call a supabase API here
    };

    return (
        <Button 
            variant={isFollowing ? "outline" : "primary"} 
            className={`w-full sm:w-auto shadow-sm transition-all ${isFollowing ? 'border-brand-primary text-brand-primary hover:bg-gray-50' : 'bg-brand-primary text-white hover:bg-brand-primary/90 hover:-translate-y-0.5'}`}
            onClick={toggleFollow}
        >
            {isFollowing ? '✓ Siguiendo' : '+ Seguir'}
        </Button>
    );
}
