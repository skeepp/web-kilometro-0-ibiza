-- Drop the policy if it already exists (just in case)
drop policy if exists "Admins can update producers" on public.producers;

-- Create policy allowing any admin to update producers
create policy "Admins can update producers" on public.producers for update using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);
