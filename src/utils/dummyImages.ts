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
    if (str.includes('lechuga') || str.includes('verdura')) return '/dummy/lechuga.png';
    if (str.includes('queso') || str.includes('lacteo')) return '/dummy/queso_producto.png';
    if (str.includes('chuleta') || str.includes('carne') || str.includes('salchichon')) return '/dummy/chuletas.png';
    return '/dummy/tomates.png'; // fallback nicely
};
