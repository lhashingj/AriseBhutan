-- ============================================================
--  Arise Bhutan — Migration 011: enquiry contact fields
--  Adds client contact info to itinerary_requests so the
--  public contact form can save enquiries with full details.
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

alter table public.itinerary_requests
  add column if not exists client_name    text,
  add column if not exists client_email   text,
  add column if not exists client_phone   text,
  add column if not exists client_country text,
  add column if not exists tour_interest  text,
  add column if not exists travel_date    date,
  add column if not exists message        text,
  add column if not exists interests      jsonb default '[]'::jsonb;

-- Index to quickly find enquiries by email (admin lookup)
create index if not exists itinerary_requests_email_idx
  on public.itinerary_requests (client_email);

-- ── END OF MIGRATION 011 ─────────────────────────────────────
