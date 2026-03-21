export const getDummyCover = (slug: string) => {
    if (!slug) return '/dummy/huerta.png';
    const lSlug = slug.toLowerCase();
    if (lSlug.includes('salchichon')) return '/dummy/can_salchichon.png';
    if (lSlug.includes('bufi') || lSlug.includes('queso')) return '/dummy/quesos.png';
    return '/dummy/huerta.png';
};

export const getDummyProductImage = (name: string, slug: string) => {
    const str = ((name || '') + (slug || '')).toLowerCase();
    if (str.includes('tomate')) return '/dummy/tomates.png';
    if (str.includes('lechuga') || str.includes('romana')) return '/dummy/lechuga.png';
    if (str.includes('queso') || str.includes('lacteo')) return '/dummy/queso_producto.png';
    if (str.includes('chuleta') || str.includes('carne') || str.includes('salchichon')) return '/dummy/chuletas.png';
    if (str.includes('sand')) return 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=200&q=80';
    if (str.includes('calabac')) return '/dummy/lechuga.png';
    if (str.includes('naranja') || str.includes('citric')) return 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=200&q=80';
    if (str.includes('huevo') || str.includes('gallina')) return 'https://images.unsplash.com/photo-1498823802901-0d7842468190?w=200&q=80';
    return '/dummy/tomates.png'; // fallback nicely
};
