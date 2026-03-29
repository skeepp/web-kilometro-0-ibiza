import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from('orders').select('id, created_at, consumer_id, status').order('created_at', { ascending: false }).limit(5);

if (error) console.error(error);
else console.log(data);
