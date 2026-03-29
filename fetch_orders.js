const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

supabase.from('orders')
  .select('id, created_at, stripe_payment_intent_id')
  .order('created_at', { ascending: false })
  .limit(5)
  .then(res => console.log(JSON.stringify(res.data, null, 2)));
