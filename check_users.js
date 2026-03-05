const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://ijjxqccaarsdvdglklww.supabase.co',
    'sb_publishable_4djdgDVlKlXK_JeRFQC7VQ_r6EptdFb'
);

async function check() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Recent profiles:', JSON.stringify(profiles, null, 2));
}

check();
