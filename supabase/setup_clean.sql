-- ============================================
-- DE LA FINCA — LIMPIEZA + ESQUEMA COMPLETO
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Borrar tablas existentes (en orden por dependencias)
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.addresses cascade;
drop table if exists public.products cascade;
drop table if exists public.producers cascade;
drop table if exists public.profiles cascade;

-- 2. Borrar trigger si existe
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 3. Extension
create extension if not exists "pgcrypto";

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('consumer', 'producer', 'admin')) not null default 'consumer',
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Public readable profiles" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- ============================================
-- TRIGGER: auto-crear perfil al registrarse
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'consumer'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- PRODUCERS
-- ============================================
create table public.producers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  slug text unique not null,
  brand_name text not null,
  description text,
  municipality text,
  lat numeric,
  lng numeric,
  cover_image_url text,
  profile_image_url text,
  gallery_urls text[],
  sanitary_registration text,
  stripe_account_id text,
  status text check (status in ('pending', 'active', 'suspended')) default 'pending',
  created_at timestamptz not null default now()
);

alter table public.producers enable row level security;
create policy "Producers are viewable by everyone" on public.producers for select using (true);
create policy "Producers can insert their own producer record" on public.producers for insert with check (auth.uid() = user_id);
create policy "Producers can update their own producer record" on public.producers for update using (auth.uid() = user_id);

-- ============================================
-- PRODUCTS
-- ============================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  producer_id uuid references public.producers(id) not null,
  slug text unique not null,
  name text not null,
  description text,
  category text check (category in ('fruta', 'verdura', 'carne', 'lacteos', 'huevos', 'conservas')),
  price numeric not null,
  unit text check (unit in ('kg', 'unidad', 'docena', 'bote', 'litro')),
  stock integer not null default 0,
  available boolean default true,
  active_months integer[],
  allergens text[],
  images text[],
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
create policy "Products are viewable by everyone" on public.products for select using (true);
create policy "Producers can manage their products" on public.products for all using (
  auth.uid() in (select user_id from public.producers where id = producer_id)
);

-- ============================================
-- ORDERS
-- ============================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  consumer_id uuid references public.profiles(id) not null,
  producer_id uuid references public.producers(id) not null,
  status text check (status in ('pending', 'preparing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  delivery_name text not null,
  delivery_address text not null,
  delivery_phone text,
  delivery_notes text,
  subtotal numeric not null,
  shipping_cost numeric not null,
  platform_fee numeric not null,
  total numeric not null,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
create policy "Consumers can read own orders" on public.orders for select using (auth.uid() = consumer_id);
create policy "Consumers can create orders" on public.orders for insert with check (auth.uid() = consumer_id);
create policy "Producers can view own received orders" on public.orders for select using (
  auth.uid() in (select user_id from public.producers where id = producer_id)
);
create policy "Producers can update status of own orders" on public.orders for update using (
  auth.uid() in (select user_id from public.producers where id = producer_id)
);

-- ============================================
-- ORDER ITEMS
-- ============================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) not null,
  product_id uuid references public.products(id) not null,
  product_name text not null,
  quantity integer not null,
  unit_price numeric not null,
  subtotal numeric not null
);

alter table public.order_items enable row level security;
create policy "Consumers can read own order items" on public.order_items for select using (
  auth.uid() in (select consumer_id from public.orders where id = order_id)
);
create policy "Consumers can create order items" on public.order_items for insert with check (
  auth.uid() in (select consumer_id from public.orders where id = order_id)
);
create policy "Producers can read own order items" on public.order_items for select using (
  auth.uid() in (select producer_id from public.orders where id = order_id)
);

-- ============================================
-- ADDRESSES
-- ============================================
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  label text,
  full_address text not null,
  is_default boolean default false
);

alter table public.addresses enable row level security;
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id);

-- ============================================
-- ADMIN POLICIES
-- ============================================
create policy "Admins have full access to profiles" on public.profiles for all using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to producers" on public.producers for all using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to products" on public.products for all using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to orders" on public.orders for all using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);
create policy "Admins have full access to order items" on public.order_items for all using (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);
