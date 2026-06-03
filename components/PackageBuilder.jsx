'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Check, Plane, Calendar, Users, Hotel, MapPin, DollarSign, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

// ─── Pricing constants ────────────────────────────────────────────────────────
const SDF_PER_PERSON_PER_NIGHT = 100   // USD — Bhutan Sustainable Development Fee
const GUIDE_PER_DAY            = 80    // USD — licensed guide + transport

const HOTEL_RATES = {
  '3-Star': { rate: 80,  label: '3-Star Heritage',  desc: 'Comfortable heritage hotels' },
  '4-Star': { rate: 150, label: '4-Star Boutique',  desc: 'Premium boutique properties' },
  '5-Star': { rate: 300, label: '5-Star Luxury',    desc: 'Amankora, Como Uma & equivalents' },
}

const TOUR_TEMPLATES = [
  { id: 'classic',   title: 'Classic Cultural Tour',   days: 5, nights: 4, basePerPax: 1850, category: 'Cultural' },
  { id: 'heritage',  title: 'Heritage Trail',          days: 7, nights: 6, basePerPax: 2400, category: 'Cultural' },
  { id: 'trek',      title: "Tiger's Nest Trek",       days: 2, nights: 1, basePerPax:  850, category: 'Adventure' },
  { id: 'festival',  title: 'Paro Tshechu Festival',   days: 5, nights: 4, basePerPax: 2100, category: 'Festival' },
  { id: 'luxury',    title: 'Luxury Bhutan Escape',    days: 7, nights: 6, basePerPax: 4500, category: 'Luxury' },
  { id: 'custom',    title: 'Custom Package',          days: 0, nights: 0, basePerPax:    0, category: 'Custom' },
]

const CAT_COLOR = {
  Cultural:  'border-blue-300  bg-blue-50  text-blue-700',
  Adventure: 'border-green-300 bg-green-50 text-green-700',
  Festival:  'border-purple-300 bg-purple-50 text-purple-700',
  Luxury:    'border-amber-300  bg-amber-50  text-amber-700',
  Custom:    'border-stone-300  bg-stone-50  text-stone-600',
}

const STEP_LABELS = ['Template', 'Travel Details', 'Itinerary', 'Cost Review', 'Save']

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

// ─── Cost calculator ──────────────────────────────────────────────────────────
function calcCosts({ template, hotelTier, pax, nights, isCustom }) {
  const days      = nights + 1
  const hotel     = HOTEL_RATES[hotelTier] || HOTEL_RATES['3-Star']
  const rooms     = Math.ceil(pax / 2)

  let packageBase, sdf, guideTransport, subtotal, gst, total
  const items = []

  if (!isCustom && template.basePerPax > 0) {
    packageBase    = template.basePerPax * pax
    sdf            = SDF_PER_PERSON_PER_NIGHT * pax * nights
    guideTransport = 0 // included in template

    items.push({ label: `${template.title} (per-person rate)`, calc: `$${template.basePerPax.toLocaleString()} × ${pax} pax`, amount: packageBase })
    items.push({ label: 'Sustainable Development Fee (SDF)', calc: `$${SDF_PER_PERSON_PER_NIGHT}/pax/night × ${nights}N × ${pax}`, amount: sdf })
  } else {
    const hotelTotal  = hotel.rate * rooms * nights
    guideTransport    = GUIDE_PER_DAY * days
    sdf               = SDF_PER_PERSON_PER_NIGHT * pax * nights
    packageBase       = hotelTotal + guideTransport

    items.push({ label: `Accommodation (${hotel.label})`, calc: `$${hotel.rate}/room/night × ${rooms} room(s) × ${nights}N`, amount: hotelTotal })
    items.push({ label: 'Guide & Private Transport',      calc: `$${GUIDE_PER_DAY}/day × ${days} days`, amount: guideTransport })
    items.push({ label: 'Sustainable Development Fee (SDF)', calc: `$${SDF_PER_PERSON_PER_NIGHT}/pax/night × ${nights}N × ${pax}`, amount: sdf })
  }

  subtotal = packageBase + sdf
  gst      = parseFloat((subtotal * 0.05).toFixed(2))
  total    = parseFloat((subtotal + gst).toFixed(2))

  return { items, subtotal, gst, total }
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center gap-1 mb-7">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className={`flex items-center ${i < STEP_LABELS.length - 1 ? 'flex-1' : ''}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
            i < current  ? 'bg-amber-600 text-white'
            : i === current ? 'bg-amber-600 text-white ring-4 ring-amber-100'
            : 'bg-stone-100 text-stone-400'
          }`}>
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`hidden sm:block ml-1.5 text-xs font-medium whitespace-nowrap ${i === current ? 'text-stone-800' : 'text-stone-400'}`}>
            {label}
          </span>
          {i < STEP_LABELS.length - 1 && (
            <div className={`flex-1 h-px mx-2 ${i < current ? 'bg-amber-500' : 'bg-stone-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PackageBuilder({ profile, onClose, onSaved }) {
  const [step, setStep]         = useState(0)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveErr] = useState('')

  // Form state
  const [template, setTemplate]     = useState(TOUR_TEMPLATES[0])
  const [hotelTier, setHotelTier]   = useState('3-Star')
  const [pax, setPax]               = useState(2)
  const [arrivalDate, setArrival]   = useState('')
  const [returnDate, setReturn]     = useState('')
  const [flightIn, setFlightIn]     = useState('')
  const [flightOut, setFlightOut]   = useState('')
  const [clientName, setClientName] = useState(profile?.name || '')
  const [days, setDays]             = useState([])

  const isCustom   = template.id === 'custom'
  const nights     = arrivalDate && returnDate
    ? Math.max(0, Math.floor((new Date(returnDate) - new Date(arrivalDate)) / 86400000))
    : template.nights
  const totalDays  = nights + 1
  const costs      = calcCosts({ template, hotelTier, pax, nights, isCustom })

  // Rebuild days array when nights changes
  useEffect(() => {
    setDays(Array.from({ length: totalDays }, (_, i) => {
      const existing = days[i] || {}
      const date = arrivalDate
        ? new Date(new Date(arrivalDate).getTime() + i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : `Day ${i + 1}`
      return {
        title:      existing.title      || '',
        activities: existing.activities || '',
        hotel:      existing.hotel      || '',
        breakfast:  existing.breakfast  ?? (i > 0),
        lunch:      existing.lunch      ?? true,
        dinner:     existing.dinner     ?? (i < totalDays - 1),
        date,
      }
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDays, arrivalDate])

  function updateDay(i, k, v) {
    setDays((prev) => prev.map((d, idx) => idx === i ? { ...d, [k]: v } : d))
  }

  // Validation per step
  const valid = [
    true,
    clientName && pax >= 1 && (isCustom ? (arrivalDate && returnDate && nights > 0) : true),
    days.every((d) => d.title.trim()),
    true,
    true,
  ]

  async function save() {
    setSaving(true)
    setSaveErr('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaveErr('Session expired. Please sign in again.'); setSaving(false); return }

    const payload = {
      user_id:        session.user.id,
      client_name:    clientName,
      group_size:     String(pax),
      tour_title:     template.title,
      hotel_tier:     hotelTier,
      flight_arrival: flightIn,
      flight_return:  flightOut,
      arrival_date:   arrivalDate || null,
      return_date:    returnDate  || null,
      itinerary_days: days,
      cost_items:     costs.items,
      subtotal:       costs.subtotal,
      gst:            costs.gst,
      total_cost:     costs.total,
      status:         'PENDING',
    }

    const { error } = await supabase.from('bookings').insert(payload)
    if (error) { setSaveErr(error.message); setSaving(false); return }

    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white flex-shrink-0">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg">Build Custom Package</h2>
            <p className="text-stone-400 text-xs">Step {step + 1} of {STEP_LABELS.length}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <StepBar current={step} />

          {/* ── Step 0: Template ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Choose a Journey Template</h3>
                <p className="text-stone-400 text-sm">Start from a curated itinerary or build fully custom.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {TOUR_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      template.id === t.id
                        ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-stone-900 text-sm leading-snug">{t.title}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${CAT_COLOR[t.category]}`}>
                        {t.category}
                      </span>
                    </div>
                    {t.basePerPax > 0
                      ? <p className="text-xs text-stone-500">{t.days}D / {t.nights}N · from ${t.basePerPax.toLocaleString()}/pax</p>
                      : <p className="text-xs text-stone-500">Fully custom — set your own parameters</p>
                    }
                    {template.id === t.id && (
                      <div className="mt-2 flex items-center gap-1 text-amber-600 text-xs font-medium">
                        <Check className="w-3 h-3" /> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Travel Details ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Travel Details</h3>
                <p className="text-stone-400 text-sm">Client info, dates, flights, and hotel preference.</p>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Guest Name *</label>
                    <input value={clientName} onChange={(e) => setClientName(e.target.value)}
                      className={inputCls} placeholder="Full name on passport" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Group Size *</label>
                    <input type="number" min={1} max={50} value={pax}
                      onChange={(e) => setPax(Math.max(1, parseInt(e.target.value) || 1))}
                      className={inputCls} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Arrival Date {isCustom && '*'}
                    </label>
                    <input type="date" value={arrivalDate}
                      onChange={(e) => setArrival(e.target.value)}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Return Date {isCustom && '*'}
                    </label>
                    <input type="date" value={returnDate}
                      min={arrivalDate}
                      onChange={(e) => setReturn(e.target.value)}
                      className={inputCls} />
                  </div>
                </div>

                {nights > 0 && (
                  <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg font-medium">
                    ✓ {totalDays} Days / {nights} Nights detected
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Inbound Flight Sector
                    </label>
                    <input value={flightIn} onChange={(e) => setFlightIn(e.target.value)}
                      className={inputCls} placeholder="e.g. Delhi → Paro" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Outbound Flight Sector
                    </label>
                    <input value={flightOut} onChange={(e) => setFlightOut(e.target.value)}
                      className={inputCls} placeholder="e.g. Paro → Delhi" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Hotel Tier</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(HOTEL_RATES).map(([tier, info]) => (
                      <button key={tier} type="button" onClick={() => setHotelTier(tier)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          hotelTier === tier
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}>
                        <p className="font-semibold text-stone-900 text-sm">{tier}</p>
                        <p className="text-xs text-stone-500 mt-0.5">${info.rate}/room/night</p>
                        <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{info.desc}</p>
                        {hotelTier === tier && <Check className="w-3 h-3 text-amber-600 mt-1" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Day-by-Day Itinerary ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Day-by-Day Itinerary</h3>
                <p className="text-stone-400 text-sm">{totalDays} days · {nights} nights. Fill in activities for each day.</p>
              </div>

              <div className="space-y-4">
                {days.map((day, i) => (
                  <div key={i} className="border border-stone-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 border-b border-stone-200">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">Day {i + 1}</p>
                        <p className="text-xs text-stone-400">{day.date}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          Day Title / Destination *
                        </label>
                        <input
                          value={day.title}
                          onChange={(e) => updateDay(i, 'title', e.target.value)}
                          className={inputCls}
                          placeholder={i === 0 ? 'Arrival in Paro' : i === days.length - 1 ? 'Departure Day' : 'e.g. Thimphu Culture Day'}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          Activities & Highlights
                        </label>
                        <textarea
                          value={day.activities}
                          onChange={(e) => updateDay(i, 'activities', e.target.value)}
                          rows={2}
                          className={`${inputCls} resize-none`}
                          placeholder="e.g. Tiger's Nest hike, Drukgyal Dzong ruins, Hot stone bath"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Hotel / Accommodation</label>
                          <input
                            value={day.hotel}
                            onChange={(e) => updateDay(i, 'hotel', e.target.value)}
                            className={inputCls}
                            placeholder={`${hotelTier} property`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-2">Meals Included</label>
                          <div className="flex gap-3">
                            {[['breakfast', 'B'], ['lunch', 'L'], ['dinner', 'D']].map(([key, abbr]) => (
                              <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={day[key]}
                                  onChange={(e) => updateDay(i, key, e.target.checked)}
                                  className="w-3.5 h-3.5 accent-amber-600"
                                />
                                <span className="text-xs font-medium text-stone-600">{abbr}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Cost Review ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Cost Breakdown</h3>
                <p className="text-stone-400 text-sm">Auto-calculated for {pax} pax · {nights} nights · {hotelTier}</p>
              </div>

              {/* Cost matrix */}
              <div className="rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-stone-800 text-white">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Cost Item</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">Calculation</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costs.items.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-3 text-sm text-stone-700 font-medium">{row.label}</td>
                        <td className="px-4 py-3 text-xs text-stone-400 text-right">{row.calc}</td>
                        <td className="px-4 py-3 text-sm text-stone-900 font-semibold text-right">
                          ${row.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-amber-50">
                      <td className="px-4 py-3 font-semibold text-stone-800 text-sm">Sub-total</td>
                      <td />
                      <td className="px-4 py-3 font-bold text-stone-900 text-right">${costs.subtotal.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-3 text-sm text-stone-600">GST (5%)</td>
                      <td className="px-4 py-3 text-xs text-stone-400 text-right">5% on sub-total</td>
                      <td className="px-4 py-3 text-sm font-medium text-stone-900 text-right">${costs.gst.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-stone-900">
                      <td colSpan={2} className="px-4 py-4 text-white font-bold text-sm uppercase tracking-wide">
                        Grand Total (USD)
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-amber-400 font-bold text-xl">${costs.total.toLocaleString()}</span>
                      </td>
                    </tr>
                    <tr className="bg-amber-700">
                      <td colSpan={2} className="px-4 py-3 text-white font-semibold text-xs uppercase tracking-wide">
                        Equivalent (INR @ ₹83.50)
                      </td>
                      <td className="px-4 py-3 text-right text-white font-bold text-base">
                        ₹{Math.round(costs.total * 83.5).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Notes */}
              <div className="text-xs text-stone-400 space-y-1 px-1">
                <p>• SDF ($100/person/night) is a mandatory Royal Govt. of Bhutan levy, non-negotiable.</p>
                <p>• INR rate for reference only. All billing in USD.</p>
                <p>• Quote valid 14 days from save date. Final pricing confirmed on booking approval.</p>
              </div>

              {/* Summary pill */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">{template.title}</p>
                  <p className="text-stone-700 text-sm mt-0.5">{pax} pax · {nights}N · {hotelTier}</p>
                </div>
                <p className="text-2xl font-bold text-stone-900">${costs.total.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* ── Step 4: Save ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Review & Save</h3>
                <p className="text-stone-400 text-sm">Your package will be saved with PENDING status and reviewed by our team.</p>
              </div>

              <div className="bg-stone-50 rounded-2xl border border-stone-200 divide-y divide-stone-200">
                {[
                  ['Guest',     clientName || '—'],
                  ['Tour',      template.title],
                  ['Duration',  `${totalDays} Days / ${nights} Nights`],
                  ['Group',     `${pax} pax`],
                  ['Hotel',     hotelTier],
                  ['Dates',     arrivalDate ? `${arrivalDate} → ${returnDate || '—'}` : 'Not set'],
                  ['Flight In', flightIn || '—'],
                  ['Flight Out',flightOut || '—'],
                  ['Total USD', `$${costs.total.toLocaleString()}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-semibold text-stone-900">{val}</span>
                  </div>
                ))}
              </div>

              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {saveError}
                </div>
              )}

              <button
                onClick={save}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving package…</>
                  : <><Save className="w-4 h-4" /> Save Package to My Portal</>
                }
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 bg-white flex-shrink-0">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="btn-outline text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!valid[step]}
              className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
