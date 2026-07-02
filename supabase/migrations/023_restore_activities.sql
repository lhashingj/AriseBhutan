-- ============================================================
--  Arise Bhutan — Migration 023: Restore removed activities
--  Re-inserts entries deleted by migration 022
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

INSERT INTO public.activities
  (name, description, duration_hours, location, cost_per_person, category, emoji, price_label, active)
VALUES
  ('River Rafting In Punakha',
   'Thrilling white-water rafting adventure on the Mo Chhu and Pho Chhu rivers near Punakha Dzong.',
   3.0, 'Punakha', 100, 'Adventure', '🛶', 'USD 100/Raft', true),

  ('Camping At Bumdra Camp Site',
   'Overnight camping at the spectacular Bumdra campsite above Paro valley with sweeping Himalayan views.',
   NULL, 'Paro', 150, 'Adventure', '🏕️', 'USD 150/Person', true),

  ('Bumthang Valley Temple Circuit',
   'Visit Jambay Lhakhang, Kurjey Lhakhang, and Tamshing Monastery — the most sacred sites in central Bhutan.',
   5.0, 'Bumthang', 40, 'Cultural', '🕌', 'USD 40/Person', true),

  ('Bumdrak Camping Trek',
   'Overnight camping trek above Tiger''s Nest to Bumdrak, with sweeping views of the entire Paro valley.',
   8.0, 'Paro', 95, 'Trekking', '⛺', 'USD 95/Person', true),

  ('Druk Path Trek (6 Days)',
   'Classic high-altitude trek from Paro to Thimphu through pristine forests, glacial lakes, and ancient monasteries.',
   48.0, 'Paro', 320, 'Trekking', '🥾', 'USD 320/Person', true),

  ('Jomolhari Base Camp Trek',
   'Challenging 9-day trek to the foot of Mt. Jomolhari (7,326 m) through remote valleys and yak pastures.',
   72.0, 'Paro', 480, 'Trekking', '🏔️', 'USD 480/Person', true)

ON CONFLICT DO NOTHING;

-- ── END OF MIGRATION 023 ─────────────────────────────────────
