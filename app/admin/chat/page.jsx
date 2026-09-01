'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Search, MessageCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import {
  fetchInbox, fetchThread, sendMessage, markThreadRead,
  subscribeToThread, subscribeToAllThreads,
} from '@/utils/chat'

function fmtTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const sameDay = d.toDateString() === new Date().toDateString()
  return sameDay
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function fmtDay(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
function groupByDay(messages) {
  const groups = []
  for (const m of messages) {
    const day = new Date(m.created_at).toDateString()
    const last = groups[groups.length - 1]
    if (last && last.day === day) last.items.push(m)
    else groups.push({ day, items: [m] })
  }
  return groups
}
function initials(name, email) {
  const src = (name || email || '?').trim()
  return src[0]?.toUpperCase() || '?'
}

export default function AdminChatPage() {
  const [adminId, setAdminId]       = useState(null)
  const [inbox, setInbox]           = useState([])
  const [inboxLoading, setInboxLoading] = useState(true)
  const [query, setQuery]           = useState('')
  const [activeId, setActiveId]     = useState(null)
  const [messages, setMessages]     = useState([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [draft, setDraft]           = useState('')
  const [sending, setSending]       = useState(false)
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false)
  const bottomRef = useRef(null)

  async function loadInbox() {
    const data = await fetchInbox().catch(() => [])
    setInbox(data)
    setInboxLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setAdminId(session?.user?.id || null))
    loadInbox()
    const unsubscribe = subscribeToAllThreads(loadInbox)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!activeId) return
    let unsubscribe = () => {}
    setThreadLoading(true)
    fetchThread(activeId).then((data) => {
      setMessages(data)
      setThreadLoading(false)
      markThreadRead(activeId, 'ADMIN').then(loadInbox).catch(() => {})
    })
    unsubscribe = subscribeToThread(activeId, {
      // Dedup by id — the message admin just sent is already added locally
      // (see handleSend below), so this only adds what Realtime delivers
      // that isn't already on screen (i.e. the client's incoming messages).
      onInsert: (msg) => {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
        if (msg.sender_role === 'CLIENT') markThreadRead(activeId, 'ADMIN').then(loadInbox).catch(() => {})
      },
      onUpdate: (msg) => setMessages(prev => prev.map(m => m.id === msg.id ? msg : m)),
    })
    return () => unsubscribe()
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const filteredInbox = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return inbox
    return inbox.filter(t =>
      t.profile?.name?.toLowerCase().includes(q) || t.profile?.email?.toLowerCase().includes(q)
    )
  }, [inbox, query])

  const activeThread = inbox.find(t => t.client_id === activeId)

  function openThread(clientId) {
    setActiveId(clientId)
    setShowThreadOnMobile(true)
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!draft.trim() || !activeId || !adminId || sending) return
    setSending(true)
    const text = draft
    setDraft('')
    try {
      const saved = await sendMessage({ clientId: activeId, senderId: adminId, senderRole: 'ADMIN', content: text })
      if (saved) setMessages(prev => prev.some(m => m.id === saved.id) ? prev : [...prev, saved])
      loadInbox()
    } catch {
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  const groups = groupByDay(messages)

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-serif font-bold text-white">Chat</h1>
        <p className="text-stone-400 text-sm mt-1">Message any registered client directly.</p>
      </div>

      <div className="flex-1 min-h-0 flex rounded-2xl border border-white/10 bg-stone-900 overflow-hidden shadow-xl">

        {/* ── Thread list ── */}
        <div className={`w-full sm:w-80 shrink-0 border-r border-white/10 flex flex-col ${showThreadOnMobile ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clients…"
                className="w-full bg-stone-800 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {inboxLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
              </div>
            ) : filteredInbox.length === 0 ? (
              <p className="text-center text-stone-500 text-sm py-16 px-6">
                {query ? 'No clients match your search.' : 'No registered clients yet.'}
              </p>
            ) : (
              filteredInbox.map((t) => {
                const active = t.client_id === activeId
                const unread = t.admin_unread_count > 0
                return (
                  <button
                    key={t.client_id}
                    onClick={() => openThread(t.client_id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2 ${
                      active ? 'bg-amber-500/10 border-amber-500' : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-400 font-bold text-sm flex items-center justify-center shrink-0">
                      {initials(t.profile?.name, t.profile?.email)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${unread ? 'font-bold text-white' : 'font-medium text-stone-200'}`}>
                          {t.profile?.name || t.profile?.email || 'Unknown client'}
                        </p>
                        {t.last_message_at && (
                          <span className="text-[10px] text-stone-500 shrink-0">{fmtTime(t.last_message_at)}</span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${unread ? 'text-stone-300 font-medium' : 'text-stone-500'}`}>
                        {t.last_message
                          ? `${t.last_sender_role === 'ADMIN' ? 'You: ' : ''}${t.last_message}`
                          : 'No messages yet'}
                      </p>
                    </div>
                    {unread && (
                      <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                        {t.admin_unread_count > 9 ? '9+' : t.admin_unread_count}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Active conversation ── */}
        <div className={`flex-1 min-w-0 flex-col bg-stone-950/40 ${showThreadOnMobile ? 'flex' : 'hidden sm:flex'}`}>
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-stone-500" />
              </div>
              <p className="font-semibold text-stone-300">Select a client to start chatting</p>
              <p className="text-sm text-stone-500 mt-1 max-w-xs">
                Every registered client shows up on the left, even if they haven&apos;t messaged you yet.
              </p>
            </div>
          ) : (
            <>
              <div className="shrink-0 flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/10">
                <button onClick={() => setShowThreadOnMobile(false)} className="sm:hidden p-1 -ml-1 text-stone-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-400 font-bold text-sm flex items-center justify-center shrink-0">
                  {initials(activeThread?.profile?.name, activeThread?.profile?.email)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {activeThread?.profile?.name || activeThread?.profile?.email || 'Client'}
                  </p>
                  <p className="text-xs text-stone-500 truncate">{activeThread?.profile?.email}</p>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-5 space-y-4">
                {threadLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <ShieldCheck className="w-6 h-6 text-stone-600 mb-2" />
                    <p className="text-sm text-stone-500">No messages yet — send the first one.</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group.day} className="space-y-3">
                      <div className="flex items-center justify-center">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 bg-white/5 rounded-full px-3 py-1">
                          {fmtDay(group.items[0].created_at)}
                        </span>
                      </div>
                      {group.items.map((m) => {
                        const mine = m.sender_role === 'ADMIN'
                        return (
                          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm ${
                              mine
                                ? 'bg-amber-600 text-white rounded-br-md'
                                : 'bg-stone-800 text-stone-100 border border-white/10 rounded-bl-md'
                            }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                              <p className={`text-[10px] mt-1 text-right ${mine ? 'text-amber-100/80' : 'text-stone-500'}`}>
                                {fmtTime(m.created_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="shrink-0 flex items-end gap-2 p-3 border-t border-white/10">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
                  }}
                  rows={1}
                  placeholder="Reply to this client…"
                  className="flex-1 resize-none max-h-32 rounded-xl border border-white/10 bg-stone-800 px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="shrink-0 w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                  aria-label="Send message"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
