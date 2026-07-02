-- ============================================================
--  Arise Bhutan — Migration 024
--  1. Backfill emoji + price_label for original migration 008 activities
--  2. Insert new "Traditional Custom Gho & Kira" activity
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Backfill emoji & price_label ───────────────────────────

-- Cultural
UPDATE public.activities SET emoji = '🏯', price_label = 'USD 25/Person'  WHERE name = 'Punakha Dzong Guided Tour';
UPDATE public.activities SET emoji = '🗺️', price_label = 'USD 20/Person'  WHERE name = 'Thimphu Dzong & Capital Walk';
UPDATE public.activities SET emoji = '🏹', price_label = 'USD 30/Person'  WHERE name = 'Traditional Archery Session';
UPDATE public.activities SET emoji = '🖌️', price_label = 'USD 35/Person'  WHERE name = 'Thangka Painting Workshop';
UPDATE public.activities SET emoji = '🧵', price_label = 'USD 18/Person'  WHERE name = 'Textile & Weaving Centre Visit';
UPDATE public.activities SET emoji = '🕌', price_label = 'USD 40/Person'  WHERE name = 'Bumthang Valley Temple Circuit';

-- Spiritual
UPDATE public.activities SET emoji = '🙏', price_label = 'USD 30/Person'  WHERE name = 'Kyichu Lhakhang Meditation';
UPDATE public.activities SET emoji = '⛩️', price_label = 'USD 35/Person'  WHERE name = 'Gangtey Monastery Retreat';
UPDATE public.activities SET emoji = '🦢', price_label = 'USD 22/Person'  WHERE name = 'Black-Necked Crane Observation';
UPDATE public.activities SET emoji = '🌅', price_label = 'USD 25/Person'  WHERE name = 'Sunrise Puja Ceremony';

-- Trekking
UPDATE public.activities SET emoji = '🏔️', price_label = 'USD 45/Person'  WHERE name = 'Tiger''s Nest Monastery Hike';
UPDATE public.activities SET emoji = '🥾', price_label = 'USD 320/Person' WHERE name = 'Druk Path Trek (6 Days)';
UPDATE public.activities SET emoji = '🏔️', price_label = 'USD 480/Person' WHERE name = 'Jomolhari Base Camp Trek';
UPDATE public.activities SET emoji = '⛺', price_label = 'USD 95/Person'  WHERE name = 'Bumdrak Camping Trek';
UPDATE public.activities SET emoji = '🌿', price_label = 'USD 20/Person'  WHERE name = 'Dochula Pass Nature Walk';

-- Adventure
UPDATE public.activities SET emoji = '🛶', price_label = 'USD 60/Person'  WHERE name = 'Mo Chhu White-Water Rafting';
UPDATE public.activities SET emoji = '🚴', price_label = 'USD 45/Person'  WHERE name = 'Mountain Biking Thimphu Valley';
UPDATE public.activities SET emoji = '🪂', price_label = 'USD 85/Person'  WHERE name = 'Paragliding over Paro Valley';

-- Wellness
UPDATE public.activities SET emoji = '🛁', price_label = 'USD 40/Person'  WHERE name = 'Traditional Hot Stone Bath';
UPDATE public.activities SET emoji = '💆', price_label = 'USD 55/Person'  WHERE name = 'Bhutanese Herbal Spa Treatment';

-- Photography
UPDATE public.activities SET emoji = '📸', price_label = 'USD 30/Person'  WHERE name = 'Sunrise at Dochula Pass';
UPDATE public.activities SET emoji = '📷', price_label = 'USD 50/Person'  WHERE name = 'Paro Tshechu Festival Coverage';

-- ── 2. Insert new activity ────────────────────────────────────

INSERT INTO public.activities
  (name, description, duration_hours, location, cost_per_person, category, emoji, price_label, active)
VALUES
  ('Traditional Custom Gho & Kira',
   'Dress in the national costume of Bhutan — the Gho (men''s robe) or Kira (women''s dress) — tailored or rented for a truly immersive cultural experience.',
   1.0, 'Bhutan', 15, 'Cultural', '👘', 'USD 15/Person', true)

ON CONFLICT DO NOTHING;

-- ── END OF MIGRATION 024 ─────────────────────────────────────
