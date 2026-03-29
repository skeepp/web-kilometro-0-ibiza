const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, slug, images, image_url, producer_id')
    .order('name');

  if (pErr) { console.error('Product error:', pErr); return; }

  console.log('=== PRODUCTS IMAGE DATA ===');
  (products || []).forEach(p => {
    console.log(`${p.name} | images: ${JSON.stringify(p.images)} | image_url: ${p.image_url}`);
  });

  const { data: producers, error: prErr } = await supabase
    .from('producers')
    .select('id, brand_name, profile_image_url, cover_image_url');

  if (prErr) { console.error('Producer error:', prErr); return; }

  console.log('\n=== PRODUCERS IMAGE DATA ===');
  (producers || []).forEach(p => {
    console.log(`${p.brand_name} | profile: ${p.profile_image_url} | cover: ${p.cover_image_url}`);
  });
}

main();
