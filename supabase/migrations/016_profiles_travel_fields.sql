-- ============================================================
--  Migration 016 — Add travel document fields to profiles
--  + RLS policy for admin to update any profile
-- ============================================================

-- Add travel/contact columns to profiles
alter table public.profiles
  add column if not exists phone            text,
  add column if not exists nationality     text,
  add column if not exists passport_number text,
  add column if not exists passport_expiry date,
  add column if not exists emergency_contact text,
  add column if not exists avatar_url      text;

-- Allow admins to update any user's profile
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.get_my_role() = 'ADMIN');

-- ── Supabase Storage bucket setup (run in Dashboard or via CLI) ──
-- 1. Go to Storage → Create bucket named: avatars
-- 2. Set to Public
-- 3. Add these RLS policies on storage.objects:
--
-- create policy "avatar_upload"
-- on storage.objects for insert
-- with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "avatar_update"
-- on storage.objects for update
-- using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "avatar_public_read"
-- on storage.objects for select
-- using (bucket_id = 'avatars');
