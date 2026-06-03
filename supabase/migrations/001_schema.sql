-- ============================================================
--  Arise Bhutan Tours — Supabase Database Schema
--  Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Profiles table (extends Supabase Auth users) ──────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text,
  role        text not null default 'CLIENT',   -- 'CLIENT' | 'ADMIN'
  created_at  timestamptz not null default now()
);

-- ── 2. Bookings table ─────────────────────────────────────────
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  client_name     text,
  group_size      text,
  tour_title      text,
  hotel_tier      text default '3-Star',
  flight_arrival  text,
  flight_return   text,
  arrival_date    date,
  return_date     date,
  itinerary_days  jsonb default '[]'::jsonb,
  cost_items      jsonb default '[]'::jsonb,
  subtotal        numeric(10,2) default 0,
  gst             numeric(10,2) default 0,
  total_cost      numeric(10,2) default 0,
  status          text not null default 'PENDING',  -- 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  created_at      timestamptz not null default now()
);

-- ── 3. Row-Level Security ─────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.bookings  enable row level security;

-- Helper: security-definer avoids RLS recursion when checking role
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- profiles: own row + admin sees all
create policy "profiles_select" on public.profiles
  for select using (
    id = auth.uid() or public.get_my_role() = 'ADMIN'
  );

create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update" on public.profiles
  for update using (id = auth.uid());

-- bookings: own rows + admin sees all
create policy "bookings_select" on public.bookings
  for select using (
    user_id = auth.uid() or public.get_my_role() = 'ADMIN'
  );

create policy "bookings_insert" on public.bookings
  for insert with check (user_id = auth.uid());

create policy "bookings_update_admin" on public.bookings
  for update using (public.get_my_role() = 'ADMIN');

-- ── 4. Auto-create profile on signup ─────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 5. Grant anon/authenticated read on public schema ─────────
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.bookings  to authenticated;
grant execute on function public.get_my_role()   to authenticated;

-- ── 6. To promote a user to ADMIN ─────────────────────────────
-- Run this after registration, replacing the email:
-- UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'admin@arisebhutan.com';
