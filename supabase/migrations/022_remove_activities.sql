-- ============================================================
--  Arise Bhutan — Migration 022: Remove specific activities
--  Deletes trekking/rafting entries no longer offered
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

DELETE FROM public.activities
WHERE name IN (
  'Mo Chhu White-Water Rafting',
  'Traditional Archery Session'
);

-- ── END OF MIGRATION 022 ─────────────────────────────────────
