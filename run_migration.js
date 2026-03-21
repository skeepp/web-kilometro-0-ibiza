// Run harvest_calendar.sql migration against Supabase
const fs = require('fs');

const SUPABASE_URL = 'https://ijjxqccaarsdvdglklww.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqanhxY2NhYXJzZHZkZ2xrbHd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NTk0NywiZXhwIjoyMDg3NzYxOTQ3fQ.JX0BmbkJ380l4QZoHhAFn-dz40JniFz0NBn7R8Ihow4';

const sql = fs.readFileSync('supabase/harvest_calendar.sql', 'utf8');

async function runMigration() {
    // Try the Supabase Management API endpoint
    const projectRef = 'ijjxqccaarsdvdglklww';
    
    const res = await fetch(`https://${projectRef}.supabase.co/rest/v1/`, {
        method: 'GET',
        headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
    });
    console.log('API check:', res.status);
    
    // Use the Supabase JS client to check if table already exists
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // Try to query the table - if it doesn't exist we need migration
    const { data, error } = await supabase.from('harvest_calendar').select('id').limit(1);
    if (error && error.code === '42P01') {
        console.log('Table does not exist yet. You need to run the SQL in Supabase Dashboard.');
        console.log('Go to: https://supabase.com/dashboard/project/ijjxqccaarsdvdglklww/sql/new');
    } else if (error) {
        console.log('Error:', error.message, error.code);
    } else {
        console.log('SUCCESS! Table harvest_calendar already exists! Data:', data);
    }
}

runMigration().catch(console.error);
