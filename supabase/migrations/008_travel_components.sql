-- ============================================================
--  Arise Bhutan — Travel Components Schema
--  Migration 008: accommodations, activities, base_logistics
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. ACCOMMODATIONS ─────────────────────────────────────────
create table if not exists public.accommodations (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  location        text        not null,   -- 'Paro' | 'Thimphu' | 'Punakha' | 'Bumthang' | 'Haa'
  tier            text        not null,   -- '3-Star' | '4-Star' | '5-Star Luxury'
  price_per_night numeric(10,2) not null,
  description     text,
  image_url       text,
  active          boolean     not null default true,
  created_at      timestamptz not null default now(),

  constraint accommodations_tier_check
    check (tier in ('3-Star', '4-Star', '5-Star Luxury'))
);

-- ── 2. ACTIVITIES ─────────────────────────────────────────────
create table if not exists public.activities (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  description     text,
  duration_hours  numeric(4,1),
  location        text        not null,
  cost_per_person numeric(10,2) not null,
  category        text        not null,   -- 'Cultural' | 'Spiritual' | 'Trekking' | 'Adventure' | 'Wellness' | 'Photography'
  active          boolean     not null default true,
  created_at      timestamptz not null default now(),

  constraint activities_category_check
    check (category in ('Cultural', 'Spiritual', 'Trekking', 'Adventure', 'Wellness', 'Photography'))
);

-- ── 3. BASE LOGISTICS ─────────────────────────────────────────
create table if not exists public.base_logistics (
  id          uuid        primary key default gen_random_uuid(),
  item_name   text        not null,
  description text,
  cost_type   text        not null,   -- 'per_person_per_night' | 'per_person_flat' | 'per_day' | 'flat'
  base_price  numeric(10,2) not null,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),

  constraint base_logistics_cost_type_check
    check (cost_type in ('per_person_per_night', 'per_person_flat', 'per_day', 'flat'))
);

-- ── 4. ROW-LEVEL SECURITY ─────────────────────────────────────
alter table public.accommodations enable row level security;
alter table public.activities      enable row level security;
alter table public.base_logistics  enable row level security;

-- Public can read active records (catalog browsing, price builder)
create policy "accommodations_public_read" on public.accommodations
  for select using (active = true);

create policy "activities_public_read" on public.activities
  for select using (active = true);

create policy "base_logistics_public_read" on public.base_logistics
  for select using (active = true);

-- Only admins can write (insert / update / delete)
create policy "accommodations_admin_write" on public.accommodations
  for all using (public.get_my_role() = 'ADMIN');

create policy "activities_admin_write" on public.activities
  for all using (public.get_my_role() = 'ADMIN');

create policy "base_logistics_admin_write" on public.base_logistics
  for all using (public.get_my_role() = 'ADMIN');

-- ── 5. GRANTS ─────────────────────────────────────────────────
grant select on public.accommodations to anon, authenticated;
grant select on public.activities      to anon, authenticated;
grant select on public.base_logistics  to anon, authenticated;

grant insert, update, delete on public.accommodations to authenticated;
grant insert, update, delete on public.activities      to authenticated;
grant insert, update, delete on public.base_logistics  to authenticated;

-- ── 6. SEED — ACCOMMODATIONS ──────────────────────────────────
insert into public.accommodations (name, location, tier, price_per_night, description) values

  -- 3-Star
  ('Yoser Lhamo Hotel',        'Paro',     '3-Star', 90.00,  'Cosy property in Paro valley with views of the river and surrounding farmland.'),
  ('Hotel Pedling',             'Thimphu',  '3-Star', 85.00,  'Well-located in the heart of the capital, walking distance to Tashichho Dzong.'),
  ('Zangto Pelri Hotel',        'Punakha',  '3-Star', 80.00,  'Peaceful riverside stay near Punakha Dzong with traditional Bhutanese architecture.'),
  ('Kaila Hotel',               'Bumthang', '3-Star', 78.00,  'Central Bumthang hotel ideal for exploring the ancient temples of the valley.'),
  ('Risum Resort',              'Haa',      '3-Star', 75.00,  'Remote and authentic lodge in the rarely-visited Haa Valley.'),

  -- 4-Star
  ('Zhiwa Ling Heritage Hotel', 'Paro',     '4-Star', 180.00, 'Award-winning traditional Bhutanese architecture set in landscaped gardens beneath Paro Dzong.'),
  ('Taj Tashi',                 'Thimphu',  '4-Star', 200.00, 'The capital''s premier luxury hotel blending Bhutanese dzong architecture with 5-star amenities.'),
  ('Riverstone Hotel',          'Punakha',  '4-Star', 165.00, 'Contemporary lodge on the banks of the Mo Chhu river with mountain-facing rooms.'),
  ('Wangchuk Hotel',            'Bumthang', '4-Star', 155.00, 'Flagship property of the Bumthang valley with excellent in-house dining.'),
  ('Lhayul Hotel',              'Paro',     '4-Star', 170.00, 'Modern comfort with traditional detailing, close to Paro International Airport.'),

  -- 5-Star Luxury
  ('COMO Uma Paro',             'Paro',     '5-Star Luxury', 650.00, 'Iconic hillside retreat offering panoramic valley views, world-class spa, and bespoke Bhutan experiences.'),
  ('Amankora Paro Lodge',       'Paro',     '5-Star Luxury', 900.00, 'Intimate Aman lodge in a blue-pine forest — the pinnacle of understated luxury in Bhutan.'),
  ('Six Senses Paro',           'Paro',     '5-Star Luxury', 1100.00,'Dramatic cliffside villas with butler service, organic farm dining, and a legendary Bhutanese spa.'),
  ('Amankora Punakha Lodge',    'Punakha',  '5-Star Luxury', 900.00, 'Set between two rivers in a former Royal Guest House — effortless calm at the heart of Bhutan.'),
  ('COMO Uma Punakha',          'Punakha',  '5-Star Luxury', 620.00, 'Riverside luxury retreat with direct access to white-water rafting and dzong walks.')

on conflict do nothing;

-- ── 7. SEED — ACTIVITIES ──────────────────────────────────────
insert into public.activities (name, description, duration_hours, location, cost_per_person, category) values

  -- Cultural
  ('Tiger''s Nest Monastery Hike',   'Guided hike to Paro Taktsang, the sacred cliff-face monastery — Bhutan''s most iconic landmark.',                  5.0,  'Paro',     45.00, 'Trekking'),
  ('Punakha Dzong Guided Tour',      'Explore the magnificent 17th-century fortress at the confluence of two rivers with a licensed guide.',               2.5,  'Punakha',  25.00, 'Cultural'),
  ('Thimphu Dzong & Capital Walk',   'Walking tour of Tashichho Dzong and Thimphu''s main cultural landmarks including the Memorial Chorten.',             3.0,  'Thimphu',  20.00, 'Cultural'),
  ('Traditional Archery Session',    'Join a local archery competition — Bhutan''s national sport — with equipment provided and coaching by masters.',     2.0,  'Thimphu',  30.00, 'Cultural'),
  ('Thangka Painting Workshop',      'Learn the ancient Buddhist art of Thangka painting under the guidance of a master artist from the School of Arts.',  3.5,  'Thimphu',  35.00, 'Cultural'),
  ('Textile & Weaving Centre Visit', 'Discover the intricate world of Bhutanese textile weaving at the National Textile Museum and artisan workshops.',    2.0,  'Thimphu',  18.00, 'Cultural'),
  ('Bumthang Valley Temple Circuit', 'Visit Jambay Lhakhang, Kurjey Lhakhang, and Tamshing Monastery — the most sacred sites in central Bhutan.',         5.0,  'Bumthang', 40.00, 'Cultural'),

  -- Spiritual
  ('Kyichu Lhakhang Meditation',     'Guided meditation session inside one of Bhutan''s oldest and most sacred temples, built in 659 AD.',                2.0,  'Paro',     30.00, 'Spiritual'),
  ('Gangtey Monastery Retreat',      'Half-day spiritual immersion at the stunning Gangtey Goemba overlooking the Phobjikha Valley.',                     4.0,  'Gangtey',  35.00, 'Spiritual'),
  ('Black-Necked Crane Observation', 'Guided observation of the endangered black-necked cranes that winter in the Phobjikha Valley (Oct–Mar).',           2.5,  'Phobjikha',22.00, 'Spiritual'),
  ('Sunrise Puja Ceremony',          'Attend an early-morning puja (prayer ceremony) at a monastery with monks — a profoundly moving experience.',         1.5,  'Paro',     25.00, 'Spiritual'),

  -- Trekking
  ('Druk Path Trek (6 Days)',        'Classic high-altitude trek from Paro to Thimphu through pristine forests, glacial lakes, and ancient monasteries.', 48.0, 'Paro',    320.00, 'Trekking'),
  ('Jomolhari Base Camp Trek',       'Challenging 9-day trek to the foot of Mt. Jomolhari (7,326 m) through remote valleys and yak pastures.',           72.0, 'Paro',    480.00, 'Trekking'),
  ('Bumdrak Camping Trek',           'Overnight camping trek above Tiger''s Nest to Bumdrak, with sweeping views of the entire Paro valley.',             8.0,  'Paro',     95.00, 'Trekking'),
  ('Dochula Pass Nature Walk',       'Gentle walk around Dochula Pass (3,050 m) through rhododendron forests to the 108 memorial chortens.',              2.5,  'Dochula',  20.00, 'Trekking'),

  -- Adventure
  ('Mo Chhu White-Water Rafting',    'Exhilarating Grade III–IV rafting on the Mo Chhu river past Punakha Dzong — Bhutan''s best rafting run.',           3.0,  'Punakha',  60.00, 'Adventure'),
  ('Mountain Biking Thimphu Valley', 'Guided off-road cycling through Thimphu''s hillside villages and forested trails with top-quality bikes provided.', 4.0,  'Thimphu',  45.00, 'Adventure'),
  ('Paragliding over Paro Valley',   'Tandem paragliding flight over the Paro valley with a certified pilot — the most spectacular view in Bhutan.',      2.0,  'Paro',     85.00, 'Adventure'),

  -- Wellness
  ('Traditional Hot Stone Bath',     'A centuries-old Bhutanese healing ritual — river stones heated by fire infuse the water with minerals.',             1.5,  'Paro',     40.00, 'Wellness'),
  ('Bhutanese Herbal Spa Treatment', 'Full body treatment using local herbs, wild grasses, and Himalayan botanicals at a traditional spa.',                2.0,  'Thimphu',  55.00, 'Wellness'),

  -- Photography
  ('Sunrise at Dochula Pass',        'Pre-dawn drive to photograph the 108 chortens with the Himalayan giants — Gangkhar Puensum, Masagang — at sunrise.', 3.0, 'Dochula',  30.00, 'Photography'),
  ('Paro Tshechu Festival Coverage', 'Full-day guided photography of the masked Cham dances at the annual Paro Tshechu — requires festival season booking.', 8.0,'Paro',    50.00, 'Photography')

on conflict do nothing;

-- ── 8. SEED — BASE LOGISTICS ──────────────────────────────────
insert into public.base_logistics (item_name, description, cost_type, base_price) values

  ('Sustainable Development Fee (SDF)',
   'Mandatory government levy charged to all international tourists. Contributes directly to Bhutan''s carbon-neutral policies and free healthcare/education.',
   'per_person_per_night', 100.00),

  ('Visa Processing Fee',
   'Official Bhutan visa fee paid to the Department of Immigration. Processed through a licensed tour operator.',
   'per_person_flat', 40.00),

  ('Licensed Bhutanese Guide',
   'Certified English-speaking guide — mandatory for all international visitors by Royal Government of Bhutan regulation.',
   'per_day', 50.00),

  ('Private Vehicle & Driver',
   'Dedicated air-conditioned vehicle (Toyota Land Cruiser or similar) with experienced driver for all ground transfers.',
   'per_day', 65.00),

  ('Airport Transfer (Paro)',
   'Return transfers between Paro International Airport and your first/last hotel.',
   'flat', 40.00),

  ('Travel Insurance (Recommended)',
   'Comprehensive travel and medical evacuation insurance covering trekking up to 6,000 m.',
   'per_person_flat', 35.00)

on conflict do nothing;

-- ── END OF MIGRATION 008 ──────────────────────────────────────
