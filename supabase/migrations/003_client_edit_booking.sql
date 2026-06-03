-- Allow clients to update their own PENDING bookings (edit itinerary)
-- Run this in: Supabase Dashboard → SQL Editor

DROP POLICY IF EXISTS "bookings_update_client" ON public.bookings;

CREATE POLICY "bookings_update_client" ON public.bookings
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'PENDING')
  WITH CHECK (user_id = auth.uid());
