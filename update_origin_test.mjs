import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrigin() {
    // We update all products to have an origin to test the UI
    const { data: products, error } = await supabase.from('products').select('id').limit(1);

    if (products && products.length > 0) {
        const { error: updateError } = await supabase
            .from('products')
            .update({ origin: 'Ibiza' })
            .eq('id', products[0].id);

        if (updateError) console.error("Error updates:", updateError);
        else console.log("Success updated product origin to Ibiza");
    } else {
        console.log("No products found.");
    }
}

testOrigin();
