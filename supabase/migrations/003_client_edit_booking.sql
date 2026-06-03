-- Allow clients to update their own PENDING bookings (edit itinerary)
-- Run this in: Supabase Dashboard → SQL Editor

CREATE POLICY IF NOT EXISTS "bookings_update_client" ON public.bookings
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'PENDING')
  WITH CHECK (user_id = auth.uid());
