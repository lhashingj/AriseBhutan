-- ============================================================
--  Arise Bhutan — Migration 009: itinerary_requests
--  Stores Adventure Builder wizard submissions (no auth required)
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.itinerary_requests (
  id                  uuid        primary key default gen_random_uuid(),
  nights              integer     not null,
  guests              integer     not null,
  tier                text        not null,
  selected_activities jsonb       not null default '[]'::jsonb,
  status              text        not null default 'pending_review',
  submitted_at        timestamptz not null default now(),

  constraint itinerary_requests_nights_check
    check (nights between 1 and 60),
  constraint itinerary_requests_guests_check
    check (guests between 1 and 100),
  constraint itinerary_requests_tier_check
    check (tier in ('3-Star', '4-Star', '5-Star Luxury')),
  constraint itinerary_requests_status_check
    check (status in ('pending_review', 'in_progress', 'quoted', 'confirmed', 'declined'))
);

-- ── Row-Level Security ────────────────────────────────────────
alter table public.itinerary_requests enable row level security;

-- Anyone (including unauthenticated visitors) can submit
create policy "itinerary_requests_public_insert" on public.itinerary_requests
  for insert with check (true);

-- Only admins can read, update, and delete submissions
create policy "itinerary_requests_admin_select" on public.itinerary_requests
  for select using (public.get_my_role() = 'ADMIN');

create policy "itinerary_requests_admin_update" on public.itinerary_requests
  for update using (public.get_my_role() = 'ADMIN');

create policy "itinerary_requests_admin_delete" on public.itinerary_requests
  for delete using (public.get_my_role() = 'ADMIN');

-- ── Grants ───────────────────────────────────────────────────
-- anon (unauthenticated) can insert (Adventure Builder form)
grant insert on public.itinerary_requests to anon;
grant select, insert, update, delete on public.itinerary_requests to authenticated;

-- ── Index for admin dashboard queries ────────────────────────
create index if not exists itinerary_requests_status_idx
  on public.itinerary_requests (status, submitted_at desc);

-- ── END OF MIGRATION 009 ─────────────────────────────────────
