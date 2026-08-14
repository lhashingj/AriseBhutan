'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import {
  RefreshCw, Search, X, ChevronRight, ChevronDown, Plane, MapPin,
  User, Calendar, DollarSign, Loader2, CheckCircle2,
  Clock, FileText, AlertTriangle, ExternalLink, Mail,
  Plus, Trash2, BedDouble, ListChecks, ShieldAlert, CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import AdminTravelDocuments from '@/components/AdminTravelDocuments'
import AdminBookingGuests from '@/components/AdminBookingGuests'
import {
  computePricingDetailed, SAARC_INDIA_SET, DEFAULT_GST_APPLICABLE,
  computePricingV2, DEFAULT_GST_APPLICABLE_V2,
} from '@/utils/pricingCalculator'
import {
  getSectors, getAirlinesForSector, getFlightsForSector, findFlight,
  parseSector, daysLabel, ALL_AIRLINES, AIRPORTS, SCHEDULE_EFFECTIVE,
} from '@/data/flightSchedule'
import { tours as TOUR_PACKAGES } from '@/data/tours'
import { parseDayProgramme } from '@/utils/dayProgramme'

// ── Build a day_by_day array from a real tour package (used when an
//    admin starts a new voucher "from a package" for a WhatsApp/offline lead) ──
function mealsToCsv(meals) {
  const codes = []
  if (/breakfast/i.test(meals || '')) codes.push('B')
  if (/lunch/i.test(meals || ''))     codes.push('L')
  if (/dinner/i.test(meals || ''))    codes.push('D')
  return codes.join(',')
}
function buildDayByDayFromTour(tour) {
  return (tour?.itinerary || []).map((day, i) => ({
    day:                i + 1,
    date:               null,
    title:              day.title || '',
    description:        day.description || '',
    activities:         day.activities || [],
    location:           day.location || null,
    accommodation_name: day.accommodation || '',
    meals:              mealsToCsv(day.meals),
  }))
}

// ── Flight reference data — real Druk Air / Bhutan Airlines schedules ──
const FLIGHT_SECTORS = getSectors().map(s => s.label)

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

// Enquiry response SLA — Arise Bhutan promises a 24h turnaround.
// Only meaningful while a booking is still awaiting an admin quote.
function SlaBadge({ createdAt }) {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 3_600_000
  const tone = hours >= 24
    ? 'bg-red-500/15 text-red-400 border-red-500/25'
    : hours >= 12
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
  const label = hours < 1 ? '<1h' : hours < 48 ? `${Math.floor(hours)}h` : `${Math.floor(hours / 24)}d`
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${tone}`} title="Time since enquiry — 24h response SLA">
      <Clock className="w-2.5 h-2.5" /> {label}
    </span>
  )
}

// ── Pricing computation (nationality-aware) ───────────────────
// Extracted to utils/pricingCalculator.js — unit tested there.

// ── Input / label style helpers ───────────────────────────────
const inp = 'w-full bg-stone-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 transition-colors'
const lbl = 'text-[11px] text-stone-400 uppercase tracking-wider font-semibold block mb-1.5'

// ── Full Edit Drawer ──────────────────────────────────────────
function EditDrawer({ itinerary, onClose, onSaved, onDeleted }) {

  const [openFlight, setOpenFlight] = useState(null)
  const [openDay,    setOpenDay]    = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('itineraries').delete().eq('id', itinerary.id)
    setDeleting(false)
    if (error) {
      setSaveErr(error.message || 'Failed to delete itinerary.')
      setConfirmDelete(false)
      return
    }
    onDeleted(itinerary.id)
  }

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
    (itinerary.day_by_day || []).map(d => {
      // Older records only have a flattened `programme` string — migrate them
      // into the structured title/description/activities fields on load so
      // the editor (and the client-facing pages) work off real structure.
      const parsed = parseDayProgramme(d)
      return {
        ...d,
        title:       d.title       ?? parsed.title       ?? '',
        description: d.description ?? parsed.description ?? '',
        activities:  Array.isArray(d.activities) ? d.activities : parsed.activities,
      }
    })
  )

  const [accommodations, setAccommodations] = useState(
    (itinerary.tour_summary?.accommodations || []).map(a => ({ ...a }))
  )

  const [travelInterests, setTravelInterests] = useState(
    (itinerary.tour_summary?.travel_interests || []).map(ti => ({ ...ti }))
  )

  // Pricing schema is decided once, at creation, and stored on the record —
  // it never changes on save. This is what guarantees existing/confirmed
  // vouchers keep rendering with their original v1 structure forever, while
  // anything created after this feature shipped (schema: 'v2') gets the new
  // itemized breakdown below.
  const isV2Pricing = itinerary.pricing?.schema === 'v2'

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
  const [paymentLink,       setPaymentLink]       = useState(itinerary.payment_link                  ?? '')

  // Editable display names for the 5 fixed cost categories — the underlying
  // rate basis (per pax/night, per pax, flat) can't change, but admin can
  // relabel what the client sees, e.g. "Service" → "Guide & Vehicle Fee".
  const [serviceLabel,   setServiceLabel]   = useState(itinerary.pricing?.service_label   || 'Service (Guide / Vehicle / Meals)')
  const [entranceLabel,  setEntranceLabel]  = useState(itinerary.pricing?.entrance_label  || 'Entrance Fees')
  const [specialsLabel,  setSpecialsLabel]  = useState(itinerary.pricing?.specials_label  || 'Special Experiences & Meals')
  const [flightLabel,    setFlightLabel]    = useState(itinerary.pricing?.flight_label    || 'International Flights')
  const [wireLabel,      setWireLabel]      = useState(itinerary.pricing?.wire_label      || 'Wire / Bank Transfer Fee')

  // Per-category GST toggle — defaults match historical behaviour (service only taxed).
  const [gstApplicable, setGstApplicable] = useState({
    ...DEFAULT_GST_APPLICABLE, ...(itinerary.pricing?.gst_applicable || {}),
  })
  function toggleGst(key) {
    setGstApplicable(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Ad-hoc extra cost line items — for anything that doesn't fit the fixed
  // categories above (e.g. a permit fee, a rental, a one-off charge).
  const [extraCosts, setExtraCosts] = useState(
    (itinerary.pricing?.extra_costs || []).map(c => ({
      label: c.label || '', amount: c.amount ?? '', perPax: !!c.perPax, gstApplicable: !!c.gstApplicable,
    }))
  )
  function addExtraCost() {
    setExtraCosts(prev => [...prev, { label: '', amount: '', perPax: true, gstApplicable: false }])
  }
  function updateExtraCost(idx, field, val) {
    setExtraCosts(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c))
  }
  function removeExtraCost(idx) {
    setExtraCosts(prev => prev.filter((_, i) => i !== idx))
  }

  // ── v2 pricing state (new-schema vouchers only) ─────────────
  // Fully separate from the v1 state above — nothing here is read by v1
  // rendering/save logic, so it can't affect existing/confirmed vouchers.
  const [guideRate,       setGuideRate]       = useState(itinerary.pricing?.guide_rate       ?? '') // per day
  const [guideLabel,      setGuideLabel]      = useState(itinerary.pricing?.guide_label      || 'Guide Charge')
  const [vehicleRate,     setVehicleRate]     = useState(itinerary.pricing?.vehicle_rate     ?? '') // per day
  const [vehicleLabel,    setVehicleLabel]    = useState(itinerary.pricing?.vehicle_label    || 'Vehicle & Transportation')
  const [serviceFeeAmount, setServiceFeeAmount] = useState(itinerary.pricing?.service_fee_amount ?? '') // flat
  const [serviceFeeLabel,  setServiceFeeLabel]  = useState(itinerary.pricing?.service_fee_label  || 'Service Charge / Agency Fee')
  const [mealsAmount,     setMealsAmount]     = useState(itinerary.pricing?.meals_amount     ?? '') // flat
  const [mealsLabel,      setMealsLabel]      = useState(itinerary.pricing?.meals_label      || 'Meals')
  const [hotelRoomRate,   setHotelRoomRate]   = useState(itinerary.pricing?.hotel_room_rate  ?? '') // per room/night
  const [hotelRooms,      setHotelRooms]      = useState(itinerary.pricing?.hotel_rooms      ?? 1)
  const [hotelLabel,      setHotelLabel]      = useState(itinerary.pricing?.hotel_label      || 'Hotel / Accommodation')

  const [entranceFeePerPaxV2, setEntranceFeePerPaxV2] = useState(itinerary.pricing?.entrance_fee_per_pax ?? '')
  const [entranceLabelV2,     setEntranceLabelV2]     = useState(itinerary.pricing?.entrance_label || 'Entrance & Monument Fees')
  const [specialsPerPaxV2,    setSpecialsPerPaxV2]    = useState(itinerary.pricing?.specials_per_pax ?? '')
  const [specialsLabelV2,     setSpecialsLabelV2]     = useState(itinerary.pricing?.specials_label || 'Special Experiences')

  const [includeFlightsV2, setIncludeFlightsV2] = useState(itinerary.pricing?.include_flights ?? false)
  const [flightPerPaxV2,   setFlightPerPaxV2]   = useState(itinerary.pricing?.flight_per_pax ?? '')
  const [flightLabelV2,    setFlightLabelV2]    = useState(itinerary.pricing?.flight_label || 'International Flights')
  const [flightDetails,    setFlightDetails]    = useState(itinerary.pricing?.flight_details || '')

  const [gstApplicableV2, setGstApplicableV2] = useState({
    ...DEFAULT_GST_APPLICABLE_V2, ...(itinerary.pricing?.gst_applicable || {}),
  })
  function toggleGstV2(key) {
    setGstApplicableV2(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // SDF/visa manual overrides — e.g. a client who already paid these
  // themselves outside the package. Empty string = auto-calculated.
  const [sdfOverrideOn,  setSdfOverrideOn]  = useState(itinerary.pricing?.sdf_override  != null)
  const [sdfOverride,    setSdfOverride]    = useState(itinerary.pricing?.sdf_override  ?? '')
  const [visaOverrideOn, setVisaOverrideOn] = useState(itinerary.pricing?.visa_override != null)
  const [visaOverride,   setVisaOverride]   = useState(itinerary.pricing?.visa_override ?? '')

  const DEFAULT_INCLUSIONS = [
    'Accommodation as per itinerary',
    'Licensed English-speaking DOT-certified guide',
    'Private vehicle & dedicated driver',
    'Sustainable Development Fee (SDF) — $100/person/night',
    'All monument & dzong entry fees',
    'Meals as per itinerary',
    'International flights (economy class)',
  ]
  const DEFAULT_EXCLUSIONS = [
    'Travel & medical insurance',
    'Personal expenses',
    'Gratuities for guide & driver',
  ]
  const DEFAULT_CANCELLATION = [
    { period: 'Tour Package — 60+ days before departure',   refund: 'USD $250/person flat fee + bank transfer charges' },
    { period: 'Tour Package — 60–10 days before departure', refund: '45% of package cost retained' },
    { period: 'Tour Package — Under 10 days / No-show',     refund: '100% of package cost retained (non-refundable)' },
    { period: 'Air Ticket — 30+ days before travel',        refund: '75% refund' },
    { period: 'Air Ticket — 10–30 days before travel',      refund: '50% refund' },
    { period: 'Air Ticket — Under 4 days before travel',    refund: '25% refund' },
    { period: 'Air Ticket — Within 4 days / No-show',       refund: 'Non-refundable' },
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
      sdfOverride:  sdfOverrideOn  ? (sdfOverride  === '' ? 0 : Number(sdfOverride))  : null,
      visaOverride: visaOverrideOn ? (visaOverride === '' ? 0 : Number(visaOverride)) : null,
      extraCosts,
      gstApplicable,
    }),
    [primaryNationality, nights, adultPax, child611Pax, infantPax,
     serviceRate, entranceFeePerPax, specialsPerPax, flightPerPax, includeFlights, wireTransfer,
     sdfOverrideOn, sdfOverride, visaOverrideOn, visaOverride, extraCosts, gstApplicable]
  )

  const calcV2 = useMemo(
    () => computePricingV2({
      nationality: primaryNationality,
      nights,
      adultPax, child611Pax, infantPax,
      guideRate, vehicleRate, serviceFeeAmount, mealsAmount, hotelRoomRate, hotelRooms,
      entranceFeePerPax: entranceFeePerPaxV2, specialsPerPax: specialsPerPaxV2,
      includeFlights: includeFlightsV2, flightPerPax: flightPerPaxV2,
      sdfOverride:  sdfOverrideOn  ? (sdfOverride  === '' ? 0 : Number(sdfOverride))  : null,
      visaOverride: visaOverrideOn ? (visaOverride === '' ? 0 : Number(visaOverride)) : null,
      extraCosts,
      gstApplicable: gstApplicableV2,
    }),
    [primaryNationality, nights, adultPax, child611Pax, infantPax,
     guideRate, vehicleRate, serviceFeeAmount, mealsAmount, hotelRoomRate, hotelRooms,
     entranceFeePerPaxV2, specialsPerPaxV2, includeFlightsV2, flightPerPaxV2,
     sdfOverrideOn, sdfOverride, visaOverrideOn, visaOverride, extraCosts, gstApplicableV2]
  )

  // Whichever schema applies to this itinerary — used for the parts of the
  // Cost Summary that are identical in shape between v1 and v2 (SDF, visa,
  // package cost, GST, grand total).
  const activeCalc = isV2Pricing ? calcV2 : calc

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
  function handleSectorChange(idx, sector) {
    setFlights(prev => prev.map((f, i) => i === idx
      ? { ...f, sector, airline: '', flight_no: '', departs: '', arrives: '' }
      : f))
  }
  function handleAirlineChange(idx, airline) {
    setFlights(prev => prev.map((f, i) => i === idx
      ? { ...f, airline, flight_no: '', departs: '', arrives: '' }
      : f))
  }
  function handleFlightNoChange(idx, flightNo, sector, date) {
    setFlights(prev => prev.map((f, i) => {
      if (i !== idx) return f
      const parsed = parseSector(sector)
      const match = parsed && flightNo !== '__other__' ? findFlight(flightNo, parsed.from, parsed.to, date) : null
      return {
        ...f,
        flight_no: flightNo,
        departs: match ? match.departs : f.departs,
        arrives: match ? match.arrives : f.arrives,
      }
    }))
  }
  function handleDateChange(idx, date, sector, flightNo) {
    setFlights(prev => prev.map((f, i) => {
      if (i !== idx) return f
      const parsed = parseSector(sector)
      const match = parsed && flightNo && flightNo !== '__other__' ? findFlight(flightNo, parsed.from, parsed.to, date) : null
      return {
        ...f,
        date,
        departs: match ? match.departs : f.departs,
        arrives: match ? match.arrives : f.arrives,
      }
    }))
  }

  // ── day helpers ────────────────────────────────────────────
  function addDay() {
    setDays(prev => [...prev, {
      day: prev.length + 1, date: '', title: '', description: '', activities: [], location: '',
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

    // Pricing payload shape depends on the itinerary's fixed schema (see
    // isV2Pricing above). v1's shape is preserved byte-for-byte so
    // existing/confirmed vouchers never see their saved structure change.
    const pricingPayload = isV2Pricing ? {
      // inputs
      schema:                'v2',
      adult_pax:              Number(adultPax)     || 0,
      child_611_pax:          Number(child611Pax)  || 0,
      infant_pax:             Number(infantPax)    || 0,
      guide_rate:              Number(guideRate)              || 0,
      guide_label:             guideLabel.trim()              || 'Guide Charge',
      vehicle_rate:            Number(vehicleRate)            || 0,
      vehicle_label:           vehicleLabel.trim()            || 'Vehicle & Transportation',
      service_fee_amount:      Number(serviceFeeAmount)       || 0,
      service_fee_label:       serviceFeeLabel.trim()         || 'Service Charge / Agency Fee',
      meals_amount:            Number(mealsAmount)            || 0,
      meals_label:             mealsLabel.trim()              || 'Meals',
      hotel_room_rate:         Number(hotelRoomRate)          || 0,
      hotel_rooms:             Number(hotelRooms)             || 0,
      hotel_label:             hotelLabel.trim()               || 'Hotel / Accommodation',
      entrance_fee_per_pax:    Number(entranceFeePerPaxV2)    || 0,
      entrance_label:          entranceLabelV2.trim()         || 'Entrance & Monument Fees',
      specials_per_pax:        Number(specialsPerPaxV2)       || 0,
      specials_label:          specialsLabelV2.trim()         || 'Special Experiences',
      include_flights:         includeFlightsV2,
      flight_per_pax:          Number(flightPerPaxV2)         || 0,
      flight_label:            flightLabelV2.trim()           || 'International Flights',
      flight_details:          flightDetails.trim(),
      inr_rate:                Number(inrRate)                || 83.5,
      extra_costs:             calcV2.extrasBreakdown,
      sdf_override:            sdfOverrideOn  ? (Number(sdfOverride)  || 0) : null,
      visa_override:           visaOverrideOn ? (Number(visaOverride) || 0) : null,
      gst_applicable:          gstApplicableV2,
      // computed
      is_saarc:                calcV2.isSaarc,
      currency:                calcV2.currency,
      sdf_total:               calcV2.sdfTotal,
      visa_total:              calcV2.visaTotal,
      guide_total:             calcV2.guideTotal,
      vehicle_total:           calcV2.vehicleTotal,
      service_fee_total:       calcV2.serviceFeeTotal,
      meals_total:             calcV2.mealsTotal,
      hotel_total:             calcV2.hotelTotal,
      entrance_total:          calcV2.entrTotal,
      specials_total:          calcV2.specTotal,
      flights_total:           calcV2.fltTotal,
      gst:                     calcV2.gst,
      package_cost:            calcV2.pkgCost,
      grand_total:             calcV2.grandTotal,
      equivalent_inr:          !calcV2.isSaarc ? calcV2.grandTotal * (Number(inrRate) || 83.5) : 0,
    } : {
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
      extra_costs:          calc.extrasBreakdown,
      sdf_override:         sdfOverrideOn  ? (Number(sdfOverride)  || 0) : null,
      visa_override:        visaOverrideOn ? (Number(visaOverride) || 0) : null,
      service_label:        serviceLabel.trim()  || 'Service (Guide / Vehicle / Meals)',
      entrance_label:       entranceLabel.trim() || 'Entrance Fees',
      specials_label:       specialsLabel.trim() || 'Special Experiences & Meals',
      flight_label:         flightLabel.trim()   || 'International Flights',
      wire_label:           wireLabel.trim()     || 'Wire / Bank Transfer Fee',
      gst_applicable:       gstApplicable,
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
        day_by_day:   days.map(d => ({
                        ...d,
                        activities: (d.activities || []).map(a => (a || '').trim()).filter(Boolean),
                      })),
        pricing:      pricingPayload,
        payment_link: paymentLink.trim() || null,
        status:       nextStatus,
      })
      .eq('id', itinerary.id)
      .select()
      .single()

    setSaving(false)
    if (error) { setSaveErr(error.message); return }

    // Notify the client by email the moment their itinerary moves to
    // Quoted or Confirmed — fire-and-forget, never blocks the save.
    const statusChanged = nextStatus !== itinerary.status
    if (statusChanged && (nextStatus === 'quoted' || nextStatus === 'confirmed')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return
        fetch('/api/notify-itinerary-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ bookingReference: itinerary.booking_reference, status: nextStatus }),
        }).catch(err => console.error('Status notification failed:', err))
      })
    }

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
                  <label className={lbl}>Arrival Date</label>
                  <input
                    type="date"
                    value={tourSummary.departure_date}
                    onChange={e => setTourSummary(p => ({ ...p, departure_date: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Departure Date</label>
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
                            onChange={e => handleSectorChange(idx, e.target.value)}
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
                            onChange={e => handleAirlineChange(idx, e.target.value)}
                            className={inp}
                          >
                            <option value="">Select airline…</option>
                            {(() => {
                              const parsed = parseSector(f.sector)
                              const options = parsed ? getAirlinesForSector(parsed.from, parsed.to) : ALL_AIRLINES
                              return (options.length > 0 ? options : ALL_AIRLINES).map(a => (
                                <option key={a} value={a}>{a}</option>
                              ))
                            })()}
                          </select>
                        </div>

                        {/* Flight No — dropdown of real scheduled flights, else free text */}
                        <div>
                          <label className={lbl}>Flight No.</label>
                          {(() => {
                            const parsed = parseSector(f.sector)
                            const scheduled = parsed ? getFlightsForSector(parsed.from, parsed.to, f.airline || undefined) : []
                            const flightNos = [...new Set(scheduled.map(s => s.flightNo))]
                            const selectedMatch = parsed && f.flight_no && f.flight_no !== '__other__'
                              ? findFlight(f.flight_no, parsed.from, parsed.to, f.date)
                              : null
                            return flightNos.length > 0 ? (
                              <>
                                <select
                                  value={f.flight_no}
                                  onChange={e => handleFlightNoChange(idx, e.target.value, f.sector, f.date)}
                                  className={inp}
                                >
                                  <option value="">Select flight no…</option>
                                  {flightNos.map(n => {
                                    const variant = findFlight(n, parsed.from, parsed.to, f.date) || scheduled.find(s => s.flightNo === n)
                                    return (
                                      <option key={n} value={n}>
                                        {n} · {variant.departs}→{variant.arrives}{variant.via ? ` via ${AIRPORTS[variant.via]}` : ''} · {daysLabel(variant.days)}
                                      </option>
                                    )
                                  })}
                                  <option value="__other__">Other (type below)</option>
                                </select>
                                {selectedMatch && (
                                  <p className="text-[10px] text-stone-500 mt-1">
                                    Scheduled: {selectedMatch.departs} → {selectedMatch.arrives}
                                    {selectedMatch.via ? ` via ${AIRPORTS[selectedMatch.via]}` : ''} · {daysLabel(selectedMatch.days)}
                                    {f.airline && SCHEDULE_EFFECTIVE[f.airline] ? ` · schedule effective ${SCHEDULE_EFFECTIVE[f.airline]}` : ''}
                                  </p>
                                )}
                              </>
                            ) : (
                              <input
                                type="text"
                                value={f.flight_no}
                                onChange={e => updateFlight(idx, 'flight_no', e.target.value)}
                                placeholder="e.g. KB 131"
                                className={inp}
                              />
                            )
                          })()}
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
                              onChange={e => handleDateChange(idx, e.target.value, f.sector, f.flight_no)}
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
                const programmePreview = (d.title || parseDayProgramme(d).title || '').slice(0, 48)
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
                          <label className={lbl}>Topic</label>
                          <input
                            type="text"
                            value={d.title || ''}
                            onChange={e => updateDay(idx, 'title', e.target.value)}
                            placeholder="e.g. Arrival in Paro → Thimphu"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className={lbl}>Description</label>
                          <textarea
                            value={d.description || ''}
                            onChange={e => updateDay(idx, 'description', e.target.value)}
                            rows={3}
                            placeholder="Narrative paragraph describing the day…"
                            className={`${inp} resize-none`}
                          />
                        </div>
                        <div>
                          <label className={lbl}>Activities</label>
                          <textarea
                            value={(d.activities || []).join('\n')}
                            onChange={e => updateDay(idx, 'activities', e.target.value.split('\n'))}
                            rows={3}
                            placeholder={'One activity per line, e.g.\nAirport pickup & Khadar welcome\nBuddha Dordenma\nWelcome dinner'}
                            className={`${inp} resize-none`}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className={lbl}>Location</label>
                            <input
                              type="text"
                              value={d.location || ''}
                              onChange={e => updateDay(idx, 'location', e.target.value)}
                              placeholder="e.g. Thimphu"
                              className={inp}
                            />
                          </div>
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
                activeCalc.isSaarc ? 'bg-blue-500/10 border-blue-500/20' : 'bg-stone-800 border-white/10'
              }`}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-0.5">Rate Type — auto from Nationality</p>
                  <p className={`text-sm font-bold ${activeCalc.isSaarc ? 'text-blue-300' : 'text-stone-200'}`}>
                    {activeCalc.isSaarcIndia
                      ? 'India — Entry Permit · INR / Nu.'
                      : activeCalc.isSaarcBdMv
                      ? 'Bangladesh / Maldives — Visa on Arrival · INR / Nu.'
                      : primaryNationality
                      ? `${primaryNationality} — International · USD ($)`
                      : 'Set Nationality in Client tab'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {activeCalc.isSaarcIndia
                      ? 'SDF: ₹1,200/adult/night · ₹600/child(6–11)/night · Infants free · No visa fee'
                      : activeCalc.isSaarcBdMv
                      ? 'SDF: ₹1,200/person/night · No advance visa fee'
                      : 'SDF: $100/person/night · Visa: $40/person'}
                  </p>
                </div>
                <div className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${
                  activeCalc.isSaarc
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : 'bg-stone-700 text-stone-400 border-white/10'
                }`}>
                  {activeCalc.isSaarc ? 'INR' : 'USD'}
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
                      {activeCalc.isSaarcIndia ? 'Children 6–11 (₹600)' : 'Children 6–11'}
                    </label>
                    <input type="number" min="0" value={child611Pax}
                      onChange={e => setChild611Pax(e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">
                      {activeCalc.isSaarcIndia ? 'Infants ≤5 (free)' : 'Infants / ≤5'}
                    </label>
                    <input type="number" min="0" value={infantPax}
                      onChange={e => setInfantPax(e.target.value)} className={inp} />
                  </div>
                </div>
                <p className="text-[10px] text-stone-600 mt-2">
                  Total: {activeCalc.totalPax} pax · {nights} nights
                  {activeCalc.isSaarcIndia && activeCalc.infantsNum > 0 ? ` · ${activeCalc.infantsNum} infant(s) exempt from SDF` : ''}
                </p>
              </div>

              {/* Itemized rate inputs */}
              <div className="space-y-2">
                <p className={lbl}>Itemized Costs</p>

                {!isV2Pricing && (
                <>
                {/* Service Rate */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <input type="text" value={serviceLabel} onChange={e => setServiceLabel(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  <p className="text-[9px] text-stone-600 mb-1.5">Per pax / night</p>
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
                  <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={gstApplicable.service} onChange={() => toggleGst('service')}
                      className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                    GST (5%) applies to this amount
                  </label>
                </div>

                {/* Entrance Fees */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <input type="text" value={entranceLabel} onChange={e => setEntranceLabel(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  <p className="text-[9px] text-stone-600 mb-1.5">Per pax</p>
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
                  <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={gstApplicable.entrance} onChange={() => toggleGst('entrance')}
                      className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                    GST (5%) applies to this amount
                  </label>
                </div>

                {/* Special Experiences */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <input type="text" value={specialsLabel} onChange={e => setSpecialsLabel(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  <p className="text-[9px] text-stone-600 mb-1.5">Per pax</p>
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
                  <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={gstApplicable.specials} onChange={() => toggleGst('specials')}
                      className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                    GST (5%) applies to this amount
                  </label>
                </div>

                {/* Flights */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="incl-flights" checked={includeFlights}
                      onChange={e => setIncludeFlights(e.target.checked)}
                      className="rounded accent-amber-500 w-3.5 h-3.5 cursor-pointer shrink-0" />
                    <input type="text" value={flightLabel} onChange={e => setFlightLabel(e.target.value)}
                      className="flex-1 bg-transparent text-[10px] text-stone-400 uppercase tracking-wider focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  </div>
                  {includeFlights && (
                    <>
                      <p className="text-[9px] text-stone-600 mb-1.5">Per pax</p>
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
                      <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                        <input type="checkbox" checked={gstApplicable.flights} onChange={() => toggleGst('flights')}
                          className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                        GST (5%) applies to this amount
                      </label>
                    </>
                  )}
                </div>

                {/* Wire Transfer */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <input type="text" value={wireLabel} onChange={e => setWireLabel(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  <p className="text-[9px] text-stone-600 mb-1.5">Flat fee</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calc.sym}</span>
                    <input type="number" min="0" step="10" value={wireTransfer}
                      onChange={e => setWireTransfer(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`} />
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={gstApplicable.wire} onChange={() => toggleGst('wire')}
                      className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                    GST (5%) applies to this amount
                  </label>
                </div>
                </>
                )}

                {isV2Pricing && (
                <>
                {/* Guide & Vehicle — per day (rate × days, where days = nights + 1) */}
                {[
                  { label: guideLabel,   setLabel: setGuideLabel,   rate: guideRate,   setRate: setGuideRate,   total: calcV2.guideTotal,   gstKey: 'guide' },
                  { label: vehicleLabel, setLabel: setVehicleLabel, rate: vehicleRate, setRate: setVehicleRate, total: calcV2.vehicleTotal, gstKey: 'vehicle' },
                ].map((f, i) => (
                  <div key={i} className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                    <input type="text" value={f.label} onChange={e => f.setLabel(e.target.value)}
                      className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                    <p className="text-[9px] text-stone-600 mb-1.5">Per day</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calcV2.sym}</span>
                      <input type="number" min="0" step="100" value={f.rate}
                        onChange={e => f.setRate(e.target.value)}
                        placeholder="0" className={`${inp} pl-7`} />
                    </div>
                    {f.rate > 0 && (
                      <p className="text-[10px] text-stone-500 mt-1.5">
                        {calcV2.sym}{Number(f.rate).toLocaleString()} × {calcV2.days} days = {calcV2.sym}{f.total.toLocaleString()}
                      </p>
                    )}
                    <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                      <input type="checkbox" checked={gstApplicableV2[f.gstKey]} onChange={() => toggleGstV2(f.gstKey)}
                        className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                      GST (5%) applies to this amount
                    </label>
                  </div>
                ))}

                {/* Service Charge / Agency Fee — flat lump sum */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <input type="text" value={serviceFeeLabel} onChange={e => setServiceFeeLabel(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  <p className="text-[9px] text-stone-600 mb-1.5">Flat total</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calcV2.sym}</span>
                    <input type="number" min="0" step="10" value={serviceFeeAmount}
                      onChange={e => setServiceFeeAmount(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`} />
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={gstApplicableV2.serviceFee} onChange={() => toggleGstV2('serviceFee')}
                      className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                    GST (5%) applies to this amount
                  </label>
                </div>

                {/* Meals — direct/flat total for all meals */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <input type="text" value={mealsLabel} onChange={e => setMealsLabel(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  <p className="text-[9px] text-stone-600 mb-1.5">Total direct amount</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calcV2.sym}</span>
                    <input type="number" min="0" step="10" value={mealsAmount}
                      onChange={e => setMealsAmount(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`} />
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={gstApplicableV2.meals} onChange={() => toggleGstV2('meals')}
                      className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                    GST (5%) applies to this amount
                  </label>
                </div>

                {/* Hotel / Accommodation — per room / night */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <input type="text" value={hotelLabel} onChange={e => setHotelLabel(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  <p className="text-[9px] text-stone-600 mb-1.5">Per room / night</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-stone-600 block mb-1">Rooms</label>
                      <input type="number" min="0" step="1" value={hotelRooms}
                        onChange={e => setHotelRooms(e.target.value)}
                        placeholder="1" className={inp} />
                    </div>
                    <div>
                      <label className="text-[9px] text-stone-600 block mb-1">Rate / room / night</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calcV2.sym}</span>
                        <input type="number" min="0" step="10" value={hotelRoomRate}
                          onChange={e => setHotelRoomRate(e.target.value)}
                          placeholder="0" className={`${inp} pl-7`} />
                      </div>
                    </div>
                  </div>
                  {hotelRoomRate > 0 && (
                    <p className="text-[10px] text-stone-500 mt-1.5">
                      {calcV2.sym}{Number(hotelRoomRate).toLocaleString()} × {calcV2.rooms} room{calcV2.rooms === 1 ? '' : 's'} × {nights} nights = {calcV2.sym}{calcV2.hotelTotal.toLocaleString()}
                    </p>
                  )}
                  <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={gstApplicableV2.hotel} onChange={() => toggleGstV2('hotel')}
                      className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                    GST (5%) applies to this amount
                  </label>
                </div>

                {/* Entrance & Monument Fees */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <input type="text" value={entranceLabelV2} onChange={e => setEntranceLabelV2(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  <p className="text-[9px] text-stone-600 mb-1.5">Per pax</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calcV2.sym}</span>
                    <input type="number" min="0" step="100" value={entranceFeePerPaxV2}
                      onChange={e => setEntranceFeePerPaxV2(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`} />
                  </div>
                  {entranceFeePerPaxV2 > 0 && (
                    <p className="text-[10px] text-stone-500 mt-1.5">
                      {calcV2.sym}{Number(entranceFeePerPaxV2).toLocaleString()} × {calcV2.totalPax} pax = {calcV2.sym}{calcV2.entrTotal.toLocaleString()}
                    </p>
                  )}
                  <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={gstApplicableV2.entrance} onChange={() => toggleGstV2('entrance')}
                      className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                    GST (5%) applies to this amount
                  </label>
                </div>

                {/* Special Experiences */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <input type="text" value={specialsLabelV2} onChange={e => setSpecialsLabelV2(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                  <p className="text-[9px] text-stone-600 mb-1.5">Per pax</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calcV2.sym}</span>
                    <input type="number" min="0" step="100" value={specialsPerPaxV2}
                      onChange={e => setSpecialsPerPaxV2(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`} />
                  </div>
                  {specialsPerPaxV2 > 0 && (
                    <p className="text-[10px] text-stone-500 mt-1.5">
                      {calcV2.sym}{Number(specialsPerPaxV2).toLocaleString()} × {calcV2.totalPax} pax = {calcV2.sym}{calcV2.specTotal.toLocaleString()}
                    </p>
                  )}
                  <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={gstApplicableV2.specials} onChange={() => toggleGstV2('specials')}
                      className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                    GST (5%) applies to this amount
                  </label>
                </div>

                {/* International Flights */}
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <input type="text" value={flightLabelV2} onChange={e => setFlightLabelV2(e.target.value)}
                      className="flex-1 bg-transparent text-[10px] text-stone-400 uppercase tracking-wider focus:outline-none focus:text-stone-200 border-b border-transparent focus:border-white/10 pb-0.5" />
                    <button type="button" role="switch" aria-checked={includeFlightsV2}
                      onClick={() => setIncludeFlightsV2(v => !v)}
                      className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${includeFlightsV2 ? 'bg-amber-500' : 'bg-stone-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${includeFlightsV2 ? 'translate-x-4' : ''}`} />
                    </button>
                  </div>
                  {includeFlightsV2 && (
                    <>
                      <p className="text-[9px] text-stone-600 mb-1.5">Airfare — per pax</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{calcV2.sym}</span>
                        <input type="number" min="0" step="100" value={flightPerPaxV2}
                          onChange={e => setFlightPerPaxV2(e.target.value)}
                          placeholder="0" className={`${inp} pl-7`} />
                      </div>
                      {flightPerPaxV2 > 0 && (
                        <p className="text-[10px] text-stone-500 mt-1.5">
                          {calcV2.sym}{Number(flightPerPaxV2).toLocaleString()} × {calcV2.totalPax} pax = {calcV2.sym}{calcV2.fltTotal.toLocaleString()}
                        </p>
                      )}
                      <label className="text-[10px] text-stone-400 uppercase tracking-wider block mt-2 mb-1">Flight Details</label>
                      <textarea value={flightDetails} onChange={e => setFlightDetails(e.target.value)}
                        rows={2} placeholder="e.g. Druk Air KB120 Bangkok–Paro, economy class, returning KB121"
                        className={`${inp} resize-none`} />
                      <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                        <input type="checkbox" checked={gstApplicableV2.flights} onChange={() => toggleGstV2('flights')}
                          className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                        GST (5%) applies to this amount
                      </label>
                    </>
                  )}
                </div>
                </>
                )}

                {/* Extra cost line items — freeform, admin add/remove */}
                {extraCosts.map((c, idx) => (
                  <div key={idx} className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input type="text" value={c.label}
                        onChange={e => updateExtraCost(idx, 'label', e.target.value)}
                        placeholder="e.g. Camera / photography permit"
                        className={`${inp} flex-1`} />
                      <button onClick={() => removeExtraCost(idx)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">{activeCalc.sym}</span>
                        <input type="number" min="0" step="10" value={c.amount}
                          onChange={e => updateExtraCost(idx, 'amount', e.target.value)}
                          placeholder="0" className={`${inp} pl-7`} />
                      </div>
                      <label className="flex items-center gap-1.5 text-[10px] text-stone-400 uppercase tracking-wider cursor-pointer shrink-0">
                        <input type="checkbox" checked={c.perPax}
                          onChange={e => updateExtraCost(idx, 'perPax', e.target.checked)}
                          className="rounded accent-amber-500 w-3.5 h-3.5 cursor-pointer" />
                        Per pax
                      </label>
                    </div>
                    {Number(c.amount) > 0 && (
                      <p className="text-[10px] text-stone-500 mt-1.5">
                        {c.perPax
                          ? `${activeCalc.sym}${Number(c.amount).toLocaleString()} × ${activeCalc.totalPax} pax = ${activeCalc.sym}${(Number(c.amount) * activeCalc.totalPax).toLocaleString()}`
                          : `Flat fee = ${activeCalc.sym}${Number(c.amount).toLocaleString()}`}
                      </p>
                    )}
                    <label className="flex items-center gap-1.5 text-[10px] text-amber-600/70 mt-1.5 cursor-pointer">
                      <input type="checkbox" checked={c.gstApplicable}
                        onChange={e => updateExtraCost(idx, 'gstApplicable', e.target.checked)}
                        className="rounded accent-amber-500 w-3 h-3 cursor-pointer" />
                      GST (5%) applies to this amount
                    </label>
                  </div>
                ))}
                <button
                  onClick={addExtraCost}
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-stone-500 hover:text-stone-300 hover:border-white/40 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Extra Cost Line
                </button>
              </div>

              {/* Client Payment Checkout — Bhutan Payments */}
              <div className="space-y-2">
                <p className={lbl}>
                  <CreditCard className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-amber-400" />
                  Client Payment Checkout
                </p>
                <div className="bg-stone-800/60 rounded-xl border border-white/5 p-3">
                  <label className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1.5">
                    Bhutan Payments Link
                  </label>
                  <input
                    type="url"
                    value={paymentLink}
                    onChange={e => setPaymentLink(e.target.value)}
                    placeholder="https://checkout.bhutanpayments.com/…"
                    className={inp}
                  />
                  <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed">
                    Paste the hosted checkout link generated from your Bhutan Payments / BNB merchant
                    dashboard for this booking. Once saved and the itinerary is Quoted or Confirmed, the
                    client&apos;s voucher shows a &quot;Pay via Credit/Debit Card&quot; button linking here.
                  </p>
                  {paymentLink.trim() && (
                    <a
                      href={paymentLink.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                    >
                      <ExternalLink className="w-3 h-3" /> Preview link
                    </a>
                  )}
                </div>

                {/* Direct API checkout — disabled: no public Bhutan Payments API docs exist yet */}
                <div className="bg-stone-800/30 rounded-xl border border-dashed border-white/10 p-3 opacity-60">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-stone-400 uppercase tracking-wider">
                      Direct API Checkout (Merchant Credentials)
                    </label>
                    <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-stone-700 text-stone-400">
                      Not Available
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed">
                    Bhutan Payments does not yet publish developer API documentation, so a direct hosted-checkout
                    session integration can&apos;t be built without fabricating endpoint/auth details. Use the
                    payment link above for now — once Bhutan Payments/BNB issue merchant API credentials and specs,
                    this section can be wired up for real-time checkout session creation.
                  </p>
                </div>
              </div>

              {/* Cost summary */}
              <div className="bg-stone-950 rounded-2xl p-5 space-y-2.5 border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">Cost Summary</p>

                {/* SDF rows */}
                {sdfOverrideOn ? (
                  <div className="flex items-center justify-between gap-2 text-stone-400 text-sm">
                    <span>SDF (manual override)</span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs">{activeCalc.sym}</span>
                        <input
                          type="number"
                          value={sdfOverride}
                          onChange={e => setSdfOverride(e.target.value)}
                          placeholder="0"
                          className="w-28 bg-stone-800 border border-amber-500/30 rounded-lg pl-6 pr-2 py-1 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        onClick={() => { setSdfOverrideOn(false); setSdfOverride('') }}
                        className="text-[11px] text-stone-500 hover:text-stone-300 underline whitespace-nowrap"
                      >
                        Reset to auto ({activeCalc.sym}{activeCalc.sdfAuto.toLocaleString()})
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {activeCalc.isSaarcIndia ? (
                      <>
                        {activeCalc.adultsNum > 0 && (
                          <div className="flex justify-between text-stone-400 text-sm">
                            <span>SDF ₹1,200 × {activeCalc.adultsNum} adult{activeCalc.adultsNum > 1 ? 's' : ''} × {nights} nights</span>
                            <span className="font-mono text-stone-200">₹{activeCalc.sdfAdult.toLocaleString()}</span>
                          </div>
                        )}
                        {activeCalc.c611Num > 0 && (
                          <div className="flex justify-between text-stone-400 text-sm">
                            <span>SDF ₹600 × {activeCalc.c611Num} child(6–11) × {nights} nights</span>
                            <span className="font-mono text-stone-200">₹{activeCalc.sdfChild.toLocaleString()}</span>
                          </div>
                        )}
                        {activeCalc.infantsNum > 0 && (
                          <div className="flex justify-between text-stone-400 text-sm">
                            <span>SDF — {activeCalc.infantsNum} infant(s) / ≤5</span>
                            <span className="font-mono text-emerald-400 text-xs">Exempt</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex justify-between text-stone-400 text-sm">
                        <span>SDF ({activeCalc.isSaarc ? '₹1,200' : '$100'} × {activeCalc.isSaarc ? activeCalc.adultsNum + activeCalc.c611Num : activeCalc.totalPax} pax × {nights} nights)</span>
                        <span className="font-mono text-stone-200">{activeCalc.sym}{activeCalc.sdfTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <button
                      onClick={() => { setSdfOverrideOn(true); setSdfOverride(String(activeCalc.sdfAuto)) }}
                      className="text-[11px] text-amber-500/80 hover:text-amber-400 underline"
                    >
                      Client already paid SDF — override
                    </button>
                  </>
                )}

                {/* Visa */}
                {visaOverrideOn ? (
                  <div className="flex items-center justify-between gap-2 text-stone-400 text-sm">
                    <span>Visa (manual override)</span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs">$</span>
                        <input
                          type="number"
                          value={visaOverride}
                          onChange={e => setVisaOverride(e.target.value)}
                          placeholder="0"
                          className="w-28 bg-stone-800 border border-amber-500/30 rounded-lg pl-6 pr-2 py-1 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        onClick={() => { setVisaOverrideOn(false); setVisaOverride('') }}
                        className="text-[11px] text-stone-500 hover:text-stone-300 underline whitespace-nowrap"
                      >
                        Reset to auto (${activeCalc.visaAuto.toLocaleString()})
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {activeCalc.isSaarc ? (
                      <div className="flex justify-between text-stone-400 text-sm">
                        <span>{activeCalc.isSaarcIndia ? 'Entry Permit (Visa)' : 'Visa on Arrival'}</span>
                        <span className="font-mono text-emerald-400 text-xs">Exempt</span>
                      </div>
                    ) : activeCalc.totalPax > 0 && (
                      <div className="flex justify-between text-stone-400 text-sm">
                        <span>Visa Processing ($40 × {activeCalc.totalPax} pax)</span>
                        <span className="font-mono text-stone-200">${activeCalc.visaTotal.toLocaleString()}</span>
                      </div>
                    )}
                    {!activeCalc.isSaarc && (
                      <button
                        onClick={() => { setVisaOverrideOn(true); setVisaOverride(String(activeCalc.visaAuto)) }}
                        className="text-[11px] text-amber-500/80 hover:text-amber-400 underline"
                      >
                        Client already paid visa — override
                      </button>
                    )}
                  </>
                )}

                {!isV2Pricing && (
                <>
                {/* Service */}
                {calc.svcTotal > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>{serviceLabel}{gstApplicable.service && <span className="text-[9px] text-amber-500/80 ml-1">+GST</span>}</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.svcTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Entrance */}
                {calc.entrTotal > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>{entranceLabel}{gstApplicable.entrance && <span className="text-[9px] text-amber-500/80 ml-1">+GST</span>}</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.entrTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Specials */}
                {calc.specTotal > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>{specialsLabel}{gstApplicable.specials && <span className="text-[9px] text-amber-500/80 ml-1">+GST</span>}</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.specTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Flights */}
                {includeFlights && calc.fltTotal > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>{flightLabel}{gstApplicable.flights && <span className="text-[9px] text-amber-500/80 ml-1">+GST</span>}</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.fltTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Wire */}
                {calc.wire > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>{wireLabel}{gstApplicable.wire && <span className="text-[9px] text-amber-500/80 ml-1">+GST</span>}</span>
                    <span className="font-mono text-stone-200">{calc.sym}{calc.wire.toLocaleString()}</span>
                  </div>
                )}
                </>
                )}

                {isV2Pricing && (
                <>
                {[
                  { label: guideLabel,      total: calcV2.guideTotal,      taxed: gstApplicableV2.guide },
                  { label: vehicleLabel,    total: calcV2.vehicleTotal,    taxed: gstApplicableV2.vehicle },
                  { label: serviceFeeLabel, total: calcV2.serviceFeeTotal, taxed: gstApplicableV2.serviceFee },
                  { label: mealsLabel,      total: calcV2.mealsTotal,      taxed: gstApplicableV2.meals },
                  { label: hotelLabel,      total: calcV2.hotelTotal,      taxed: gstApplicableV2.hotel },
                  { label: entranceLabelV2, total: calcV2.entrTotal,       taxed: gstApplicableV2.entrance },
                  { label: specialsLabelV2, total: calcV2.specTotal,       taxed: gstApplicableV2.specials },
                  ...(includeFlightsV2 ? [{ label: flightLabelV2, total: calcV2.fltTotal, taxed: gstApplicableV2.flights }] : []),
                ].filter(f => f.total > 0).map((f, i) => (
                  <div key={i} className="flex justify-between text-stone-400 text-sm">
                    <span>{f.label}{f.taxed && <span className="text-[9px] text-amber-500/80 ml-1">+GST</span>}</span>
                    <span className="font-mono text-stone-200">{calcV2.sym}{f.total.toLocaleString()}</span>
                  </div>
                ))}
                {includeFlightsV2 && flightDetails.trim() && (
                  <p className="text-[10px] text-stone-600 -mt-1.5">{flightDetails.trim()}</p>
                )}
                </>
                )}

                {/* Extra cost lines */}
                {activeCalc.extrasBreakdown.filter(c => c.total > 0).map((c, i) => (
                  <div key={i} className="flex justify-between text-stone-400 text-sm">
                    <span>{c.label || 'Extra cost'}{c.gstApplicable && <span className="text-[9px] text-amber-500/80 ml-1">+GST</span>}</span>
                    <span className="font-mono text-stone-200">{activeCalc.sym}{c.total.toLocaleString()}</span>
                  </div>
                ))}

                <div className="border-t border-white/10 pt-3 flex justify-between text-white font-semibold text-sm">
                  <span>Package Cost</span>
                  <span className="font-mono">{activeCalc.sym}{Math.round(activeCalc.pkgCost).toLocaleString()}</span>
                </div>

                {activeCalc.gst > 0 && (
                  <div className="flex justify-between text-stone-400 text-sm">
                    <span>GST (5%)</span>
                    <span className="font-mono text-stone-200">{activeCalc.sym}{Math.round(activeCalc.gst).toLocaleString()}</span>
                  </div>
                )}

                {/* Grand Total glow */}
                <div className="rounded-xl overflow-hidden mt-2"
                  style={{ background: 'linear-gradient(135deg, #1C1007, #2D1A08)', boxShadow: '0 0 20px 2px rgba(217,119,6,0.18), inset 0 1px 0 rgba(245,158,11,0.2)' }}>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70">Grand Total</p>
                      <p className="text-white text-sm font-bold mt-0.5">{activeCalc.currency} · All inclusive</p>
                    </div>
                    <p className="font-black text-2xl tracking-tight"
                      style={{ color: '#F59E0B', fontFamily: 'monospace', textShadow: '0 0 24px rgba(245,158,11,0.6)' }}>
                      {activeCalc.sym}{Math.round(activeCalc.grandTotal).toLocaleString()}
                    </p>
                  </div>
                  {/* Show INR equivalent for USD bookings */}
                  {!activeCalc.isSaarc && (
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
                        ₹{(activeCalc.grandTotal * (Number(inrRate) || 83.5)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-stone-600">Nights ({nights}) synced from Tour tab. GST (5%) applies per-line — toggle it on whichever items are taxable.</p>
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

        {/* Delete confirm bar */}
        {confirmDelete && (
          <div className="shrink-0 px-4 sm:px-6 py-3 bg-red-500/10 border-t border-red-500/25 flex items-center gap-3 flex-wrap">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-300 flex-1 min-w-[180px]">
              Permanently delete this itinerary? This can&apos;t be undone.
            </p>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="px-3.5 py-2 rounded-xl border border-white/10 text-stone-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete Permanently
            </button>
          </div>
        )}

        {/* Sticky footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-stone-950 border-t border-white/10 flex items-center gap-2 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/25 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>

          <div className="flex-1" />

          <details className="relative list-none marker:content-none [&::-webkit-details-marker]:hidden">
            <summary
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-sm font-semibold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Voucher
              <ChevronDown className="w-3.5 h-3.5" />
            </summary>
            <div className="absolute bottom-full mb-2 right-0 w-60 bg-stone-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
              <Link
                href={`/itinerary/${itinerary.booking_reference}`}
                target="_blank"
                className="block px-4 py-2.5 hover:bg-white/5 transition-colors"
              >
                <span className="block text-sm font-semibold text-stone-100">Client Copy</span>
                <span className="block text-[10px] text-stone-500">Full pricing &amp; payment details</span>
              </Link>
              <Link
                href={`/itinerary/${itinerary.booking_reference}?view=ops`}
                target="_blank"
                className="block px-4 py-2.5 hover:bg-white/5 transition-colors border-t border-white/5"
              >
                <span className="block text-sm font-semibold text-stone-100">Operations Copy</span>
                <span className="block text-[10px] text-stone-500">For guide &amp; driver — no pricing shown</span>
              </Link>
            </div>
          </details>

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
            disabled={saving || activeCalc.grandTotal === 0}
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

// ── New voucher modal ────────────────────────────────────────
// For clients who reach out off-platform (WhatsApp, phone, email) and want a
// custom package quoted — creates a fresh itineraries row the admin can then
// build out in full via EditDrawer.
function NewVoucherModal({ onClose, onCreated }) {
  const [guestName, setGuestName] = useState('')
  const [phone,     setPhone]     = useState('')
  const [email,     setEmail]     = useState('')
  const [tourId,    setTourId]    = useState('')
  const [creating,  setCreating]  = useState(false)
  const [err,       setErr]       = useState('')

  async function handleSubmit() {
    if (!guestName.trim()) {
      setErr('Guest name is required.')
      return
    }
    setCreating(true)
    setErr('')

    const chosenTour = TOUR_PACKAGES.find(t => t.id === tourId) || null

    const { data, error } = await supabase
      .from('itineraries')
      .insert({
        status: 'pending_review',
        client_info: {
          guest_name: guestName.trim(),
          email:      email.trim() || null,
          phone:      phone.trim() || null,
          nationality: '',
        },
        tour_summary: {
          tour_package:    chosenTour?.title         || 'Custom Itinerary',
          category:        chosenTour?.categoryLabel  || 'Custom',
          duration_nights: chosenTour?.nights         ?? null,
          group_size:      2,
          hotel_tier:      '',
          departure_date:  null,
          return_date:     null,
        },
        flights:    [],
        day_by_day: chosenTour ? buildDayByDayFromTour(chosenTour) : [],
        pricing:    { schema: 'v2' },
      })
      .select()
      .single()

    setCreating(false)
    if (error) {
      setErr(error.message || 'Failed to create voucher.')
      return
    }
    onCreated(data)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-stone-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-white font-serif font-bold text-lg">New Voucher</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              For a client who reached out on WhatsApp, phone, or email and wants a
              custom package. This creates a blank voucher you can build out fully —
              day-by-day itinerary, flights, and pricing — in the editor.
            </p>

            <div>
              <label className={lbl}>Guest Name *</label>
              <input
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="e.g. Jamyang Lhashing"
                className={inp}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Phone / WhatsApp</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+975…"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Email (optional)</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="guest@email.com"
                  className={inp}
                />
              </div>
            </div>

            <div>
              <label className={lbl}>Base This On a Package (optional)</label>
              <select
                value={tourId}
                onChange={e => setTourId(e.target.value)}
                className={inp}
              >
                <option value="">— Fully Custom (blank) —</option>
                {TOUR_PACKAGES.map(t => (
                  <option key={t.id} value={t.id}>{t.title} — {t.duration}</option>
                ))}
              </select>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Pre-fills the day-by-day itinerary from that package so you can
                tweak it, instead of starting from a blank list.
              </p>
            </div>

            {err && (
              <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {err}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-6 py-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSubmit}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Voucher
            </button>
          </div>
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
  const [selectMode,  setSelectMode]  = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkBusy,    setBulkBusy]    = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

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

  function handleDeleted(id) {
    setItineraries(prev => prev.filter(i => i.id !== id))
    setSelected(null)
  }

  function handleCreated(created) {
    setItineraries(prev => [created, ...prev])
    setShowNewModal(false)
    setSelected(created)
  }

  // ── Bulk actions ──────────────────────────────────────────────
  function toggleSelectMode() {
    setSelectMode(v => !v)
    setSelectedIds(new Set())
    setConfirmBulkDelete(false)
  }

  function toggleSelected(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllVisible() {
    setSelectedIds(new Set(visible.map(it => it.id)))
  }

  const selectedItems = itineraries.filter(it => selectedIds.has(it.id))

  async function bulkUpdateStatus(fromStatus, toStatus) {
    const targets = selectedItems.filter(it => it.status === fromStatus)
    if (targets.length === 0 || bulkBusy) return
    setBulkBusy(true)
    try {
      const { error } = await supabase
        .from('itineraries')
        .update({ status: toStatus })
        .in('id', targets.map(t => t.id))
      if (error) throw error

      setItineraries(prev => prev.map(i => targets.some(t => t.id === i.id) ? { ...i, status: toStatus } : i))
      setSelectedIds(new Set())
      setSelectMode(false)

      // Notify clients when bulk-confirming already-quoted bookings
      if (toStatus === 'confirmed') {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          for (const t of targets) {
            fetch('/api/notify-itinerary-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
              body: JSON.stringify({ bookingReference: t.booking_reference, status: 'confirmed' }),
            }).catch(err => console.error('Bulk status notification failed:', err))
          }
        }
      }
    } catch (err) {
      console.error('Bulk status update failed:', err)
    } finally {
      setBulkBusy(false)
    }
  }

  async function bulkDelete() {
    if (selectedItems.length === 0 || bulkDeleting) return
    setBulkDeleting(true)
    try {
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .in('id', selectedItems.map(t => t.id))
      if (error) throw error
      setItineraries(prev => prev.filter(i => !selectedIds.has(i.id)))
      setSelectedIds(new Set())
      setSelectMode(false)
      setConfirmBulkDelete(false)
    } catch (err) {
      console.error('Bulk delete failed:', err)
    } finally {
      setBulkDeleting(false)
    }
  }

  function exportSelectedCsv() {
    if (selectedItems.length === 0) return
    const rows = [
      ['Booking Reference', 'Guest Name', 'Email', 'Status', 'Tour Package', 'Nights', 'Guests', 'Arrival', 'Grand Total', 'Currency'],
      ...selectedItems.map(it => [
        it.booking_reference || '',
        it.client_info?.guest_name || '',
        it.client_info?.email || '',
        it.status || '',
        it.tour_summary?.tour_package || '',
        it.tour_summary?.duration_nights || '',
        it.tour_summary?.group_size || '',
        it.tour_summary?.departure_date || '',
        it.pricing?.grand_total || '',
        it.pricing?.is_saarc ? 'INR' : 'USD',
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arise-bhutan-itineraries-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Voucher
          </button>
          <button
            onClick={toggleSelectMode}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              selectMode
                ? 'bg-amber-600 border-amber-600 text-white'
                : 'border-white/10 text-stone-400 hover:text-white hover:border-white/20'
            }`}
          >
            {selectMode ? 'Cancel Selection' : 'Select'}
          </button>
          <button
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectMode && (
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-stone-900 border border-white/10 rounded-2xl px-5 py-4">
          <p className="text-sm text-stone-300 font-medium">
            {selectedIds.size} selected
          </p>
          <button
            onClick={selectAllVisible}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            Select all visible ({visible.length})
          </button>
          <div className="flex-1" />
          <button
            onClick={() => bulkUpdateStatus('enquiry_pending', 'pending_review')}
            disabled={bulkBusy || !selectedItems.some(it => it.status === 'enquiry_pending')}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Mark Reviewing
          </button>
          <button
            onClick={() => bulkUpdateStatus('quoted', 'confirmed')}
            disabled={bulkBusy || !selectedItems.some(it => it.status === 'quoted')}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Mark Confirmed
          </button>
          <button
            onClick={exportSelectedCsv}
            disabled={selectedIds.size === 0}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-stone-800 text-stone-300 border border-white/10 hover:text-white hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          {confirmBulkDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-300">Delete {selectedIds.size} permanently?</span>
              <button
                onClick={() => setConfirmBulkDelete(false)}
                disabled={bulkDeleting}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-white/10 text-stone-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={bulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white transition-colors"
              >
                {bulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmBulkDelete(true)}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          )}
        </div>
      )}

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
                onClick={selectMode ? () => toggleSelected(it.id) : undefined}
                className={`bg-stone-900 rounded-2xl border ${s.card} p-5 flex flex-col gap-4 hover:border-opacity-60 transition-all group ${
                  selectMode ? 'cursor-pointer' : ''
                } ${selectedIds.has(it.id) ? 'ring-2 ring-amber-500/60' : ''}`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(it.id)}
                        onChange={() => toggleSelected(it.id)}
                        onClick={e => e.stopPropagation()}
                        className="mt-1 rounded accent-amber-500 w-4 h-4 cursor-pointer shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-stone-500 tracking-wider">
                        {it.booking_reference}
                      </p>
                      <p className="text-white font-serif font-semibold text-base mt-0.5 line-clamp-1">
                        {it.tour_summary?.tour_package || 'Custom Itinerary'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={it.status} />
                    {(it.status === 'enquiry_pending' || it.status === 'pending_review') && (
                      <SlaBadge createdAt={it.created_at} />
                    )}
                  </div>
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

                {/* Actions — hidden in selection mode so card clicks only toggle selection */}
                {!selectMode && (
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
                )}
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
          onDeleted={handleDeleted}
        />
      )}

      {/* New voucher modal */}
      {showNewModal && (
        <NewVoucherModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
