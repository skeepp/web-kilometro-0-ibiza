import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define some nice dummy data with unsplash images
const dummyProducers = [
    {
        brand_name: 'Finca La Huerta del Sol',
        municipality: 'Santa Eulària des Riu',
        description: 'Cultivamos verduras de temporada siguiendo métodos tradicionales y ecológicos en el corazón de Ibiza.',
        slug: 'finca-la-huerta-del-sol',
        cover_image_url: '/dummy/huerta.png',
        profile_image_url: '/dummy/huerta.png',
        status: 'active',
    },
    {
        brand_name: 'Quesos Can Bufí',
        municipality: 'Sant Antoni de Portmany',
        description: 'Elaboración artesanal de quesos de cabra y oveja con la leche de nuestros propios rebaños.',
        slug: 'quesos-can-bufi',
        cover_image_url: '/dummy/quesos.png',
        profile_image_url: '/dummy/quesos.png',
        status: 'active',
    },
    {
        brand_name: 'Carnes Es Verger',
        municipality: 'Sant Joan de Labritja',
        description: 'Carnes de pasto de máxima calidad. Animales criados en libertad respetando sus ciclos naturales.',
        slug: 'carnes-es-verger',
        cover_image_url: '/dummy/can_salchichon.png',
        profile_image_url: '/dummy/can_salchichon.png',
        status: 'active',
    }
];

const dummyProducts = [
    {
        name: 'Tomates Corazón de Buey',
        category: 'verdura',
        price: 3.50,
        unit: 'kg',
        stock: 50,
        description: 'Nuestros mejores tomates, recogidos en su punto óptimo de maduración. Sabor intenso y textura carnosa.',
        images: ['/dummy/tomates.png']
    },
    {
        name: 'Lechuga Romana Fresca',
        category: 'verdura',
        price: 1.20,
        unit: 'unidad',
        stock: 30,
        description: 'Lechugas recién cortadas, crujientes y llenas de sabor.',
        images: ['/dummy/lechuga.png']
    },
    {
        name: 'Queso Curado Artesano',
        category: 'lacteos',
        price: 18.00,
        unit: 'kg',
        stock: 15,
        description: 'Queso curado durante 6 meses en nuestras cavas. Sabor profundo y ligeramente picante.',
        images: ['/dummy/queso_producto.png']
    },
    {
        name: 'Chuletas de Cordero',
        category: 'carne',
        price: 22.50,
        unit: 'kg',
        stock: 10,
        description: 'Jugosas chuletas de cordero lechal criado en libertad.',
        images: ['/dummy/chuletas.png']
    }
];

async function createDummyData() {
    console.log('Starting seed...');

    // 1. Create a dummy user in profiles if they don't exist
    // To bypass auth limitations for this script, we'll try to get existing profiles first,
    // or we need a service role key. Since we only have anon key, we'll fetch existing users to attach producers to.

    const { data: profiles, error: profileErr } = await supabase.from('profiles').select('id, role').limit(3);

    if (profileErr || !profiles || profiles.length === 0) {
        console.error('Could not fetch profiles. You need at least one user registered to attach dummy data to:', profileErr);
        process.exit(1);
    }

    // Ensure they are producers
    for (const p of profiles) {
        await supabase.from('profiles').update({ role: 'producer' }).eq('id', p.id);
    }

    const profileIds = profiles.map(p => p.id);

    console.log(`Found ${profileIds.length} profiles to use as owners.`);

    // 2. Insert Producers
    for (let i = 0; i < Math.min(dummyProducers.length, profileIds.length); i++) {
        const producerData = {
            ...dummyProducers[i],
            user_id: profileIds[i]
        };

        // Check if exists
        const { data: existing } = await supabase.from('producers').select('id').eq('slug', producerData.slug).single();

        let producerId;
        if (existing) {
            console.log(`Producer ${producerData.slug} already exists, updating images...`);
            const { data: updated, error: updateErr } = await supabase.from('producers')
                .update({ cover_image_url: producerData.cover_image_url, profile_image_url: producerData.profile_image_url, status: 'active' })
                .eq('id', existing.id)
                .select('id').single();

            if (updateErr) console.error('Error updating producer:', updateErr);
            producerId = updated?.id || existing.id;
        } else {
            console.log(`Inserting producer ${producerData.brand_name}...`);
            const { data: inserted, error: insertErr } = await supabase.from('producers').insert(producerData).select('id').single();
            if (insertErr) {
                console.error('Error inserting producer:', insertErr);
                continue;
            }
            producerId = inserted.id;
        }

        // 3. Insert specific products for this producer
        if (producerId) {
            let productToInsert;
            if (i === 0) { productToInsert = [dummyProducts[0], dummyProducts[1]]; }
            if (i === 1) { productToInsert = [dummyProducts[2]]; }
            if (i === 2) { productToInsert = [dummyProducts[3]]; }

            if (productToInsert) {
                for (const prod of productToInsert) {
                    const pData = {
                        ...prod,
                        producer_id: producerId,
                        slug: prod.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString().slice(-4)
                    };
                    console.log(`  Inserting product ${pData.name}...`);
                    await supabase.from('products').insert(pData);
                }
            }
        }
    }

    console.log('Seed completed successfully!');
}

createDummyData().catch(console.error);
