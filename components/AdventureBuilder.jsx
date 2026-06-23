'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronRight, ChevronLeft, Check, Star,
  Minus, Plus, Sparkles, AlertCircle, Loader2,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

// ── Constants ─────────────────────────────────────────────────

const STEPS = ['Core Details', 'Accommodation', 'Activities']

const TIER_META = {
  '3-Star': {
    label:  'Premium 3-Star',
    badge:  'Best Value',
    desc:   'Comfortable, authentic Bhutanese hospitality at well-reviewed properties with warm local character.',
    stars:  3,
  },
  '4-Star': {
    label:  '4-Star Deluxe',
    badge:  'Most Popular',
    desc:   'Elegant rooms, superior dining, and sweeping valley views — the sweet spot for discerning travellers.',
    stars:  4,
  },
  '5-Star Luxury': {
    label:  'Ultra-Luxury',
    badge:  'Exclusive',
    desc:   'COMO, Aman, Six Senses — world-renowned properties offering butler service and bespoke Bhutan experiences.',
    stars:  5,
  },
}

const CATEGORY_EMOJI = {
  Cultural:    '🏛️',
  Spiritual:   '🙏',
  Trekking:    '🥾',
  Adventure:   '⚡',
  Wellness:    '🌿',
  Photography: '📷',
}

// ── Sub-components ─────────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
            i < current  ? 'bg-amber-600 text-white' :
            i === current ? 'bg-amber-600 text-white ring-4 ring-amber-100' :
                            'bg-stone-100 text-stone-400'
          }`}>
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`hidden sm:block ml-2 text-xs font-medium whitespace-nowrap transition-colors ${
            i === current ? 'text-stone-900' : 'text-stone-400'
          }`}>{label}</span>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${i < current ? 'bg-amber-400' : 'bg-stone-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function CountStepper({ label, sublabel, value, min, max, onChange }) {
  return (
    <div className="bg-stone-50 rounded-2xl p-5">
      <p className="text-sm font-semibold text-stone-700">{label}</p>
      {sublabel && <p className="text-xs text-stone-400 mt-0.5 mb-3">{sublabel}</p>}
      <div className="flex items-center gap-4 mt-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:border-amber-400 hover:text-amber-600 disabled:opacity-30 transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-3xl font-bold text-stone-900 w-10 text-center tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:border-amber-400 hover:text-amber-600 disabled:opacity-30 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Loading skeleton ───────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-stone-100 p-8 flex flex-col items-center justify-center min-h-[420px] gap-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 text-sm">Loading your adventure builder…</p>
      </div>
      <div className="bg-stone-900 rounded-3xl p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded-full w-32 mb-6" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex justify-between mb-3">
            <div className="h-3 bg-white/10 rounded-full w-40" />
            <div className="h-3 bg-white/10 rounded-full w-16" />
          </div>
        ))}
        <div className="border-t border-white/10 mt-6 pt-5">
          <div className="h-8 bg-white/10 rounded-full w-36" />
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

export default function AdventureBuilder() {
  // Wizard state
  const [step, setStep]     = useState(0)
  const [nights, setNights] = useState(7)
  const [guests, setGuests] = useState(2)
  const [tier, setTier]     = useState('4-Star')
  const [selectedIds, setSelectedIds]         = useState([])
  const [activeCategory, setActiveCategory]   = useState('All')

  // Remote data
  const [accommodations, setAccommodations] = useState([])
  const [activities, setActivities]         = useState([])
  const [logistics, setLogistics]           = useState({})
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)

  // ── Fetch from Supabase ──────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [
          { data: acc, error: e1 },
          { data: act, error: e2 },
          { data: log, error: e3 },
        ] = await Promise.all([
          supabase.from('accommodations').select('*').eq('active', true).order('price_per_night'),
          supabase.from('activities').select('*').eq('active', true).order('category').order('name'),
          supabase.from('base_logistics').select('*').eq('active', true),
        ])

        if (e1) throw e1
        if (e2) throw e2
        if (e3) throw e3

        setAccommodations(acc ?? [])
        setActivities(act ?? [])

        // Index by item_name for O(1) lookup in price calculator
        const map = {}
        for (const row of (log ?? [])) map[row.item_name] = row
        setLogistics(map)
      } catch (err) {
        console.error('AdventureBuilder fetch error:', err)
        setError('Could not load pricing data. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Derived data ─────────────────────────────────────────────

  const tierPriceRange = useMemo(() => {
    const hotels = accommodations.filter(a => a.tier === tier)
    if (!hotels.length) return null
    const prices = hotels.map(h => Number(h.price_per_night))
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [accommodations, tier])

  const avgHotelRate = useMemo(() => {
    const hotels = accommodations.filter(a => a.tier === tier)
    if (!hotels.length) return 0
    return hotels.reduce((sum, h) => sum + Number(h.price_per_night), 0) / hotels.length
  }, [accommodations, tier])

  const selectedActivities = useMemo(
    () => activities.filter(a => selectedIds.includes(a.id)),
    [activities, selectedIds]
  )

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(activities.map(a => a.category)))],
    [activities]
  )

  const visibleActivities = activeCategory === 'All'
    ? activities
    : activities.filter(a => a.category === activeCategory)

  // ── Live price breakdown ──────────────────────────────────────
  const breakdown = useMemo(() => {
    const sdf     = Number(logistics['Sustainable Development Fee (SDF)']?.base_price ?? 100)
    const visa    = Number(logistics['Visa Processing Fee']?.base_price ?? 40)
    const guide   = Number(logistics['Licensed Bhutanese Guide']?.base_price ?? 50)
    const vehicle = Number(logistics['Private Vehicle & Driver']?.base_price ?? 65)

    const sdfTotal        = sdf * guests * nights
    const visaTotal       = visa * guests
    const logisticsTotal  = (guide + vehicle) * nights
    const hotelTotal      = avgHotelRate * nights
    const activitiesTotal = selectedActivities.reduce((s, a) => s + Number(a.cost_per_person), 0) * guests
    const total           = sdfTotal + visaTotal + logisticsTotal + hotelTotal + activitiesTotal

    return { sdfTotal, visaTotal, logisticsTotal, hotelTotal, activitiesTotal, total }
  }, [logistics, guests, nights, avgHotelRate, selectedActivities])

  const toggleActivity = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const fmt = (n) => Math.round(n).toLocaleString()

  // ── Render ────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />

  if (error) return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 max-w-lg mx-auto my-8">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-800 text-sm">Unable to load pricing</p>
        <p className="text-red-600 text-sm mt-0.5">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-xs font-semibold text-red-700 underline underline-offset-2"
        >
          Refresh page
        </button>
      </div>
    </div>
  )

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">

      {/* ── Wizard panel ─────────────────────────────────────── */}
      <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-stone-100 p-6 sm:p-8">
        <StepIndicator current={step} />

        {/* STEP 0 — Core Details */}
        {step === 0 && (
          <div className="space-y-7">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Plan Your Journey</h2>
              <p className="text-stone-500 text-sm mt-1">Tell us the basics and we'll build a live tailored estimate.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <CountStepper
                label="Number of Nights"
                sublabel="Minimum 3 nights recommended"
                value={nights} min={3} max={21}
                onChange={setNights}
              />
              <CountStepper
                label="Number of Guests"
                sublabel="All ages welcome"
                value={guests} min={1} max={20}
                onChange={setGuests}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-900 leading-relaxed">
              <span className="font-semibold">About the SDF:</span> Bhutan's Sustainable Development Fee of{' '}
              <span className="font-semibold">$100 per person per night</span> is a mandatory government levy.
              It funds free healthcare, education, and Bhutan's carbon-neutral policies — and is already included in your estimate below.
            </div>

            <button onClick={() => setStep(1)} className="btn-primary w-full">
              Choose Accommodation <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1 — Hotel Tier */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Choose Your Accommodation Tier</h2>
              <p className="text-stone-500 text-sm mt-1">All properties are personally vetted by the Arise Bhutan team.</p>
            </div>

            <div className="space-y-3">
              {Object.entries(TIER_META).map(([key, meta]) => {
                const hotels  = accommodations.filter(a => a.tier === key)
                const prices  = hotels.map(h => Number(h.price_per_night))
                const range   = prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null
                const active  = tier === key

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTier(key)}
                    className={`w-full text-left rounded-2xl border-2 px-5 py-4 transition-all duration-200 ${
                      active ? 'border-amber-500 bg-amber-50' : 'border-stone-100 hover:border-amber-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-stone-900">{meta.label}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            active ? 'bg-amber-200 text-amber-800' : 'bg-stone-100 text-stone-500'
                          }`}>{meta.badge}</span>
                        </div>
                        <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">{meta.desc}</p>
                        <div className="flex items-center gap-0.5 mt-2.5">
                          {Array.from({ length: meta.stars }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          {range && (
                            <span className="ml-2 text-xs text-stone-400">
                              from <span className="font-semibold text-stone-700">${range.min.toLocaleString()}</span>
                              {range.min !== range.max && <> – ${range.max.toLocaleString()}</>}
                              /night
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                        active ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                      }`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-outline flex-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1">
                Add Activities <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Activities */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Curate Your Experiences</h2>
              <p className="text-stone-500 text-sm mt-1">
                Select any activities to add to your itinerary. Prices shown are per person.
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700'
                  }`}
                >
                  {CATEGORY_EMOJI[cat] || ''} {cat}
                </button>
              ))}
            </div>

            {/* Activity cards */}
            <div className="grid sm:grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-1 -mr-1">
              {visibleActivities.map(activity => {
                const isSelected = selectedIds.includes(activity.id)
                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => toggleActivity(activity.id)}
                    className={`text-left rounded-2xl border-2 px-4 py-3.5 transition-all duration-150 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-100 hover:border-amber-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 text-xs sm:text-sm leading-snug">{activity.name}</p>
                        <p className="text-stone-400 text-[11px] mt-1">
                          {activity.location} · {activity.duration_hours}h · {CATEGORY_EMOJI[activity.category]} {activity.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-sm font-bold text-stone-900">
                          ${Number(activity.cost_per_person).toFixed(0)}
                          <span className="text-stone-400 font-normal text-[10px]">/pp</span>
                        </span>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <Link
                href={`/contact?nights=${nights}&guests=${guests}&tier=${encodeURIComponent(tier)}`}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Get My Quote
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Live price summary ────────────────────────────────── */}
      <div className="lg:sticky lg:top-24">
        <div className="bg-stone-900 text-white rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Live Estimate</p>
          </div>

          {/* Line items */}
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between items-start gap-2">
              <span className="text-stone-400 leading-tight">SDF ($100 × {guests}p × {nights}n)</span>
              <span className="font-semibold text-white flex-shrink-0">${fmt(breakdown.sdfTotal)}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-stone-400 leading-tight">
                {TIER_META[tier]?.label || tier} ({nights} nights)
              </span>
              <span className="font-semibold text-white flex-shrink-0">${fmt(breakdown.hotelTotal)}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-stone-400 leading-tight">Guide + Vehicle ({nights} days)</span>
              <span className="font-semibold text-white flex-shrink-0">${fmt(breakdown.logisticsTotal)}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-stone-400 leading-tight">Visa processing (×{guests})</span>
              <span className="font-semibold text-white flex-shrink-0">${fmt(breakdown.visaTotal)}</span>
            </div>
            {selectedActivities.length > 0 && (
              <div className="flex justify-between items-start gap-2">
                <span className="text-stone-400 leading-tight">
                  {selectedActivities.length} {selectedActivities.length === 1 ? 'activity' : 'activities'} (×{guests}p)
                </span>
                <span className="font-semibold text-white flex-shrink-0">${fmt(breakdown.activitiesTotal)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-white/10 pt-5 mb-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-stone-400 text-xs mb-1">Estimated Total</p>
                <p className="font-serif text-4xl font-bold text-white leading-none">
                  ${fmt(breakdown.total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-stone-400 text-[11px]">per person</p>
                <p className="text-amber-400 text-lg font-bold">
                  ${fmt(breakdown.total / guests)}
                </p>
              </div>
            </div>
          </div>

          {/* Trip summary tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {[
              `${nights} nights`,
              `${guests} ${guests === 1 ? 'guest' : 'guests'}`,
              TIER_META[tier]?.label || tier,
              selectedActivities.length ? `${selectedActivities.length} ${selectedActivities.length === 1 ? 'activity' : 'activities'}` : null,
            ].filter(Boolean).map(tag => (
              <span key={tag} className="text-[11px] bg-white/10 text-stone-300 px-2.5 py-1 rounded-full">{tag}</span>
            ))}
          </div>

          {/* Caveat */}
          <p className="text-stone-500 text-[11px] leading-relaxed">
            Based on average rates for the selected tier. Flights and international transfers are not included.
            Your Arise Bhutan specialist will confirm final pricing — no payment required at this stage.
          </p>
        </div>
      </div>

    </div>
  )
}
