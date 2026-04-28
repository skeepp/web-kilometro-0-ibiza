-- ============================================
-- Migration: Add contact & social fields to producers
-- ============================================

alter table public.producers add column if not exists phone text;
alter table public.producers add column if not exists contact_email text;
alter table public.producers add column if not exists instagram text;
alter table public.producers add column if not exists website text;
