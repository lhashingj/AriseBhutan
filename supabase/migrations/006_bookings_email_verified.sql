-- ============================================================
--  006 — Require confirmed email to insert bookings
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Replace the open insert policy with one that requires
-- the user's email to be confirmed in auth.users.
DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;

CREATE POLICY "bookings_insert" ON public.bookings
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      SELECT email_confirmed_at
      FROM auth.users
      WHERE id = auth.uid()
    ) IS NOT NULL
  );
