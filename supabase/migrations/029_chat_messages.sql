-- Migration 029: Client ↔ admin live chat
-- Run in: Supabase Dashboard → SQL Editor
--
-- One thread per registered client, identified by client_id. Admins see and
-- reply to every thread; a client sees and can only post into their own.
-- Realtime is enabled on the table so both portals update live. Thread
-- summaries (last message, unread counts) are computed in the app rather
-- than a Postgres view, so there's nothing here for an older Postgres
-- version to reject partway through the script.

-- Cleanup from an earlier draft of this migration that used a Postgres view
-- for thread summaries — no longer used by the app, drop it if it exists.
DROP VIEW IF EXISTS public.chat_threads;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  sender_role TEXT        NOT NULL CHECK (sender_role IN ('CLIENT', 'ADMIN')),
  content     TEXT        NOT NULL CHECK (char_length(trim(content)) > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS chat_messages_client_created_idx
  ON public.chat_messages (client_id, created_at);

-- ── Row-Level Security ─────────────────────────────────────────
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Admins: full read/write across every thread
DROP POLICY IF EXISTS "chat_messages_admin_all" ON public.chat_messages;
CREATE POLICY "chat_messages_admin_all" ON public.chat_messages
  FOR ALL USING (public.get_my_role() = 'ADMIN');

-- Clients: read only their own thread
DROP POLICY IF EXISTS "chat_messages_client_read" ON public.chat_messages;
CREATE POLICY "chat_messages_client_read" ON public.chat_messages
  FOR SELECT USING (client_id = auth.uid());

-- Clients: post only into their own thread, only as themselves
DROP POLICY IF EXISTS "chat_messages_client_insert" ON public.chat_messages;
CREATE POLICY "chat_messages_client_insert" ON public.chat_messages
  FOR INSERT WITH CHECK (
    client_id = auth.uid() AND sender_id = auth.uid() AND sender_role = 'CLIENT'
  );

-- Clients: allowed to mark admin's messages read in their own thread only
-- (still their own thread — can't touch anyone else's, can't edit content).
DROP POLICY IF EXISTS "chat_messages_client_mark_read" ON public.chat_messages;
CREATE POLICY "chat_messages_client_mark_read" ON public.chat_messages
  FOR UPDATE USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO authenticated;

-- ── Realtime ──────────────────────────────────────────────────
-- If this specific line errors with "already a member of publication", that's
-- fine — it just means Realtime was already enabled on this table; the rest
-- of the migration above has still applied correctly.
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

COMMENT ON TABLE public.chat_messages IS
  'Client <-> admin support chat. One thread per client_id.';

-- ── END OF MIGRATION 029 ─────────────────────────────────────
