-- Product Reviews Migration
create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz not null default now(),
  unique(product_id, user_id)
);

alter table public.product_reviews enable row level security;

create policy "Reviews are viewable by everyone" on public.product_reviews for select using (true);
create policy "Authenticated users can create reviews" on public.product_reviews for insert with check (auth.uid() = user_id);
create policy "Users can update their own reviews" on public.product_reviews for update using (auth.uid() = user_id);
create policy "Users can delete their own reviews" on public.product_reviews for delete using (auth.uid() = user_id);

-- Add average rating and review count to products view or just compute on the fly.
-- We can create a view or just query directly. Since we want an easy way to get this stats:
create view public.product_stats as
select
  p.id as product_id,
  coalesce(avg(r.rating), 0) as average_rating,
  count(r.id) as review_count
from public.products p
left join public.product_reviews r on p.id = r.product_id
group by p.id;
