-- ============================================================
--  Arise Bhutan — Migration 020: Travel Interests columns
--  Adds travel_interests JSONB to bookings and itinerary_requests
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Add to bookings (client-submitted via PackageBuilder)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS travel_interests JSONB NOT NULL DEFAULT '[]'::JSONB;

-- Add to itinerary_requests (AdventureBuilder submissions)
ALTER TABLE public.itinerary_requests
  ADD COLUMN IF NOT EXISTS travel_interests JSONB NOT NULL DEFAULT '[]'::JSONB;

-- ── END OF MIGRATION 020 ─────────────────────────────────────
