// Execute SQL migration via Supabase REST SQL endpoint
const SUPABASE_URL = 'https://ijjxqccaarsdvdglklww.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqanhxY2NhYXJzZHZkZ2xrbHd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NTk0NywiZXhwIjoyMDg3NzYxOTQ3fQ.JX0BmbkJ380l4QZoHhAFn-dz40JniFz0NBn7R8Ihow4';

const SQL_STATEMENTS = [
    {
        name: '1. Add pickup_address to producers',
        sql: `ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS pickup_address text;`
    },
    {
        name: '2. Add pickup_code to orders',
        sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_code text;`
    },
    {
        name: '3. Drop old status constraint',
        sql: `ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;`
    },
    {
        name: '4. Add new Click & Collect status constraint',
        sql: `ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('paid', 'preparing', 'ready_pickup', 'picked_up', 'cancelled'));`
    },
    {
        name: '5. Migrate pending -> paid',
        sql: `UPDATE public.orders SET status = 'paid' WHERE status = 'pending';`
    },
    {
        name: '6. Migrate shipped/delivered -> picked_up',
        sql: `UPDATE public.orders SET status = 'picked_up' WHERE status IN ('shipped', 'delivered');`
    },
    {
        name: '7. Set all shipping_cost to 0',
        sql: `UPDATE public.orders SET shipping_cost = 0;`
    }
];

async function executeSql(sql) {
    // Use the Supabase pg REST endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql })
    });
    return response;
}

async function main() {
    console.log('🔄 Click & Collect Migration via Supabase SQL\n');
    
    // The Supabase client JS API cannot run DDL (ALTER TABLE).
    // We need to use the database connection string directly.
    // Let's try using the PostgREST SQL execution endpoint first.
    
    // Actually, Supabase doesn't expose a raw SQL endpoint via REST.
    // The proper way is to use the Supabase CLI or the SQL Editor.
    // Let's open the SQL Editor in the browser instead.
    
    const sqlEditorUrl = `https://supabase.com/dashboard/project/ijjxqccaarsdvdglklww/sql/new`;
    
    console.log('⚠️  Supabase does not allow DDL operations (ALTER TABLE) via the JS client or REST API.');
    console.log('');
    console.log('📋 I need you to paste this SQL in the Supabase SQL Editor:');
    console.log(`🔗 ${sqlEditorUrl}`);
    console.log('');
    console.log('--- COPY EVERYTHING BELOW THIS LINE ---');
    console.log('');
    
    const fullSql = `
-- ============================================
-- CLICK & COLLECT MIGRATION
-- ============================================

-- 1. Add pickup_address to producers
ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS pickup_address text;

-- 2. Add pickup_code to orders  
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_code text;

-- 3. Update order status constraint to Click & Collect statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('paid', 'preparing', 'ready_pickup', 'picked_up', 'cancelled'));

-- 4. Migrate existing order statuses
UPDATE public.orders SET status = 'paid' WHERE status = 'pending';
UPDATE public.orders SET status = 'picked_up' WHERE status IN ('shipped', 'delivered');

-- 5. Set shipping_cost to 0 for all existing orders
UPDATE public.orders SET shipping_cost = 0;
`;
    
    console.log(fullSql);
    console.log('--- END OF SQL ---');
}

main();
