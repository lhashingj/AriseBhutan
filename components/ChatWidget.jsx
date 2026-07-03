'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'
import {
  MessageCircle, X, Send, ArrowRight, ExternalLink, Menu, Sparkles,
  Plane, FileCheck2, QrCode, Download, Leaf, Stamp, Clock,
} from 'lucide-react'

/**
 * Arise Bhutan Assistant — floating chat widget.
 *
 * Streams real AI replies from /api/chat (Claude-powered concierge)
 * as NDJSON events, including interactive travel-document cards with
 * secure 15-minute download links. Premium amber/white styling with
 * full dark-mode support via `dark:` variants.
 */

const WHATSAPP_URL =
  'https://wa.me/97577319405?text=Hello%2C%20I%20have%20an%20enquiry%20about%20a%20Bhutan%20tour.'

const QUICK_CHIPS = [
  'What tours do you offer?',
  'What is the SDF fee?',
  'Do I need a visa for Bhutan?',
  'Check my travel documents',
]

const QUICK_ACTIONS = [
  { label: 'View My Itineraries', emoji: '🗺️', action: 'link', value: '/client/itineraries' },
  { label: 'Adventure Builder',   emoji: '🏗️', action: 'link', value: '/adventure-builder' },
  { label: 'Talk to Live Agent',  emoji: '💬', action: 'whatsapp' },
]

const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  text: "Kuzuzangpo la! 🙏 I'm the **Arise Bhutan Assistant** — your personal Bhutan travel concierge. Ask me about our tours, visas, the SDF fee, festivals… or share your **booking reference** (ARB-2026-XXXXXX) and I'll fetch your travel documents.",
  created_at: new Date().toISOString(),
}

// ── Markdown-lite renderer ───────────────────────────────────────────────────

function MsgText({ text }) {
  const linkCls =
    'text-amber-700 font-medium underline underline-offset-2 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300'

  const renderInline = (line, keyBase) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${keyBase}-${j}`}>{part.slice(2, -2)}</strong>
      }
      const lm = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (lm) {
        const external = /^https?:/i.test(lm[2])
        return (
          <a
            key={`${keyBase}-${j}`}
            href={lm[2]}
            className={linkCls}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {lm[1]}
          </a>
        )
      }
      return part
    })
  }

  return (
    <div className="leading-relaxed">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />
        const bullet = line.match(/^\s*[-•]\s+(.*)$/)
        if (bullet) {
          return (
            <div key={i} className="flex items-start gap-1.5 pl-0.5">
              <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0 mt-2" />
              <span>{renderInline(bullet[1], i)}</span>
            </div>
          )
        }
        return <div key={i}>{renderInline(line, i)}</div>
      })}
    </div>
  )
}

// ── Travel documents card ────────────────────────────────────────────────────

const SDF_BADGE = {
  PENDING:  { label: 'SDF Pending',  cls: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30' },
  PAID:     { label: 'SDF Paid',     cls: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30' },
  APPROVED: { label: 'SDF Approved', cls: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30' },
}

const VISA_BADGE = {
  NOT_APPLIED: { label: 'Visa Not Applied', cls: 'bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-700' },
  PROCESSING:  { label: 'Visa Processing',  cls: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30' },
  ISSUED:      { label: 'Visa Issued',      cls: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30' },
}

const DOC_ICONS = { flight_tickets: Plane, visa_file: FileCheck2, entrance_qr: QrCode }

const TRIP_STATUS = {
  enquiry_pending: 'Enquiry',
  pending_review:  'In Review',
  quoted:          'Quoted',
  confirmed:       'Confirmed',
}

function BookingCard({ card }) {
  const sdf  = SDF_BADGE[card.sdf_status]   || SDF_BADGE.PENDING
  const visa = VISA_BADGE[card.visa_status] || VISA_BADGE.NOT_APPLIED

  return (
    <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-white shadow-sm overflow-hidden dark:border-amber-500/25 dark:from-amber-500/10 dark:to-stone-900">
      {/* Header */}
      <div className="px-3.5 pt-3 pb-2.5 border-b border-amber-100 dark:border-amber-500/15">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-mono tracking-widest text-amber-700/70 dark:text-amber-400/70">{card.ref}</p>
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-600 text-white">
            {TRIP_STATUS[card.status] || card.status}
          </span>
        </div>
        <p className="text-sm font-serif font-bold text-stone-900 dark:text-stone-50 mt-0.5 leading-snug">{card.tour}</p>
      </div>

      {/* Clearance badges */}
      <div className="flex flex-wrap gap-1.5 px-3.5 py-2.5">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ring-1 ring-inset ${sdf.cls}`}>
          <Leaf className="w-3 h-3" /> {sdf.label}
        </span>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ring-1 ring-inset ${visa.cls}`}>
          <Stamp className="w-3 h-3" /> {visa.label}
        </span>
      </div>

      {/* Document download buttons */}
      {card.documents?.length > 0 && (
        <div className="px-3.5 pb-2.5 space-y-1.5">
          {card.documents.map(doc => {
            const Icon = DOC_ICONS[doc.key] || FileCheck2
            return (
              <a
                key={doc.key}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-stone-700 transition-colors group dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200 dark:hover:border-amber-500/50 dark:hover:bg-stone-800/80"
              >
                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 dark:bg-amber-500/15 dark:text-amber-400">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-semibold flex-1 text-left leading-tight">{doc.label}</span>
                <Download className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 shrink-0" />
              </a>
            )
          })}
          <p className="flex items-center gap-1 text-[9px] text-stone-400 dark:text-stone-500 pt-0.5">
            <Clock className="w-2.5 h-2.5" /> Secure links — expire in 15 minutes. Ask me again for fresh ones.
          </p>
        </div>
      )}

      {/* Itinerary link */}
      <a
        href={card.itineraryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
      >
        View Full Itinerary & Voucher <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  )
}

// ── Message row ──────────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
      <Sparkles className="w-3.5 h-3.5 text-white" />
    </div>
  )
}

function MessageRow({ msg, onConcierge }) {
  const isUser = msg.role === 'user'
  const time = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-sm">
          <p className="leading-relaxed">{msg.text}</p>
          <p className="text-[10px] mt-1.5 text-right text-white/60">{time}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="max-w-[85%] space-y-1.5 min-w-0">
        <p className="text-[10px] font-semibold ml-0.5 text-amber-700/60 dark:text-amber-500/60">Arise Bhutan Assistant</p>
        {(msg.text || msg.isStreaming) && (
          <div className="rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm bg-white border border-stone-100 text-stone-800 shadow-sm dark:bg-stone-800 dark:border-white/5 dark:text-stone-200">
            <MsgText text={msg.text || ''} />
            {msg.isStreaming && (
              <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-amber-500 animate-pulse rounded-sm align-middle" />
            )}
            {!msg.isStreaming && <p className="text-[10px] mt-1.5 text-stone-400 dark:text-stone-500">{time}</p>}
          </div>
        )}
        {msg.cards?.map((card, i) => (
          <BookingCard key={`${card.ref}-${i}`} card={card} />
        ))}
        {msg.showConcierge && !msg.isStreaming && (
          <button
            onClick={onConcierge}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold transition-colors bg-amber-600 text-white hover:bg-amber-700"
          >
            Chat with our Concierge Desk <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main widget ──────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput]       = useState('')
  const [busy, setBusy]         = useState(false)   // request in flight
  const [waiting, setWaiting]   = useState(false)   // no first token yet
  const [chipsGone, setChipsGone] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollRef   = useRef(null)
  const textareaRef = useRef(null)
  const menuRef     = useRef(null)

  // Auto-scroll on new content
  useEffect(() => {
    if (!scrollRef.current) return
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }, [messages, waiting])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 180)
  }, [open])

  // Close quick-action menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function onDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  const openWhatsApp = useCallback(() => window.open(WHATSAPP_URL, '_blank'), [])

  const sendMessage = useCallback(async (text) => {
    const trimmed = text?.trim()
    if (!trimmed || busy) return

    setChipsGone(true)
    setInput('')
    setMenuOpen(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const userMsg = { id: 'u-' + Date.now(), role: 'user', text: trimmed, created_at: new Date().toISOString() }
    const botId = 'b-' + Date.now()

    setMessages(prev => [...prev, userMsg])
    setBusy(true)
    setWaiting(true)

    // Conversation history for the API (welcome message excluded)
    const history = [...messages, userMsg]
      .filter(m => m.id !== 'welcome' && m.text)
      .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }))

    const patchBot = (patch) =>
      setMessages(prev => prev.map(m => (m.id === botId ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m)))

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, accessToken: session?.access_token || null }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`API ${res.status}`)
      }

      // Insert the streaming bot placeholder once the request is live
      setMessages(prev => [
        ...prev,
        { id: botId, role: 'bot', text: '', cards: [], isStreaming: true, created_at: new Date().toISOString() },
      ])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let sawError = false

      const handleEvent = (evt) => {
        if (evt.type === 'text' && evt.text) {
          setWaiting(false)
          patchBot(m => ({ text: (m.text || '') + evt.text }))
        } else if (evt.type === 'booking_card' && evt.card) {
          setWaiting(false)
          patchBot(m => ({ cards: [...(m.cards || []), evt.card] }))
        } else if (evt.type === 'error') {
          sawError = true
          patchBot(m => ({
            text: m.text || "I'm having a little trouble reaching base camp right now. 🏔️ Please try again in a moment — or reach our human concierge team directly on WhatsApp.",
            showConcierge: true,
          }))
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          try { handleEvent(JSON.parse(line)) } catch { /* skip malformed line */ }
        }
      }
      if (buffer.trim()) {
        try { handleEvent(JSON.parse(buffer)) } catch { /* ignore */ }
      }

      patchBot(m => ({
        isStreaming: false,
        text: m.text || (sawError ? m.text : "Hmm, I didn't manage to compose a reply — please try asking again."),
      }))
    } catch (err) {
      setMessages(prev => {
        const exists = prev.some(m => m.id === botId)
        const errMsg = {
          id: botId,
          role: 'bot',
          text: "I couldn't reach the assistant service just now. 🏔️ Please try again shortly — or chat with our human concierge team on WhatsApp.",
          showConcierge: true,
          isStreaming: false,
          created_at: new Date().toISOString(),
        }
        return exists ? prev.map(m => (m.id === botId ? { ...m, ...errMsg } : m)) : [...prev, errMsg]
      })
    } finally {
      setBusy(false)
      setWaiting(false)
    }
  }, [busy, messages])

  function handleSubmit(e) {
    e?.preventDefault()
    sendMessage(input)
  }

  function handleQuickAction(action) {
    setMenuOpen(false)
    if (action.action === 'whatsapp') openWhatsApp()
    else if (action.action === 'link') window.location.href = action.value
    else if (action.action === 'message') sendMessage(action.value)
  }

  const canSend = input.trim().length > 0 && !busy

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-900/30 hover:shadow-xl hover:shadow-amber-900/40 hover:scale-105"
      >
        <div className={`transition-all duration-200 ${open ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </div>
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-white text-amber-700 border border-amber-200">
            {Math.min(messages.length - 1, 9)}
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px] rounded-3xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right bg-[#faf8f4] border border-stone-200/80 shadow-2xl shadow-stone-900/15 dark:bg-stone-900 dark:border-white/10 dark:shadow-black/60 ${
          open ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none translate-y-2'
        }`}
        style={{ height: '560px', maxHeight: 'calc(100vh - 128px)' }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-3.5 flex-shrink-0 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 right-16 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-serif font-bold leading-tight text-white">Arise Bhutan Assistant</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <p className="text-[10px] text-amber-50/90">AI concierge — replies in seconds</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="relative p-1.5 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#faf8f4] dark:bg-stone-950/50"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#a8a29e transparent' }}
        >
          {messages.map(msg => (
            <MessageRow key={msg.id} msg={msg} onConcierge={openWhatsApp} />
          ))}

          {/* Suggested query chips */}
          {!chipsGone && messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-1 pl-9">
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="text-xs px-3.5 py-2 rounded-full border font-medium transition-all bg-white border-amber-200 text-amber-800 shadow-sm hover:border-amber-400 hover:bg-amber-50 hover:shadow dark:bg-stone-800 dark:border-amber-500/25 dark:text-amber-300 dark:hover:border-amber-500/50 dark:hover:bg-stone-800/80"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Typing dots while waiting for the first token */}
          {waiting && (
            <div className="flex items-end gap-2">
              <BotAvatar />
              <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-white border border-stone-100 shadow-sm dark:bg-stone-800 dark:border-white/5">
                <div className="flex items-center gap-1.5 h-4">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce bg-amber-500"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-3 py-3 bg-white border-t border-stone-100 dark:bg-stone-900 dark:border-white/10 relative" ref={menuRef}>
          {/* Quick-action flyup menu */}
          {menuOpen && (
            <div className="absolute bottom-full left-3 mb-1.5 rounded-xl overflow-hidden z-20 w-52 bg-white border border-stone-200 shadow-lg shadow-stone-900/10 dark:bg-stone-800 dark:border-white/10 dark:shadow-black/40">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors flex items-center gap-2.5 text-stone-700 hover:bg-amber-50 hover:text-amber-700 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-amber-300 ${
                    i < QUICK_ACTIONS.length - 1 ? 'border-b border-stone-100 dark:border-white/10' : ''
                  }`}
                >
                  <span className="text-sm leading-none">{action.emoji}</span>
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Quick actions"
              title="Quick actions"
              className={`w-9 h-[42px] rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
                menuOpen
                  ? 'border-amber-400 text-amber-600 bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:bg-stone-700/60'
                  : 'border-stone-200 text-stone-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-300 dark:border-white/10 dark:hover:text-amber-400 dark:hover:bg-stone-700/60 dark:hover:border-amber-500/40'
              }`}
            >
              <Menu className="w-4 h-4" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
                if (menuOpen) setMenuOpen(false)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (canSend) sendMessage(input)
                }
                if (e.key === 'Escape') setMenuOpen(false)
              }}
              placeholder="Ask about Bhutan, or paste your ARB reference…"
              className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-colors bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-amber-500 dark:bg-stone-800 dark:border-white/10 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-500/60"
              style={{ minHeight: '42px', maxHeight: '96px' }}
            />

            <button
              type="submit"
              disabled={!canSend}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-md hover:shadow-amber-900/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-[10px] mt-2 text-stone-400 dark:text-stone-600">
            AI concierge by Arise Bhutan &middot;{' '}
            <a href="/contact" className="transition-colors text-amber-600 hover:text-amber-700 dark:text-amber-500/70 dark:hover:text-amber-400">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
