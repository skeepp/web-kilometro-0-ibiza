/**
 * Geo-validation utilities for Ibiza & Formentera.
 *
 * Uses a simplified polygon (bounding polygon) for each island
 * and a point-in-polygon ray-casting algorithm to determine
 * if a coordinate falls on land.
 */

// Simplified polygon outlines of Ibiza & Formentera (lat, lng pairs)
// These are generous outlines that include coastal areas but exclude open sea.

const IBIZA_POLYGON: [number, number][] = [
    [39.115, 1.190],  // NW tip (Punta Grossa / Cap Nunó)
    [39.120, 1.280],  // N coast
    [39.115, 1.350],  // NE (near Portinatx)
    [39.100, 1.440],  // NE tip (Tagomago area)
    [39.080, 1.490],  // E (Cala de Sant Vicent)
    [39.020, 1.570],  // E coast (Santa Eulària)
    [38.975, 1.590],  // SE (Es Canar)
    [38.935, 1.580],  // SE coast
    [38.900, 1.530],  // S (Cala Llonga)
    [38.860, 1.480],  // S coast
    [38.850, 1.410],  // SW (Ses Salines / Playa d'en Bossa)
    [38.870, 1.310],  // SW (Sant Josep)
    [38.890, 1.240],  // W (Cala d'Hort)
    [38.930, 1.190],  // W coast (Cala Conta)
    [38.960, 1.170],  // NW (San Antonio bay)
    [39.010, 1.160],  // NW coast
    [39.050, 1.155],  // NW
    [39.080, 1.160],  // NW
    [39.115, 1.190],  // close polygon
];

const FORMENTERA_POLYGON: [number, number][] = [
    [38.800, 1.370],  // NW (Espalmador)
    [38.800, 1.470],  // NE (Punta de la Gavina / Es Pujols area)
    [38.790, 1.510],  // E
    [38.760, 1.530],  // SE (La Mola)
    [38.730, 1.530],  // SE tip
    [38.720, 1.490],  // S (La Mola cliff)
    [38.730, 1.440],  // S
    [38.710, 1.410],  // SW (Cap de Barbaria area)
    [38.710, 1.370],  // SW
    [38.720, 1.340],  // W
    [38.735, 1.330],  // W
    [38.770, 1.350],  // NW (Illetes)
    [38.790, 1.360],  // NW
    [38.800, 1.370],  // close polygon
];

/**
 * Ray-casting point-in-polygon algorithm.
 * Returns true if the point (lat, lng) lies inside the given polygon.
 */
function pointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [yi, xi] = polygon[i];
        const [yj, xj] = polygon[j];
        if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

/**
 * Returns true if coordinates are within Ibiza or Formentera land boundaries.
 * Uses a generous tolerance margin (~1km buffer) to include coastal farms.
 */
export function isOnIsland(lat: number | null, lng: number | null): boolean {
    if (lat == null || lng == null) return false;
    // Quick bounding-box pre-check (saves computation for obviously wrong coords)
    if (lat < 38.6 || lat > 39.2 || lng < 1.1 || lng > 1.65) return false;
    return pointInPolygon(lat, lng, IBIZA_POLYGON) || pointInPolygon(lat, lng, FORMENTERA_POLYGON);
}

/**
 * Simple sea-check: returns true if coordinates are clearly in the sea.
 * This is a broader fallback that just checks bounding box of
 * Ibiza/Formentera archipelago.
 */
export function isInSeaArea(lat: number | null, lng: number | null): boolean {
    if (lat == null || lng == null) return true;
    // If within the general Balearic area but NOT on an island polygon → sea
    const inGeneralArea = lat > 38.5 && lat < 39.3 && lng > 1.0 && lng < 1.7;
    if (!inGeneralArea) return true; // Completely outside the area
    return !isOnIsland(lat, lng);
}

/**
 * Validates and filters producer coordinates.
 * Returns the coordinate pair if valid, or null if the producer
 * would appear in the sea.
 */
export function validateProducerCoords(
    lat: number | null,
    lng: number | null
): { lat: number; lng: number } | null {
    if (lat == null || lng == null) return null;
    if (!isOnIsland(lat, lng)) return null;
    return { lat, lng };
}
