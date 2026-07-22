'use client'

import { useState } from 'react'
import { trackLead } from '@/utils/adTracking'
import {
  Check, ShieldCheck, Clock, Users, Send, Loader2, CheckCircle2,
  AlertTriangle, BadgeCheck, Star, MessageCircle,
} from 'lucide-react'

/**
 * "Request a Free Quote" — high-converting landing section for paid
 * ad traffic (see marketing_strategy.md §6). Left column sells the
 * transparent $200–$250/day all-inclusive price; right column is a
 * minimal-friction quote form posting to /api/simple-contact.
 */

const WHATSAPP_URL =
  'https://wa.me/97577319405?text=Hello%2C%20I%27d%20like%20a%20free%20quote%20for%20a%20Bhutan%20tour.'

const DAY_RATE_ITEMS = [
  'Handpicked 3-star hotel or heritage lodge',
  'All meals — breakfast, lunch & dinner',
  'Private licensed English-speaking guide',
  'Private vehicle & driver, door to door',
  'Every monument & museum entry fee',
  'Visa & all permits processed for you',
]

const MONTHS = [
  'Flexible / not sure yet',
  'January 2027', 'February 2027', 'March 2027', 'April 2027', 'May 2027',
  'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026',
]

const NIGHT_OPTIONS = ['4 nights', '5 nights', '6 nights', '7 nights', '8–10 nights', '10+ nights']
const TRAVELLER_OPTIONS = ['1 traveller', '2 travellers', '3–4 travellers', '5–8 travellers', '9+ travellers']
const TIERS = ['3-Star Standard', '4-Star Deluxe', '5-Star Luxury']

const inputCls =
  'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-500/60'

const labelCls = 'block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5'

function TrustChip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-200 backdrop-blur-sm dark:bg-stone-900/80 dark:text-stone-200 dark:ring-stone-700">
      <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      {children}
    </span>
  )
}

export default function FreeQuoteLanding() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    month: MONTHS[0], nights: NIGHT_OPTIONS[1], travellers: TRAVELLER_OPTIONS[1],
    tier: TIERS[0], notes: '',
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')

    const message = [
      '— FREE QUOTE REQUEST (ad landing page) —',
      `Travel month: ${form.month}`,
      `Duration: ${form.nights}`,
      `Group size: ${form.travellers}`,
      `Hotel tier: ${form.tier}`,
      form.notes ? `Notes: ${form.notes}` : null,
    ].filter(Boolean).join('\n')

    try {
      const res = await fetch('/api/simple-contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message,
        }),
      })
      if (!res.ok) throw new Error('send failed')
      trackLead({ content_name: 'free_quote_form', tier: form.tier })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden pt-36 pb-16 text-center text-white sm:pt-44 sm:pb-20"
        style={{
          backgroundImage: 'url(/images/prayer-flags-mountains.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
        }}
      >
        <div className="absolute inset-0 bg-stone-900/70" />
        <div className="relative z-10 mx-auto max-w-3xl px-5">
          <span className="mb-4 block text-xs font-semibold uppercase tracking-widest text-amber-400">
            Transparent, All-Inclusive Pricing
          </span>
          <h1 className="mb-4 font-serif text-[2rem] font-bold leading-tight sm:mb-5 sm:text-4xl md:text-5xl">
            Bhutan From <span className="text-amber-400">$200/Day</span> —
            <br className="hidden sm:block" /> Even the $100 SDF Is Included
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Hotels, every meal, a private guide &amp; car, visa, permits and Bhutan&apos;s mandatory
            Sustainable Development Fee — one honest price of <strong className="text-white">$200–$250 per person, per day</strong>.
            Tell us your dates and a Bhutanese specialist will send your personalised quote within 24 hours. Free.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <TrustChip icon={BadgeCheck}>DOT-Licensed Operator</TrustChip>
            <TrustChip icon={Clock}>Quote in 24 Hours</TrustChip>
            <TrustChip icon={ShieldCheck}>$0 &amp; No Card to Enquire</TrustChip>
          </div>
        </div>
      </section>

      {/* ── Value + Form ── */}
      <section className="bg-stone-50 py-14 transition-colors duration-300 dark:bg-stone-950 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:gap-12 lg:px-8">

          {/* Left — the transparent price pitch */}
          <div className="space-y-8 lg:col-span-3">

            {/* Price card */}
            <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-colors duration-300 dark:border-stone-800 dark:bg-stone-900">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-100 bg-gradient-to-br from-amber-50 to-white px-6 py-5 dark:border-stone-800 dark:from-amber-500/10 dark:to-stone-900">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Your day rate, itemised
                  </p>
                  <p className="mt-1 font-serif text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl">
                    $200–$250 <span className="text-base font-normal text-stone-500 dark:text-stone-400">/ person / day</span>
                  </p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30">
                  No hidden fees
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-3 px-6 py-6 sm:grid-cols-2">
                {DAY_RATE_ITEMS.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                    {item}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-sm font-semibold text-stone-900 dark:text-stone-50 sm:col-span-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  The mandatory $100/night Sustainable Development Fee — already in the price
                </li>
              </ul>
              <p className="border-t border-stone-100 px-6 py-4 text-xs leading-relaxed text-stone-500 dark:border-stone-800 dark:text-stone-400">
                Most operators quote low, then add the SDF later. We don&apos;t. The number on your quote
                is the number you pay — international flights are the only extra.
              </p>
            </div>

            {/* Why us */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: Users, title: '100% Private', text: 'Your own guide and vehicle — never a stranger on your bus, at 3-star prices.' },
                { icon: ShieldCheck, title: 'Paperwork Done', text: 'Visa, permits and SDF processed by us, tracked live in your travel portal.' },
                { icon: Star, title: 'Rated 4.9/5', text: 'By travellers from 6 continents — read their stories on our tour pages.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-stone-800 dark:bg-stone-900">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mb-1 font-serif text-base font-bold text-stone-900 dark:text-stone-50">{title}</p>
                  <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">{text}</p>
                </div>
              ))}
            </div>

            {/* Urgency note */}
            <p className="flex items-start gap-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              Festival-season departures (Paro &amp; Thimphu Tshechu) are limited by hotel space and
              book out months ahead — enquiring early costs nothing and holds your options open.
            </p>
          </div>

          {/* Right — quote form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-amber-200/70 bg-white p-6 shadow-lg shadow-stone-900/5 transition-colors duration-300 dark:border-amber-500/25 dark:bg-stone-900 dark:shadow-black/30 lg:sticky lg:top-28">
              {status === 'success' ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-500/10">
                    <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-stone-900 dark:text-stone-50">
                    Tashi Delek — request received!
                  </h3>
                  <p className="mx-auto mb-6 max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                    A Bhutan specialist is preparing your personalised quote and will email you
                    within 24 hours. In a hurry? We&apos;re one message away.
                  </p>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp Us Now
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" aria-label="Request a free quote">
                  <div>
                    <p className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50">
                      Get Your Free Quote
                    </p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      Personalised by a Bhutanese specialist · replies within 24h
                    </p>
                  </div>

                  <div>
                    <label htmlFor="fq-name" className={labelCls}>Full name *</label>
                    <input id="fq-name" required value={form.name} onChange={set('name')}
                      placeholder="Jane Traveller" className={inputCls} autoComplete="name" />
                  </div>

                  <div>
                    <label htmlFor="fq-email" className={labelCls}>Email *</label>
                    <input id="fq-email" required type="email" value={form.email} onChange={set('email')}
                      placeholder="you@example.com" className={inputCls} autoComplete="email" />
                  </div>

                  <div>
                    <label htmlFor="fq-phone" className={labelCls}>WhatsApp number <span className="font-normal text-stone-400">(optional)</span></label>
                    <input id="fq-phone" value={form.phone} onChange={set('phone')}
                      placeholder="+1 555 000 0000" className={inputCls} autoComplete="tel" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="fq-month" className={labelCls}>Travel month</label>
                      <select id="fq-month" value={form.month} onChange={set('month')} className={inputCls}>
                        {MONTHS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="fq-nights" className={labelCls}>Duration</label>
                      <select id="fq-nights" value={form.nights} onChange={set('nights')} className={inputCls}>
                        {NIGHT_OPTIONS.map(n => <option key={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fq-travellers" className={labelCls}>Travellers</label>
                    <select id="fq-travellers" value={form.travellers} onChange={set('travellers')} className={inputCls}>
                      {TRAVELLER_OPTIONS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <fieldset>
                    <legend className={labelCls}>Hotel tier</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {TIERS.map(tier => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, tier }))}
                          aria-pressed={form.tier === tier}
                          className={`cursor-pointer rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
                            form.tier === tier
                              ? 'border-amber-500 bg-amber-50 text-amber-800 dark:border-amber-500/60 dark:bg-amber-500/15 dark:text-amber-300'
                              : 'border-stone-200 bg-white text-stone-500 hover:border-amber-300 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-amber-500/40'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor="fq-notes" className={labelCls}>Anything else? <span className="font-normal text-stone-400">(optional)</span></label>
                    <textarea id="fq-notes" rows={2} value={form.notes} onChange={set('notes')}
                      placeholder="Festivals, trekking, honeymoon touches…" className={`${inputCls} resize-none`} />
                  </div>

                  {status === 'error' && (
                    <p className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Something went wrong — please try again, or WhatsApp us at +975 77 319 405.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-900/15 transition-colors hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'sending'
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                      : <><Send className="h-4 w-4" /> Request My Free Quote</>}
                  </button>

                  <p className="text-center text-[11px] leading-relaxed text-stone-400 dark:text-stone-500">
                    No payment, no card, no obligation. We reply personally — never a mailing list.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-t border-stone-100 bg-white py-10 transition-colors duration-300 dark:border-stone-800 dark:bg-stone-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 text-center sm:grid-cols-3">
            {[
              ['24h', 'Personal response from a Bhutan specialist'],
              ['$0', 'No payment or commitment required to enquire'],
              ['100%', 'Private tours — never shared with strangers'],
            ].map(([stat, label]) => (
              <div key={stat}>
                <p className="mb-1 font-serif text-2xl font-bold text-amber-600 dark:text-amber-400">{stat}</p>
                <p className="text-sm leading-snug text-stone-500 dark:text-stone-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
