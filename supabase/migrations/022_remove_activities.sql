-- ============================================================
--  Arise Bhutan — Migration 022: Remove specific activities
--  Deletes trekking/rafting entries no longer offered
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

DELETE FROM public.activities
WHERE name IN (
  'River Rafting In Punakha',
  'Camping At Bumdra Camp Site',
  'Bumthang Valley Temple Circuit',
  'Bumdrak Camping Trek',
  'Druk Path Trek (6 Days)',
  'Jomolhari Base Camp Trek'
);

-- ── END OF MIGRATION 022 ─────────────────────────────────────
