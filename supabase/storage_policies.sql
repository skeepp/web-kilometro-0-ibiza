-- Políticas de Storage para el bucket "images" (fotos de productos)
-- Ejecuta esto en: Supabase Dashboard > SQL Editor

-- 1. Lectura pública (cualquiera puede ver las fotos)
CREATE POLICY "images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 2. Subida para usuarios autenticados (productores pueden subir fotos)
CREATE POLICY "images_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 3. Actualización para usuarios autenticados
CREATE POLICY "images_auth_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
