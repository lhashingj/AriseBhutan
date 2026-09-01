'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { Send, MessageCircle, Loader2, ShieldCheck } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { fetchThread, sendMessage, markThreadRead, subscribeToThread } from '@/utils/chat'

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
function fmtDay(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

/** Groups consecutive messages by calendar day so the thread can show day dividers. */
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

export default function ClientChatPage() {
  const [userId, setUserId]     = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [draft, setDraft]       = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    let unsubscribe = () => {}
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }
      setUserId(session.user.id)

      const thread = await fetchThread(session.user.id).catch(() => [])
      setMessages(thread)
      setLoading(false)
      markThreadRead(session.user.id, 'CLIENT').catch(() => {})

      unsubscribe = subscribeToThread(session.user.id, {
        // Dedup by id — the message we just sent is already added locally
        // (see handleSend below) the moment the insert succeeds, so this
        // only actually adds anything for messages Realtime delivers that
        // aren't already on screen (i.e. the admin's replies).
        onInsert: (msg) => {
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
          if (msg.sender_role === 'ADMIN') markThreadRead(session.user.id, 'CLIENT').catch(() => {})
        },
        onUpdate: (msg) => setMessages(prev => prev.map(m => m.id === msg.id ? msg : m)),
      })
    }
    init()
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend(e) {
    e.preventDefault()
    if (!draft.trim() || !userId || sending) return
    setSending(true)
    const text = draft
    setDraft('')
    try {
      const saved = await sendMessage({ clientId: userId, senderId: userId, senderRole: 'CLIENT', content: text })
      // Show it immediately rather than waiting on the Realtime echo —
      // subscribeToThread's onInsert dedupes by id, so this is safe even
      // if the echo does arrive.
      if (saved) setMessages(prev => prev.some(m => m.id === saved.id) ? prev : [...prev, saved])
    } catch {
      setDraft(text) // put it back so nothing's lost
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const groups = groupByDay(messages)

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      {/* Page header */}
      <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-white dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border border-amber-100 dark:border-stone-800 rounded-2xl px-6 py-5 mb-4 transition-colors duration-300 shrink-0">
        <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">Arise Bhutan · Client Portal</p>
        <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">Chat</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Message your Arise Bhutan travel specialist directly.</p>
      </div>

      {/* Conversation panel */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden transition-colors duration-300">

        {/* Panel header */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-stone-100 dark:border-stone-800">
          <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-50 truncate">Arise Bhutan Team</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Usually replies within a few hours
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-5 space-y-4 bg-stone-50/50 dark:bg-stone-950/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-semibold text-stone-800 dark:text-stone-100">Say hello 👋</p>
              <p className="text-sm text-stone-400 dark:text-stone-500 mt-1 max-w-xs">
                Ask about your booking, itinerary changes, or anything else — a real person on our team will reply here.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.day} className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 rounded-full px-3 py-1">
                    {fmtDay(group.items[0].created_at)}
                  </span>
                </div>
                {group.items.map((m) => {
                  const mine = m.sender_role === 'CLIENT'
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        mine
                          ? 'bg-amber-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-100 dark:border-stone-700 rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${mine ? 'text-amber-100/80' : 'text-stone-400 dark:text-stone-500'}`}>
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

        {/* Composer */}
        <form onSubmit={handleSend} className="shrink-0 flex items-end gap-2 p-3 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
            }}
            rows={1}
            placeholder="Type a message…"
            className="flex-1 resize-none max-h-32 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="shrink-0 w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
