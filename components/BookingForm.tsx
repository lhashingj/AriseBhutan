'use client'
import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronRight, AlertCircle, Minus, Plus, Star, Loader2 } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

interface Activity {
  id: string; name: string; location: string
  category: string; duration_hours: number
}

interface FormData {
  name: string; email: string; phone: string; country: string
  tourInterest: string; travelDate: string
  groupSize: number; nights: number; hotelTier: string
  selectedActivities: Activity[]
  interests: string[]; message: string
}

const INTERESTS = [
  'Cultural Heritage', 'Trekking & Adventure', 'Festival Experience', 'Photography',
  'Wellness & Meditation', 'Luxury Travel', 'Wildlife & Nature', 'Spiritual Journey',
]

const HOTEL_TIERS = [
  { id: '3-Star',        label: '3-Star Heritage', desc: 'Comfortable heritage hotels',          stars: 3 },
  { id: '4-Star',        label: '4-Star Boutique', desc: 'Premium boutique properties',          stars: 4 },
  { id: '5-Star Luxury', label: '5-Star Luxury',   desc: 'Amankora, Como Uma & equivalents',     stars: 5 },
]

const CATEGORY_EMOJI: Record<string, string> = {
  Cultural: '🏛️', Spiritual: '🙏', Trekking: '🥾',
  Adventure: '⚡', Wellness: '🌿', Photography: '📷',
}

const STEPS = ['Contact', 'Adventure Builder', 'Preferences']

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

function Stepper({ label, sublabel, value, min, max, onChange }: {
  label: string; sublabel?: string; value: number; min: number; max: number; onChange: (n: number) => void
}) {
  return (
    <div className="bg-stone-50 rounded-2xl p-4">
      <p className="text-sm font-semibold text-stone-700">{label}</p>
      {sublabel && <p className="text-xs text-stone-400 mt-0.5">{sublabel}</p>}
      <div className="flex items-center gap-4 mt-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="w-10 h-10 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:border-amber-400 hover:text-amber-600 disabled:opacity-30 transition-all">
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-3xl font-bold text-stone-900 w-10 text-center tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="w-10 h-10 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:border-amber-400 hover:text-amber-600 disabled:opacity-30 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function BookingForm({ defaultTour = '' }: { defaultTour?: string }) {
  const [step, setStep]           = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [bookingRef, setBookingRef]   = useState<string | null>(null)

  const [activities, setActivities]         = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  const [data, setData] = useState<FormData>({
    name: '', email: '', phone: '', country: '',
    tourInterest: defaultTour, travelDate: '',
    groupSize: 2, nights: 5, hotelTier: '4-Star',
    selectedActivities: [],
    interests: [], message: '',
  })

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData(d => ({ ...d, [k]: v }))

  const toggleInterest = (i: string) =>
    set('interests', data.interests.includes(i)
      ? data.interests.filter(x => x !== i)
      : [...data.interests, i])

  const toggleActivity = (a: Activity) =>
    set('selectedActivities', data.selectedActivities.some(x => x.id === a.id)
      ? data.selectedActivities.filter(x => x.id !== a.id)
      : [...data.selectedActivities, a])

  useEffect(() => {
    supabase
      .from('activities')
      .select('id, name, location, category, duration_hours')
      .eq('active', true)
      .order('category').order('name')
      .then(({ data: rows }) => {
        setActivities(rows ?? [])
        setActivitiesLoading(false)
      })
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(activities.map(a => a.category)))],
    [activities]
  )
  const visibleActivities = activeCategory === 'All'
    ? activities
    : activities.filter(a => a.category === activeCategory)

  // ── Success screen ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center py-10 sm:py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">Enquiry Received!</h3>
        <p className="text-stone-600 max-w-md mx-auto text-sm sm:text-base">
          Thank you, <strong>{data.name}</strong>! Our Bhutan travel specialist will contact you within 24 hours with a personalised quote.
        </p>
        {bookingRef && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 max-w-sm mx-auto text-left">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1.5">Your Booking Reference</p>
            <p className="font-mono font-bold text-amber-800 text-xl tracking-widest mb-3">{bookingRef}</p>
            <a
              href={`/itinerary/${bookingRef}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2"
            >
              Track your enquiry status →
            </a>
            <p className="text-xs text-stone-400 mt-2">A confirmation has been sent to {data.email}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center mb-7 sm:mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${i <= step ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`hidden sm:block ml-1.5 text-xs font-medium whitespace-nowrap ${i === step ? 'text-stone-900' : 'text-stone-400'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 sm:mx-3 ${i < step ? 'bg-amber-500' : 'bg-stone-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={async e => {
        e.preventDefault()
        setSubmitting(true)
        setSubmitError('')
        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.name,
              email: data.email,
              phone: data.phone,
              country: data.country,
              tourInterest: data.tourInterest,
              travelDate: data.travelDate,
              groupSize: String(data.groupSize),
              nights: data.nights,
              hotelTier: data.hotelTier,
              interests: data.interests,
              message: data.message,
              activitiesSelected: data.selectedActivities,
            }),
          })
          if (!res.ok) throw new Error('Failed')
          const json = await res.json()
          setBookingRef(json.booking_reference ?? null)
          setSubmitted(true)
        } catch {
          setSubmitError('Something went wrong. Please email us directly at arisebhutan@gmail.com.')
        } finally {
          setSubmitting(false)
        }
      }}>

        {/* ── Step 0: Contact ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name *</label>
                <input required value={data.name} onChange={e => set('name', e.target.value)}
                  className={inputCls} placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address *</label>
                <input required type="email" value={data.email} onChange={e => set('email', e.target.value)}
                  className={inputCls} placeholder="your@email.com" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone / WhatsApp</label>
                <input value={data.phone} onChange={e => set('phone', e.target.value)}
                  className={inputCls} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Country of Residence *</label>
                <input required value={data.country} onChange={e => set('country', e.target.value)}
                  className={inputCls} placeholder="e.g. United States" />
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)}
              disabled={!data.name || !data.email || !data.country}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 1: Adventure Builder ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Build Your Trip</h3>
              <p className="text-stone-500 text-xs mt-1">Set your trip basics, then pick activities to include.</p>
            </div>

            {/* Nights + Guests */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Stepper
                label="Number of Nights"
                sublabel="Min. 3 nights recommended"
                value={data.nights} min={3} max={21}
                onChange={v => set('nights', v)}
              />
              <Stepper
                label="Number of Guests"
                sublabel="All ages welcome"
                value={data.groupSize} min={1} max={20}
                onChange={v => set('groupSize', v)}
              />
            </div>

            {/* Hotel Tier */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Preferred Accommodation</label>
              <div className="space-y-2">
                {HOTEL_TIERS.map(t => (
                  <button key={t.id} type="button" onClick={() => set('hotelTier', t.id)}
                    className={`w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all duration-150 ${
                      data.hotelTier === t.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-100 hover:border-amber-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">{t.label}</p>
                        <p className="text-stone-400 text-xs mt-0.5">{t.desc}</p>
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: t.stars }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        data.hotelTier === t.id ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                      }`}>
                        {data.hotelTier === t.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tour + Travel Date */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Tour of Interest</label>
                <select value={data.tourInterest} onChange={e => set('tourInterest', e.target.value)} className={inputCls}>
                  <option value="">Select a tour (or describe below)</option>
                  <option>Classic Bhutan Cultural Tour — 5D/4N</option>
                  <option>Bhutan Heritage Trail — 7D/6N</option>
                  <option>Kingdom of Happiness — 10D/9N</option>
                  <option>Tiger&apos;s Nest Day Hike — 1 Day</option>
                  <option>Druk Path Trek — 6D/5N</option>
                  <option>Jomolhari Base Camp Trek — 9D/8N</option>
                  <option>Paro Tshechu Festival Tour — 5D/4N</option>
                  <option>Thimphu Tshechu Festival Tour — 5D/4N</option>
                  <option>Punakha Drubchen — 5D/4N</option>
                  <option>Bhutan Luxury Escape — 7D/6N</option>
                  <option>Bhutan Wellness Retreat — 8D/7N</option>
                  <option>Custom itinerary (please describe)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Preferred Travel Date</label>
                <input type="date" value={data.travelDate} onChange={e => set('travelDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls} />
              </div>
            </div>

            {/* Activities */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Pick Activities
                {data.selectedActivities.length > 0 && (
                  <span className="ml-2 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {data.selectedActivities.length}
                  </span>
                )}
              </label>

              {activitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <p className="text-stone-400 text-xs text-center py-4">No activities available yet.</p>
              ) : (
                <>
                  {/* Category filter */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {categories.map(cat => (
                      <button
                        key={cat} type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          activeCategory === cat
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700'
                        }`}
                      >
                        {CATEGORY_EMOJI[cat] || ''} {cat}
                      </button>
                    ))}
                  </div>

                  {/* Activity grid */}
                  <div className="grid sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 -mr-1">
                    {visibleActivities.map(a => {
                      const isSelected = data.selectedActivities.some(x => x.id === a.id)
                      return (
                        <button
                          key={a.id} type="button"
                          onClick={() => toggleActivity(a)}
                          className={`text-left rounded-2xl border-2 px-3.5 py-3 transition-all duration-150 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-stone-100 hover:border-amber-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-stone-900 text-xs leading-snug">{a.name}</p>
                              <p className="text-stone-400 text-[10px] mt-0.5">
                                {a.location} · {a.duration_hours}h · {CATEGORY_EMOJI[a.category]} {a.category}
                              </p>
                            </div>
                            <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                              isSelected ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
              <button type="button" onClick={() => setStep(2)} className="btn-primary flex-1">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Preferences ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">Special Interests (select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map(interest => (
                  <button
                    type="button" key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-xs sm:text-sm transition-all min-h-[44px] ${
                      data.interests.includes(interest)
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium'
                        : 'border-stone-200 text-stone-600 hover:border-amber-300'
                    }`}
                  >
                    {data.interests.includes(interest) && <Check className="w-3 h-3 inline mr-1 flex-shrink-0" />}
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Additional Notes or Questions</label>
              <textarea value={data.message} onChange={e => set('message', e.target.value)} rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Any dietary requirements, accessibility needs, or specific interests you'd like us to know..." />
            </div>
            {submitError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1" disabled={submitting}>Back</button>
              <button type="submit" className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                  : <><Check className="w-4 h-4" /> Submit Enquiry</>
                }
              </button>
            </div>
            <p className="text-xs text-stone-400 text-center">We respond within 24 hours. No payment required at this stage.</p>
          </div>
        )}
      </form>
    </div>
  )
}
