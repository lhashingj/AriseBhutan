-- Migration 028: Secure voucher access — close the public pricing leak
-- Run in: Supabase Dashboard → SQL Editor
--
-- "itineraries_public_voucher_read" (added in 013, widened in 015) let ANY
-- unauthenticated visitor SELECT the full itineraries row — pricing,
-- payment_link, passport info — for any booking reference, with no
-- ownership check at all. That policy is what the public voucher page and
-- the client portal both relied on to read data straight from the browser.
--
-- This migration removes that policy. Direct browser reads of itineraries
-- are now restricted to admins (existing "itineraries_admin_all" policy)
-- and the itinerary's own client (new policy below, matched by user_id,
-- client_info email, or booking_guests membership).
--
-- The public voucher page (client copy) and the staff/field (operations)
-- voucher link no longer read this table directly — they go through
-- app/api/voucher/[reference]/route.ts, which uses the service-role key
-- (bypasses RLS) and decides server-side whether the requester is an
-- admin, the owning client, or unauthenticated — stripping pricing/
-- payment_link out of the response for anyone in that last group,
-- including anonymous guide/driver links. That downgrade can't be
-- bypassed by editing the URL, since it's enforced before the response
-- is ever sent.

DROP POLICY IF EXISTS "itineraries_public_voucher_read" ON public.itineraries;

CREATE POLICY "itineraries_owner_read" ON public.itineraries
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid()
      OR (client_info ->> 'email') = (auth.jwt() ->> 'email')
      OR EXISTS (
        SELECT 1 FROM public.booking_guests bg
        WHERE bg.booking_id = itineraries.booking_reference
          AND bg.user_id = auth.uid()
      )
    )
  );

-- ── END OF MIGRATION 028 ─────────────────────────────────────
