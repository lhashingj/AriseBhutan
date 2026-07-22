-- ============================================================
--  Arise Bhutan — Migration 027: Bhutan Payments checkout link
--  Per-itinerary card-payment link, pasted by admin from the
--  Bhutan Payments / BNB merchant dashboard. Client-facing "Pay via
--  Credit/Debit Card" button redirects here once status is
--  'quoted' or 'confirmed'. No direct API integration — Bhutan
--  Payments has no public API docs as of this migration; this is a
--  link-based (hosted checkout link) integration only.
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.itineraries
  ADD COLUMN IF NOT EXISTS payment_link TEXT;

COMMENT ON COLUMN public.itineraries.payment_link IS
  'Bhutan Payments / BNB hosted-checkout URL for this booking, pasted by an admin. Client voucher shows a "Pay via Credit/Debit Card" button linking here once status is quoted or confirmed.';

-- ── END OF MIGRATION 027 ─────────────────────────────────────
