/**
 * fix_producer_coords.mjs
 * 
 * Updates producer coordinates to verified on-land positions
 * in Ibiza and Formentera. Run once with:
 *   node fix_producer_coords.mjs
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Known-good coordinates for test producers ──
const COORD_FIXES = [
    {
        brand_name: 'Can Salchichón',
        lat: 38.9845,
        lng: 1.5341,
        note: 'Santa Eulària — verified on-land'
    },
    {
        // Handles both "finca Cocktel ibiza" and "Finca Cocktel Ibiza" (case-insensitive match)
        brand_name: 'finca Cocktel ibiza',
        lat: 38.9920,
        lng: 1.5120,
        note: 'Santa Eulària — verified on-land'
    },
    {
        brand_name: 'Test Finca 2',
        lat: 38.9067,
        lng: 1.4206,
        note: 'Eivissa centro — verified on-land'
    },
    {
        brand_name: 'Del fin asta el fin',
        lat: 38.7056,
        lng: 1.4342,
        note: 'Formentera, Sant Francesc — verified on-land'
    },
    {
        // Duplicate lowercase entry in DB
        brand_name: 'can salchichon',
        lat: 38.9845,
        lng: 1.5341,
        note: 'Santa Eulària — same as Can Salchichón'
    },
];

// ── Ibiza & Formentera bounding box for quick sea detection ──
const IBIZA_BOUNDS = { minLat: 38.83, maxLat: 39.13, minLng: 1.15, maxLng: 1.60 };
const FORMENTERA_BOUNDS = { minLat: 38.68, maxLat: 38.81, minLng: 1.33, maxLng: 1.55 };

function roughlyOnLand(lat, lng) {
    const inIbiza = lat >= IBIZA_BOUNDS.minLat && lat <= IBIZA_BOUNDS.maxLat &&
                    lng >= IBIZA_BOUNDS.minLng && lng <= IBIZA_BOUNDS.maxLng;
    const inFormentera = lat >= FORMENTERA_BOUNDS.minLat && lat <= FORMENTERA_BOUNDS.maxLat &&
                         lng >= FORMENTERA_BOUNDS.minLng && lng <= FORMENTERA_BOUNDS.maxLng;
    return inIbiza || inFormentera;
}

// Fallback for any unknown producer in the sea → move to Santa Gertrudis rural area
const FALLBACK_COORDS = { lat: 38.9732, lng: 1.4289 };

async function fixCoords() {
    console.log('🌿 Fixing producer coordinates...\n');

    // 1. Fetch all producers
    const { data: producers, error } = await supabase
        .from('producers')
        .select('id, brand_name, lat, lng, municipality')
        .in('status', ['active', 'pending']);

    if (error) {
        console.error('❌ Error fetching producers:', error.message);
        process.exit(1);
    }

    console.log(`Found ${producers.length} producers total.\n`);

    let updated = 0;
    let fallbacks = 0;

    for (const producer of producers) {
        // Check if this producer has a known fix (trim to handle trailing spaces in DB)
        const fix = COORD_FIXES.find(
            (f) => f.brand_name.toLowerCase().trim() === producer.brand_name.toLowerCase().trim()
        );

        if (fix) {
            console.log(`✅ ${producer.brand_name}`);
            console.log(`   Old: (${producer.lat}, ${producer.lng})`);
            console.log(`   New: (${fix.lat}, ${fix.lng}) — ${fix.note}`);

            const { error: updateErr } = await supabase
                .from('producers')
                .update({ lat: fix.lat, lng: fix.lng })
                .eq('id', producer.id);

            if (updateErr) {
                console.log(`   ❌ Update failed: ${updateErr.message}`);
            } else {
                console.log(`   ✓ Updated successfully`);
                updated++;
            }
            console.log();
            continue;
        }

        // Check if current coords are in the sea (outside rough land bounds)
        if (producer.lat != null && producer.lng != null && !roughlyOnLand(producer.lat, producer.lng)) {
            console.log(`⚠️  ${producer.brand_name} — coords appear to be in the sea!`);
            console.log(`   Old: (${producer.lat}, ${producer.lng})`);
            console.log(`   New: (${FALLBACK_COORDS.lat}, ${FALLBACK_COORDS.lng}) — fallback Santa Gertrudis`);

            const { error: updateErr } = await supabase
                .from('producers')
                .update({ lat: FALLBACK_COORDS.lat, lng: FALLBACK_COORDS.lng })
                .eq('id', producer.id);

            if (updateErr) {
                console.log(`   ❌ Update failed: ${updateErr.message}`);
            } else {
                console.log(`   ✓ Updated with fallback`);
                updated++;
                fallbacks++;
            }
            console.log();
            continue;
        }

        // Already on land, skip
        if (producer.lat != null && producer.lng != null) {
            console.log(`🟢 ${producer.brand_name} — coords OK (${producer.lat}, ${producer.lng})`);
        } else {
            console.log(`⚪ ${producer.brand_name} — no coordinates set`);
        }
    }

    console.log(`\n─────────────────────────────────`);
    console.log(`✅ Updated: ${updated} producers`);
    console.log(`   (${fallbacks} used fallback coords)`);
    console.log(`🌿 Done!`);
}

fixCoords().catch(console.error);
