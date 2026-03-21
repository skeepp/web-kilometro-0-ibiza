-- Harvest Calendar
create table if not exists public.harvest_calendar (
  id uuid primary key default gen_random_uuid(),
  producer_id uuid references public.producers(id) not null,
  product_name text not null,
  category text check (category in ('fruta', 'verdura', 'carne', 'lacteos', 'huevos', 'conservas')),
  planted_at date not null,
  estimated_harvest date not null,
  duration_days integer not null default 30,
  status text check (status in ('planted', 'growing', 'ready', 'harvested')) default 'planted',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.harvest_calendar enable row level security;

-- Everyone can read harvest calendars (public info)
create policy "Harvest calendars are viewable by everyone"
  on public.harvest_calendar for select using (true);

-- Producers can manage their own harvest entries
create policy "Producers can insert their own harvests"
  on public.harvest_calendar for insert
  with check (auth.uid() in (select user_id from public.producers where id = producer_id));

create policy "Producers can update their own harvests"
  on public.harvest_calendar for update
  using (auth.uid() in (select user_id from public.producers where id = producer_id));

create policy "Producers can delete their own harvests"
  on public.harvest_calendar for delete
  using (auth.uid() in (select user_id from public.producers where id = producer_id));

-- Admins full access
create policy "Admins have full access to harvest_calendar"
  on public.harvest_calendar for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');
