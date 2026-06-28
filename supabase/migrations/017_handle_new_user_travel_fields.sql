-- ============================================================
--  Migration 017 — Update handle_new_user trigger to save
--  phone and nationality from signup metadata.
--  Run AFTER 016_profiles_travel_fields.sql
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, nationality)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    nullif(trim(new.raw_user_meta_data->>'phone'), ''),
    nullif(trim(new.raw_user_meta_data->>'nationality'), '')
  )
  on conflict (id) do update
    set
      name        = coalesce(excluded.name,        profiles.name),
      phone       = coalesce(excluded.phone,       profiles.phone),
      nationality = coalesce(excluded.nationality, profiles.nationality);
  return new;
end;
$$;
