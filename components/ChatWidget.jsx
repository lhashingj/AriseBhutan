'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { MessageCircle, X, Send, ArrowRight, ExternalLink } from 'lucide-react'

// ── Knowledge base ──────────────────────────────────────────────────────────

const FAQS = [
  {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'good day', 'howdy', 'kuzuzangpo', 'namaste', 'salaam', 'hiya', 'yo '],
    answer: "Kuzuzangpo la! 🙏 I'm your Arise Bhutan travel assistant. I can help with questions about our Bhutan tours, visa requirements, trekking, festivals, pricing, and more. What would you like to explore?",
  },
  {
    patterns: ['how are you', 'how r u', "how're you", 'are you ok', 'you ok', "what's up", 'whats up', 'sup', 'how is it going', "how's it going", 'how do you do'],
    answer: "I'm doing great, thank you for asking! 😊 Ready to help you plan an unforgettable Bhutan journey. What would you like to know?",
  },
  {
    patterns: ['bye', 'goodbye', 'see you', 'see ya', 'take care', 'talk later', 'talk soon', 'ciao', 'tata', 'ttyl', 'have a good', 'have a nice'],
    answer: "Goodbye! 🙏 Safe travels, and we hope to welcome you to the Kingdom of Happiness soon. Feel free to come back anytime with questions!",
  },
  {
    patterns: ['are you a bot', 'are you ai', 'are you robot', 'are you human', 'are you real', 'who built you', 'who created you', 'what are you'],
    answer: "I'm a virtual travel assistant for Arise Bhutan Tours & Travels! 🤖 I can answer questions about Bhutan tours, visa, trekking, pricing, and more. For personalised advice, you can always reach our human team on WhatsApp at +975 77 319 405.",
  },
  {
    patterns: ['what can you do', 'help me', 'help', 'what do you know', 'what can i ask', 'how can you help'],
    answer: "I can help you with:\n• **Tours & Packages** — custom itineraries, destinations\n• **Visa & Permits** — entry requirements for Bhutan\n• **Pricing** — package rates, SDF fee explained\n• **Trekking** — routes, difficulty, what to expect\n• **Festivals** — Tshechu dates and best times to visit\n• **Booking** — how to reserve and what to expect\n• **Booking Reference** — paste your ARB-XXXX code to check your trip\n\nJust ask away!",
  },
  {
    patterns: ['ok', 'okay', 'alright', 'sure', 'got it', 'i see', 'i understand', 'understood', 'noted', 'cool', 'great', 'awesome', 'nice', 'perfect', 'sounds good', 'makes sense'],
    answer: "Great! 😊 Is there anything else you'd like to know about your Bhutan journey?",
  },
  {
    patterns: ['no', 'nope', 'nah', 'not really', 'nothing else', 'that is all', "that's all", 'i am good', "i'm good", 'all good'],
    answer: "No problem at all! 🙏 Feel free to come back anytime. We'd love to help you plan your Bhutan adventure whenever you're ready!",
  },
  {
    patterns: ['yes', 'yep', 'yup', 'yeah', 'absolutely', 'definitely', 'of course', 'certainly', 'indeed', 'for sure'],
    answer: "Wonderful! Please go ahead and tell me what you'd like to know — I'm here to help. 😊",
  },
  {
    patterns: ['thank you', 'thanks', 'thank u', 'cheers', 'appreciate', 'thx', 'thnks', 'ty '],
    answer: "You're most welcome! 🙏 Is there anything else I can help you with about your Bhutan journey?",
  },
  {
    patterns: ['arise bhutan', 'about you', 'who are you', 'your company', 'travel agency', 'tour operator', 'about arise', 'who is arise'],
    answer: "Arise Bhutan Tours & Travels is a licensed Bhutanese tour operator based in Paro. We specialise in crafting personalised Bhutan journeys — from cultural immersions and monastery visits to high-altitude trekking adventures. We are certified by Bhutan's Department of Tourism (DOT).",
  },
  {
    patterns: ['visa', 'permit', 'entry requirement', 'travel document', 'tourist visa'],
    answer: "All international visitors need a Tourist Visa, which must be arranged through a licensed Bhutanese operator. **We handle the entire visa application** as part of your tour package. SAARC nationals (India, Bangladesh, Maldives) only need an entry permit — no visa required.",
  },
  {
    patterns: ['sdf', 'sustainable development fee', 'daily fee', 'royalty fee', 'tourism fee', '$100', 'usd 100'],
    answer: "Bhutan charges a **Sustainable Development Fee (SDF) of USD 100 per person per night**. This mandatory levy funds Bhutan's free healthcare, education, and carbon-neutral policies. It is included in your quoted tour price.",
  },
  {
    patterns: ['cost', 'price', 'pricing', 'how much', 'expensive', 'budget', 'rate', 'package cost', 'quote'],
    answer: "Our custom packages are priced based on nights, hotel tier, and group size. A rough guide:\n• **Standard tier**: USD 200–300 per person/night\n• **Deluxe tier**: USD 350–500 per person/night\n• **Luxury tier**: USD 500–700+ per person/night\n\n(All inclusive of SDF, hotels, meals, guide, transport & permits.) Contact us for a personalised quote!",
  },
  {
    patterns: ['hotel', 'accommodation', 'stay', 'lodge', 'resort', 'standard', 'deluxe', 'luxury'],
    answer: "We offer three accommodation tiers:\n• **Standard** — Comfortable 3-star lodges\n• **Deluxe** — 4-star boutique heritage hotels\n• **Luxury** — Bhutan's finest resorts & heritage properties\n\nAll include breakfast and dinner.",
  },
  {
    patterns: ['best time', 'when to visit', 'season', 'weather', 'climate', 'monsoon', 'spring', 'autumn', 'winter'],
    answer: "The best times to visit Bhutan are:\n• **Spring (Mar–May)**: Blooming rhododendrons, ideal trekking, Paro Tshechu\n• **Autumn (Sep–Nov)**: Crystal-clear Himalayan views, vibrant festivals, perfect weather\n\nWinter offers fewer crowds and snow-dusted dzongs. Monsoon (Jun–Aug) is lush but wet.",
  },
  {
    patterns: ['tour', 'tours', 'package', 'packages', 'what tours', 'our tours', 'available tours', 'tour options', 'tour packages', 'what packages', 'bhutan tour', 'bhutan package', 'offer', 'offerings', 'itinerary', 'itineraries'],
    answer: "We offer a wide range of **Bhutan tour packages** tailored to every traveller:\n\n• **Cultural Tours** — Dzongs, monasteries, local markets (5–8 nights)\n• **Festival Tours** — Timed around Paro or Thimphu Tshechu\n• **Trekking Packages** — Druk Path, Jomolhari, Snowman Trek\n• **Luxury Retreats** — Heritage hotels, wellness, fine dining\n• **Honeymoon Packages** — Romantic settings with private experiences\n• **Family Tours** — Kid-friendly itineraries with gentle hiking\n\nAll packages are **fully private and customised** — no fixed group tours. Use our **Adventure Builder** to design yours, or contact us for a personal quote!",
  },
  {
    patterns: ['book', 'booking', 'reserve', 'how to book', 'how do i book', 'start', 'plan my trip', 'get started', 'adventure builder', 'package builder'],
    answer: "Booking with us is easy:\n1. Use our **Adventure Builder** to design your custom package\n2. Submit your preferences — we'll send a detailed quote within 24 hours\n3. Confirm with a 30% deposit to lock in your dates\n4. We handle visa, permits, hotels, guide & all ground arrangements\n\nSign in to your account to get started!",
  },
  {
    patterns: ['trek', 'hike', 'trekking', 'hiking', 'snowman', 'druk path', 'jomolhari', 'trail', 'walking tour'],
    answer: "Bhutan offers world-class trekking:\n• **Druk Path Trek** (5 days) — lakes & ridge views, moderate\n• **Jomolhari Trek** (8 days) — base camp at 4,080m\n• **Snowman Trek** (25 days) — one of the world's most challenging\n\nWe provide certified guides, pack animals, camping equipment, and all permits.",
  },
  {
    patterns: ['festival', 'tshechu', 'paro tshechu', 'thimphu tshechu', 'event', 'celebration', 'mask dance', 'losar'],
    answer: "Bhutan's Tshechu festivals are spectacular masked dance celebrations:\n• **Paro Tshechu** — March/April (most famous)\n• **Thimphu Tshechu** — September/October (largest)\n• **Punakha Drubchen** — February/March\n\nWe can time your visit around any festival. Book early — spots fill fast!",
  },
  {
    patterns: ["tiger's nest", 'tiger nest', 'paro taktsang', 'taktsang', 'monastery', 'dzong', 'landmark'],
    answer: "**Paro Taktsang (Tiger's Nest)** is Bhutan's most iconic landmark, perched at 3,120m above the Paro Valley. The hike takes about 2–3 hours each way and is included in most of our itineraries. We ensure you have a knowledgeable guide and all required entry permits for sacred sites.",
  },
  {
    patterns: ['paro', 'thimphu', 'punakha', 'bumthang', 'haa', 'wangdue', 'destination', 'must see', 'attraction', 'place to visit'],
    answer: "Top Bhutan destinations:\n• **Paro** — Tiger's Nest, Paro Dzong, local crafts market\n• **Thimphu** — Capital city, Buddha Point, Memorial Chorten\n• **Punakha** — Stunning dzong at the river confluence\n• **Bumthang** — Spiritual heartland with ancient monasteries\n\nOur itineraries range from 5-night highlights to 14-night deep explorations.",
  },
  {
    patterns: ['flight', 'airport', 'arrive', 'drukair', 'bhutan airlines', 'fly', 'flying to bhutan', 'paro airport'],
    answer: "Flights land at **Paro International Airport (PBH)**. Airlines:\n• **Druk Air** (Royal Bhutan Airlines)\n• **Bhutan Airlines**\n\nConnecting hubs include Bangkok, Singapore, Kolkata, Delhi, and Kathmandu. We can recommend flight options once your dates are confirmed.",
  },
  {
    patterns: ['payment', 'pay', 'bank transfer', 'deposit', 'advance', 'how to pay', 'inr', 'usd'],
    answer: "We accept bank transfers in **USD or INR**. Payment schedule:\n• **30% deposit** — to confirm your booking\n• **Remaining 70%** — due 30 days before arrival\n\nFull banking details and a booking confirmation letter are sent immediately upon booking.",
  },
  {
    patterns: ['cancel', 'refund', 'cancellation policy', 'change date', 'postpone', 'reschedule'],
    answer: "Our cancellation policy:\n• **30+ days before arrival** — Full refund minus processing fees\n• **15–30 days** — 50% refund\n• **Under 15 days** — Non-refundable\n\nWe strongly recommend purchasing **travel insurance** to cover unexpected cancellations.",
  },
  {
    patterns: ['contact', 'reach you', 'phone', 'email', 'whatsapp', 'call us', 'get in touch', 'office address'],
    answer: "Reach our team at:\n📞 **+975 77 319 405**\n✉ **arisebhutan@gmail.com**\n💬 WhatsApp at the same number\n📍 Nyamaizampa, Paro 12001, Bhutan\n\nWe respond within 24 hours — usually much faster!",
  },
  {
    patterns: ['group', 'family', 'solo', 'couple', 'honeymoon', 'private tour', 'custom tour', 'personalised'],
    answer: "We cater to all travel styles — solo adventurers, couples on honeymoon, families with children, and corporate groups. **All our tours are fully private and customised** to your preferences. No sharing with strangers on set group tours!",
  },
  {
    patterns: ['carbon neutral', 'environment', 'sustainable', 'eco', 'green', 'nature', 'biodiversity'],
    answer: "Bhutan is the **world's only carbon-negative country** — it absorbs more carbon than it produces. Conservation is central to Bhutanese culture. The SDF levy you pay directly funds environmental protection, reforestation, and Bhutan's Gross National Happiness philosophy.",
  },
]

const ARB_REGEX = /\bARB-\d{4}-[A-Z0-9]{4,}\b/i

const QUICK_CHIPS = [
  'What tours do you offer?',
  'What is the SDF fee?',
  'Best time to visit Bhutan',
  'How do I book a tour?',
]

const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  text: "Kuzuzangpo la! 🙏 I'm the **Arise Bhutan Assistant**. Ask me anything about our tours, Bhutan visa, trekking, festivals, or paste your **booking reference** (e.g. ARB-2026-XXXX) to check your trip status.",
  created_at: new Date().toISOString(),
}

// Short single-word patterns use whole-word matching to avoid false positives
// (e.g. 'hi' shouldn't match 'this', 'ok' shouldn't match 'book')
const SHORT_PATTERN = /^[a-z]{1,4}$/ // ≤4 chars, letters only

function matchesPattern(low, pattern) {
  if (SHORT_PATTERN.test(pattern.trim())) {
    return new RegExp(`(^|\\s)${pattern.trim()}(\\s|$|[!?.,])`).test(low)
  }
  return low.includes(pattern)
}

function findAnswer(text) {
  const low = text.toLowerCase().trim()
  for (const faq of FAQS) {
    if (faq.patterns.some((p) => matchesPattern(low, p))) return faq.answer
  }
  return null
}

// ── Sub-components ──────────────────────────────────────────────────────────

function MsgText({ text, isAdmin }) {
  const linkCls = isAdmin
    ? 'text-amber-400 underline underline-offset-2 hover:text-amber-300'
    : 'text-amber-600 underline underline-offset-2 hover:text-amber-700'

  return (
    <div className="leading-relaxed">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />
        const parts = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
        return (
          <div key={i}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>
              }
              const lm = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
              if (lm) {
                return <a key={j} href={lm[2]} className={linkCls}>{lm[1]}</a>
              }
              return part
            })}
          </div>
        )
      })}
    </div>
  )
}

function BotAvatar({ isAdmin }) {
  return (
    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
      isAdmin ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-amber-100'
    }`}>
      <MessageCircle className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-400' : 'text-amber-600'}`} />
    </div>
  )
}

function MessageRow({ msg, isAdmin, t, onConcierge }) {
  const isUser      = msg.role === 'user'
  const isStreaming = !!msg.isStreaming
  const time        = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className={`max-w-[80%] rounded-2xl rounded-br-none px-3.5 py-2.5 text-sm ${t.userBubble}`}>
          <p className="leading-relaxed">{msg.text}</p>
          <p className={`text-[10px] mt-1.5 text-right ${isAdmin ? 'text-amber-200/40' : 'text-white/60'}`}>{time}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      <BotAvatar isAdmin={isAdmin} />
      <div className="max-w-[82%] space-y-1.5">
        <p className={`text-[10px] font-medium ml-0.5 ${t.botLabel}`}>Arise Bhutan Assistant</p>
        <div className={`rounded-2xl rounded-bl-none px-3.5 py-2.5 text-sm ${t.botBubble}`}>
          <MsgText text={msg.text} isAdmin={isAdmin} />
          {isStreaming && (
            <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-amber-500 animate-pulse rounded-sm align-middle" />
          )}
          {!isStreaming && (
            <p className={`text-[10px] mt-1.5 ${t.time}`}>{time}</p>
          )}
        </div>
        {msg.itineraryRef && !isStreaming && (
          <a
            href={`/itinerary/${msg.itineraryRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-semibold transition-colors ${t.conciergeBtn}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Itinerary & Voucher
          </a>
        )}
        {msg.showConcierge && !isStreaming && (
          <button
            onClick={onConcierge}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-semibold transition-colors ${t.conciergeBtn}`}
          >
            Send Enquiry to Concierge Desk
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main widget ─────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const pathname = usePathname()
  const router   = useRouter()
  const isAdmin  = !!pathname?.startsWith('/admin')

  const [open,       setOpen]       = useState(false)
  const [messages,   setMessages]   = useState([WELCOME_MSG])
  const [input,      setInput]      = useState('')
  const [typing,     setTyping]     = useState(false)
  const [stream,     setStream]     = useState(null)
  const [missCount,  setMissCount]  = useState(0)
  const [chipsGone,  setChipsGone]  = useState(false)

  const scrollRef  = useRef(null)
  const inputRef   = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }, [messages, typing, stream?.text])

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 180)
  }, [open])

  // Character-by-character streaming reveal
  useEffect(() => {
    if (!stream?.fullText) return
    let cancelled = false
    let timer
    let idx = 0
    const full          = stream.fullText
    const streamId      = stream.id
    const showConcierge = stream.showConcierge

    const tick = () => {
      if (cancelled) return
      idx = Math.min(full.length, idx + (idx < 120 ? 4 : idx < 300 ? 6 : 9))
      setStream((prev) => prev ? { ...prev, text: full.slice(0, idx) } : prev)
      if (idx >= full.length) {
        setMessages((prev) => [
          ...prev,
          { id: streamId, role: 'bot', text: full, showConcierge, created_at: new Date().toISOString() },
        ])
        setStream(null)
        return
      }
      timer = setTimeout(tick, idx < 140 ? 18 : 12)
    }
    timer = setTimeout(tick, 80)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [stream?.fullText, stream?.id, stream?.showConcierge])

  async function sendMessage(text) {
    const trimmed = text?.trim()
    if (!trimmed || typing || stream) return

    setChipsGone(true)

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setTyping(true)

    await new Promise((r) => setTimeout(r, 650 + Math.random() * 400))

    // Booking reference detection — live Supabase lookup
    const refMatch = trimmed.match(ARB_REGEX)
    if (refMatch) {
      const ref = refMatch[0].toUpperCase()

      // Keep typing dots visible while Supabase query runs
      const { data: itin } = await supabase
        .from('itineraries')
        .select('id, booking_reference, client_info, tour_summary, status, pricing')
        .eq('booking_reference', ref)
        .maybeSingle()

      setTyping(false)

      if (itin) {
        const clientName  = itin.client_info?.name || itin.client_info?.full_name || ''
        const tourTitle   = itin.tour_summary?.title || itin.tour_summary?.tour_name || 'Your Bhutan Tour'
        const statusLabel = itin.status ? itin.status.charAt(0).toUpperCase() + itin.status.slice(1) : 'Pending'
        const nameFragment = clientName ? `\nClient: **${clientName}**` : ''

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'bot',
            text: `Found it! Here are the details for **${ref}**:\n\nTour: **${tourTitle}**${nameFragment}\nStatus: **${statusLabel}**\n\nView your full itinerary and voucher below:`,
            itineraryRef: ref,
            created_at: new Date().toISOString(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'bot',
            text: `No booking found for **${ref}**.\n\nPlease double-check your reference (format: ARB-YYYY-XXXXXX). If you think this is an error, our team is happy to help.`,
            showConcierge: true,
            created_at: new Date().toISOString(),
          },
        ])
      }
      return
    }

    setTyping(false)

    const answer = findAnswer(trimmed)
    if (answer) {
      setMissCount(0)
      setStream({ id: `bot-${Date.now()}`, text: '', fullText: answer, showConcierge: false })
    } else {
      const next = missCount + 1
      setMissCount(next)
      const fallback = next >= 2
        ? "I'm not able to find a specific answer to that. Our travel specialists can give you a detailed, personalised response — tap below to reach them directly."
        : "I'm not quite sure about that one. You can ask about our tours, Bhutan visa, trekking, festivals, pricing, or contact details. Or connect with our concierge team below!"
      setStream({ id: `bot-${Date.now()}`, text: '', fullText: fallback, showConcierge: true })
    }
  }

  function handleSubmit(e) {
    e?.preventDefault()
    sendMessage(input)
  }

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const t = isAdmin
    ? {
        widget:       'bg-stone-900 border border-white/10 shadow-2xl shadow-black/60',
        header:       'bg-stone-950 border-b border-white/10',
        headerTitle:  'text-white',
        headerSub:    'text-amber-400/70',
        body:         'bg-stone-950/50',
        inputWrap:    'bg-stone-900 border-t border-white/10',
        inputField:   'bg-stone-800 border border-white/10 text-stone-100 placeholder-stone-500 focus:border-amber-500/50 focus:ring-0',
        sendBtn:      'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed',
        userBubble:   'bg-amber-500/20 border border-amber-500/30 text-amber-100',
        botBubble:    'bg-stone-800 border border-white/5 text-stone-200',
        typingDot:    'bg-amber-500/70',
        chip:         'bg-stone-800 border border-white/10 text-stone-300 hover:border-amber-500/40 hover:text-amber-400',
        conciergeBtn: 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30',
        fab:          'bg-stone-800 border border-amber-500/40 text-amber-400 hover:bg-stone-700 shadow-lg shadow-black/50',
        closeBtn:     'text-stone-400 hover:text-white hover:bg-white/10',
        footer:       'text-stone-600',
        footerLink:   'text-amber-500/70 hover:text-amber-400',
        time:         'text-stone-600',
        botLabel:     'text-amber-500/60',
      }
    : {
        widget:       'bg-[#f8f6f2] border border-stone-200/80 shadow-2xl shadow-stone-900/12',
        header:       'bg-gradient-to-r from-amber-700 to-amber-600',
        headerTitle:  'text-white',
        headerSub:    'text-amber-100/80',
        body:         'bg-[#f8f6f2]',
        inputWrap:    'bg-white border-t border-stone-100',
        inputField:   'bg-white border border-stone-200 text-[#1c1917] placeholder-stone-400 focus:border-amber-500 focus:ring-0',
        sendBtn:      'bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed',
        userBubble:   'bg-amber-600 text-white',
        botBubble:    'bg-white border border-stone-100 text-[#1c1917]',
        typingDot:    'bg-amber-500',
        chip:         'bg-white border border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50',
        conciergeBtn: 'bg-amber-600 text-white hover:bg-amber-700 border-transparent',
        fab:          'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-900/25',
        closeBtn:     'text-white/70 hover:text-white hover:bg-white/15',
        footer:       'text-stone-400',
        footerLink:   'text-amber-600 hover:text-amber-700',
        time:         'text-stone-400',
        botLabel:     'text-amber-700/50',
      }

  const canSend = input.trim().length > 0 && !typing && !stream

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${t.fab}`}
      >
        <div className={`transition-all duration-200 ${open ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </div>
        {!open && messages.length > 1 && (
          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${isAdmin ? 'bg-amber-500 text-stone-900' : 'bg-white text-amber-700 border border-amber-200'}`}>
            {Math.min(messages.length - 1, 9)}
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] sm:w-[390px] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${t.widget} ${
          open ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none translate-y-2'
        }`}
        style={{ height: '520px', maxHeight: 'calc(100vh - 128px)' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 flex-shrink-0 ${t.header}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-white/20'}`}>
              <MessageCircle className={`w-4.5 h-4.5 ${isAdmin ? 'text-amber-400' : 'text-white'}`} />
            </div>
            <div>
              <p className={`text-sm font-semibold leading-tight ${t.headerTitle}`}>Arise Bhutan Assistant</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className={`text-[10px] ${t.headerSub}`}>Online — usually replies instantly</p>
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className={`p-1.5 rounded-lg transition-colors ${t.closeBtn}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 ${t.body}`}
          style={{ scrollbarWidth: 'thin', scrollbarColor: isAdmin ? '#44403c transparent' : '#d6d3d1 transparent' }}
        >
          {/* Quick chips — shown only at the very start */}
          {!chipsGone && messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${t.chip}`}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg) => (
            <MessageRow
              key={msg.id}
              msg={msg}
              isAdmin={isAdmin}
              t={t}
              onConcierge={() => window.open('https://wa.me/97577319405?text=Hello%2C%20I%20have%20an%20enquiry%20about%20a%20Bhutan%20tour.', '_blank')}
            />
          ))}

          {/* Typing indicator */}
          {typing && !stream && (
            <div className="flex items-end gap-2">
              <BotAvatar isAdmin={isAdmin} />
              <div className={`rounded-2xl rounded-bl-none px-4 py-3 ${t.botBubble}`}>
                <div className="flex items-center gap-1.5 h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full animate-bounce ${t.typingDot}`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Streaming bot message */}
          {stream && (
            <MessageRow
              msg={{ ...stream, role: 'bot', isStreaming: true, created_at: new Date().toISOString() }}
              isAdmin={isAdmin}
              t={t}
              onConcierge={() => window.open('https://wa.me/97577319405?text=Hello%2C%20I%20have%20an%20enquiry%20about%20a%20Bhutan%20tour.', '_blank')}
            />
          )}
        </div>

        {/* Input area */}
        <div className={`flex-shrink-0 px-3 py-3 ${t.inputWrap}`}>
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (canSend) sendMessage(input)
                }
              }}
              placeholder="Ask about Bhutan..."
              className={`flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${t.inputField}`}
              style={{ minHeight: '42px', maxHeight: '96px' }}
            />
            <button
              type="submit"
              disabled={!canSend}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors flex-shrink-0 ${t.sendBtn}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className={`text-center text-[10px] mt-2 ${t.footer}`}>
            Powered by Arise Bhutan ·{' '}
            <a href="/contact" className={`transition-colors ${t.footerLink}`}>Contact us</a>
          </p>
        </div>
      </div>
    </>
  )
}
