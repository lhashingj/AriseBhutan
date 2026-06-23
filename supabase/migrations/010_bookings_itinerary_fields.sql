-- ============================================================
--  Arise Bhutan — Migration 010: bookings table enhancements
--  Adds itinerary_details JSONB and final_calculated_price
--  to support human-reviewed custom itinerary bookings.
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Add itinerary_details ─────────────────────────────────────
-- Stores the full structured itinerary from the Adventure Builder
-- or manually entered by the admin during review.
-- Shape: { nights, guests, tier, activities: [...], notes: "..." }
alter table public.bookings
  add column if not exists itinerary_details jsonb;

-- ── Add final_calculated_price ────────────────────────────────
-- Populated by the admin after reviewing the itinerary request.
-- Null until the specialist has completed their pricing review.
alter table public.bookings
  add column if not exists final_calculated_price numeric(12, 2);

-- ── Extend valid status values (comment only — no check constraint) ──
-- Existing statuses: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
-- New status:        'pending_review'  (set when booking originates
--                                       from the Adventure Builder wizard)
-- Update the comment for documentation:
comment on column public.bookings.status is
  'PENDING | pending_review | CONFIRMED | CANCELLED';

comment on column public.bookings.itinerary_details is
  'Structured itinerary from Adventure Builder: { nights, guests, tier, activities[], notes }';

comment on column public.bookings.final_calculated_price is
  'USD total confirmed by admin after human pricing review. NULL until reviewed.';

-- ── Index for filtering pending_review bookings ───────────────
create index if not exists bookings_pending_review_idx
  on public.bookings (status, created_at desc)
  where status = 'pending_review';

-- ── END OF MIGRATION 010 ─────────────────────────────────────
