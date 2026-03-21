import React from 'react';
import { requireProducer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HarvestManager from './HarvestManager';

export default async function CosechasPage() {
    const { supabase, producer } = await requireProducer();

    if (!producer) {
        redirect('/es/productor/onboarding');
    }

    const { data: harvests } = await supabase
        .from('harvest_calendar')
        .select('*')
        .eq('producer_id', producer.id)
        .order('estimated_harvest', { ascending: true });

    return (
        <div className="p-4 sm:p-8 md:p-12 max-w-5xl mx-auto">
            <HarvestManager harvests={harvests || []} />
        </div>
    );
}
