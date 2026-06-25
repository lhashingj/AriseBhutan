-- ============================================================
--  Arise Bhutan — Migration 013: itineraries table
--  Comprehensive itinerary management with pricing workflow
--  Status flow: pending_review → quoted → confirmed
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Booking Reference Generator ───────────────────────────
-- Generates unique refs: ARB-2026-9C3073
-- Uses first 6 uppercase hex chars from gen_random_uuid().
-- PL/pgSQL body validated at call time, not compile time,
-- so the self-referencing NOT EXISTS check is safe.
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  ref    TEXT;
  yr     TEXT  := EXTRACT(YEAR FROM NOW())::TEXT;
  hash   TEXT;
BEGIN
  LOOP
    hash := UPPER(LEFT(REPLACE(gen_random_uuid()::TEXT, '-', ''), 6));
    ref  := 'ARB-' || yr || '-' || hash;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.itineraries WHERE booking_reference = ref
    );
  END LOOP;
  RETURN ref;
END;
$$;

-- ── 2. Itineraries table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.itineraries (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Human-readable unique identifier, auto-generated on INSERT
  booking_reference TEXT        NOT NULL UNIQUE
                                DEFAULT public.generate_booking_reference(),

  -- Workflow status
  status            TEXT        NOT NULL DEFAULT 'pending_review',

  -- Client / passenger details
  client_info       JSONB       NOT NULL DEFAULT '{}',
  -- {
  --   guest_name       : text,
  --   email            : text,
  --   phone            : text,
  --   nationality      : text,
  --   passport_no      : text,
  --   passport_expiry  : text (ISO date),
  --   emergency_contact: text
  -- }

  -- High-level tour overview
  tour_summary      JSONB       NOT NULL DEFAULT '{}',
  -- {
  --   tour_package   : text,
  --   category       : text ('3-Star' | '4-Star' | '5-Star Luxury'),
  --   duration_nights: integer,
  --   group_size     : integer,
  --   departure_date : text (ISO date),
  --   return_date    : text (ISO date)
  -- }

  -- Flight legs (ordered array)
  flights           JSONB       NOT NULL DEFAULT '[]',
  -- [{
  --   sector  : text (e.g. 'BKK → PBH'),
  --   date    : text,
  --   flight_no: text,
  --   departs : text (HH:MM),
  --   arrives : text (HH:MM),
  --   airline : text
  -- }]

  -- Daily programme (ordered array, one entry per night)
  day_by_day        JSONB       NOT NULL DEFAULT '[]',
  -- [{
  --   day               : integer,
  --   date              : text,
  --   programme         : text,
  --   accommodation_name: text,
  --   meals             : text (e.g. 'B/L/D' or 'B/D')
  -- }]

  -- Pricing matrix (null until admin quotes)
  pricing           JSONB       NOT NULL DEFAULT '{}',
  -- {
  --   package_rate_per_pax : numeric,
  --   sdf_total            : numeric,   -- $100 × nights × guests
  --   service_fee          : numeric,
  --   subtotal             : numeric,   -- (rate × guests) + sdf + fee
  --   gst                  : numeric,   -- 5% of subtotal
  --   grand_total          : numeric,   -- subtotal + gst
  --   equivalent_inr       : numeric    -- grand_total × 83.5
  -- }

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT itineraries_status_check
    CHECK (status IN ('pending_review', 'quoted', 'confirmed'))
);

-- ── 3. Auto-update updated_at on every change ─────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS itineraries_updated_at ON public.itineraries;
CREATE TRIGGER itineraries_updated_at
  BEFORE UPDATE ON public.itineraries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── 4. Row-Level Security ─────────────────────────────────────
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Admins: full CRUD
CREATE POLICY "itineraries_admin_all" ON public.itineraries
  FOR ALL USING (public.get_my_role() = 'ADMIN');

-- Public (anon): read-only on quoted/confirmed records.
-- Enables the client voucher page at /itinerary/[reference]
-- without requiring the client to be logged in.
CREATE POLICY "itineraries_public_voucher_read" ON public.itineraries
  FOR SELECT USING (status IN ('quoted', 'confirmed'));

-- ── 5. Indices ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS itineraries_status_created_idx
  ON public.itineraries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS itineraries_reference_idx
  ON public.itineraries (booking_reference);

-- ── 6. Grants ─────────────────────────────────────────────────
GRANT SELECT                         ON public.itineraries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itineraries TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_booking_reference() TO authenticated;

-- ── 7. Table & column documentation ──────────────────────────
COMMENT ON TABLE  public.itineraries IS
  'Admin-managed Bhutan tour itineraries. Status: pending_review → quoted → confirmed.';

COMMENT ON COLUMN public.itineraries.booking_reference IS
  'Auto-generated unique ID in format ARB-{YEAR}-{6HEX}. Used as the client voucher URL slug.';

COMMENT ON COLUMN public.itineraries.client_info IS
  'JSONB: { guest_name, email, phone, nationality, passport_no, passport_expiry, emergency_contact }';

COMMENT ON COLUMN public.itineraries.tour_summary IS
  'JSONB: { tour_package, category, duration_nights, group_size, departure_date, return_date }';

COMMENT ON COLUMN public.itineraries.flights IS
  'JSONB array: [{ sector, date, flight_no, departs, arrives, airline }]';

COMMENT ON COLUMN public.itineraries.day_by_day IS
  'JSONB array: [{ day, date, programme, accommodation_name, meals }]';

COMMENT ON COLUMN public.itineraries.pricing IS
  'JSONB: { package_rate_per_pax, sdf_total, service_fee, subtotal, gst, grand_total, equivalent_inr }. Populated when admin quotes.';

-- ── END OF MIGRATION 013 ─────────────────────────────────────
