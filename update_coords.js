const SUPABASE_URL = 'https://ijjxqccaarsdvdglklww.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqanhxY2NhYXJzZHZkZ2xrbHd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NTk0NywiZXhwIjoyMDg3NzYxOTQ3fQ.JX0BmbkJ380l4QZoHhAFn-dz40JniFz0NBn7R8Ihow4';

const MUNICIPALITIES = {
  'Ibiza': { lat: 38.9067, lng: 1.4206 },
  'Eivissa': { lat: 38.9067, lng: 1.4206 },
  'Santa Eulària des Riu': { lat: 38.9842, lng: 1.5362 },
  'Santa Eularia': { lat: 38.9842, lng: 1.5362 },
  'Sant Joan de Labritja': { lat: 39.0797, lng: 1.4508 },
  'Formentera': { lat: 38.7025, lng: 1.4819 }
};

async function fetchProducers() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/producers?select=id,brand_name,municipality,lat,lng`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });
  return response.json();
}

async function updateProducer(id, lat, lng) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/producers?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ lat, lng })
  });
  if (!response.ok) {
    console.error(`Failed to update producer ${id}:`, await response.text());
  } else {
    console.log(`Updated producer ${id} to lat: ${lat}, lng: ${lng}`);
  }
}

async function main() {
  const producers = await fetchProducers();
  console.log('Producers:', producers);

  for (const producer of producers) {
    // If coords are 0 or null, or we just want to force correct ones based on municipality
    const mun = producer.municipality;
    if (mun) {
      let matched = false;
      for (const key of Object.keys(MUNICIPALITIES)) {
        if (mun.toLowerCase().includes(key.toLowerCase())) {
          await updateProducer(producer.id, MUNICIPALITIES[key].lat, MUNICIPALITIES[key].lng);
          matched = true;
          break;
        }
      }
      if (!matched && (producer.lat === 0 || producer.lng === 0)) {
         // Default to Ibiza maybe?
         await updateProducer(producer.id, MUNICIPALITIES['Ibiza'].lat, MUNICIPALITIES['Ibiza'].lng);
      }
    } else {
        // null municipality and 0 coords
        if (producer.lat === 0 || producer.lng === 0) {
            await updateProducer(producer.id, null, null);
        }
    }
  }
}

main().catch(console.error);
