import { supabase } from '@/utils/supabase/client'

/**
 * Client <-> admin live chat helpers. One thread per client, keyed by
 * client_id (the client's auth.users id). Shared between the client
 * portal's single-thread view and the admin inbox's multi-thread view.
 *
 * Deliberately avoids depending on any Postgres view — admin's full-access
 * RLS policy on chat_messages already lets a single query return every
 * thread's rows, so thread summaries are built in plain JS instead. Simpler
 * to reason about and nothing to silently fail to create during migration.
 */

export async function fetchThread(clientId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function sendMessage({ clientId, senderId, senderRole, content }) {
  const trimmed = (content || '').trim()
  if (!trimmed) return null
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ client_id: clientId, sender_id: senderId, sender_role: senderRole, content: trimmed })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Mark the OTHER party's messages in this thread as read. */
export async function markThreadRead(clientId, readerRole) {
  const otherRole = readerRole === 'ADMIN' ? 'CLIENT' : 'ADMIN'
  const { error } = await supabase
    .from('chat_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('client_id', clientId)
    .eq('sender_role', otherRole)
    .is('read_at', null)
  if (error) throw error
}

/** How many of the client's own messages to the given client_id are still unread by admin. */
export async function fetchClientUnreadCount(clientId) {
  const { count, error } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('sender_role', 'ADMIN')
    .is('read_at', null)
  if (error) throw error
  return count || 0
}

/** Total unread (client → admin) across every thread — for the admin nav badge. */
export async function fetchAdminUnreadTotal() {
  const { count, error } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('sender_role', 'CLIENT')
    .is('read_at', null)
  if (error) throw error
  return count || 0
}

// Supabase reuses a channel object for a given topic name — subscribing
// twice under the same name (e.g. the layout's unread badge and the chat
// page itself, mounted at once) hits an already-subscribed channel and
// throws trying to attach a second listener. Every subscriber gets its own
// unique name so independent callers never collide.
let channelSeq = 0
function uniqueChannel(base) {
  channelSeq += 1
  return supabase.channel(`${base}_${Date.now()}_${channelSeq}`)
}

/** Live-subscribe to every new/updated message in one client's thread. */
export function subscribeToThread(clientId, { onInsert, onUpdate } = {}) {
  const channel = uniqueChannel(`chat_thread_${clientId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `client_id=eq.${clientId}` },
      (payload) => onInsert?.(payload.new))
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `client_id=eq.${clientId}` },
      (payload) => onUpdate?.(payload.new))
    .subscribe()
  return () => supabase.removeChannel(channel)
}

/** Admin inbox: live-subscribe to every new message across all threads. */
export function subscribeToAllThreads(onChange) {
  const channel = uniqueChannel('chat_all_threads')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => onChange?.())
    .subscribe()
  return () => supabase.removeChannel(channel)
}

/** Groups a flat message list into one summary row per client_id, newest first. */
function summarizeThreads(messages) {
  const byClient = new Map()
  for (const m of messages) {
    const existing = byClient.get(m.client_id)
    if (!existing || m.created_at > existing.last_message_at) {
      byClient.set(m.client_id, {
        client_id: m.client_id,
        last_message: m.content,
        last_message_at: m.created_at,
        last_sender_role: m.sender_role,
      })
    }
  }
  const unreadByClient = new Map()
  for (const m of messages) {
    if (m.sender_role === 'CLIENT' && !m.read_at) {
      unreadByClient.set(m.client_id, (unreadByClient.get(m.client_id) || 0) + 1)
    }
  }
  return [...byClient.values()]
    .map(t => ({ ...t, admin_unread_count: unreadByClient.get(t.client_id) || 0 }))
    .sort((a, b) => (a.last_message_at < b.last_message_at ? 1 : -1))
}

/**
 * Admin inbox: every registered client, merged with their thread summary if
 * one exists — so admin can start a first message with anyone, not just
 * reply to people who've already written in. Clients with an active thread
 * sort first (most recent activity), the rest alphabetically after.
 */
export async function fetchInbox() {
  const [{ data: clients, error: clientsErr }, { data: messages, error: msgErr }] = await Promise.all([
    supabase.from('profiles').select('id, name, email, avatar_url').eq('role', 'CLIENT').order('name'),
    supabase.from('chat_messages').select('client_id, content, sender_role, created_at, read_at'),
  ])
  if (clientsErr) throw clientsErr
  if (msgErr) throw msgErr

  const threads = summarizeThreads(messages || [])
  const threadByClientId = Object.fromEntries(threads.map(t => [t.client_id, t]))

  const withThreads = threads.map(t => ({ ...t, profile: null }))
  const withoutThreads = []
  for (const c of clients || []) {
    if (threadByClientId[c.id]) {
      const t = withThreads.find(x => x.client_id === c.id)
      if (t) t.profile = c
    } else {
      withoutThreads.push({
        client_id: c.id, profile: c, last_message: null, last_message_at: null,
        last_sender_role: null, admin_unread_count: 0,
      })
    }
  }
  return [...withThreads, ...withoutThreads]
}
