'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ChevronRight, ChevronLeft, Check, Star,
  Minus, Plus, Sparkles, AlertCircle, CheckCircle2,
  Moon, Users, MapPin, Send,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

// ── Constants ─────────────────────────────────────────────────

const STEPS = ['Core Details', 'Accommodation', 'Activities']

const TIER_META = {
  '3-Star': {
    label: 'Premium 3-Star',
    badge: 'Best Value',
    desc:  'Comfortable, authentic Bhutanese hospitality at well-reviewed properties with warm local character.',
    stars: 3,
  },
  '4-Star': {
    label: '4-Star Deluxe',
    badge: 'Most Popular',
    desc:  'Elegant rooms, superior dining, and sweeping valley views — the sweet spot for discerning travellers.',
    stars: 4,
  },
  '5-Star Luxury': {
    label: 'Ultra-Luxury',
    badge: 'Exclusive',
    desc:  'COMO, Aman, Six Senses — world-renowned properties with butler service and bespoke Bhutan experiences.',
    stars: 5,
  },
}

const CATEGORY_EMOJI = {
  Cultural:    '🏛️',
  Spiritual:   '🙏',
  Trekking:    '🥾',
  Adventure:   '⚡',
  Wellness:    '🌿',
  Photography: '📷',
  Nature:      '🌲',
  Leisure:     '🎭',
}

// ── Sub-components ─────────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
            i < current   ? 'bg-amber-600 text-white' :
            i === current ? 'bg-amber-600 text-white ring-4 ring-amber-100 dark:ring-amber-500/20' :
                            'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500'
          }`}>
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`hidden sm:block ml-2 text-xs font-medium whitespace-nowrap transition-colors ${
            i === current ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'
          }`}>{label}</span>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${i < current ? 'bg-amber-400' : 'bg-stone-200 dark:bg-stone-700'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function CountStepper({ label, sublabel, value, min, max, onChange }) {
  return (
    <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-5 transition-colors duration-300">
      <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">{label}</p>
      {sublabel && <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{sublabel}</p>}
      <div className="flex items-center gap-4 mt-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500/50 dark:hover:text-amber-400 disabled:opacity-30 transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-3xl font-bold text-stone-900 dark:text-stone-50 w-10 text-center tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500/50 dark:hover:text-amber-400 disabled:opacity-30 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl shadow-lg dark:shadow-black/40 border border-stone-100 dark:border-stone-800 p-8 flex flex-col items-center justify-center min-h-[420px] gap-4 transition-colors duration-300">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 dark:text-stone-500 text-sm">Loading your adventure builder…</p>
      </div>
      <div className="bg-stone-900 rounded-3xl p-6 animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded-full w-28" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-white/5 rounded-2xl" />
          <div className="h-16 bg-white/5 rounded-2xl" />
        </div>
        <div className="h-14 bg-white/5 rounded-2xl" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-3 bg-white/10 rounded-full w-full" />)}
        </div>
      </div>
    </div>
  )
}

// ── Itinerary Summary Showcase (right panel) ───────────────────

function ItinerarySummary({ nights, guests, tier, selectedActivities }) {
  const meta = TIER_META[tier]
  return (
    <div className="bg-stone-900 text-white rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-4 h-4 text-amber-400" />
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Your Itinerary</p>
      </div>

      {/* Trip Overview */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/5 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold">Nights</p>
          </div>
          <p className="text-3xl font-bold text-white leading-none">{nights}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold">Guests</p>
          </div>
          <p className="text-3xl font-bold text-white leading-none">{guests}</p>
        </div>
      </div>

      {/* Accommodation Tier */}
      <div className="mb-5">
        <p className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold mb-2">Accommodation</p>
        <div className={`rounded-xl p-3.5 ${tier === '5-Star Luxury' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5'}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-white font-semibold text-sm">{meta?.label}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              tier === '5-Star Luxury' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-stone-400'
            }`}>{meta?.badge}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: meta?.stars ?? 3 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Selected Experiences */}
      <div className="mb-6">
        <p className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold mb-2">
          Experiences {selectedActivities.length > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {selectedActivities.length}
            </span>
          )}
        </p>

        {selectedActivities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
            <Sparkles className="w-4 h-4 text-stone-600 mx-auto mb-2" />
            <p className="text-stone-500 text-xs leading-relaxed">
              Select experiences in Step 3 to build your itinerary
            </p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {selectedActivities.map(a => (
              <li key={a.id} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-medium leading-snug">
                    {a.emoji ? `${a.emoji} ` : ''}{a.name}
                  </p>
                  <p className="text-stone-500 text-[10px] mt-0.5">
                    {CATEGORY_EMOJI[a.category]} {a.category}
                    {a.location ? ` · ${a.location}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-stone-500 text-[11px] leading-relaxed">
          Your specialist will review this itinerary and respond within 24 hours with a personalised proposal. No payment required at this stage.
        </p>
      </div>
    </div>
  )
}

// ── Success screen ─────────────────────────────────────────────

function SuccessScreen({ nights, guests, tier, selectedActivities }) {
  const meta = TIER_META[tier]
  return (
    <div className="text-center py-8 space-y-5">
      <div className="relative mx-auto w-16 h-16">
        <div className="absolute inset-0 bg-green-100 dark:bg-green-500/15 rounded-full animate-ping opacity-40" />
        <div className="relative w-16 h-16 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">Itinerary Submitted!</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
          Our Bhutan travel specialist will personally review your selections and reach out within{' '}
          <span className="font-semibold text-stone-700 dark:text-stone-200">24 hours</span> with a tailored proposal.
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-2xl p-5 text-left space-y-3 max-w-sm mx-auto">
        <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Your Selections</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white dark:bg-stone-900 rounded-xl px-3 py-2 text-center border border-amber-100 dark:border-amber-500/20">
            <p className="font-bold text-stone-900 dark:text-stone-50 text-lg">{nights}</p>
            <p className="text-stone-400 dark:text-stone-500 text-xs">nights</p>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-xl px-3 py-2 text-center border border-amber-100 dark:border-amber-500/20">
            <p className="font-bold text-stone-900 dark:text-stone-50 text-lg">{guests}</p>
            <p className="text-stone-400 dark:text-stone-500 text-xs">guests</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
          <div className="flex gap-0.5">
            {Array.from({ length: meta?.stars ?? 3 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-medium">{meta?.label}</span>
        </div>
        {selectedActivities.length > 0 && (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedActivities.length}</span>{' '}
            {selectedActivities.length === 1 ? 'experience' : 'experiences'} selected
          </p>
        )}
      </div>

      <p className="text-xs text-stone-400 dark:text-stone-500">
        You can also reach us directly at{' '}
        <a href="mailto:arisebhutan@gmail.com" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
          arisebhutan@gmail.com
        </a>
      </p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

export default function AdventureBuilder() {
  const [step, setStep]                 = useState(0)
  const [nights, setNights]             = useState(7)
  const [guests, setGuests]             = useState(2)
  const [tier, setTier]                 = useState('4-Star')
  const [selectedIds, setSelectedIds]   = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [submitting, setSubmitting]     = useState(false)
  const [submitted, setSubmitted]       = useState(false)
  const [submitError, setSubmitError]   = useState('')

  const [activities, setActivities] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // ── Fetch activities from Supabase ───────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const { data, error: e } = await supabase
          .from('activities')
          .select('id, name, location, category, duration_hours, emoji, price_label')
          .eq('active', true)
          .order('category')
          .order('name')
        if (e) throw e
        setActivities(data ?? [])
      } catch (err) {
        console.error('AdventureBuilder fetch error:', err)
        setError('Could not load activity data. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Derived ──────────────────────────────────────────────────
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

  const toggleActivity = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  // ── Submit to Supabase ───────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const { error: insertErr } = await supabase
        .from('itinerary_requests')
        .insert({
          nights,
          guests,
          tier,
          selected_activities: selectedActivities.map(a => ({
            id:             a.id,
            name:           a.name,
            location:       a.location,
            category:       a.category,
            duration_hours: a.duration_hours,
            emoji:          a.emoji,
            price_label:    a.price_label,
          })),
          status: 'pending_review',
        })
      if (insertErr) throw insertErr
      setSubmitted(true)
    } catch (err) {
      console.error('AdventureBuilder submit error:', err)
      setSubmitError(
        'Submission failed — please try again or email us directly at arisebhutan@gmail.com.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />

  if (error) return (
    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-5 max-w-lg mx-auto my-8">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-800 dark:text-red-300 text-sm">Unable to load activity data</p>
        <p className="text-red-600 dark:text-red-400 text-sm mt-0.5">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-xs font-semibold text-red-700 dark:text-red-400 underline underline-offset-2"
        >
          Refresh page
        </button>
      </div>
    </div>
  )

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">

      {/* ── Wizard panel ────────────────────────────────────── */}
      <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl shadow-lg dark:shadow-black/40 border border-stone-100 dark:border-stone-800 p-6 sm:p-8 transition-colors duration-300">

        {submitted ? (
          <SuccessScreen
            nights={nights} guests={guests}
            tier={tier} selectedActivities={selectedActivities}
          />
        ) : (
          <>
            <StepIndicator current={step} />

            {/* STEP 0 — Core Details */}
            {step === 0 && (
              <div className="space-y-7">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">Plan Your Journey</h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
                    Tell us the basics and our team will craft a personalised Bhutan itinerary for you.
                  </p>
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

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-2xl px-5 py-4 text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                  <span className="font-semibold">About travel to Bhutan:</span>{' '}
                  All international visitors are required to pay the Sustainable Development Fee (SDF), a mandatory government
                  levy that funds Bhutan's free healthcare, education, and carbon-neutral environmental policies.
                  Your specialist will include this in your personalised quote.
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
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">Choose Your Accommodation Tier</h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
                    All properties are personally vetted by the Arise Bhutan team.
                  </p>
                </div>

                <div className="space-y-3">
                  {Object.entries(TIER_META).map(([key, meta]) => {
                    const active = tier === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTier(key)}
                        className={`w-full text-left rounded-2xl border-2 px-5 py-4 transition-all duration-200 ${
                          active ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-stone-100 dark:border-stone-700 hover:border-amber-200 dark:hover:border-amber-500/40 bg-white dark:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-stone-900 dark:text-stone-100">{meta.label}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                active ? 'bg-amber-200 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                              }`}>{meta.badge}</span>
                            </div>
                            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">{meta.desc}</p>
                            <div className="flex items-center gap-0.5 mt-2.5">
                              {Array.from({ length: meta.stars }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                            active ? 'border-amber-500 bg-amber-500' : 'border-stone-300 dark:border-stone-600'
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
                    Select Activities <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Activities */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50">Curate Your Experiences</h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
                    Select any activities or experiences to include — our specialist will confirm availability and costs.
                  </p>
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                        activeCategory === cat
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-amber-300 dark:hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-400'
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
                    const priceLabel = activity.price_label
                    const isFree     = priceLabel === 'No Additional Cost'
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => toggleActivity(activity.id)}
                        className={`text-left rounded-2xl border-2 px-4 py-3.5 transition-all duration-150 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                            : 'border-stone-100 dark:border-stone-700 hover:border-amber-200 dark:hover:border-amber-500/40 bg-white dark:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-stone-900 dark:text-stone-100 text-xs sm:text-sm leading-snug">
                              {activity.emoji ? `${activity.emoji} ` : ''}{activity.name}
                            </p>
                            <p className="text-[11px] mt-1">
                              {priceLabel ? (
                                <span className={isFree ? 'text-green-600 dark:text-green-400 font-medium' : 'text-amber-700 dark:text-amber-400 font-medium'}>
                                  {priceLabel}
                                </span>
                              ) : (
                                <span className="text-stone-400 dark:text-stone-500">
                                  {activity.location}{activity.duration_hours ? ` · ${activity.duration_hours}h` : ''} · {CATEGORY_EMOJI[activity.category]} {activity.category}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                            isSelected ? 'border-amber-500 bg-amber-500' : 'border-stone-300 dark:border-stone-600'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Error */}
                {submitError && (
                  <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1" disabled={submitting}>
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Custom Itinerary for Personal Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Itinerary Summary Showcase ────────────────────────── */}
      <div className="lg:sticky lg:top-24">
        <ItinerarySummary
          nights={nights}
          guests={guests}
          tier={tier}
          selectedActivities={selectedActivities}
        />
      </div>

    </div>
  )
}
