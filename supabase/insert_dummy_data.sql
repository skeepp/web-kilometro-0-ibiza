-- Inserta perfiles si no existen 3 perfiles dummy
INSERT INTO public.profiles (id, role, full_name, phone)
SELECT
    gen_random_uuid(),
    'producer',
    'Productor Demo 1',
    '600123456'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 3)
RETURNING id;

INSERT INTO public.profiles (id, role, full_name, phone)
SELECT
    gen_random_uuid(),
    'producer',
    'Productor Demo 2',
    '600123457'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 3);

INSERT INTO public.profiles (id, role, full_name, phone)
SELECT
    gen_random_uuid(),
    'producer',
    'Productor Demo 3',
    '600123458'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 3);

-- Inserta los productores usando los 3 primeros IDs de perfiles
WITH user_ids AS (
    SELECT id, row_number() OVER () as rn FROM public.profiles WHERE role = 'producer' LIMIT 3
)
INSERT INTO public.producers (user_id, slug, brand_name, description, municipality, cover_image_url, profile_image_url, status)
SELECT 
    (SELECT id FROM user_ids WHERE rn = 1), 
    'finca-la-huerta', 
    'Finca La Huerta del Sol', 
    'Cultivamos verduras de temporada siguiendo métodos tradicionales y ecológicos.', 
    'Santa Eulària des Riu', 
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80', 
    'https://plus.unsplash.com/premium_photo-1663013675034-7a917ecca517?w=400&q=80',
    'active'
WHERE NOT EXISTS (SELECT 1 FROM public.producers WHERE slug = 'finca-la-huerta');

WITH user_ids AS (
    SELECT id, row_number() OVER () as rn FROM public.profiles WHERE role = 'producer' LIMIT 3
)
INSERT INTO public.producers (user_id, slug, brand_name, description, municipality, cover_image_url, profile_image_url, status)
SELECT 
    (SELECT id FROM user_ids WHERE rn = 2), 
    'quesos-can-bufi', 
    'Quesos Can Bufí', 
    'Elaboración artesanal de quesos con la leche de nuestros propios rebaños.', 
    'Sant Antoni de Portmany', 
    'https://images.unsplash.com/photo-1596649282803-120d912906e7?w=800&q=80', 
    'https://images.unsplash.com/photo-1525087740718-9e0f2c58c7ef?w=400&q=80',
    'active'
WHERE NOT EXISTS (SELECT 1 FROM public.producers WHERE slug = 'quesos-can-bufi');

-- Insert products
INSERT INTO public.products (producer_id, slug, name, description, category, price, unit, stock, available, images)
SELECT 
    id, 
    'tomates-corazon', 
    'Tomates Corazón de Buey', 
    'Nuestros mejores tomates, recogidos en su punto óptimo de maduración.', 
    'verdura', 
    3.50, 
    'kg', 
    50, 
    true, 
    ARRAY['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80']
FROM public.producers WHERE slug = 'finca-la-huerta'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (producer_id, slug, name, description, category, price, unit, stock, available, images)
SELECT 
    id, 
    'lechuga-romana', 
    'Lechuga Romana Fresca', 
    'Lechugas recién cortadas, crujientes y llenas de sabor.', 
    'verdura', 
    1.20, 
    'unidad', 
    30, 
    true, 
    ARRAY['https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&q=80']
FROM public.producers WHERE slug = 'finca-la-huerta'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (producer_id, slug, name, description, category, price, unit, stock, available, images)
SELECT 
    id, 
    'queso-curado', 
    'Queso Curado Artesano', 
    'Queso curado durante 6 meses en nuestras cavas. Sabor profundo y picante.', 
    'lacteos', 
    18.00, 
    'kg', 
    15, 
    true, 
    ARRAY['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80']
FROM public.producers WHERE slug = 'quesos-can-bufi'
ON CONFLICT (slug) DO NOTHING;
