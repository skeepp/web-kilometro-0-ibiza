// Run the contact fields migration on Supabase
const SUPABASE_URL = 'https://ijjxqccaarsdvdglklww.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqanhxY2NhYXJzZHZkZ2xrbHd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NTk0NywiZXhwIjoyMDg3NzYxOTQ3fQ.JX0BmbkJ380l4QZoHhAFn-dz40JniFz0NBn7R8Ihow4';

const statements = [
    'ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS phone text;',
    'ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS contact_email text;',
    'ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS instagram text;',
    'ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS website text;'
];

async function runSql(sql, label) {
    // Supabase Management API - SQL query endpoint
    const projectRef = 'ijjxqccaarsdvdglklww';
    
    // Try using the Supabase client with rpc first, then fall back to direct REST
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // Use the rpc method to call a function that executes raw SQL
    // Actually, let's just try adding a column by inserting a row with the new field
    // The simplest approach: use the postgrest endpoint
    
    console.log('  → ' + label);
    
    const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ sql_query: sql })
    });
    
    return { status: res.status, ok: res.ok };
}

async function main() {
    console.log('🔄 Running contact fields migration...\n');
    
    // First, let's check if we can use the Supabase SQL endpoint directly
    // The Dashboard SQL editor uses: POST /pg/query
    const fullSql = statements.join('\n');
    
    // Method 1: Try the internal pg/query endpoint
    console.log('Trying /pg/query endpoint...');
    let res = await fetch(SUPABASE_URL + '/pg/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ query: fullSql })
    });
    
    if (res.ok) {
        console.log('✅ Migration completed via /pg/query!');
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
        return;
    }
    
    console.log('  /pg/query returned ' + res.status + ', trying alternative...');
    
    // Method 2: Try the management API SQL endpoint  
    console.log('Trying management API...');
    res = await fetch('https://api.supabase.com/v1/projects/ijjxqccaarsdvdglklww/database/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ query: fullSql })
    });
    
    if (res.ok) {
        console.log('✅ Migration completed via management API!');
        return;
    }
    
    console.log('  Management API returned ' + res.status);
    
    // Method 3: Use @supabase/supabase-js to test if columns already exist
    console.log('\nChecking if columns already exist...');
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    const { data, error } = await supabase
        .from('producers')
        .select('phone, contact_email, instagram, website')
        .limit(1);
    
    if (!error) {
        console.log('✅ Columns already exist! Data:', JSON.stringify(data));
    } else {
        console.log('❌ Columns do NOT exist yet. Error:', error.message);
        console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
        console.log('🔗 https://supabase.com/dashboard/project/ijjxqccaarsdvdglklww/sql/new\n');
        console.log(fullSql);
    }
}

main().catch(e => console.error('Error:', e.message));
