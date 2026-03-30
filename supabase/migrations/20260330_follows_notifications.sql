-- =============================================
-- FOLLOWS & NOTIFICATIONS SYSTEM
-- =============================================

-- follows: users follow producers
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  producer_id uuid references public.producers(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(follower_id, producer_id)
);

alter table public.follows enable row level security;

-- Users can see their own follows
create policy "Users can read own follows"
  on public.follows for select
  using (auth.uid() = follower_id);

-- Users can follow (insert)
create policy "Users can follow producers"
  on public.follows for insert
  with check (auth.uid() = follower_id);

-- Users can unfollow (delete)
create policy "Users can unfollow producers"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- Producers can see who follows them (for count)
create policy "Producers can see their followers"
  on public.follows for select
  using (
    producer_id in (
      select id from public.producers where user_id = auth.uid()
    )
  );

-- Anyone can read follow counts (for display)
create policy "Public can count follows"
  on public.follows for select
  using (true);

-- notifications: in-app notification system
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null default 'promotion',
  title text not null,
  body text,
  image_url text,
  action_url text,
  producer_name text,
  product_name text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Users can read their own notifications
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Service role / admins can insert notifications (server actions use service role)
-- For server actions, we use the service role key which bypasses RLS
-- But we also allow authenticated users to insert for edge cases
create policy "Authenticated can insert notifications"
  on public.notifications for insert
  with check (true);

-- Admins have full access
create policy "Admins full access follows"
  on public.follows for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Admins full access notifications"
  on public.notifications for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Index for fast lookups
create index if not exists idx_follows_producer on public.follows(producer_id);
create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_notifications_user on public.notifications(user_id, read, created_at desc);
