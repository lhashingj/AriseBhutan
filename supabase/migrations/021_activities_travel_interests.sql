-- ============================================================
--  Arise Bhutan — Migration 021: Merge Travel Interests into activities
--  Adds emoji + price_label columns, expands category constraint,
--  and inserts the 26 Travel Interests as activity rows.
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Add new columns ────────────────────────────────────────
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS emoji       TEXT,
  ADD COLUMN IF NOT EXISTS price_label TEXT;

-- ── 2. Expand category constraint to include Nature & Leisure ─
ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS activities_category_check;

ALTER TABLE public.activities
  ADD CONSTRAINT activities_category_check
    CHECK (category IN (
      'Cultural', 'Spiritual', 'Trekking', 'Adventure',
      'Wellness', 'Photography', 'Nature', 'Leisure'
    ));

-- ── 3. Insert 26 Travel Interests ─────────────────────────────
INSERT INTO public.activities
  (name, description, duration_hours, location, cost_per_person, category, emoji, price_label, active)
VALUES
  ('Cultural Sights And Activities',
   'Visit iconic cultural sites, museums, and participate in traditional Bhutanese activities throughout your journey.',
   NULL, 'Bhutan', 0, 'Cultural', '🏛️', 'No Additional Cost', true),

  ('Nature Hikes And Trails',
   'Explore Bhutan''s pristine forests, valleys, and mountain trails with your guide.',
   NULL, 'Bhutan', 0, 'Nature', '🥾', 'No Additional Cost', true),

  ('Multi Day Trekking With Camping',
   'Multi-day trekking expeditions through remote Himalayan landscapes with camping equipment provided.',
   NULL, 'Bhutan', 0, 'Adventure', '⛺', 'Charges Applicable', true),

  ('Play Archery And Other Traditional Games',
   'Join locals for a session of Bhutan''s national sport archery, khuru (dart throwing), and other traditional games.',
   2.0, 'Thimphu', 0, 'Cultural', '🏹', 'No Additional Cost', true),

  ('Cycling In A Rural Setting',
   'Scenic cycling through rural Bhutanese villages and farmland on quality mountain bikes.',
   3.0, 'Bhutan', 40, 'Adventure', '🚴', 'USD 40/Cycle', true),

  ('Night Stay at a Monastery',
   'An extraordinary experience spending a night within a working Bhutanese monastery, participating in morning prayers.',
   NULL, 'Bhutan', 0, 'Spiritual', '🙏', 'Charges Applicable', true),

  ('Bar And Nightlife in Thimphu',
   'Experience Thimphu''s vibrant bar scene, from local chang beer spots to rooftop cocktail lounges.',
   NULL, 'Thimphu', 0, 'Leisure', '🌙', 'No Additional Cost', true),

  ('Rural Farm Stay And Farm Activities',
   'Immerse in authentic Bhutanese farm life — help with harvests, cook local food, and stay in a traditional farmhouse.',
   NULL, 'Bhutan', 0, 'Cultural', '🌾', 'Charges Applicable', true),

  ('Pottery Class For Beginners',
   'Learn the art of traditional Bhutanese pottery under the guidance of a local master craftsperson.',
   2.5, 'Bhutan', 40, 'Cultural', '🏺', 'USD 40/Person', true),

  ('Basic Art And Painting Class',
   'Try your hand at traditional Bhutanese art styles and patterns in a beginner-friendly painting session.',
   2.0, 'Thimphu', 50, 'Cultural', '🎨', 'USD 50/Person', true),

  ('Meditation And Yoga Class',
   'Guided meditation and yoga session in a serene Bhutanese setting, led by an experienced local instructor.',
   1.5, 'Bhutan', 40, 'Wellness', '🧘', 'USD 40/Person', true),

  ('Lesson On Traditional Weaving And Textile Dyeing',
   'Learn the intricate art of Bhutanese textile weaving and natural plant-based fabric dyeing from a master weaver.',
   3.0, 'Thimphu', 50, 'Cultural', '🧵', 'USD 50/Person', true),

  ('Consult A Buddhist Astrologer',
   'Consult a traditional Bhutanese astrologer for an astrological reading based on Buddhist teachings and the lunar calendar.',
   1.0, 'Bhutan', 10, 'Spiritual', '🔮', 'USD 10/Person', true),

  ('Talk On Buddha Dharma',
   'Enlightening discourse on Buddhist philosophy and Dharma teachings by a learned monk or scholar.',
   1.5, 'Bhutan', 20, 'Spiritual', '☸️', 'USD 20/Person', true),

  ('Consult A Traditional Medicine Doctor',
   'Session with a Bhutanese Sowa Rigpa (traditional medicine) practitioner for consultation and wellness insights.',
   1.0, 'Bhutan', 20, 'Wellness', '🌿', 'USD 20/Person', true),

  ('Rural School Visit',
   'Visit a village school, meet students and teachers, and gain insight into Bhutan''s unique education system.',
   2.0, 'Bhutan', 0, 'Cultural', '🏫', 'No Additional Cost', true),

  ('Cooking Class On Local Dishes',
   'Learn to cook authentic Bhutanese dishes like ema datshi, phaksha paa, and red rice with a local family.',
   3.0, 'Bhutan', 0, 'Cultural', '🍲', 'No Additional Cost', true),

  ('Horseback Riding',
   'Explore Bhutan''s valleys and trails on horseback — a traditional and scenic way to experience the countryside.',
   2.0, 'Bhutan', 80, 'Adventure', '🐎', 'USD 80/Horse', true),

  ('Get Head Shaved By A Monk',
   'A unique spiritual experience — have your head ceremonially shaved by a monk at a monastery for merit and blessings.',
   0.5, 'Bhutan', 0, 'Spiritual', '✂️', 'No Additional Cost', true),

  ('Visit A Rural Village',
   'Walk through an authentic Bhutanese farming village, meet local families, and see traditional daily life.',
   2.0, 'Bhutan', 0, 'Cultural', '🏘️', 'No Additional Cost', true),

  ('Traditional Wedding Ceremony',
   'Witness or participate in a traditional Bhutanese wedding ceremony with colourful attire, rituals, and feasting.',
   NULL, 'Bhutan', 0, 'Cultural', '💐', 'Charges Applicable', true),

  ('Hoist A Prayer Flag',
   'Participate in the meaningful ritual of hoisting a lungta (prayer flag) at a high mountain pass for blessings and merit.',
   1.0, 'Bhutan', 0, 'Spiritual', '🚩', 'No Additional Cost', true),

  ('River Rafting In Punakha',
   'Thrilling white-water rafting adventure on the Mo Chhu and Pho Chhu rivers near Punakha Dzong.',
   3.0, 'Punakha', 100, 'Adventure', '🛶', 'USD 100/Raft', true),

  ('Camping At Bumdra Camp Site',
   'Overnight camping at the spectacular Bumdra campsite above Paro valley with sweeping Himalayan views.',
   NULL, 'Paro', 150, 'Adventure', '🏕️', 'USD 150/Person', true),

  ('Plant A Tree',
   'Contribute to Bhutan''s legendary carbon-negative status by planting a tree as part of the national reforestation effort.',
   1.0, 'Bhutan', 0, 'Nature', '🌱', 'No Additional Cost', true),

  ('Private Cultural Performance',
   'A one-hour private performance of traditional Bhutanese masked dances, music, and folk art arranged for your group.',
   1.0, 'Bhutan', 80, 'Cultural', '💃', 'USD 80 for 1 Hour', true)

ON CONFLICT DO NOTHING;

-- ── END OF MIGRATION 021 ─────────────────────────────────────
