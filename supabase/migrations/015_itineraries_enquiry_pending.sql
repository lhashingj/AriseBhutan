-- Migration 015: Guest enquiry pipeline — enquiry_pending status support
--
-- When a guest submits the contact form, the API now auto-creates an itineraries
-- row with status='enquiry_pending' and all pricing zeroed. The guest receives a
-- booking reference and can view their pending-state voucher at /itinerary/[ref].

-- 1. Extend the status check constraint to include 'enquiry_pending'
ALTER TABLE public.itineraries DROP CONSTRAINT IF EXISTS itineraries_status_check;
ALTER TABLE public.itineraries
  ADD CONSTRAINT itineraries_status_check
  CHECK (status IN ('enquiry_pending', 'pending_review', 'quoted', 'confirmed'));

-- 2. Allow public SELECT on all live statuses so guests can view pending vouchers.
--    References are long-form UUIDs — unguessable in practice.
DROP POLICY IF EXISTS "itineraries_public_voucher_read" ON public.itineraries;
CREATE POLICY "itineraries_public_voucher_read" ON public.itineraries
  FOR SELECT USING (
    status IN ('enquiry_pending', 'pending_review', 'quoted', 'confirmed')
  );

-- 3. Persist status on the enquiry log table
ALTER TABLE public.itinerary_requests
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'enquiry_pending';
