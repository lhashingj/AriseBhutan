'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import {
  RefreshCw, Search, X, ChevronRight, ChevronDown, Plane, MapPin,
  User, Calendar, DollarSign, Loader2, CheckCircle2,
  Clock, FileText, AlertTriangle, ExternalLink, Mail,
  Plus, Trash2, BedDouble, ListChecks, ShieldAlert,
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import AdminTravelDocuments from '@/components/AdminTravelDocuments'
import AdminBookingGuests from '@/components/AdminBookingGuests'

// ── Flight reference data ─────────────────────────────────────
const FLIGHT_SECTORS = [
  'Bangkok (BKK) → Paro (PBH)',
  'Paro (PBH) → Bangkok (BKK)',
  'Delhi (DEL) → Paro (PBH)',
  'Paro (PBH) → Delhi (DEL)',
  'Mumbai (BOM) → Paro (PBH)',
  'Paro (PBH) → Mumbai (BOM)',
  'Kathmandu (KTM) → Paro (PBH)',
  'Paro (PBH) → Kathmandu (KTM)',
  'Singapore (SIN) → Paro (PBH)',
  'Paro (PBH) → Singapore (SIN)',
  'Kolkata (CCU) → Paro (PBH)',
  'Paro (PBH) → Kolkata (CCU)',
  'Dhaka (DAC) → Paro (PBH)',
  'Paro (PBH) → Dhaka (DAC)',
  'Kuala Lumpur (KUL) → Paro (PBH)',
  'Paro (PBH) → Kuala Lumpur (KUL)',
]

const AIRLINES = ['Druk Air (KB)', 'Bhutan Airlines (B3)']

// Pre-fill helper: common flight numbers by sector keyword
const SECTOR_FLIGHTS = {
  'Bangkok': { 'Druk Air (KB)': ['KB 131', 'KB 132'], 'Bhutan Airlines (B3)': ['B3 700', 'B3 701', 'B3 707'] },
  'Delhi':   { 'Druk Air (KB)': ['KB 200', 'KB 201'], 'Bhutan Airlines (B3)': ['B3 710', 'B3 711'] },
  'Mumbai':  { 'Druk Air (KB)': ['KB 210', 'KB 211'], 'Bhutan Airlines (B3)': ['B3 720', 'B3 721'] },
  'Kathmandu': { 'Druk Air (KB)': ['KB 220', 'KB 221'], 'Bhutan Airlines (B3)': ['B3 730', 'B3 731'] },
  'Singapore': { 'Druk Air (KB)': ['KB 140', 'KB 141'], 'Bhutan Airlines (B3)': ['B3 740', 'B3 741'] },
  'Kolkata': { 'Druk Air (KB)': ['KB 150', 'KB 151'], 'Bhutan Airlines (B3)': ['B3 750', 'B3 751'] },
  'Dhaka':   { 'Druk Air (KB)': ['KB 160', 'KB 161'], 'Bhutan Airlines (B3)': ['B3 760', 'B3 761'] },
  'Kuala Lumpur': { 'Druk Air (KB)': ['KB 170', 'KB 171'], 'Bhutan Airlines (B3)': ['B3 770', 'B3 771'] },
}

function getFlightNos(sector, airline) {
  if (!sector || !airline) return []
  const city = Object.keys(SECTOR_FLIGHTS).find(k => sector.includes(k))
  return city ? (SECTOR_FLIGHTS[city][airline] ?? []) : []
}

// ── Status config ─────────────────────────────────────────────
const STATUS = {
  enquiry_pending: {
    label:  'New Enquiry',
    bg:     'bg-rose-500/15',
    text:   'text-rose-400',
    border: 'border-rose-500/30',
    dot:    'bg-rose-400',
    card:   'border-rose-500/20',
  },
  pending_review: {
    label:  'Pending Review',
    bg:     'bg-amber-500/15',
    text:   'text-amber-400',
    border: 'border-amber-500/30',
    dot:    'bg-amber-400',
    card:   'border-amber-500/20',
  },
  quoted: {
    label:  'Quoted',
    bg:     'bg-blue-500/15',
    text:   'text-blue-400',
    border: 'border-blue-500/30',
    dot:    'bg-blue-400',
    card:   'border-blue-500/20',
  },
  confirmed: {
    label:  'Confirmed',
    bg:     'bg-emerald-500/15',
    text:   'text-emerald-400',
    border: 'border-emerald-500/30',
    dot:    'bg-emerald-400',
    card:   'border-emerald-500/20',
  },
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending_review
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${s.bg} ${s.text} border ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

// ── SAARC rate sets ───────────────────────────────────────────
const SAARC_INDIA_SET = new Set(['India'])
const SAARC_BD_MV_SET = new Set(['Bangladesh', 'Maldives'])
const SAARC_ALL_SET   = new Set(['India', 'Bangladesh', 'Maldives'])

// ── Pricing computation (nationality-aware) ───────────────────
function computePricingDetailed({
  nationality, nights, adultPax, child611Pax, infantPax,
  serviceRate, entranceFeePerPax, specialsPerPax,
  flightPerPax, includeFlights, wireTransfer,
}) {
  const n       = Math.max(0, Math.floor(Number(nights)      || 0))
  const adults  = Math.max(0, Number(adultPax)   || 0)
  const c611    = Math.max(0, Number(child611Pax) || 0)
  const infants = Math.max(0, Number(infantPax)   || 0)
  const totalPax = adults + c611 + infants

  const isSaarcIndia = SAARC_INDIA_SET.has(nationality)
  const isSaarcBdMv  = SAARC_BD_MV_SET.has(nationality)
  const isSaarc      = isSaarcIndia || isSaarcBdMv
  const currency     = isSaarc ? 'INR / Nu.' : 'USD ($)'
  const sym          = isSaarc ? '₹' : '$'

  // SDF — India: adults 1200/night, children 6-11 600/night, infants free
  //        BD/MV: all paying pax 1200/night
  //        International: all pax $100/night
  let sdfAdult = 0, sdfChild = 0, sdfTotal = 0
  if (isSaarcIndia) {
    sdfAdult = 1200 * adults * n
    sdfChild = 600  * c611   * n
    sdfTotal = sdfAdult + sdfChild
  } else if (isSaarcBdMv) {
    sdfTotal = 1200 * (adults + c611) * n
  } else {
    sdfTotal = 100 * totalPax * n
  }

  // Visa — SAARC exempt (Entry Permit / Visa on Arrival, no advance fee)
  const visaPerPax = isSaarc ? 0 : 40
  const visaTotal  = visaPerPax * totalPax

  // Service (Guide / Vehicle / Meals) — GST applies ONLY to this
  const svcRate  = Number(serviceRate)       || 0
  const svcTotal = svcRate * (adults + c611) * n

  // Other items (no GST)
  const entrTotal = (Number(entranceFeePerPax) || 0) * totalPax
  const specTotal = (Number(specialsPerPax)    || 0) * totalPax
  const fltTotal  = includeFlights ? (Number(flightPerPax) || 0) * totalPax : 0
  const wire      = Number(wireTransfer) || 0

  // GST 5% — on service charge only (not SDF, not visa, not entrance, not flights)
  const gst       = svcTotal * 0.05
  const pkgCost   = sdfTotal + visaTotal + svcTotal + entrTotal + specTotal + fltTotal + wire
  const grandTotal = pkgCost + gst

  return {
    isSaarc, isSaarcIndia, isSaarcBdMv, currency, sym,
    sdfAdult, sdfChild, sdfTotal,
    visaPerPax, visaTotal,
    svcRate, svcTotal,
    entrTotal, specTotal, fltTotal, wire,
    gst, pkgCost, grandTotal,
    totalPax, adultsNum: adults, c611Num: c611, infantsNum: infants,
  }
}

// ── Input / label style helpers ───────────────────────────────
const inp = 'w-full bg-stone-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 transition-colors'
const lbl = 'text-[11px] text-stone-400 uppercase tracking-wider font-semibold block mb-1.5'

// ── Full Edit Drawer ──────────────────────────────────────────
function EditDrawer({ itinerary, onClose, onSaved }) {

  const [openFlight, setOpenFlight] = useState(null)
  const [openDay,    setOpenDay]    = useState(null)

  // ── state ──────────────────────────────────────────────────
  const [clientInfo, setClientInfo] = useState({
    guest_name:        itinerary.client_info?.guest_name        || '',
    email:             itinerary.client_info?.email             || '',
    phone:             itinerary.client_info?.phone             || '',
    nationality:       itinerary.client_info?.nationality       || '',
    emergency_contact: itinerary.client_info?.emergency_contact || '',
  })

  // Multi-guest list (stored in tour_summary.guests)
  const [guests, setGuests] = useState(
    itinerary.tour_summary?.guests?.length
      ? itinerary.tour_summary.guests.map(g => ({ ...g }))
      : [{
          name:            itinerary.client_info?.guest_name       || '',
          nationality:     itinerary.client_info?.nationality      || '',
          age_category:    'adult',
          passport_no:     itinerary.client_info?.passport_no || itinerary.client_info?.passport_number || '',
          passport_expiry: itinerary.client_info?.passport_expiry  || '',
        }]
  )

  const [tourSummary, setTourSummary] = useState({
    tour_package:    itinerary.tour_summary?.tour_package    || '',
    category:        itinerary.tour_summary?.category        || '',
    duration_nights: itinerary.tour_summary?.duration_nights ?? '',
    group_size:      itinerary.tour_summary?.group_size      ?? '',
    departure_date:  itinerary.tour_summary?.departure_date  || '',
    return_date:     itinerary.tour_summary?.return_date     || '',
    hotel_tier:      itinerary.tour_summary?.hotel_tier      || '',
    guide_name:      itinerary.tour_summary?.guide_name      || '',
    vehicle_details: itinerary.tour_summary?.vehicle_details || '',
    room_config:     itinerary.tour_summary?.room_config     || '',
    interests:       itinerary.tour_summary?.interests       || [],
    message:         itinerary.tour_summary?.message         || '',
  })

  const [flights, setFlights] = useState(
    (itinerary.flights || []).map(f => ({ ...f }))
  )

  const [days, setDays] = useState(
    (itinerary.day_by_day || []).map(d => ({ ...d }))
  )

  const [accommodations, setAccommodations] = useState(
    (itinerary.tour_summary?.accommodations || []).map(a => ({ ...a }))
  )

  const [travelInterests, setTravelInterests] = useState(
    (itinerary.tour_summary?.travel_interests || []).map(ti => ({ ...ti }))
  )

  // ── Pricing state (itemized) ───────────────────────────────
  const [adultPax,    setAdultPax]    = useState(itinerary.pricing?.adult_pax    ?? (Number(itinerary.tour_summary?.group_size) || 1))
  const [child611Pax, setChild611Pax] = useState(itinerary.pricing?.child_611_pax ?? 0)
  const [infantPax,   setInfantPax]   = useState(itinerary.pricing?.infant_pax   ?? 0)
  const [serviceRate, setServiceRate] = useState(
    itinerary.pricing?.service_rate ?? itinerary.pricing?.package_rate_per_pax ?? ''
  )
  const [entranceFeePerPax, setEntranceFeePerPax] = useState(itinerary.pricing?.entrance_fee_per_pax ?? '')
  const [specialsPerPax,    setSpecialsPerPax]    = useState(itinerary.pricing?.specials_per_pax     ?? '')
  const [flightPerPax,      setFlightPerPax]      = useState(itinerary.pricing?.flight_per_pax       ?? '')
  const [includeFlights,    setIncludeFlights]    = useState(itinerary.pricing?.include_flights      ?? false)
  const [wireTransfer,      setWireTransfer]      = useState(itinerary.pricing?.wire_transfer        ?? '')
  const [inrRate,           setInrRate]           = useState(itinerary.pricing?.inr_rate             ?? 83.5)

  const DEFAULT_INCLUSIONS = [
    'Accommodation as per itinerary',
    'Licensed English-speaking DOT-certified guide',
    'Private vehicle & dedicated driver',
    'Sustainable Development Fee (SDF) — $100/person/night',
    'All monument & dzong entry fees',
    'Meals as per itinerary',
  ]
  const DEFAULT_EXCLUSIONS = [
    'International flights (DEL ↔ PBH)',
    'Travel & medical insurance',
    'Personal expenses',
    'Gratuities for guide & driver',
  ]
  const DEFAULT_CANCELLATION = [
    { period: '60+ days before departure',   refund: 'Full refund less $150 processing fee' },
    { period: '30–59 days before departure', refund: '50% refund' },
    { period: 'Under 30 days / No-show',     refund: 'Non-refundable' },
  ]

  const [inclusions, setInclusions]             = useState(
    itinerary.tour_summary?.inclusions || DEFAULT_INCLUSIONS
  )
  const [exclusions, setExclusions]             = useState(
    itinerary.tour_summary?.exclusions || DEFAULT_EXCLUSIONS
  )
  const [cancellationPolicy, setCancellation]   = useState(
    itinerary.tour_summary?.cancellation || DEFAULT_CANCELLATION
  )

  const [activeTab, setActiveTab] = useState('client')
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState('')

  // ── Travel Interest helpers ────────────────────────────────
  const [allActivities,    setAllActivities]    = useState([])
  const [activitySearch,   setActivitySearch]   = useState('')
  const [showActivityPick, setShowActivityPick] = useState(false)
  const [showCustomForm,   setShowCustomForm]   = useState(false)
  const [customDraft,      setCustomDraft]      = useState({ name: '', emoji: '', category: '', price_label: '' })

  useEffect(() => {
    supabase.from('activities').select('id,name,emoji,price_label,category,cost_per_person').eq('active', true).order('category').order('name')
      .then(({ data }) => setAllActivities(data ?? []))
  }, [])

  function updateInterest(i, field, val) {
    setTravelInterests(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t))
  }
  function removeInterest(i) {
    setTravelInterests(prev => prev.filter((_, idx) => idx !== i))
  }
  function addFromActivity(act) {
    if (travelInterests.some(t => t.id === act.id)) return
    setTravelInterests(prev => [...prev, {
      id:          act.id,
      name:        act.name,
      emoji:       act.emoji || '',
      category:    act.category,
      price_label: act.price_label || (act.cost_per_person === 0 ? 'No Additional Cost' : `USD ${act.cost_per_person}`),
      admin_note:  '',
    }])
    setActivitySearch('')
    setShowActivityPick(false)
  }
  function addCustomInterest() {
    if (!customDraft.name.trim()) return
    setTravelInterests(prev => [...prev, {
      id:          `custom-${Date.now()}`,
      name:        customDraft.name.trim(),
      emoji:       customDraft.emoji.trim(),
      category:    customDraft.category.trim() || 'Cultural',
      price_label: customDraft.price_label.trim() || 'No Additional Cost',
      admin_note:  '',
    }])
    setCustomDraft({ name: '', emoji: '', category: '', price_label: '' })
    setShowCustomForm(false)
  }

  const nights = Number(tourSummary.duration_nights) || 1
  const primaryNationality = clientInfo.nationality || ''

  const calc = useMemo(
    () => computePricingDetailed({
      nationality: primaryNationality,
      nights,
      adultPax, child611Pax, infantPax,
      serviceRate, entranceFeePerPax, specialsPerPax,
      flightPerPax, includeFlights, wireTransfer,
    }),
    [primaryNationality, nights, adultPax, child611Pax, infantPax,
     serviceRate, entranceFeePerPax, specialsPerPax, flightPerPax, includeFlights, wireTransfer]
  )

  // ── flight helpers ─────────────────────────────────────────
  function addFlight() {
    setFlights(prev => [...prev, { sector: '', date: '', flight_no: '', departs: '', arrives: '', airline: '' }])
  }
  function updateFlight(idx, field, val) {
    setFlights(prev => prev.map((f, i) => i === idx ? { ...f, [field]: val } : f))
  }
  function removeFlight(idx) {
    setFlights(prev => prev.filter((_, i) => i !== idx))
  }

  // ── day helpers ────────────────────────────────────────────
  function addDay() {
    setDays(prev => [...prev, {
      day: prev.length + 1, date: '', programme: '',
      accommodation_name: '', meals: 'B,D',
    }])
  }
  function updateDay(idx, field, val) {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d))
  }
  function removeDay(idx) {
    setDays(prev => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })))
  }

  // ── accommodation helpers ──────────────────────────────────
  function addAccom() {
    setAccommodations(prev => [...prev, { hotel: '', city: '', tier: '', check_in: '', check_out: '', room_type: '' }])
  }
  function updateAccom(idx, field, val) {
    setAccommodations(prev => prev.map((a, i) => i === idx ? { ...a, [field]: val } : a))
  }
  function removeAccom(idx) {
    setAccommodations(prev => prev.filter((_, i) => i !== idx))
  }

  // ── guest helpers ──────────────────────────────────────────
  function addGuest() {
    setGuests(prev => [...prev, { name: '', nationality: '', age_category: 'adult', passport_no: '', passport_expiry: '' }])
  }
  function updateGuest(idx, field, val) {
    setGuests(prev => prev.map((g, i) => i === idx ? { ...g, [field]: val } : g))
  }
  function removeGuest(idx) {
    setGuests(prev => prev.filter((_, i) => i !== idx))
  }

  // ── save ───────────────────────────────────────────────────
  async function handleSave(nextStatus) {
    setSaving(true)
    setSaveErr('')

    const pricingPayload = {
      // inputs
      adult_pax:            Number(adultPax)          || 0,
      child_611_pax:        Number(child611Pax)        || 0,
      infant_pax:           Number(infantPax)          || 0,
      service_rate:         Number(serviceRate)        || 0,
      entrance_fee_per_pax: Number(entranceFeePerPax)  || 0,
      specials_per_pax:     Number(specialsPerPax)     || 0,
      flight_per_pax:       Number(flightPerPax)       || 0,
      include_flights:      includeFlights,
      wire_transfer:        Number(wireTransfer)       || 0,
      inr_rate:             Number(inrRate)            || 83.5,
      // computed
      is_saarc:             calc.isSaarc,
      currency:             calc.currency,
      sdf_total:            calc.sdfTotal,
      visa_total:           calc.visaTotal,
      service_total:        calc.svcTotal,
      entrance_total:       calc.entrTotal,
      specials_total:       calc.specTotal,
      flights_total:        calc.fltTotal,
      gst:                  calc.gst,
      package_cost:         calc.pkgCost,
      grand_total:          calc.grandTotal,
      equivalent_inr:       !calc.isSaarc ? calc.grandTotal * (Number(inrRate) || 83.5) : 0,
    }

    // Sync group_size with total pax if all pax fields are set
    const totalPaxCount = (Number(adultPax) || 0) + (Number(child611Pax) || 0) + (Number(infantPax) || 0)

    const { data, error } = await supabase
      .from('itineraries')
      .update({
        client_info:  clientInfo,
        tour_summary: {
          ...itinerary.tour_summary,
          ...tourSummary,
          guests,
          accommodations:   accommodations,
          inclusions:       inclusions,
          exclusions:       exclusions,
          cancellation:     cancellationPolicy,
          travel_interests: travelInterests,
          duration_nights:  Number(tourSummary.duration_nights) || itinerary.tour_summary?.duration_nights || 1,
          group_size:       totalPaxCount || Number(tourSummary.group_size) || itinerary.tour_summary?.group_size || 1,
        },
        flights,
        day_by_day: days,
        pricing:    pricingPayload,
        status:     nextStatus,
      })
      .eq('id', itinerary.id)
      .select()
      .single()

    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    onSaved(data)
  }

  // ── tabs ───────────────────────────────────────────────────
  const TABS = [
    { id: 'client',          label: 'Client',           icon: User },
    { id: 'tour',            label: 'Tour',             icon: MapPin },
    { id: 'flights',         label: 'Flights',          icon: Plane },
    { id: 'itinerary',       label: 'Itinerary',        icon: Calendar },
    { id: 'travelinterest',  label: 'Travel Interest',  icon: ListChecks },
    { id: 'hotels',          label: 'Hotels',           icon: BedDouble },
    { id: 'pricing',         label: 'Pricing',          icon: DollarSign },
    { id: 'inclusions',      label: 'Incl./Excl.',      icon: ListChecks },
    { id: 'policy',          label: 'Policy',           icon: ShieldAlert },
    { id: 'documents',       label: 'Documents',        icon: FileText },
    { id: 'guests',          label: 'Guests',           icon: User },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-stone-900 z-50 flex flex-col shadow-2xl border-l border-white/5">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-950 border-b border-white/10 shrink-0">
          <div>
            <p className="text-[11px] text-stone-500 font-mono uppercase tracking-widest">
              {itinerary.booking_reference}
            </p>
            <h2 className="text-white font-serif font-bold text-lg leading-tight mt-0.5">
              Edit Itinerary
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={itinerary.status} />
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/5 bg-stone-950 shrink-0 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === id
                  ? 'text-amber-400 border-amber-500'
                  : 'text-stone-500 border-transparent hover:text-stone-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">

          {/* ── Client Tab ── */}
          {activeTab === 'client' && (
            <div className="space-y-4">

              {/* Primary Contact */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-3">Primary Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Guest Name</label>
                    <input
                      type="text"
                      value={clientInfo.guest_name}
                      onChange={e => setClientInfo(p => ({ ...p, guest_name: e.target.value }))}
                      placeholder="Full name"
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Nationality</label>
                    <input
                      type="text"
                      value={clientInfo.nationality}
                      onChange={e => setClientInfo(p => ({ ...p, nationality: e.target.value }))}
                      placeholder="e.g. India, United States"
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Email</label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={e => setClientInfo(p => ({ ...p, email: e.target.value }))}
                      placeholder="email@example.com"
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={clientInfo.phone}
                      onChange={e => setClientInfo(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      className={inp}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Emergency Contact</label>
                    <input
                      type="text"
                      value={clientInfo.emergency_contact}
                      onChange={e => setClientInfo(p => ({ ...p, emergency_contact: e.target.value }))}
                      placeholder="Name · Relationship · Phone"
                      className={inp}
                    />
                  </div>
                </div>
              </div>

              {/* Guest List */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Guest List</p>
                    <p className="text-[10px] text-stone-600 mt-0.5">
                      {guests.length} guest{guests.length !== 1 ? 's' : ''} ·{' '}
                      {guests.filter(g => g.age_category === 'adult').length} adult
                      {guests.filter(g => g.age_category === 'child_6_11').length > 0 && `, ${guests.filter(g => g.age_category === 'child_6_11').length} child(6–11)`}
                      {guests.filter(g => g.age_category === 'infant').length > 0 && `, ${guests.filter(g => g.age_category === 'infant').length} infant`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addGuest}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Guest
                  </button>
                </div>

                <div className="space-y-2.5">
                  {guests.map((g, idx) => (
                    <div key={idx} className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                            {idx === 0 ? 'Primary Guest' : `Guest ${idx + 1}`}
                          </p>
                          {g.age_category === 'infant' && (
                            <span className="text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              SDF Exempt (≤5)
                            </span>
                          )}
                          {g.age_category === 'child_6_11' && SAARC_INDIA_SET.has(clientInfo.nationality) && (
                            <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Half SDF ₹600
                            </span>
                          )}
                        </div>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => removeGuest(idx)}
                            className="p-1 rounded text-stone-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <label className="text-[10px] text-stone-500 block mb-1">Full Name</label>
                          <input
                            type="text"
                            value={g.name}
                            onChange={e => updateGuest(idx, 'name', e.target.value)}
                            placeholder="Full name"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 block mb-1">Nationality</label>
                          <input
                            type="text"
                            value={g.nationality}
                            onChange={e => updateGuest(idx, 'nationality', e.target.value)}
                            placeholder="e.g. India"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 block mb-1">Age Category</label>
                          <select
                            value={g.age_category}
                            onChange={e => updateGuest(idx, 'age_category', e.target.value)}
                            className={inp}
                          >
                            <option value="adult">Adult (12+)</option>
                            <option value="child_6_11">Child (6–11)</option>
                            <option value="infant">Infant / Under 5</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 block mb-1">Passport No.</label>
                          <input
                            type="text"
                            value={g.passport_no}
                            onChange={e => updateGuest(idx, 'passport_no', e.target.value)}
                            placeholder="e.g. A12345678"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 block mb-1">Passport Expiry</label>
                          <input
                            type="date"
                            value={g.passport_expiry}
                            onChange={e => updateGuest(idx, 'passport_expiry', e.target.value)}
                            className={inp}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tour Tab ── */}
          {activeTab === 'tour' && (
            <div className="space-y-3">
              <div className="col-span-2">
                <label className={lbl}>Tour Package</label>
                <input
                  type="text"
                  value={tourSummary.tour_package}
                  onChange={e => setTourSummary(p => ({ ...p, tour_package: e.target.value }))}
                  placeholder="e.g. Classic Bhutan Cultural Tour"
                  className={inp}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Category</label>
                  <input
                    type="text"
                    value={tourSummary.category}
                    onChange={e => setTourSummary(p => ({ ...p, category: e.target.value }))}
                    placeholder="e.g. Cultural"
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Hotel Tier</label>
                  <select
                    value={tourSummary.hotel_tier}
                    onChange={e => setTourSummary(p => ({ ...p, hotel_tier: e.target.value }))}
                    className={inp}
                  >
                    <option value="">Select tier</option>
                    <option value="3-Star">3-Star Heritage</option>
                    <option value="4-Star">4-Star Boutique</option>
                    <option value="5-Star Luxury">5-Star Luxury</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Duration (Nights)</label>
                  <input
                    type="number"
                    min="1"
                    value={tourSummary.duration_nights}
                    onChange={e => setTourSummary(p => ({ ...p, duration_nights: e.target.value }))}
                    placeholder="e.g. 4"
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Group Size (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    value={tourSummary.group_size}
                    onChange={e => setTourSummary(p => ({ ...p, group_size: e.target.value }))}
                    placeholder="e.g. 2"
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Departure Date</label>
                  <input
                    type="date"
                    value={tourSummary.departure_date}
                    onChange={e => setTourSummary(p => ({ ...p, departure_date: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Return Date</label>
                  <input
                    type="date"
                    value={tourSummary.return_date}
                    onChange={e => setTourSummary(p => ({ ...p, return_date: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Guide Name</label>
                  <input
                    type="text"
                    value={tourSummary.guide_name}
                    onChange={e => setTourSummary(p => ({ ...p, guide_name: e.target.value }))}
                    placeholder="e.g. Tenzin Dorje"
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Vehicle &amp; Driver</label>
                  <input
                    type="text"
                    value={tourSummary.vehicle_details}
                    onChange={e => setTourSummary(p => ({ ...p, vehicle_details: e.target.value }))}
                    placeholder="e.g. Land Cruiser · Karma Wangdi"
                    className={inp}
                  />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Room Configuration</label>
                  <input
                    type="text"
                    value={tourSummary.room_config}
                    onChange={e => setTourSummary(p => ({ ...p, room_config: e.target.value }))}
                    placeholder="e.g. 2 Twin/Double + 1 Single"
                    className={inp}
                  />
                </div>
              </div>
              {tourSummary.message && (
                <div>
                  <label className={lbl}>Client Notes (from enquiry)</label>
                  <textarea
                    value={tourSummary.message}
                    onChange={e => setTourSummary(p => ({ ...p, message: e.target.value }))}
                    rows={3}
                    className={`${inp} resize-none`}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Flights Tab ── */}
          {activeTab === 'flights' && (
            <div className="space-y-2">
              {flights.length === 0 && (
                <p className="text-stone-600 text-sm text-center py-4">No flights yet. Add a flight below.</p>
              )}
              {flights.map((f, idx) => {
                const isOpen = openFlight === idx
                const summary = [f.sector, f.flight_no, f.departs && f.arrives ? `${f.departs} → ${f.arrives}` : ''].filter(Boolean).join('  ·  ')
                return (
                  <div key={idx} className="bg-stone-800/60 rounded-2xl border border-white/5 overflow-hidden">
                    {/* Accordion header */}
                    <button
                      type="button"
                      onClick={() => setOpenFlight(isOpen ? null : idx)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Plane className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Flight {idx + 1}</p>
                        <p className="text-stone-200 text-sm font-medium truncate mt-0.5">
                          {summary || <span className="text-stone-600 italic">Incomplete</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeFlight(idx) }}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Accordion body */}
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
                        {/* Sector */}
                        <div>
                          <label className={lbl}>Sector</label>
                          <select
                            value={f.sector}
                            onChange={e => updateFlight(idx, 'sector', e.target.value)}
                            className={inp}
                          >
                            <option value="">Select route…</option>
                            {FLIGHT_SECTORS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* Airline */}
                        <div>
                          <label className={lbl}>Airline</label>
                          <select
                            value={f.airline}
                            onChange={e => updateFlight(idx, 'airline', e.target.value)}
                            className={inp}
                          >
                            <option value="">Select airline…</option>
                            {AIRLINES.map(a => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                        </div>

                        {/* Flight No — dropdown if known, else free text */}
                        <div>
                          <label className={lbl}>Flight No.</label>
                          {getFlightNos(f.sector, f.airline).length > 0 ? (
                            <select
                              value={f.flight_no}
                              onChange={e => updateFlight(idx, 'flight_no', e.target.value)}
                              className={inp}
                            >
                              <option value="">Select flight no…</option>
                              {getFlightNos(f.sector, f.airline).map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                              <option value="__other__">Other (type below)</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={f.flight_no}
                              onChange={e => updateFlight(idx, 'flight_no', e.target.value)}
                              placeholder="e.g. KB 131"
                              className={inp}
                            />
                          )}
                          {f.flight_no === '__other__' && (
                            <input
                              type="text"
                              autoFocus
                              placeholder="Enter flight number"
                              className={`${inp} mt-1.5`}
                              onChange={e => updateFlight(idx, 'flight_no', e.target.value)}
                            />
                          )}
                        </div>

                        {/* Date + Times */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className={lbl}>Date</label>
                            <input
                              type="date"
                              value={f.date}
                              onChange={e => updateFlight(idx, 'date', e.target.value)}
                              className={inp}
                            />
                          </div>
                          <div>
                            <label className={lbl}>Departs</label>
                            <input
                              type="time"
                              value={f.departs}
                              onChange={e => updateFlight(idx, 'departs', e.target.value)}
                              className={inp}
                            />
                          </div>
                          <div>
                            <label className={lbl}>Arrives</label>
                            <input
                              type="time"
                              value={f.arrives}
                              onChange={e => updateFlight(idx, 'arrives', e.target.value)}
                              className={inp}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              <button
                onClick={() => { addFlight(); setOpenFlight(flights.length) }}
                className="w-full py-3 rounded-xl border border-dashed border-white/20 text-stone-500 hover:text-stone-300 hover:border-white/40 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Flight
              </button>
            </div>
          )}

          {/* ── Itinerary Tab ── */}
          {activeTab === 'itinerary' && (
            <div className="space-y-2">
              {/* Client-requested activities reference */}
              {(itinerary.tour_summary?.activities_selected?.length > 0) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-2">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    Client Requested Activities ({itinerary.tour_summary.activities_selected.length})
                  </p>
                  <div className="space-y-1.5">
                    {itinerary.tour_summary.activities_selected.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-stone-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="font-medium">{a.name}</span>
                        <span className="text-stone-500">· {a.location} · {a.duration_hours}h · {a.category}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-600 mt-2">These are pre-filled into the day programmes below. Edit as needed.</p>
                </div>
              )}

              {days.length === 0 && (
                <p className="text-stone-600 text-sm text-center py-4">No days yet. Add a day below.</p>
              )}
              {days.map((d, idx) => {
                const isOpen = openDay === idx
                const dateStr = d.date
                  ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : ''
                const programmePreview = (d.programme || '').split('·')[0].trim().slice(0, 48)
                return (
                  <div key={idx} className="bg-stone-800/60 rounded-2xl border border-white/5 overflow-hidden">
                    {/* Accordion header */}
                    <button
                      type="button"
                      onClick={() => setOpenDay(isOpen ? null : idx)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-400 font-bold text-xs">
                        {d.day ?? idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Day {d.day ?? idx + 1}</p>
                          {dateStr && <span className="text-[10px] text-stone-600">{dateStr}</span>}
                          {d.meals && <span className="text-[10px] text-stone-500 font-mono">{d.meals}</span>}
                        </div>
                        <p className="text-stone-200 text-sm truncate mt-0.5">
                          {programmePreview || <span className="text-stone-600 italic">No programme yet</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeDay(idx) }}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Accordion body */}
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className={lbl}>Day No.</label>
                            <input
                              type="number"
                              min="1"
                              value={d.day ?? idx + 1}
                              onChange={e => updateDay(idx, 'day', Number(e.target.value))}
                              className={inp}
                            />
                          </div>
                          <div>
                            <label className={lbl}>Date</label>
                            <input
                              type="date"
                              value={d.date || ''}
                              onChange={e => updateDay(idx, 'date', e.target.value)}
                              className={inp}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={lbl}>Programme &amp; Activities</label>
                          <textarea
                            value={d.programme || ''}
                            onChange={e => updateDay(idx, 'programme', e.target.value)}
                            rows={3}
                            placeholder="e.g. Arrival in Paro → Thimphu · Airport pickup, Buddha Dordenma, Welcome dinner"
                            className={`${inp} resize-none`}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className={lbl}>Accommodation</label>
                            <input
                              type="text"
                              value={d.accommodation_name || ''}
                              onChange={e => updateDay(idx, 'accommodation_name', e.target.value)}
                              placeholder="Hotel, City (★)"
                              className={inp}
                            />
                          </div>
                          <div>
                            <label className={lbl}>Meals</label>
                            <input
                              type="text"
                              value={d.meals || ''}
                              onChange={e => updateDay(idx, 'meals', e.target.value)}
                              placeholder="B,L,D"
                              className={inp}
                            />
                            <p className="text-[10px] text-stone-600 mt-1">B=Breakfast · L=Lunch · D=Dinner</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              <button
                onClick={() => { addDay(); setOpenDay(days.length) }}
                className="w-full py-3 rounded-xl border border-dashed border-white/20 text-stone-500 hover:text-stone-300 hover:border-white/40 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Day
              </button>
            </div>
          )}

          {/* ── Travel Interest Tab ── */}
          {activeTab === 'travelinterest' && (() => {
            const inp = 'w-full bg-stone-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 transition-colors'
            const filteredActivities = allActivities.filter(a =>
              !travelInterests.some(t => t.id === a.id) &&
              (!activitySearch || a.name.toLowerCase().includes(activitySearch.toLowerCase()) || a.category.toLowerCase().includes(activitySearch.toLowerCase()))
            )
            return (
              <div className="space-y-4">
                {/* Action bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setShowActivityPick(v => !v); setShowCustomForm(false) }}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add from Activities
                  </button>
                  <button
                    onClick={() => { setShowCustomForm(v => !v); setShowActivityPick(false) }}
                    className="flex items-center gap-1.5 text-xs font-semibold border border-white/10 text-stone-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Custom
                  </button>
                  {travelInterests.length > 0 && (
                    <span className="ml-auto text-[11px] text-stone-500">
                      {travelInterests.length} experience{travelInterests.length !== 1 ? 's' : ''} ·{' '}
                      <span className="text-amber-500">
                        {travelInterests.filter(ti => (ti.price_label || ti.priceLabel || '') !== 'No Additional Cost').length} chargeable
                      </span>
                    </span>
                  )}
                </div>

                {/* Pick from activities dropdown */}
                {showActivityPick && (
                  <div className="bg-stone-800 border border-amber-500/30 rounded-xl overflow-hidden">
                    <div className="p-3 border-b border-white/5">
                      <input
                        autoFocus
                        value={activitySearch}
                        onChange={e => setActivitySearch(e.target.value)}
                        placeholder="Search activities by name or category…"
                        className={inp}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
                      {filteredActivities.length === 0 ? (
                        <p className="px-4 py-6 text-center text-stone-500 text-xs">
                          {activitySearch ? 'No matching activities.' : 'All activities already added.'}
                        </p>
                      ) : filteredActivities.map(act => (
                        <button
                          key={act.id}
                          onClick={() => addFromActivity(act)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left transition-colors"
                        >
                          <span className="text-lg shrink-0 w-7">{act.emoji || '•'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-stone-200 font-medium truncate">{act.name}</p>
                            <p className="text-[10px] text-stone-500">{act.category}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            act.cost_per_person === 0 ? 'text-green-400 bg-green-500/15' : 'text-amber-400 bg-amber-500/15'
                          }`}>
                            {act.price_label || (act.cost_per_person === 0 ? 'Free' : `$${act.cost_per_person}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add custom form */}
                {showCustomForm && (
                  <div className="bg-stone-800 border border-white/10 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Add Custom Experience</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-1">
                        <label className="text-[10px] text-stone-500 uppercase tracking-wider font-bold block mb-1.5">Emoji</label>
                        <input value={customDraft.emoji} onChange={e => setCustomDraft(d => ({ ...d, emoji: e.target.value }))}
                          placeholder="🎯" className={inp} />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-stone-500 uppercase tracking-wider font-bold block mb-1.5">Experience Name *</label>
                        <input value={customDraft.name} onChange={e => setCustomDraft(d => ({ ...d, name: e.target.value }))}
                          placeholder="e.g. Hot Stone Bath" className={inp} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase tracking-wider font-bold block mb-1.5">Category</label>
                        <select value={customDraft.category} onChange={e => setCustomDraft(d => ({ ...d, category: e.target.value }))}
                          className={inp + ' cursor-pointer'}>
                          <option value="">Select…</option>
                          {['Cultural','Spiritual','Trekking','Adventure','Wellness','Photography','Nature','Leisure'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase tracking-wider font-bold block mb-1.5">Price Label</label>
                        <input value={customDraft.price_label} onChange={e => setCustomDraft(d => ({ ...d, price_label: e.target.value }))}
                          placeholder="e.g. USD 50/Person or No Additional Cost" className={inp} />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={addCustomInterest} disabled={!customDraft.name.trim()}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Experience
                      </button>
                      <button onClick={() => { setShowCustomForm(false); setCustomDraft({ name: '', emoji: '', category: '', price_label: '' }) }}
                        className="text-xs text-stone-500 hover:text-stone-300 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing interests list */}
                {travelInterests.length === 0 && !showActivityPick && !showCustomForm ? (
                  <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                    <ListChecks className="w-8 h-8 text-stone-600 mx-auto mb-3" />
                    <p className="text-stone-500 text-sm font-medium">No travel experiences added yet</p>
                    <p className="text-stone-600 text-xs mt-1">Use the buttons above to add from the activities list or create a custom experience</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {travelInterests.map((ti, i) => {
                      const isFree = (ti.price_label || ti.priceLabel || '') === 'No Additional Cost'
                      return (
                        <div key={i} className="bg-stone-800 border border-white/5 rounded-xl overflow-hidden">
                          {/* Card header — editable name + emoji + category */}
                          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
                            <input
                              value={ti.emoji || ''}
                              onChange={e => updateInterest(i, 'emoji', e.target.value)}
                              placeholder="🎯"
                              className="w-11 bg-stone-900 border border-white/10 rounded-lg px-2 py-1.5 text-center text-base focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                            <input
                              value={ti.name || ''}
                              onChange={e => updateInterest(i, 'name', e.target.value)}
                              className="flex-1 bg-stone-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-500/50 transition-colors min-w-0"
                            />
                            <select
                              value={ti.category || ''}
                              onChange={e => updateInterest(i, 'category', e.target.value)}
                              className="bg-stone-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-stone-300 focus:outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
                            >
                              {['Cultural','Spiritual','Trekking','Adventure','Wellness','Photography','Nature','Leisure'].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                              isFree ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {isFree ? 'Free' : 'Paid'}
                            </span>
                            <button onClick={() => removeInterest(i)}
                              className="text-stone-600 hover:text-red-400 transition-colors p-1 shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* Editable price + notes */}
                          <div className="px-3 py-2.5 grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Price Label</label>
                              <input
                                value={ti.price_label || ti.priceLabel || ''}
                                onChange={e => updateInterest(i, 'price_label', e.target.value)}
                                placeholder="e.g. USD 40/Person or No Additional Cost"
                                className={inp}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Admin Notes</label>
                              <input
                                value={ti.admin_note || ''}
                                onChange={e => updateInterest(i, 'admin_note', e.target.value)}
                                placeholder="e.g. Scheduled for Day 4"
                                className={inp}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}

          {/* ── Hotels Tab ── */}
          {activeTab === 'hotels' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-stone-500">List all hotels in the tour. This appears on the client voucher.</p>
                {days.some(d => d.accommodation_name) && accommodations.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const seen = new Set()
                      const auto = days
                        .filter(d => d.accommodation_name && !seen.has(d.accommodation_name) && seen.add(d.accommodation_name))
                        .map(d => ({ hotel: d.accommodation_name, city: '', tier: tourSummary.hotel_tier || '', check_in: d.date || '', check_out: '', room_type: '' }))
                      setAccommodations(auto)
                    }}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Auto-fill from itinerary
                  </button>
                )}
              </div>

              {accommodations.length === 0 && (
                <p className="text-stone-600 text-sm text-center py-8">No hotels yet. Add hotels below or auto-fill from the Itinerary tab.</p>
              )}

              {accommodations.map((a, idx) => (
                <div key={idx} className="bg-stone-800/60 rounded-2xl border border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-amber-500" /> Hotel {idx + 1}
                      {a.hotel && <span className="text-stone-300 normal-case font-semibold">— {a.hotel}</span>}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeAccom(idx)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className={lbl}>Hotel / Property Name</label>
                      <input
                        type="text"
                        value={a.hotel}
                        onChange={e => updateAccom(idx, 'hotel', e.target.value)}
                        placeholder="e.g. Taj Tashi Thimphu"
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl}>City / Location</label>
                      <input
                        type="text"
                        value={a.city}
                        onChange={e => updateAccom(idx, 'city', e.target.value)}
                        placeholder="e.g. Thimphu"
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl}>Tier</label>
                      <select
                        value={a.tier}
                        onChange={e => updateAccom(idx, 'tier', e.target.value)}
                        className={inp}
                      >
                        <option value="">Select tier</option>
                        <option value="3-Star">3-Star Heritage</option>
                        <option value="4-Star">4-Star Boutique</option>
                        <option value="5-Star Luxury">5-Star Luxury</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Check-in</label>
                      <input
                        type="date"
                        value={a.check_in}
                        onChange={e => updateAccom(idx, 'check_in', e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className={lbl}>Check-out</label>
                      <input
                        type="date"
                        value={a.check_out}
                        onChange={e => updateAccom(idx, 'check_out', e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className={lbl}>Room Type</label>
                      <input
                        type="text"
                        value={a.room_type}
                        onChange={e => updateAccom(idx, 'room_type', e.target.value)}
                        placeholder="e.g. Deluxe Double Room"
                        className={inp}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addAccom}
                className="w-full py-3 rounded-xl border border-dashed border-white/20 text-stone-500 hover:text-stone-300 hover:border-white/40 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Hotel
              </button>
            </div>
          )}

          {/* ── Pricing Tab ── */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">

              {/* Rate type banner */}
              <div className={`rounded-xl p-3.5 border flex items-center justify-between gap-3 ${
                calc.isSaarc ? 'bg-blue-500/10 border-blue-500/20' : 'bg-stone-800 border-white/10'
              }`}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-0.5">Rate Type — auto from Nationality</p>
                  <p className={`text-sm font-bold ${calc.isSaarc ? 'text-blue-300' : 'text-stone-200'}`}>
                    {calc.isSaarcIndia
                      ? 'India — Entry Permit · INR / Nu.'
                      : calc.isSaarcBdMv
                      ? 'Bangladesh / Maldives — Visa on Arrival · INR / Nu.'
                      : primaryNationality
                      ? `${primaryNationality} — International · USD ($)`
                      : 'Set Nationality in Client tab'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {calc.isSaarcIndia
                      ? 'SDF: ₹1,200/adult/night · ₹600/child(6–11)/night · Infants free · No visa fee'
                      : calc.isSaarcBdMv
                      ? 'SDF: ₹1,200/person/night · No advance visa fee'
                      : 'SDF: $100/person/night · Visa: $40/person'}
                  </p>
                </div>
                <div className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${
                  calc.isSaarc
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : 'bg-stone-700 text-stone-400 border-white/10'
                }`}>
                  {calc.isSaarc ? 'INR' : 'USD'}
                </div>
              </div>

              {/* Pax breakdown */}
              <div className="bg-stone-800/60 rounded-xl border border-white/5 p-4">
                <p className={lbl}>Group Breakdown</p>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Adults (12+)</label>
                    <input type="number" min="0" value={adultPax}
                      onChange={e => setAdultPax(e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">
                      {calc.isSaarcIndia ? 'Children 6–11 (₹600)' : 'Children 6–11'}
                    </label>
                    <input type="number" min="0" value={child611Pax}
                      onChange={e => setChild611Pax(e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">
                      {calc.isSaarcIndia ? 'Infants ≤5 (free)' : 'Infants / ≤5'}
                    </label>
                    <input type="number" min="0" value={infantPax}
                      onChange={e => setInfantPax(e.target.value)} className={inp} />
                  </div>
                </div>
                <p className="text-[10px] text-stone-600 mt-2">
                  Total: {calc.totalPax} pax · {nights} nights
                  {calc.isSaarcIndia && calc.infantsNum > 0 ? ` · ${calc.infantsNum} infant(s) exempt from SDF` : ''}
                </p>
              </div>

              {/* Itemized rate inputs */}
              <div className="space-y-2">
                <p className={lbl}>Itemized Costs</p>

                {/* Service Rate */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1.5">
                    Service (Guide / Vehicle / Meals) — per pax / night
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calc.sym}</span>
                    <input type="number" min="0" step="100" value={serviceRate}
                      onChange={e => setServiceRate(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`} />
                  </div>
                  {serviceRate > 0 && (
                    <p className="text-[10px] text-stone-500 mt-1.5">
                      {calc.sym}{Number(serviceRate).toLocaleString()} × {calc.adultsNum + calc.c611Num} pax × {nights} nights = {calc.sym}{calc.svcTotal.toLocaleString()}
                    </p>
                  )}
                  <p className="text-[10px] text-amber-600/70 mt-0.5">GST (5%) applies to this amount only</p>
                </div>

                {/* Entrance Fees */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1.5">Entrance Fees — per pax</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calc.sym}</span>
                    <input type="number" min="0" step="100" value={entranceFeePerPax}
                      onChange={e => setEntranceFeePerPax(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`} />
                  </div>
                  {entranceFeePerPax > 0 && (
                    <p className="text-[10px] text-stone-500 mt-1.5">
                      {calc.sym}{Number(entranceFeePerPax).toLocaleString()} × {calc.totalPax} pax = {calc.sym}{calc.entrTotal.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Special Experiences */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1.5">Special Experiences &amp; Meals — per pax</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calc.sym}</span>
                    <input type="number" min="0" step="100" value={specialsPerPax}
                      onChange={e => setSpecialsPerPax(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`} />
                  </div>
                  {specialsPerPax > 0 && (
                    <p className="text-[10px] text-stone-500 mt-1.5">
                      {calc.sym}{Number(specialsPerPax).toLocaleString()} × {calc.totalPax} pax = {calc.sym}{calc.specTotal.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Flights */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="incl-flights" checked={includeFlights}
                      onChange={e => setIncludeFlights(e.target.checked)}
                      className="rounded accent-amber-500 w-3.5 h-3.5 cursor-pointer" />
                    <label htmlFor="incl-flights" className="text-[10px] text-stone-400 uppercase tracking-wider cursor-pointer">
                      Include Flights in Package — per pax
                    </label>
                  </div>
                  {includeFlights && (
                    <>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calc.sym}</span>
                        <input type="number" min="0" step="100" value={flightPerPax}
                          onChange={e => setFlightPerPax(e.target.value)}
                          placeholder="0" className={`${inp} pl-7`} />
                      </div>
                      {flightPerPax > 0 && (
                        <p className="text-[10px] text-stone-500 mt-1.5">
                          {calc.sym}{Number(flightPerPax).toLocaleString()} × {calc.totalPax} pax = {calc.sym}{calc.fltTotal.toLocaleString()}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Wire Transfer */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1.5">Wire / Bank Transfer Fee (flat)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calc.sym}</span>
                    <input type="number" min="0" step="10" value={wireTransfer}
                      onChange={e => setWireTransfer(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`} />
                  </div>
                </div>
              </div>

              {/* Cost summary */}
              <div className="bg-stone-950 rounded-2xl p-5 space-y-2.5 border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Cost Summary</p>

                {/* SDF rows */}
                {calc.isSaarcIndia ? (
                  <>
                    {calc.adultsNum > 0 && (
                      <div className="flex justify-between text-stone-400 text-sm">
                        <span>SDF ₹1,200 × {calc.adultsNum} adult{calc.adultsNum > 1 ? 's' : ''} × {nights} nights</span>
                        <span className="font-mono text-stone-200">₹{calc.sdfAdult.toLocaleString()}</span>
                      </div>
                    )}
                    {calc.c611Num > 0 && (
                      <div className="flex justify-between text-stone-400 text-sm">
                        <span>SDF ₹600 × {calc.c611Num} child(6–11) × {nights} nights</span>
                        <span className="font-mono text-stone-200">₹{calc.sdfChild.toLocaleString()}</span>
                      </div>
                    )}
                    {calc.infantsNum > 0 && (
                      <div className="flex justify-between text-stone-400 text-sm">
                        <span>SDF — {calc.infantsNum} infant(s) / ≤5</span>
                        <span className="font-mono text-emerald-400 text-xs">Exempt</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>SDF ({calc.isSaarc ? '₹1,200' : '$100'} × {calc.isSaarc ? calc.adultsNum + calc.c611Num : calc.totalPax} pax × {nights} nights)</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.sdfTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Visa */}
                {calc.isSaarc ? (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>{calc.isSaarcIndia ? 'Entry Permit (Visa)' : 'Visa on Arrival'}</span>
                    <span className="font-mono text-emerald-400 text-xs">Exempt</span>
                  </div>
                ) : calc.totalPax > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>Visa Processing ($40 × {calc.totalPax} pax)</span>
                    <span className="font-mono text-stone-200">${calc.visaTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Service */}
                {calc.svcTotal > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>Guide / Vehicle / Meals</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.svcTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Entrance */}
                {calc.entrTotal > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>Entrance Fees</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.entrTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Specials */}
                {calc.specTotal > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>Special Experiences &amp; Meals</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.specTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Flights */}
                {includeFlights && calc.fltTotal > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>International Flights</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.fltTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Wire */}
                {calc.wire > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>Wire / Bank Transfer</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.wire.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-3 flex justify-between text-white font-semibold text-sm">
                  <span>Package Cost</span>
                  <span className="font-mono">{calc.sym}{Math.round(calc.pkgCost).toLocaleString()}</span>
                </div>

                {calc.gst > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>GST (5%) — on service charge only</span>
                    <span className="font-mono text-stone-200">{calc.sym}{Math.round(calc.gst).toLocaleString()}</span>
                  </div>
                )}

                {/* Grand Total glow */}
                <div className="rounded-xl overflow-hidden mt-2"
                  style={{ background: 'linear-gradient(135deg, #1C1007, #2D1A08)', boxShadow: '0 0 20px 2px rgba(217,119,6,0.18), inset 0 1px 0 rgba(245,158,11,0.2)' }}>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70">Grand Total</p>
                      <p className="text-white text-sm font-bold mt-0.5">{calc.currency} · All inclusive</p>
                    </div>
                    <p className="font-black text-2xl tracking-tight"
                      style={{ color: '#F59E0B', fontFamily: 'monospace', textShadow: '0 0 24px rgba(245,158,11,0.6)' }}>
                      {calc.sym}{Math.round(calc.grandTotal).toLocaleString()}
                    </p>
                  </div>
                  {/* Show INR equivalent for USD bookings */}
                  {!calc.isSaarc && (
                    <div className="border-t border-amber-900/40 px-4 py-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-amber-700/60 whitespace-nowrap">INR Rate ₹</span>
                        <input
                          type="number" min="1" step="0.5" value={inrRate}
                          onChange={e => setInrRate(e.target.value)}
                          className="w-20 bg-transparent border border-amber-900/50 rounded-lg px-2 py-0.5 text-xs text-amber-600 font-mono focus:outline-none focus:border-amber-600/60 text-center"
                        />
                      </div>
                      <span className="font-mono text-amber-600 text-xs font-semibold">
                        ₹{(calc.grandTotal * (Number(inrRate) || 83.5)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-stone-600">Nights ({nights}) synced from Tour tab. GST applies only to service/guide/meals charge.</p>
            </div>
          )}

          {/* ── Inclusions / Exclusions Tab ── */}
          {activeTab === 'inclusions' && (
            <div className="space-y-5">

              {/* Inclusions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-green-400">Inclusions</p>
                  <button onClick={() => setInclusions(p => [...p, ''])}
                    className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/25 px-2.5 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {inclusions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-green-500 text-sm shrink-0 font-bold">✓</span>
                      <input
                        value={item}
                        onChange={e => setInclusions(p => p.map((v, i) => i === idx ? e.target.value : v))}
                        placeholder="Included item..."
                        className="flex-1 bg-stone-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-green-500/50"
                      />
                      <button onClick={() => setInclusions(p => p.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10" />

              {/* Exclusions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-400">Exclusions</p>
                  <button onClick={() => setExclusions(p => [...p, ''])}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 px-2.5 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {exclusions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-red-500 text-sm shrink-0 font-bold">✗</span>
                      <input
                        value={item}
                        onChange={e => setExclusions(p => p.map((v, i) => i === idx ? e.target.value : v))}
                        placeholder="Excluded item..."
                        className="flex-1 bg-stone-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-red-500/50"
                      />
                      <button onClick={() => setExclusions(p => p.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Cancellation Policy Tab ── */}
          {activeTab === 'policy' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Cancellation &amp; Refund Policy</p>
                <button
                  onClick={() => setCancellation(p => [...p, { period: '', refund: '' }])}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>

              <div className="space-y-2">
                {cancellationPolicy.map((row, idx) => (
                  <div key={idx} className="bg-stone-800 border border-white/5 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Row {idx + 1}</p>
                      <button onClick={() => setCancellation(p => p.filter((_, i) => i !== idx))}
                        className="p-1 rounded text-stone-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      value={row.period}
                      onChange={e => setCancellation(p => p.map((r, i) => i === idx ? { ...r, period: e.target.value } : r))}
                      placeholder="Cancellation period (e.g. 60+ days before departure)"
                      className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
                    />
                    <input
                      value={row.refund}
                      onChange={e => setCancellation(p => p.map((r, i) => i === idx ? { ...r, refund: e.target.value } : r))}
                      placeholder="Refund terms (e.g. Full refund less $150 processing fee)"
                      className="w-full bg-stone-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs text-stone-600 mt-2">
                These terms appear in the cancellation section of the client voucher PDF.
              </p>
            </div>
          )}

          {/* ── Documents Tab ── */}
          {activeTab === 'documents' && (
            <AdminTravelDocuments bookingId={itinerary.booking_reference} />
          )}

          {/* ── Guests Tab ── */}
          {activeTab === 'guests' && (
            <AdminBookingGuests bookingId={itinerary.booking_reference} />
          )}

          {saveErr && (
            <div className="mt-4 flex items-start gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {saveErr}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-stone-950 border-t border-white/10 flex items-center gap-2 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          <div className="flex-1" />

          <Link
            href={`/itinerary/${itinerary.booking_reference}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-sm font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Voucher
          </Link>

          <button
            onClick={() => handleSave(itinerary.status)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-700 hover:bg-stone-600 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Save
          </button>

          <button
            onClick={() => handleSave('quoted')}
            disabled={saving || calc.grandTotal === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save &amp; Quote
          </button>

          {(itinerary.status === 'quoted' || itinerary.status === 'confirmed') && (
            <button
              onClick={() => handleSave('confirmed')}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────
const FILTER_TABS = [
  { key: 'all',             label: 'All' },
  { key: 'enquiry_pending', label: 'New Enquiries' },
  { key: 'pending_review',  label: 'Pending Review' },
  { key: 'quoted',          label: 'Quoted' },
  { key: 'confirmed',       label: 'Confirmed' },
]

export default function AdminItinerariesPage() {
  const [itineraries, setItineraries] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [filter,      setFilter]      = useState('all')
  const [search,      setSearch]      = useState('')
  const [selected,    setSelected]    = useState(null)

  async function load() {
    setRefreshing(true)
    const { data } = await supabase
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: false })
    setItineraries(data || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  const counts = useMemo(() => ({
    enquiry_pending: itineraries.filter(i => i.status === 'enquiry_pending').length,
    pending_review:  itineraries.filter(i => i.status === 'pending_review').length,
    quoted:          itineraries.filter(i => i.status === 'quoted').length,
    confirmed:       itineraries.filter(i => i.status === 'confirmed').length,
  }), [itineraries])

  const visible = itineraries.filter(it => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || it.booking_reference?.toLowerCase().includes(q)
      || it.client_info?.guest_name?.toLowerCase().includes(q)
      || it.client_info?.email?.toLowerCase().includes(q)
      || it.tour_summary?.tour_package?.toLowerCase().includes(q)
    const matchStatus = filter === 'all' || it.status === filter
    return matchSearch && matchStatus
  })

  function handleSaved(updated) {
    setItineraries(prev => prev.map(i => i.id === updated.id ? updated : i))
    setSelected(updated)
  }

  return (
    <div className="-m-6 lg:-m-8 min-h-screen bg-stone-950 p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Itineraries</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Review incoming requests, set pricing &amp; issue quotations
          </p>
        </div>
        <button
          onClick={load}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        {[
          { key: 'enquiry_pending', label: 'New Enquiries',   icon: Mail,        color: 'text-rose-400',    bg: 'bg-rose-500/10'    },
          { key: 'pending_review',  label: 'Pending Review',  icon: Clock,       color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
          { key: 'quoted',          label: 'Quoted',          icon: FileText,    color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
          { key: 'confirmed',       label: 'Confirmed',       icon: CheckCircle2,color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(({ key, label, icon: Icon, color, bg }) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className={`rounded-2xl border p-5 flex items-center gap-3 text-left transition-all
              ${filter === key
                ? `${bg} ${STATUS[key].border}`
                : 'bg-stone-900 border-white/5 hover:border-white/15'}`}
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${color}`}>{counts[key]}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, reference or tour…"
            className="w-full bg-stone-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors ${
                filter === key
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-900 border border-white/10 text-stone-400 hover:text-white hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-white/5 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-stone-600" />
          </div>
          <p className="text-stone-400 font-medium">
            {search ? 'No itineraries match your search.' : 'No itineraries yet.'}
          </p>
          <p className="text-stone-600 text-sm mt-1">
            Itineraries created here will appear as cards.
          </p>
        </div>
      )}

      {/* Card grid */}
      {!loading && visible.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map(it => {
            const s = STATUS[it.status] || STATUS.pending_review
            const hasPrice = it.pricing?.grand_total > 0
            return (
              <div
                key={it.id}
                className={`bg-stone-900 rounded-2xl border ${s.card} p-5 flex flex-col gap-4 hover:border-opacity-60 transition-all group`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-stone-500 tracking-wider">
                      {it.booking_reference}
                    </p>
                    <p className="text-white font-serif font-semibold text-base mt-0.5 line-clamp-1">
                      {it.tour_summary?.tour_package || 'Custom Itinerary'}
                    </p>
                  </div>
                  <StatusBadge status={it.status} />
                </div>

                {/* Client */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                    {(it.client_info?.guest_name || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-stone-200 text-sm font-medium truncate">
                      {it.client_info?.guest_name || '—'}
                    </p>
                    <p className="text-stone-500 text-xs truncate">
                      {it.client_info?.email || '—'}
                    </p>
                  </div>
                </div>

                {/* Tour meta */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-stone-800/60 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-stone-600 uppercase tracking-wider">Nights</p>
                    <p className="text-stone-200 font-bold text-sm mt-0.5">
                      {it.tour_summary?.duration_nights || '—'}
                    </p>
                  </div>
                  <div className="bg-stone-800/60 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-stone-600 uppercase tracking-wider">Guests</p>
                    <p className="text-stone-200 font-bold text-sm mt-0.5">
                      {it.tour_summary?.group_size || '—'}
                    </p>
                  </div>
                  <div className="bg-stone-800/60 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-stone-600 uppercase tracking-wider">Tier</p>
                    <p className="text-stone-200 font-bold text-[11px] mt-0.5 truncate">
                      {it.tour_summary?.hotel_tier || '—'}
                    </p>
                  </div>
                </div>

                {/* Departure */}
                {it.tour_summary?.departure_date && (
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {new Date(it.tour_summary.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {it.tour_summary?.return_date && (
                        <> → {new Date(it.tour_summary.return_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                      )}
                    </span>
                  </div>
                )}

                {/* Price (if quoted) */}
                {hasPrice && (
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-xs text-stone-500">Grand Total</span>
                    <span className="text-amber-400 font-bold font-mono text-sm">
                      {it.pricing?.is_saarc ? '₹' : '$'}{Number(it.pricing.grand_total).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelected(it)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-colors"
                  >
                    {it.status === 'enquiry_pending' ? 'Review & Create Voucher' : 'Edit Itinerary'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/itinerary/${it.booking_reference}`}
                    target="_blank"
                    className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-white/5 text-stone-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer count */}
      {!loading && (
        <p className="text-center text-xs text-stone-700 mt-8">
          {visible.length} of {itineraries.length} itineraries
        </p>
      )}

      {/* Edit drawer */}
      {selected && (
        <EditDrawer
          itinerary={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
