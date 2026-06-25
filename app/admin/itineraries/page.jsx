'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import {
  RefreshCw, Search, X, ChevronRight, ChevronDown, Plane, MapPin,
  User, Calendar, DollarSign, Loader2, CheckCircle2,
  Clock, FileText, AlertTriangle, ExternalLink, Mail,
  Plus, Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'

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

// ── Pricing computation (pure) ────────────────────────────────
function computePricing(packageRate, serviceFee, nights, guests) {
  const rate  = Number(packageRate) || 0
  const fee   = Number(serviceFee)  || 0
  const n     = Number(nights)      || 1
  const g     = Number(guests)      || 1
  const sdf   = 100 * n * g
  const sub   = (rate * g) + sdf + fee
  const gst   = sub * 0.05
  const total = sub + gst
  const inr   = total * 83.5
  return { sdfTotal: sdf, subtotal: sub, gst, grandTotal: total, equivalentInr: inr }
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
    passport_no:       itinerary.client_info?.passport_no       || '',
    passport_expiry:   itinerary.client_info?.passport_expiry   || '',
    emergency_contact: itinerary.client_info?.emergency_contact || '',
  })

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
    interests:       itinerary.tour_summary?.interests       || [],
    message:         itinerary.tour_summary?.message         || '',
  })

  const [flights, setFlights] = useState(
    (itinerary.flights || []).map(f => ({ ...f }))
  )

  const [days, setDays] = useState(
    (itinerary.day_by_day || []).map(d => ({ ...d }))
  )

  const [packageRate, setPackageRate] = useState(itinerary.pricing?.package_rate_per_pax ?? '')
  const [serviceFee,  setServiceFee]  = useState(itinerary.pricing?.service_fee          ?? '')

  const [activeTab, setActiveTab] = useState('client')
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState('')

  const nights = Number(tourSummary.duration_nights) || 1
  const guests = Number(tourSummary.group_size)      || 1

  const calc = useMemo(
    () => computePricing(packageRate, serviceFee, nights, guests),
    [packageRate, serviceFee, nights, guests]
  )

  const fmt = n => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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

  // ── save ───────────────────────────────────────────────────
  async function handleSave(nextStatus) {
    setSaving(true)
    setSaveErr('')

    const pricingPayload = {
      package_rate_per_pax: Number(packageRate) || 0,
      sdf_total:            calc.sdfTotal,
      service_fee:          Number(serviceFee)  || 0,
      subtotal:             calc.subtotal,
      gst:                  calc.gst,
      grand_total:          calc.grandTotal,
      equivalent_inr:       calc.equivalentInr,
    }

    const { data, error } = await supabase
      .from('itineraries')
      .update({
        client_info:  clientInfo,
        tour_summary: {
          ...itinerary.tour_summary,
          ...tourSummary,
          duration_nights: Number(tourSummary.duration_nights) || itinerary.tour_summary?.duration_nights || 1,
          group_size:      Number(tourSummary.group_size)      || itinerary.tour_summary?.group_size      || 1,
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
    { id: 'client',    label: 'Client',    icon: User },
    { id: 'tour',      label: 'Tour',      icon: MapPin },
    { id: 'flights',   label: 'Flights',   icon: Plane },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'pricing',   label: 'Pricing',   icon: DollarSign },
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
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Client Tab ── */}
          {activeTab === 'client' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className={lbl}>Nationality</label>
                  <input
                    type="text"
                    value={clientInfo.nationality}
                    onChange={e => setClientInfo(p => ({ ...p, nationality: e.target.value }))}
                    placeholder="e.g. United States"
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Passport No.</label>
                  <input
                    type="text"
                    value={clientInfo.passport_no}
                    onChange={e => setClientInfo(p => ({ ...p, passport_no: e.target.value }))}
                    placeholder="e.g. A12345678"
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Passport Expiry</label>
                  <input
                    type="date"
                    value={clientInfo.passport_expiry}
                    onChange={e => setClientInfo(p => ({ ...p, passport_expiry: e.target.value }))}
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
              <div className="grid grid-cols-2 gap-3">
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
                        <div className="grid grid-cols-3 gap-2">
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
                        <div className="grid grid-cols-2 gap-2">
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
                        <div className="grid grid-cols-2 gap-2">
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

          {/* ── Pricing Tab ── */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Package Rate / Pax (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={packageRate}
                      onChange={e => setPackageRate(e.target.value)}
                      placeholder="0"
                      className={`${inp} pl-7`}
                    />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Service Fee (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={serviceFee}
                      onChange={e => setServiceFee(e.target.value)}
                      placeholder="0"
                      className={`${inp} pl-7`}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-stone-950 rounded-2xl p-5 space-y-3 border border-white/5">
                <div className="flex justify-between text-stone-400 text-sm">
                  <span>Package Rate × {guests} guests</span>
                  <span className="font-mono text-stone-200">${fmt(Number(packageRate || 0) * guests)}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-sm">
                  <span>SDF ($100 × {nights} nights × {guests} guests)</span>
                  <span className="font-mono text-stone-200">${fmt(calc.sdfTotal)}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-sm">
                  <span>Service Fee</span>
                  <span className="font-mono text-stone-200">${fmt(Number(serviceFee || 0))}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-white text-sm font-semibold">
                  <span>Subtotal</span>
                  <span className="font-mono">${fmt(calc.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-sm">
                  <span>GST (5%)</span>
                  <span className="font-mono text-stone-200">${fmt(calc.gst)}</span>
                </div>
                <div className="border-t border-amber-500/30 pt-3 flex justify-between text-amber-400 font-bold text-base">
                  <span>Grand Total (USD)</span>
                  <span className="font-mono">${fmt(calc.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-xs">
                  <span>Equivalent INR (@ ₹83.5)</span>
                  <span className="font-mono text-stone-400">
                    ₹{calc.equivalentInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              <p className="text-xs text-stone-600">
                Nights ({nights}) and group size ({guests}) are synced from the Tour tab.
              </p>
            </div>
          )}

          {saveErr && (
            <div className="mt-4 flex items-start gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {saveErr}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 px-6 py-4 bg-stone-950 border-t border-white/10 flex items-center gap-2 flex-wrap">
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
            disabled={saving || !packageRate}
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
        <div className="flex gap-1.5">
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
                      ${Number(it.pricing.grand_total).toLocaleString('en-US', { maximumFractionDigits: 0 })}
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
