-- Migration 014: Drop unused legacy tables
-- accommodations and base_logistics were scaffolded in 008_travel_components.sql
-- but are not referenced by any active Next.js code.
-- activities is retained — AdventureBuilder.jsx queries it.

DROP TABLE IF EXISTS public.base_logistics CASCADE;
DROP TABLE IF EXISTS public.accommodations CASCADE;
