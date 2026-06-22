-- ============================================================
--  007 — Remove email-confirmation requirement from bookings insert
--  Run in: Supabase Dashboard → SQL Editor
--  Reason: email confirmation is disabled; Supabase sets
--          email_confirmed_at = null, which would block all bookings.
-- ============================================================

DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;

CREATE POLICY "bookings_insert" ON public.bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
