import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: products } = await supabase
  .from('products')
  .select('id, name, slug, images, image_url, producer_id')
  .order('name');

console.log('=== PRODUCTS IMAGE DATA ===');
products?.forEach(p => {
  console.log(`${p.name} | images: ${JSON.stringify(p.images)} | image_url: ${p.image_url}`);
});

const { data: producers } = await supabase
  .from('producers')
  .select('id, brand_name, profile_image_url, cover_image_url');

console.log('\n=== PRODUCERS IMAGE DATA ===');
producers?.forEach(p => {
  console.log(`${p.brand_name} | profile: ${p.profile_image_url} | cover: ${p.cover_image_url}`);
});
