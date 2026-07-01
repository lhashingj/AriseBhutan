-- Migration 018: Deactivate specific activities from Adventure Builder
-- Removes: Sunrise Puja Ceremony, Paragliding over Paro Valley, Mountain Biking Thimphu Valley

update public.activities
set active = false
where name in (
  'Sunrise Puja Ceremony',
  'Paragliding over Paro Valley',
  'Mountain Biking Thimphu Valley'
);
