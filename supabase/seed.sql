-- Clean up before seeding
delete from public.order_items;
delete from public.orders;
delete from public.products;
delete from public.producers;
delete from public.profiles;

-- Create consumer
insert into auth.users (id, email) values ('c0000000-0000-0000-0000-000000000000', 'consumer@delafinca.local');
insert into public.profiles (id, role, full_name, phone) values ('c0000000-0000-0000-0000-000000000000', 'consumer', 'María García', '600123456');

-- Create Admin
insert into auth.users (id, email) values ('a0000000-0000-0000-0000-000000000000', 'admin@delafinca.local');
insert into public.profiles (id, role, full_name) values ('a0000000-0000-0000-0000-000000000000', 'admin', 'Admin Principal');

-- Create 5 Producers
insert into auth.users (id, email) values 
  ('p1000000-0000-0000-0000-000000000000', 'fincasol@delafinca.local'),
  ('p2000000-0000-0000-0000-000000000000', 'elsabinar@delafinca.local'),
  ('p3000000-0000-0000-0000-000000000000', 'huertamallorquina@delafinca.local'),
  ('p4000000-0000-0000-0000-000000000000', 'quesosroig@delafinca.local'),
  ('p5000000-0000-0000-0000-000000000000', 'carniceriaverde@delafinca.local');

insert into public.profiles (id, role, full_name) values 
  ('p1000000-0000-0000-0000-000000000000', 'producer', 'Juan de Finca Sol'),
  ('p2000000-0000-0000-0000-000000000000', 'producer', 'Marta de El Sabinar'),
  ('p3000000-0000-0000-0000-000000000000', 'producer', 'Pedro de Huerta Mallorquina'),
  ('p4000000-0000-0000-0000-000000000000', 'producer', 'Ana Roig'),
  ('p5000000-0000-0000-0000-000000000000', 'producer', 'Carlos de Carnes Verdes');

insert into public.producers (id, user_id, slug, brand_name, description, municipality, status) values 
  ('11111111-1111-1111-1111-111111111111', 'p1000000-0000-0000-0000-000000000000', 'finca-sol', 'Finca Sol', 'Producción ecológica de temporada en el corazón de Mallorca.', 'Inca', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'p2000000-0000-0000-0000-000000000000', 'el-sabinar', 'El Sabinar', 'Cultivamos verduras con dedicación y amor por la tierra.', 'Manacor', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'p3000000-0000-0000-0000-000000000000', 'huerta-mallorquina', 'Huerta Mallorquina', 'Las mejores frutas tropicales aclimatadas a la isla.', 'Sóller', 'active'),
  ('44444444-4444-4444-4444-444444444444', 'p4000000-0000-0000-0000-000000000000', 'quesos-roig', 'Quesos Roig', 'Lácteos artesanales de nuestras propias ovejas.', 'Llucmajor', 'active'),
  ('55555555-5555-5555-5555-555555555555', 'p5000000-0000-0000-0000-000000000000', 'carnes-verdes', 'Carnes Verdes', 'Ganadería extensiva y respetuosa para carne de máxima calidad.', 'Campos', 'active');

-- Add 1 product for each producer
insert into public.products (producer_id, slug, name, category, price, unit, stock) values 
  ('11111111-1111-1111-1111-111111111111', 'tomate-ramallet-sol', 'Tomate de Ramallet', 'verdura', 3.50, 'kg', 50),
  ('22222222-2222-2222-2222-222222222222', 'patata-poblense', 'Patata Poblense', 'verdura', 1.80, 'kg', 200),
  ('33333333-3333-3333-3333-333333333333', 'naranja-soller', 'Naranja de Sóller', 'fruta', 2.20, 'kg', 100),
  ('44444444-4444-4444-4444-444444444444', 'queso-tierno-roig', 'Queso Tierno de Oveja', 'lacteos', 18.00, 'kg', 10),
  ('55555555-5555-5555-5555-555555555555', 'sobrasada-artesanal', 'Sobrasada Artesanal', 'carne', 12.50, 'unidad', 20);
