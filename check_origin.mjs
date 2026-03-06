import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrigin() {
    const { data: products, error } = await supabase.from('products').select('name, origin').not('origin', 'is', null);

    if (error) console.error("Error updates:", error);
    else console.log("Products with origin:", products);
}

checkOrigin();
