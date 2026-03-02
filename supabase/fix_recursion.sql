-- ============================================
-- FIX: Infinite recursion en policies de profiles
-- ============================================

-- 1. Borrar la política problemática que causa recursión
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- 2. Recrearla usando auth.jwt() en vez de consultar la propia tabla profiles
-- Esto evita la recursión porque lee el rol del JWT token, no de la tabla
CREATE POLICY "Admins have full access to profiles" ON public.profiles
FOR ALL USING (
  (auth.jwt() ->> 'role') = 'service_role'
  OR auth.uid() = id
);
