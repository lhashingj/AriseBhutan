'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Check, Plane, Calendar, Users, Hotel, MapPin, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

// SDF is a mandatory Royal Government of Bhutan levy — displayed to clients
const SDF_PER_PERSON_PER_NIGHT = 100   // USD

const HOTEL_RATES = {
  '3-Star': { label: '3-Star Heritage',  desc: 'Comfortable heritage hotels' },
  '4-Star': { label: '4-Star Boutique',  desc: 'Premium boutique properties' },
  '5-Star': { label: '5-Star Luxury',    desc: 'Amankora, Como Uma & equivalents' },
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

const STEP_LABELS = ['Template', 'Travel Details', 'Itinerary', 'Summary', 'Save']

// ─── Flight schedules ─────────────────────────────────────────────────────────
const INBOUND_FLIGHTS = [
  // Delhi → Paro
  { id: 'kb201',     airline: 'Druk Air',        flightNo: 'KB201', sector: 'Delhi → Paro',      depart: '12:30', arrive: '15:20', days: 'Daily (peak season)' },
  { id: 'kb203',     airline: 'Druk Air',        flightNo: 'KB203', sector: 'Delhi → Paro',      depart: '04:45', arrive: '07:15', days: 'Select days' },
  { id: 'b3774-del', airline: 'Bhutan Airlines', flightNo: 'B3774', sector: 'Delhi → Paro',      depart: '04:30', arrive: '07:10', days: 'Select days' },
  // Kolkata → Paro
  { id: 'b3701',     airline: 'Bhutan Airlines', flightNo: 'B3701', sector: 'Kolkata → Paro',    depart: '08:25', arrive: '09:55', days: 'Select days' },
  { id: 'kb211',     airline: 'Druk Air',        flightNo: 'KB211', sector: 'Kolkata → Paro',    depart: '13:20', arrive: '15:20', days: 'Mon, Wed, Fri, Sat' },
  // Kathmandu → Paro
  { id: 'b3774-ktm', airline: 'Bhutan Airlines', flightNo: 'B3774', sector: 'Kathmandu → Paro', depart: '14:20', arrive: '15:35', days: 'Select days' },
  { id: 'kb401',     airline: 'Druk Air',        flightNo: 'KB401', sector: 'Kathmandu → Paro', depart: '09:10', arrive: '10:30', days: 'Mon–Fri, Sun' },
  // Dhaka → Paro
  { id: 'kb301',     airline: 'Druk Air',        flightNo: 'KB301', sector: 'Dhaka → Paro',      depart: '09:20', arrive: '10:50', days: 'Mon, Wed, Fri–Sun' },
  // Bangkok → Paro
  { id: 'b3707',     airline: 'Bhutan Airlines', flightNo: 'B3707', sector: 'Bangkok → Paro',    depart: '08:30', arrive: '12:20', days: 'Daily' },
  // Singapore → Paro
  { id: 'kb501',     airline: 'Druk Air',        flightNo: 'KB501', sector: 'Singapore → Paro',  depart: '09:30', arrive: '—',     days: 'Select days' },
]

const OUTBOUND_FLIGHTS = [
  // Paro → Delhi
  { id: 'kb202',     airline: 'Druk Air',        flightNo: 'KB202', sector: 'Paro → Delhi',      depart: '11:55', arrive: '13:45', days: 'Daily (peak season)' },
  { id: 'b3773',     airline: 'Bhutan Airlines', flightNo: 'B3773', sector: 'Paro → Delhi',      depart: '10:50', arrive: '12:20', days: 'Select days' },
  // Paro → Kolkata
  { id: 'b3700-ccu', airline: 'Bhutan Airlines', flightNo: 'B3700', sector: 'Paro → Kolkata',    depart: '10:35', arrive: '11:15', days: 'Select days' },
  { id: 'kb210',     airline: 'Druk Air',        flightNo: 'KB210', sector: 'Paro → Kolkata',    depart: '11:20', arrive: '12:20', days: 'Mon, Wed, Fri, Sat' },
  // Paro → Kathmandu
  { id: 'b3771',     airline: 'Bhutan Airlines', flightNo: 'B3771', sector: 'Paro → Kathmandu', depart: '07:50', arrive: '08:55', days: 'Tue, Wed, Fri, Sun' },
  { id: 'kb400',     airline: 'Druk Air',        flightNo: 'KB400', sector: 'Paro → Kathmandu', depart: '07:10', arrive: '08:10', days: 'Mon–Fri, Sun' },
  // Paro → Dhaka
  { id: 'kb300',     airline: 'Druk Air',        flightNo: 'KB300', sector: 'Paro → Dhaka',      depart: '07:00', arrive: '08:30', days: 'Select days' },
  // Paro → Bangkok
  { id: 'b3700-bkk', airline: 'Bhutan Airlines', flightNo: 'B3700', sector: 'Paro → Bangkok',   depart: '10:35', arrive: '16:05', days: 'Via Kolkata' },
  // Paro → Singapore
  { id: 'kb500',     airline: 'Druk Air',        flightNo: 'KB500', sector: 'Paro → Singapore',  depart: '—',     arrive: '—',     days: 'Select days' },
]

function findFlight(list, flightNo, sector) {
  if (!flightNo && !sector) return null
  return list.find((f) => f.flightNo === flightNo && f.sector === sector) || null
}

const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white placeholder:text-stone-400'

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

// ─── Build initial days from tour itinerary data ──────────────────────────────
function buildInitialDays(tourData) {
  if (!tourData?.itinerary?.length) return []
  return tourData.itinerary.map((day, i) => {
    const meals = (day.meals || '').toLowerCase()
    const activitiesText = Array.isArray(day.activities)
      ? day.activities.join(', ')
      : (day.activities || day.description || '')
    return {
      title:      day.title || '',
      activities: activitiesText,
      hotel:      day.accommodation || '',
      breakfast:  meals.includes('breakfast'),
      lunch:      meals.includes('lunch'),
      dinner:     meals.includes('dinner'),
      date:       `Day ${i + 1}`,
    }
  })
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PackageBuilder({ profile, onClose, onSaved, initialTourData, editBooking }) {
  const isEditing = Boolean(editBooking)

  // When editing an existing booking or coming from a specific tour, skip the template picker
  const [step, setStep]         = useState(initialTourData || isEditing ? 1 : 0)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveErr] = useState('')

  // Build synthetic template from tour data or existing booking
  const initialTemplate = (() => {
    if (isEditing) {
      const itin = editBooking.itinerary_days || []
      const nights = itin.length > 0 ? itin.length - 1 : 0
      return { id: 'edit', title: editBooking.tour_title || 'Custom Package', days: itin.length || 1, nights, basePerPax: 0, category: 'Custom' }
    }
    if (initialTourData) {
      return {
        id:         initialTourData.id || 'tour',
        title:      initialTourData.title,
        days:       initialTourData.days   || 1,
        nights:     initialTourData.nights || 0,
        basePerPax: initialTourData.startingFrom || 0,
        category:   initialTourData.categoryLabel || 'Cultural',
      }
    }
    return TOUR_TEMPLATES[0]
  })()

  // Form state — pre-filled from editBooking or tour data when available
  const [template, setTemplate]     = useState(initialTemplate)
  const [hotelTier, setHotelTier]   = useState(editBooking?.hotel_tier || '3-Star')
  const [pax, setPax]               = useState(parseInt(editBooking?.group_size) || 2)
  const [arrivalDate, setArrival]   = useState(editBooking?.arrival_date || '')
  const [returnDate, setReturn]     = useState(editBooking?.return_date  || '')
  const [inboundFlightId, setInboundId]   = useState(() => {
    const match = findFlight(INBOUND_FLIGHTS, editBooking?.flight_arrival_no, editBooking?.flight_arrival)
    return match ? match.id : 'custom'
  })
  const [outboundFlightId, setOutboundId] = useState(() => {
    const match = findFlight(OUTBOUND_FLIGHTS, editBooking?.flight_return_no, editBooking?.flight_return)
    return match ? match.id : 'custom'
  })
  const [customFlightIn, setCustomIn]   = useState(editBooking?.flight_arrival || '')
  const [customFlightOut, setCustomOut] = useState(editBooking?.flight_return  || '')
  const [clientName, setClientName]     = useState(editBooking?.client_name    || profile?.name             || '')
  const [passportNum, setPassport]      = useState(editBooking?.passport_number || profile?.passport_number  || '')
  const [nationality, setNationality]   = useState(editBooking?.nationality    || profile?.nationality       || '')
  const [clientEmail, setClientEmail]   = useState(editBooking?.client_email   || profile?.email             || '')
  const [clientPhone, setClientPhone]       = useState(editBooking?.client_phone     || profile?.phone            || '')
  const [passportExpiry, setPassportExpiry] = useState(editBooking?.passport_expiry  || profile?.passport_expiry  || '')
  const [emergencyContact, setEmergency]    = useState(editBooking?.emergency_contact || profile?.emergency_contact || '')
  const [days, setDays]                 = useState(() =>
    isEditing
      ? (editBooking.itinerary_days || [])
      : buildInitialDays(initialTourData)
  )

  const isCustom   = template.id === 'custom'
  const nights     = arrivalDate && returnDate
    ? Math.max(0, Math.floor((new Date(returnDate) - new Date(arrivalDate)) / 86400000))
    : template.nights
  const totalDays  = nights + 1
  const sdfTotal   = nights > 0 ? SDF_PER_PERSON_PER_NIGHT * pax * nights : null

  // Rebuild days array when night count or arrival date changes.
  // Uses functional updater so prevDays is always current (no stale closure).
  useEffect(() => {
    setDays((prevDays) => Array.from({ length: totalDays }, (_, i) => {
      const existing = prevDays[i] || {}
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
  }, [totalDays, arrivalDate])

  function updateDay(i, k, v) {
    setDays((prev) => prev.map((d, idx) => idx === i ? { ...d, [k]: v } : d))
  }

  // Silently save travel details to the user's profile when they complete Step 1
  async function saveProfileDetails() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await supabase.from('profiles').update({
        name:              clientName.trim()       || undefined,
        phone:             clientPhone.trim()      || undefined,
        nationality:       nationality.trim()      || undefined,
        passport_number:   passportNum.trim()      || undefined,
        passport_expiry:   passportExpiry          || null,
        emergency_contact: emergencyContact.trim() || undefined,
      }).eq('id', session.user.id)
    } catch (_) {
      // non-blocking — ignore errors
    }
  }

  // Validation per step
  const valid = [
    true,
    clientName && passportNum && nationality && clientEmail && clientPhone && pax >= 1 && (isCustom ? (arrivalDate && returnDate && nights > 0) : true),
    days.every((d) => d.title.trim()),
    true,
    true,
  ]

  async function save() {
    setSaving(true)
    setSaveErr('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaveErr('Session expired. Please sign in again.'); setSaving(false); return }

    if (!session.user.email_confirmed_at) {
      setSaveErr('Please verify your email address before submitting a booking. Check your inbox for the confirmation link.')
      setSaving(false)
      return
    }

    const inFlight  = INBOUND_FLIGHTS.find((f) => f.id === inboundFlightId)  || null
    const outFlight = OUTBOUND_FLIGHTS.find((f) => f.id === outboundFlightId) || null

    const payload = {
      user_id:         session.user.id,
      client_name:     clientName,
      passport_number: passportNum,
      nationality:     nationality,
      client_email:    clientEmail,
      client_phone:      clientPhone,
      passport_expiry:   passportExpiry || null,
      emergency_contact: emergencyContact || null,
      group_size:      String(pax),
      tour_title:      template.title,
      hotel_tier:      hotelTier,
      flight_arrival:        inFlight ? inFlight.sector   : customFlightIn,
      flight_arrival_no:     inFlight ? inFlight.flightNo  : null,
      flight_arrival_depart: inFlight ? inFlight.depart    : null,
      flight_arrival_arrive: inFlight ? inFlight.arrive    : null,
      flight_return:         outFlight ? outFlight.sector  : customFlightOut,
      flight_return_no:      outFlight ? outFlight.flightNo : null,
      flight_return_depart:  outFlight ? outFlight.depart   : null,
      flight_return_arrive:  outFlight ? outFlight.arrive   : null,
      arrival_date:    arrivalDate || null,
      return_date:     returnDate  || null,
      itinerary_days:  days,
      cost_items:      [],
      subtotal:        null,
      gst:             null,
      total_cost:      null,
      status:          'PENDING',
      payment_status:  'UNPAID',
    }

    let saved, error
    if (isEditing) {
      ;({ error } = await supabase.from('bookings').update(payload).eq('id', editBooking.id))
      saved = { ...editBooking, ...payload }
    } else {
      ;({ data: saved, error } = await supabase.from('bookings').insert(payload).select().single())
      if (!error && saved) {
        // Mirror booking into admin Itineraries (fire-and-forget)
        fetch('/api/booking/sync-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking: saved }),
        }).catch(console.error)
      }
    }
    if (error) { setSaveErr(error.message); setSaving(false); return }

    onSaved(saved)
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
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              {isEditing ? `Edit: ${editBooking.tour_title || 'Booking'}` : initialTourData ? `Book: ${initialTourData.title}` : 'Build Custom Package'}
            </h2>
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
              {initialTourData ? (
                // Pre-selected tour — show confirmation card
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1">Selected Tour</h3>
                  <p className="text-stone-400 text-sm mb-4">Your itinerary has been pre-filled. You can edit every day in step 3.</p>
                  <div className="border-2 border-amber-500 bg-amber-50 rounded-2xl p-5 shadow-md shadow-amber-100">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="font-bold text-stone-900 text-base leading-snug">{initialTourData.title}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-300 bg-amber-100 text-amber-700 flex-shrink-0">
                        {initialTourData.categoryLabel || 'Tour'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mb-3">{initialTourData.subtitle || ''}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                      <p>📅 {initialTourData.days}D / {initialTourData.nights}N</p>
                      <p>🏔 {initialTourData.categoryLabel || 'Cultural Tour'}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-amber-600 text-xs font-medium">
                      <Check className="w-3 h-3" /> Pre-filled itinerary ready to review
                    </div>
                  </div>
                </div>
              ) : (
                // Standard template picker
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1">Choose a Journey Template</h3>
                  <p className="text-stone-400 text-sm">Start from a curated itinerary or build fully custom.</p>
                </div>
              )}
              {!initialTourData && (
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
                      {t.days > 0
                        ? <p className="text-xs text-stone-500">{t.days}D / {t.nights}N</p>
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
              )}
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
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name (as on passport) *</label>
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
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Passport Number *</label>
                    <input value={passportNum} onChange={(e) => setPassport(e.target.value)}
                      className={inputCls} placeholder="e.g. A1234567" autoComplete="off" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Nationality *</label>
                    <input value={nationality} onChange={(e) => setNationality(e.target.value)}
                      className={inputCls} placeholder="e.g. Indian, British, American" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address *</label>
                    <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                      className={inputCls} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone Number *</label>
                    <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                      className={inputCls} placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Passport Expiry Date</label>
                    <input type="date" value={passportExpiry} onChange={(e) => setPassportExpiry(e.target.value)}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Emergency Contact</label>
                    <input value={emergencyContact} onChange={(e) => setEmergency(e.target.value)}
                      className={inputCls} placeholder="Name & phone number" />
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

                {/* ── Flight picker ── */}
                {[
                  { label: 'Inbound Flight (→ Paro)', list: INBOUND_FLIGHTS, id: inboundFlightId, setId: setInboundId, custom: customFlightIn, setCustom: setCustomIn, placeholder: 'e.g. Delhi → Paro' },
                  { label: 'Outbound Flight (Paro →)', list: OUTBOUND_FLIGHTS, id: outboundFlightId, setId: setOutboundId, custom: customFlightOut, setCustom: setCustomOut, placeholder: 'e.g. Paro → Delhi' },
                ].map(({ label, list, id, setId, custom, setCustom, placeholder }) => {
                  const drukFlights   = list.filter((f) => f.airline === 'Druk Air')
                  const bhutanFlights = list.filter((f) => f.airline === 'Bhutan Airlines')
                  const selected      = list.find((f) => f.id === id) || null
                  return (
                    <div key={label}>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
                      <select value={id} onChange={(e) => setId(e.target.value)} className={inputCls}>
                        <option value="custom">— Enter manually —</option>
                        <optgroup label="Druk Air (KB)">
                          {drukFlights.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.flightNo} · {f.sector} · Dep {f.depart} → Arr {f.arrive}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Bhutan Airlines (B3)">
                          {bhutanFlights.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.flightNo} · {f.sector} · Dep {f.depart} → Arr {f.arrive}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      {id === 'custom' ? (
                        <input value={custom} onChange={(e) => setCustom(e.target.value)}
                          className={`${inputCls} mt-2`} placeholder={placeholder} />
                      ) : selected ? (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                          <span className="text-stone-500">Flight</span>   <span className="font-semibold text-stone-800">{selected.flightNo} · {selected.airline}</span>
                          <span className="text-stone-500">Sector</span>   <span className="font-semibold text-stone-800">{selected.sector}</span>
                          <span className="text-stone-500">Departure</span><span className="font-semibold text-stone-800">{selected.depart}</span>
                          <span className="text-stone-500">Arrival</span>  <span className="font-semibold text-stone-800">{selected.arrive}</span>
                          <span className="text-stone-500">Days</span>     <span className="text-stone-600">{selected.days}</span>
                        </div>
                      ) : null}
                    </div>
                  )
                })}

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

          {/* ── Step 3: Booking Summary ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">Booking Summary</h3>
                <p className="text-stone-400 text-sm">Review your selections — our team will prepare a personalised quote.</p>
              </div>

              {/* Trip overview */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">{template.title}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-xl py-3 px-2 border border-amber-100">
                    <p className="text-2xl font-bold text-stone-900">{pax}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Guests</p>
                  </div>
                  <div className="bg-white rounded-xl py-3 px-2 border border-amber-100">
                    <p className="text-2xl font-bold text-stone-900">{nights || template.nights}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Nights</p>
                  </div>
                  <div className="bg-white rounded-xl py-3 px-2 border border-amber-100">
                    <p className="text-sm font-bold text-stone-900 leading-tight">{hotelTier}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Hotel</p>
                  </div>
                </div>
                {arrivalDate && (
                  <p className="text-xs text-stone-500 text-center">
                    {arrivalDate}{returnDate ? ` → ${returnDate}` : ''}
                  </p>
                )}
              </div>

              {/* SDF info — mandatory government levy */}
              <div className="rounded-2xl border border-stone-200 overflow-hidden">
                <div className="bg-stone-800 px-4 py-3">
                  <p className="text-white text-xs font-semibold uppercase tracking-wide">Mandatory Government Levy</p>
                </div>
                <div className="bg-white px-4 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Sustainable Development Fee (SDF)</p>
                    <p className="text-xs text-stone-400 mt-0.5">$100 USD per person per night — Royal Government of Bhutan</p>
                  </div>
                  {sdfTotal !== null && (
                    <p className="text-lg font-bold text-amber-700">${sdfTotal.toLocaleString()}</p>
                  )}
                </div>
                <div className="bg-stone-50 px-4 py-3 border-t border-stone-100">
                  <p className="text-xs text-stone-400">
                    SDF is a non-negotiable government fee and the only fixed cost we can confirm upfront.
                    All other rates (accommodation, guide, vehicle) will be included in your personalised quote.
                  </p>
                </div>
              </div>

              {/* Quote note */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-4 flex gap-3 items-start">
                <span className="text-blue-500 text-lg mt-0.5">ℹ</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Personalised Quote to Follow</p>
                  <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                    After you save this booking, our specialist will review your itinerary and send a
                    complete, itemised quote to your email address within 24 hours.
                  </p>
                </div>
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
                  ['Guest',      clientName || '—'],
                  ['Passport',   passportNum || '—'],
                  ['Nationality',nationality || '—'],
                  ['Email',      clientEmail || '—'],
                  ['Phone',            clientPhone    || '—'],
                  ['Passport Expiry',  passportExpiry || '—'],
                  ['Emergency Contact',emergencyContact || '—'],
                  ['Tour',       template.title],
                  ['Duration',   `${totalDays} Days / ${nights} Nights`],
                  ['Group',      `${pax} pax`],
                  ['Hotel',      hotelTier],
                  ['Dates',      arrivalDate ? `${arrivalDate} → ${returnDate || '—'}` : 'Not set'],
                  ['Flight In',  (() => { const f = INBOUND_FLIGHTS.find((x) => x.id === inboundFlightId); return f ? `${f.flightNo} · ${f.sector} · Dep ${f.depart}` : customFlightIn || '—' })()],
                  ['Flight Out', (() => { const f = OUTBOUND_FLIGHTS.find((x) => x.id === outboundFlightId); return f ? `${f.flightNo} · ${f.sector} · Dep ${f.depart}` : customFlightOut || '—' })()],
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
                  : <><Save className="w-4 h-4" /> {isEditing ? 'Update Itinerary' : 'Save & Preview Voucher'}</>
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
              onClick={() => {
                if (step === 1) saveProfileDetails()
                setStep((s) => s + 1)
              }}
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
