-- ============================================================
--  Arise Bhutan — Migration 025: Travel Document Management
--  Flight tickets (PDF), Visa clearance letters (PDF),
--  Entrance-fee QR codes (image) + SDF / Visa status tracking.
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 0. Safety: ensure itineraries.user_id exists ─────────────
-- Client pages already query itineraries.user_id; the column was
-- added outside the migrations folder. Guarantee it here since the
-- RLS policies below join on it.
ALTER TABLE public.itineraries
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ── 1. travel_documents table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.travel_documents (
  id                 UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Human-readable booking reference, e.g. 'ARB-2026-B010C9'.
  -- Matches itineraries.booking_reference (no hard FK so admins can
  -- pre-stage documents before the itinerary record exists).
  booking_id         TEXT        NOT NULL UNIQUE,

  -- Sustainable Development Fee status
  sdf_status         TEXT        NOT NULL DEFAULT 'PENDING',

  -- Visa clearance status
  visa_status        TEXT        NOT NULL DEFAULT 'NOT_APPLIED',

  -- Storage object paths inside the private 'travel-documents'
  -- bucket (NOT public URLs — files are served via signed URLs).
  visa_file_url      TEXT,
  flight_tickets_url TEXT,
  entrance_qr_url    TEXT,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT travel_documents_sdf_status_check
    CHECK (sdf_status IN ('PENDING', 'PAID', 'APPROVED')),
  CONSTRAINT travel_documents_visa_status_check
    CHECK (visa_status IN ('NOT_APPLIED', 'PROCESSING', 'ISSUED'))
);

-- Auto-update updated_at (touch_updated_at() created in migration 013)
DROP TRIGGER IF EXISTS travel_documents_updated_at ON public.travel_documents;
CREATE TRIGGER travel_documents_updated_at
  BEFORE UPDATE ON public.travel_documents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS travel_documents_booking_idx
  ON public.travel_documents (booking_id);

-- ── 2. Row-Level Security ─────────────────────────────────────
ALTER TABLE public.travel_documents ENABLE ROW LEVEL SECURITY;

-- Admins: full CRUD
DROP POLICY IF EXISTS "travel_documents_admin_all" ON public.travel_documents;
CREATE POLICY "travel_documents_admin_all" ON public.travel_documents
  FOR ALL USING (public.get_my_role() = 'ADMIN');

-- Clients: read-only on documents belonging to their own itinerary
-- (matched via itineraries.booking_reference by user_id OR email)
DROP POLICY IF EXISTS "travel_documents_client_read" ON public.travel_documents;
CREATE POLICY "travel_documents_client_read" ON public.travel_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i
      WHERE i.booking_reference = travel_documents.booking_id
        AND (
          i.user_id = auth.uid()
          OR i.client_info->>'email' = (auth.jwt()->>'email')
        )
    )
  );

GRANT SELECT ON public.travel_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.travel_documents TO service_role;

-- ── 3. Private storage bucket: travel-documents ──────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'travel-documents',
  'travel-documents',
  false,                                  -- PRIVATE: signed URLs only
  10485760,                               -- 10 MB per file
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public             = false,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 4. Storage RLS policies ───────────────────────────────────
-- Object paths follow: {booking_id}/{doc-type}-{timestamp}.{ext}

-- Admins: full access to the bucket
DROP POLICY IF EXISTS "travel_docs_admin_all" ON storage.objects;
CREATE POLICY "travel_docs_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'travel-documents' AND public.get_my_role() = 'ADMIN'
  )
  WITH CHECK (
    bucket_id = 'travel-documents' AND public.get_my_role() = 'ADMIN'
  );

-- Clients: read-only (needed for createSignedUrl) on files whose
-- top-level folder is a booking reference they own
DROP POLICY IF EXISTS "travel_docs_client_read" ON storage.objects;
CREATE POLICY "travel_docs_client_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'travel-documents'
    AND EXISTS (
      SELECT 1 FROM public.itineraries i
      WHERE i.booking_reference = (storage.foldername(name))[1]
        AND (
          i.user_id = auth.uid()
          OR i.client_info->>'email' = (auth.jwt()->>'email')
        )
    )
  );

-- ── 5. Documentation ──────────────────────────────────────────
COMMENT ON TABLE public.travel_documents IS
  'Per-booking travel documents & clearances: flight tickets (PDF), visa clearance letter (PDF), entrance-fee QR (image), SDF/visa statuses. Files live in the private travel-documents bucket and are served via 15-minute signed URLs.';

COMMENT ON COLUMN public.travel_documents.booking_id IS
  'Booking reference in ARB-{YEAR}-{6HEX} format, matching itineraries.booking_reference.';

COMMENT ON COLUMN public.travel_documents.sdf_status IS
  'Sustainable Development Fee status: PENDING | PAID | APPROVED';

COMMENT ON COLUMN public.travel_documents.visa_status IS
  'Visa clearance status: NOT_APPLIED | PROCESSING | ISSUED';

-- ── END OF MIGRATION 025 ─────────────────────────────────────
