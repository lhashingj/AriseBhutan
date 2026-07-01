create table if not exists public.subscribers (
  id            uuid        primary key default gen_random_uuid(),
  email         text        not null unique,
  subscribed_at timestamptz not null default now(),
  active        boolean     not null default true
);

alter table public.subscribers enable row level security;

-- Only accessible via service role key (server-side API routes)
create policy "service role only" on public.subscribers
  using (false);
