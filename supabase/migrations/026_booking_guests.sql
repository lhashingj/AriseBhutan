-- ============================================================
--  Arise Bhutan — Migration 026: Group Booking Architecture
--  One booking reference (e.g. 'ARB-2026-50D4B6') shared by
--  2–10+ invited guests via the booking_guests junction table.
--  Run in: Supabase Dashboard → SQL Editor
--  (Requires migrations 013 & 025 to have been applied.)
-- ============================================================

-- ── 1. booking_guests junction table ──────────────────────────
CREATE TABLE IF NOT EXISTS public.booking_guests (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Booking reference, e.g. 'ARB-2026-50D4B6'
  booking_id    TEXT        NOT NULL
                            REFERENCES public.itineraries (booking_reference)
                            ON UPDATE CASCADE ON DELETE CASCADE,

  -- Guest email (normalized to lowercase by trigger below)
  email         TEXT        NOT NULL,

  -- Mapped once the guest signs up / logs in (see claim logic)
  user_id       UUID        REFERENCES auth.users (id) ON DELETE SET NULL,

  -- 'PRIMARY' = lead traveller / booking owner, 'GUEST' = invitee
  role          TEXT        NOT NULL DEFAULT 'GUEST',

  -- Secure invitation token used in /join/{token} links
  invite_token  UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),

  invited_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at    TIMESTAMPTZ,

  CONSTRAINT booking_guests_role_check
    CHECK (role IN ('PRIMARY', 'GUEST')),
  CONSTRAINT booking_guests_booking_email_unique
    UNIQUE (booking_id, email)
);

CREATE INDEX IF NOT EXISTS booking_guests_email_idx   ON public.booking_guests (email);
CREATE INDEX IF NOT EXISTS booking_guests_user_idx    ON public.booking_guests (user_id);
CREATE INDEX IF NOT EXISTS booking_guests_booking_idx ON public.booking_guests (booking_id);

-- Normalize email to lowercase on write
CREATE OR REPLACE FUNCTION public.booking_guests_normalize_email()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email := LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_guests_email_lower ON public.booking_guests;
CREATE TRIGGER booking_guests_email_lower
  BEFORE INSERT OR UPDATE ON public.booking_guests
  FOR EACH ROW EXECUTE FUNCTION public.booking_guests_normalize_email();

-- ── 2. Membership helper (used by RLS across tables) ─────────
-- SECURITY DEFINER so policies on other tables can consult
-- booking_guests without recursive RLS evaluation.
CREATE OR REPLACE FUNCTION public.is_booking_guest(ref TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.booking_guests g
    WHERE g.booking_id = ref
      AND (
        g.user_id = auth.uid()
        OR g.email = LOWER(COALESCE(auth.jwt()->>'email', ''))
      )
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_booking_guest(TEXT) TO authenticated;

-- ── 3. Row-Level Security on booking_guests ──────────────────
ALTER TABLE public.booking_guests ENABLE ROW LEVEL SECURITY;

-- Admins: full CRUD
DROP POLICY IF EXISTS "booking_guests_admin_all" ON public.booking_guests;
CREATE POLICY "booking_guests_admin_all" ON public.booking_guests
  FOR ALL USING (public.get_my_role() = 'ADMIN');

-- Members: read every guest row of bookings they belong to
-- (lets the portal show "travelling with" info for the group)
DROP POLICY IF EXISTS "booking_guests_member_read" ON public.booking_guests;
CREATE POLICY "booking_guests_member_read" ON public.booking_guests
  FOR SELECT USING (public.is_booking_guest(booking_id));

GRANT SELECT ON public.booking_guests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_guests TO service_role;

-- ── 4. Claim logic ────────────────────────────────────────────

-- 4a. Auto-claim on signup: when a new auth user is created,
--     map any pending guest rows that match their email.
CREATE OR REPLACE FUNCTION public.claim_booking_guests_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.booking_guests
     SET user_id    = NEW.id,
         claimed_at = COALESCE(claimed_at, NOW())
   WHERE user_id IS NULL
     AND email = LOWER(NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_claim_guests ON auth.users;
CREATE TRIGGER on_auth_user_created_claim_guests
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.claim_booking_guests_on_signup();

-- 4b. Post-login claim by email (idempotent; called by the client
--     portal on every load — covers users who existed before the
--     invitation was created).
CREATE OR REPLACE FUNCTION public.claim_my_guest_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.booking_guests
     SET user_id    = auth.uid(),
         claimed_at = COALESCE(claimed_at, NOW())
   WHERE user_id IS NULL
     AND email = LOWER(COALESCE(auth.jwt()->>'email', ''));

  GET DIAGNOSTICS claimed = ROW_COUNT;
  RETURN claimed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_my_guest_invitations() TO authenticated;

-- 4c. Claim by invitation token (from /join/{token} links —
--     works even when the guest registered with a different
--     email than the one they were invited at).
CREATE OR REPLACE FUNCTION public.claim_guest_invitation(invite UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.booking_guests
     SET user_id    = auth.uid(),
         claimed_at = COALESCE(claimed_at, NOW())
   WHERE invite_token = invite
     AND (user_id IS NULL OR user_id = auth.uid());

  GET DIAGNOSTICS claimed = ROW_COUNT;
  RETURN claimed > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_guest_invitation(UUID) TO authenticated;

-- ── 5. Extend RLS: itineraries readable by group members ─────
DROP POLICY IF EXISTS "itineraries_guest_read" ON public.itineraries;
CREATE POLICY "itineraries_guest_read" ON public.itineraries
  FOR SELECT USING (public.is_booking_guest(booking_reference));

-- ── 6. Extend RLS: travel documents readable by group members ─
DROP POLICY IF EXISTS "travel_documents_guest_read" ON public.travel_documents;
CREATE POLICY "travel_documents_guest_read" ON public.travel_documents
  FOR SELECT USING (public.is_booking_guest(booking_id));

-- Storage: signed-URL creation for files in the booking's folder
DROP POLICY IF EXISTS "travel_docs_guest_read" ON storage.objects;
CREATE POLICY "travel_docs_guest_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'travel-documents'
    AND public.is_booking_guest((storage.foldername(name))[1])
  );

-- ── 7. Backfill: seed PRIMARY guests from existing itineraries ─
-- The lead traveller (client_info->>'email') of every existing
-- itinerary becomes the PRIMARY member of their booking group.
INSERT INTO public.booking_guests (booking_id, email, user_id, role, claimed_at)
SELECT
  i.booking_reference,
  LOWER(TRIM(i.client_info->>'email')),
  i.user_id,
  'PRIMARY',
  CASE WHEN i.user_id IS NOT NULL THEN NOW() ELSE NULL END
FROM public.itineraries i
WHERE COALESCE(TRIM(i.client_info->>'email'), '') <> ''
ON CONFLICT (booking_id, email) DO NOTHING;

-- ── 8. Documentation ──────────────────────────────────────────
COMMENT ON TABLE public.booking_guests IS
  'Group-booking junction: maps 2–10+ guest emails/users to one booking reference. user_id is claimed on signup (trigger), post-login (claim_my_guest_invitations RPC) or via /join/{invite_token} links (claim_guest_invitation RPC).';

COMMENT ON COLUMN public.booking_guests.invite_token IS
  'Secure single-booking invitation token used in /join/{token} deep links.';

COMMENT ON FUNCTION public.is_booking_guest(TEXT) IS
  'True when the current authenticated user (by uid or JWT email) is a member of the given booking reference. Used by RLS on itineraries, travel_documents and storage.objects.';

-- ── END OF MIGRATION 026 ─────────────────────────────────────
