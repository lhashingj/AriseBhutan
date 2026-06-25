'use client'

import { useState, useMemo } from 'react'
import {
  Inbox, Mail, Phone, MapPin, Moon, Users, Hotel,
  Send, AlertCircle, X, ChevronDown, ChevronUp,
  Loader2, Clock, CheckCircle2, Trash2, Download, Plus,
  Save, FileEdit, FileCheck,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { computePricing } from '@/utils/pdfGenerator'

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG = {
  pending_review: { label: 'New',         cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  in_progress:    { label: 'In Progress', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  quoted:         { label: 'Quoted',      cls: 'bg-green-500/15 text-green-400 border-green-500/25' },
  confirmed:      { label: 'Confirmed',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  declined:       { label: 'Declined',    cls: 'bg-stone-700 text-stone-400 border-white/10' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending_review
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.cls}`}>{cfg.label}</span>
}

// ── Defaults ──────────────────────────────────────────────────
const DEF_INCLUSIONS = [
  'Bhutan Sustainable Development Fee (SDF)',
  'Bhutan visa & permit processing',
  'All accommodation per itinerary',
  'All meals as specified',
  'Licensed English-speaking ATCB guide',
  'Private vehicle & dedicated driver',
  'All monument & dzong entry fees',
  'Arise Bhutan 24/7 in-country support',
]
const DEF_EXCLUSIONS = [
  'International airfare to/from Paro',
  'Travel & medical insurance',
  'Personal expenses & gratuities',
  'Alcoholic & premium beverages',
  'Optional adventure activities',
]
const DEF_CANCELLATION = [
  { period: '60+ days before departure',    refund: 'Full refund less $150 processing fee' },
  { period: '30–59 days before departure',  refund: '50% refund' },
  { period: 'Under 30 days / No-show',      refund: 'Non-refundable' },
]

const inp = 'w-full border border-white/10 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors bg-stone-800'
const labelCls = 'block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1'

// ── Voucher Modal ─────────────────────────────────────────────
function SendVoucherModal({ enquiry, existingVoucher, onClose, onSent, onVoucherSaved, onVoucherDeleted }) {
  const pax = enquiry.guests || 2
  const arrivalGuess = enquiry.travel_date ? enquiry.travel_date.split('T')[0] : ''

  const [tab, setTab]               = useState('details')
  const [sending, setSending]       = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saving' | 'saved' | 'error'
  const [deletingDraft, setDeletingDraft] = useState(false)
  const [confirmDiscardDraft, setConfirmDiscardDraft] = useState(false)
  const [error, setError]           = useState('')
  const [sent, setSent]             = useState(false)
  const [ref, setRef]               = useState('')

  // Initialise form from saved draft or enquiry defaults
  const [form, setFormRaw] = useState(() => {
    if (existingVoucher?.form_data) return existingVoucher.form_data
    return {
      tourTitle:        enquiry.tour_interest || '',
      category:         enquiry.tier ? `${enquiry.tier} Package` : 'Cultural Tour',
      arrivalDate:      arrivalGuess,
      returnDate:       '',
      guide:            'Licensed ATCB Guide',
      vehicle:          'Private Vehicle & Driver',
      passportNo:       '',
      passportExpiry:   '',
      emergencyContact: '',
      flights: [
        { sector: '', date: '', flightNo: '', departs: '', arrives: '', airline: 'Bhutan Airlines' },
        { sector: '', date: '', flightNo: '', departs: '', arrives: '', airline: 'Bhutan Airlines' },
      ],
      itinerary: [],
      pricePerPerson: '',
      sdfRate:        '100',
      serviceFee:     '0',
      gstRate:        '0',
      inrRate:        '83.5',
      accommodation:      [],
      inclusions:         [...DEF_INCLUSIONS],
      exclusions:         [...DEF_EXCLUSIONS],
      cancellationPolicy: [...DEF_CANCELLATION],
    }
  })

  function set(k, v) { setFormRaw(f => ({ ...f, [k]: v })) }

  const nights = useMemo(() => {
    if (!form.arrivalDate || !form.returnDate) return enquiry.nights || 5
    return Math.max(1, Math.ceil((new Date(form.returnDate) - new Date(form.arrivalDate)) / 86_400_000))
  }, [form.arrivalDate, form.returnDate, enquiry.nights])

  const costs = useMemo(() => computePricing({
    pricePerPerson:       parseFloat(form.pricePerPerson) || 0,
    pax,
    sdfPerPersonPerNight: parseFloat(form.sdfRate)        || 100,
    nights,
    serviceFeePerPax:     parseFloat(form.serviceFee)     || 0,
    gstRate:              (parseFloat(form.gstRate) || 0)  / 100,
    inrRate:              parseFloat(form.inrRate)          || 83.5,
  }), [form.pricePerPerson, form.sdfRate, form.serviceFee, form.gstRate, form.inrRate, pax, nights])

  // ── Flight helpers ────────────────────────────────────────
  function setFlight(i, k, v) {
    setFormRaw(f => { const a = [...f.flights]; a[i] = { ...a[i], [k]: v }; return { ...f, flights: a } })
  }
  function addFlight() { setFormRaw(f => ({ ...f, flights: [...f.flights, { sector: '', date: '', flightNo: '', departs: '', arrives: '', airline: 'Bhutan Airlines' }] })) }
  function removeFlight(i) { setFormRaw(f => ({ ...f, flights: f.flights.filter((_, idx) => idx !== i) })) }

  // ── Itinerary helpers ─────────────────────────────────────
  function generateItinerary() {
    if (!form.arrivalDate || !form.returnDate) return
    const start = new Date(form.arrivalDate)
    const days = Array.from({ length: nights + 1 }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i)
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const existing = form.itinerary[i]
      return existing ?? {
        day: i + 1,
        date: dateStr,
        title: i === 0 ? 'Arrival & Check-in' : i === nights ? 'Departure Day' : '',
        activitiesText: '',
        accommodation: i === nights ? 'N/A' : '',
        meals: { B: i > 0, L: false, D: i < nights },
      }
    })
    set('itinerary', days)
  }
  function setDay(i, k, v) {
    setFormRaw(f => { const a = [...f.itinerary]; a[i] = { ...a[i], [k]: v }; return { ...f, itinerary: a } })
  }
  function setMeal(i, meal, v) {
    setFormRaw(f => {
      const a = [...f.itinerary]
      a[i] = { ...a[i], meals: { ...a[i].meals, [meal]: v } }
      return { ...f, itinerary: a }
    })
  }
  function addDay() {
    const last = form.itinerary[form.itinerary.length - 1]
    const day = last ? last.day + 1 : 1
    setFormRaw(f => ({ ...f, itinerary: [...f.itinerary, { day, date: '', title: '', activitiesText: '', accommodation: '', meals: { B: false, L: false, D: false } }] }))
  }
  function removeDay(i) { setFormRaw(f => ({ ...f, itinerary: f.itinerary.filter((_, idx) => idx !== i) })) }

  // ── Hotel helpers ─────────────────────────────────────────
  function setHotel(i, k, v) {
    setFormRaw(f => { const a = [...f.accommodation]; a[i] = { ...a[i], [k]: v }; return { ...f, accommodation: a } })
  }
  function addHotel() { setFormRaw(f => ({ ...f, accommodation: [...f.accommodation, { hotel: '', location: '', category: enquiry.tier || '4-Star', type: '', nights: '' }] })) }
  function removeHotel(i) { setFormRaw(f => ({ ...f, accommodation: f.accommodation.filter((_, idx) => idx !== i) })) }

  // ── List helpers ──────────────────────────────────────────
  function addItem(field) { setFormRaw(f => ({ ...f, [field]: [...f[field], ''] })) }
  function removeItem(field, i) { setFormRaw(f => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) })) }
  function editItem(field, i, v) { setFormRaw(f => { const a = [...f[field]]; a[i] = v; return { ...f, [field]: a } }) }

  // ── Cancel policy helpers ─────────────────────────────────
  function setCancelRow(i, k, v) {
    setFormRaw(f => { const a = [...f.cancellationPolicy]; a[i] = { ...a[i], [k]: v }; return { ...f, cancellationPolicy: a } })
  }
  function addCancelRow() { setFormRaw(f => ({ ...f, cancellationPolicy: [...f.cancellationPolicy, { period: '', refund: '' }] })) }
  function removeCancelRow(i) { setFormRaw(f => ({ ...f, cancellationPolicy: f.cancellationPolicy.filter((_, idx) => idx !== i) })) }

  // ── Build API payload ─────────────────────────────────────
  function buildPayload() {
    return {
      enquiryId:   enquiry.id,
      tourTitle:   form.tourTitle,
      category:    form.category,
      arrivalDate: form.arrivalDate,
      returnDate:  form.returnDate,
      guide:       form.guide,
      vehicle:     form.vehicle,
      clientExtras: {
        passportNo:       form.passportNo,
        passportExpiry:   form.passportExpiry,
        emergencyContact: form.emergencyContact,
      },
      flights:    form.flights.filter(f => f.sector || f.flightNo),
      itinerary:  form.itinerary.map(d => ({
        day:           d.day,
        date:          d.date,
        title:         d.title,
        activities:    d.activitiesText.split('\n').filter(Boolean),
        accommodation: d.accommodation,
        meals:         [d.meals.B && 'B', d.meals.L && 'L', d.meals.D && 'D'].filter(Boolean).join(' · '),
      })),
      pricing: {
        pricePerPerson:       parseFloat(form.pricePerPerson) || 0,
        sdfPerPersonPerNight: parseFloat(form.sdfRate)        || 100,
        serviceFeePerPax:     parseFloat(form.serviceFee)     || 0,
        gstRate:              (parseFloat(form.gstRate) || 0)  / 100,
        inrRate:              parseFloat(form.inrRate)          || 83.5,
      },
      accommodation:      form.accommodation.filter(h => h.hotel),
      inclusions:         form.inclusions.filter(Boolean),
      exclusions:         form.exclusions.filter(Boolean),
      cancellationPolicy: form.cancellationPolicy.filter(r => r.period),
    }
  }

  async function getJwt() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated. Please log in again.')
    return session.access_token
  }

  // ── Save draft ────────────────────────────────────────────
  async function handleSave() {
    setSaveStatus('saving')
    setError('')
    try {
      const jwt = await getJwt()
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ enquiryId: enquiry.id, formData: form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSaveStatus('saved')
      onVoucherSaved(data.voucher)
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err) {
      setSaveStatus('error')
      setError(err.message)
    }
  }

  // ── Discard / delete draft ────────────────────────────────
  async function handleDiscardDraft() {
    setDeletingDraft(true)
    try {
      const jwt = await getJwt()
      await fetch('/api/admin/vouchers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ enquiryId: enquiry.id }),
      })
      onVoucherDeleted(enquiry.id)
      onClose()
    } catch { setDeletingDraft(false); setConfirmDiscardDraft(false) }
  }

  // ── Download PDF ──────────────────────────────────────────
  async function handleDownload() {
    setDownloading(true); setError('')
    try {
      const jwt = await getJwt()
      const res = await fetch('/api/admin/download-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify(buildPayload()),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Download failed') }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Arise-Bhutan-ARB-${enquiry.id.slice(0, 8).toUpperCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { setError(err.message) }
    finally { setDownloading(false) }
  }

  // ── Send to client ────────────────────────────────────────
  async function handleSend() {
    setSending(true); setError('')
    try {
      const jwt = await getJwt()
      const res = await fetch('/api/send-voucher-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setRef(data.ref)
      setSent(true)
      onSent()
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }

  const canProceed = Boolean(form.arrivalDate && form.returnDate)
  const usd = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const TABS = [
    ['details',   'Details'],
    ['flights',   'Flights'],
    ['itinerary', 'Itinerary'],
    ['pricing',   'Pricing'],
    ['hotels',    'Hotels'],
    ['package',   'Package'],
  ]

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-stone-900 border border-white/5 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col" style={{ maxHeight: '94vh' }}>

        {/* Header */}
        <div className="bg-stone-900 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-white text-base">Booking Voucher Editor</p>
              {existingVoucher && (
                <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Draft saved
                </span>
              )}
            </div>
            <p className="text-stone-400 text-xs mt-0.5">{enquiry.client_name || 'Guest'} · {enquiry.client_email}</p>
          </div>
          <div className="flex items-center gap-2">
            {existingVoucher && !confirmDiscardDraft && (
              <button onClick={() => setConfirmDiscardDraft(true)}
                className="text-xs text-stone-500 hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10">
                <Trash2 className="w-3.5 h-3.5" /> Discard Draft
              </button>
            )}
            {confirmDiscardDraft && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Delete this draft?</span>
                <button onClick={handleDiscardDraft} disabled={deletingDraft}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg disabled:opacity-50">
                  {deletingDraft ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Delete'}
                </button>
                <button onClick={() => setConfirmDiscardDraft(false)}
                  className="text-xs text-stone-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10">
                  Cancel
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {sent ? (
          <div className="p-10 text-center flex-1">
            <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">Voucher Sent!</h3>
            <p className="text-stone-400 text-sm mb-1">PDF emailed to <strong className="text-stone-200">{enquiry.client_email}</strong></p>
            {ref && <p className="font-mono text-xs text-stone-500 mb-6">{ref}</p>}
            <button onClick={onClose} className="btn-primary text-sm px-6">Done</button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-white/5 flex-shrink-0 overflow-x-auto bg-stone-950/50">
              {TABS.map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                    tab === id ? 'text-amber-400 border-amber-500' : 'text-stone-500 border-transparent hover:text-stone-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-5">

              {/* Enquiry context strip */}
              <div className="bg-stone-800 border border-white/5 rounded-xl px-4 py-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400 mb-4">
                <span><span className="text-stone-500">Enquiry from:</span> {enquiry.client_name || '—'}</span>
                <span><span className="text-stone-500">Nights:</span> {enquiry.nights}</span>
                <span><span className="text-stone-500">Guests:</span> {pax}</span>
                <span><span className="text-stone-500">Tier:</span> {enquiry.tier || '—'}</span>
                {enquiry.interests?.length > 0 && <span className="text-amber-400">{enquiry.interests.join(', ')}</span>}
              </div>

              {/* ══ TAB: Details ══ */}
              {tab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Tour Title</label>
                    <input value={form.tourTitle} onChange={e => set('tourTitle', e.target.value)} className={inp} placeholder="e.g. Bhutan Luxury Escape — 7D/6N" />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <input value={form.category} onChange={e => set('category', e.target.value)} className={inp} placeholder="e.g. 5-Star Luxury Package" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Arrival Date <span className="text-red-500">*</span></label>
                      <input type="date" value={form.arrivalDate} onChange={e => set('arrivalDate', e.target.value)} className={inp} />
                    </div>
                    <div>
                      <label className={labelCls}>Return Date <span className="text-red-500">*</span></label>
                      <input type="date" value={form.returnDate} min={form.arrivalDate || undefined} onChange={e => set('returnDate', e.target.value)} className={inp} />
                    </div>
                  </div>
                  {form.arrivalDate && form.returnDate && (
                    <p className="text-xs text-amber-700 font-medium -mt-2">→ {nights} nights · {nights + 1} days</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Tour Guide</label>
                      <input value={form.guide} onChange={e => set('guide', e.target.value)} className={inp} />
                    </div>
                    <div>
                      <label className={labelCls}>Vehicle</label>
                      <input value={form.vehicle} onChange={e => set('vehicle', e.target.value)} className={inp} />
                    </div>
                  </div>
                  <hr className="border-white/5" />
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Client Passport Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Passport Number</label>
                      <input value={form.passportNo} onChange={e => set('passportNo', e.target.value)} className={inp} placeholder="e.g. G123456" />
                    </div>
                    <div>
                      <label className={labelCls}>Passport Expiry</label>
                      <input type="date" value={form.passportExpiry} onChange={e => set('passportExpiry', e.target.value)} className={inp} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Emergency Contact</label>
                    <input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} className={inp} placeholder="e.g. Jane Doe +44 7700 900000" />
                  </div>
                </div>
              )}

              {/* ══ TAB: Flights ══ */}
              {tab === 'flights' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-500">Add each flight sector. Blank rows are omitted from the voucher.</p>
                  {form.flights.map((fl, i) => (
                    <div key={i} className="bg-stone-800 border border-white/5 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Flight {i + 1}</span>
                        <button onClick={() => removeFlight(i)} className="text-stone-300 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelCls}>Sector</label>
                          <input value={fl.sector} onChange={e => setFlight(i, 'sector', e.target.value)} className={inp} placeholder="e.g. Bangkok → Paro" />
                        </div>
                        <div>
                          <label className={labelCls}>Date</label>
                          <input type="date" value={fl.date} onChange={e => setFlight(i, 'date', e.target.value)} className={inp} />
                        </div>
                        <div>
                          <label className={labelCls}>Flight No.</label>
                          <input value={fl.flightNo} onChange={e => setFlight(i, 'flightNo', e.target.value)} className={inp} placeholder="e.g. B3707" />
                        </div>
                        <div>
                          <label className={labelCls}>Airline</label>
                          <input value={fl.airline} onChange={e => setFlight(i, 'airline', e.target.value)} className={inp} />
                        </div>
                        <div>
                          <label className={labelCls}>Departs</label>
                          <input value={fl.departs} onChange={e => setFlight(i, 'departs', e.target.value)} className={inp} placeholder="08:30" />
                        </div>
                        <div>
                          <label className={labelCls}>Arrives</label>
                          <input value={fl.arrives} onChange={e => setFlight(i, 'arrives', e.target.value)} className={inp} placeholder="12:20" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addFlight}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl py-3 text-sm text-stone-500 hover:border-amber-500/40 hover:text-amber-400 transition-colors">
                    <Plus className="w-4 h-4" /> Add Flight
                  </button>
                </div>
              )}

              {/* ══ TAB: Itinerary ══ */}
              {tab === 'itinerary' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button onClick={generateItinerary} disabled={!canProceed}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl disabled:opacity-40 transition-colors">
                      Generate {nights + 1}-Day Skeleton
                    </button>
                    <button onClick={addDay}
                      className="flex items-center gap-1 text-xs font-semibold text-stone-400 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/5 hover:text-stone-200 transition-colors">
                      <Plus className="w-3 h-3" /> Add Day Manually
                    </button>
                    {!canProceed && <p className="text-xs text-stone-400">Set arrival & return dates first</p>}
                  </div>

                  {form.itinerary.map((day, i) => (
                    <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                      <div className="bg-stone-950 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {String(day.day).padStart(2, '0')}
                          </span>
                          <input value={day.date} onChange={e => setDay(i, 'date', e.target.value)}
                            className="bg-transparent text-stone-300 text-xs border-b border-stone-600 focus:outline-none focus:border-amber-500 w-32"
                            placeholder="Jun 26, 2026" />
                        </div>
                        <button onClick={() => removeDay(i)} className="text-stone-500 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3 space-y-2 bg-stone-800/50">
                        <div>
                          <label className={labelCls}>Day Title</label>
                          <input value={day.title} onChange={e => setDay(i, 'title', e.target.value)} className={inp} placeholder="e.g. Exclusive Tiger's Nest Experience" />
                        </div>
                        <div>
                          <label className={labelCls}>Activities (one per line → bullet points in PDF)</label>
                          <textarea value={day.activitiesText} onChange={e => setDay(i, 'activitiesText', e.target.value)}
                            rows={3} className={`${inp} resize-none`}
                            placeholder="Private 6 AM trail access&#10;Tiger's Nest in solitude&#10;Exclusive lama ceremony" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={labelCls}>Accommodation</label>
                            <input value={day.accommodation} onChange={e => setDay(i, 'accommodation', e.target.value)} className={inp} placeholder="Luxury Boutique Lodge, Paro (5★)" />
                          </div>
                          <div>
                            <label className={labelCls}>Meals Included</label>
                            <div className="flex gap-3 mt-1">
                              {[['B', 'Breakfast'], ['L', 'Lunch'], ['D', 'Dinner']].map(([code, name]) => (
                                <label key={code} className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="checkbox" checked={!!day.meals[code]}
                                    onChange={e => setMeal(i, code, e.target.checked)}
                                    className="w-4 h-4 accent-amber-600 rounded" />
                                  <span className="text-xs font-semibold text-stone-300">{code}</span>
                                  <span className="text-xs text-stone-400 hidden sm:inline">{name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {form.itinerary.length === 0 && (
                    <div className="text-center py-8 text-stone-500 text-sm border-2 border-dashed border-white/10 rounded-xl">
                      Click "Generate Skeleton" to auto-fill days from your dates, or add days manually.
                    </div>
                  )}
                </div>
              )}

              {/* ══ TAB: Pricing ══ */}
              {tab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Package Rate / Person (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                        <input type="number" min="0" step="10" value={form.pricePerPerson}
                          onChange={e => set('pricePerPerson', e.target.value)}
                          className={`${inp} pl-7`} placeholder="e.g. 5100" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>SDF / Person / Night (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                        <input type="number" min="0" step="5" value={form.sdfRate}
                          onChange={e => set('sdfRate', e.target.value)} className={`${inp} pl-7`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Service Fee / Pax (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                        <input type="number" min="0" step="10" value={form.serviceFee}
                          onChange={e => set('serviceFee', e.target.value)}
                          className={`${inp} pl-7`} placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>GST / Tax Rate</label>
                      <div className="relative">
                        <input type="number" min="0" max="30" step="0.5" value={form.gstRate}
                          onChange={e => set('gstRate', e.target.value)}
                          className={`${inp} pr-7`} placeholder="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>INR Exchange Rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">₹</span>
                        <input type="number" min="1" step="0.5" value={form.inrRate}
                          onChange={e => set('inrRate', e.target.value)} className={`${inp} pl-7`} />
                      </div>
                    </div>
                  </div>

                  {/* Live breakdown */}
                  <div className="bg-stone-900 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-stone-800 flex justify-between">
                      <p className="text-xs font-bold text-stone-300 uppercase tracking-wider">Live Cost Breakdown</p>
                      <p className="text-xs text-stone-500">{pax} pax · {nights} nights</p>
                    </div>
                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Package ({usd(parseFloat(form.pricePerPerson)||0)} × {pax} pax)</span>
                        <span className="text-white font-semibold">{usd(costs.packageTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">SDF (${form.sdfRate}/pax/night × {nights}N × {pax})</span>
                        <span className="text-white font-semibold">{usd(costs.sdfTotal)}</span>
                      </div>
                      {parseFloat(form.serviceFee) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-stone-400">Service Fee (${form.serviceFee} × {pax})</span>
                          <span className="text-white font-semibold">{usd(costs.serviceTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-stone-700 pt-2 text-stone-400">
                        <span>Sub-total</span><span>{usd(costs.subtotal)}</span>
                      </div>
                      {parseFloat(form.gstRate) > 0 && (
                        <div className="flex justify-between text-stone-400">
                          <span>GST ({form.gstRate}%)</span><span>{usd(costs.gst)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-stone-700 pt-2.5">
                        <span className="text-amber-400 font-bold text-sm">Grand Total (USD)</span>
                        <span className="text-amber-400 font-bold text-lg">{usd(costs.totalUSD)}</span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>≈ INR @ ₹{form.inrRate}</span>
                        <span>₹{Math.round(costs.totalINR).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ TAB: Hotels ══ */}
              {tab === 'hotels' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-500">Add each hotel used in the itinerary.</p>
                  {form.accommodation.map((h, i) => (
                    <div key={i} className="bg-stone-800 border border-white/5 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Hotel {i + 1}</span>
                        <button onClick={() => removeHotel(i)} className="text-stone-300 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <label className={labelCls}>Hotel Name</label>
                          <input value={h.hotel} onChange={e => setHotel(i, 'hotel', e.target.value)} className={inp} placeholder="e.g. Luxury Boutique Lodge" />
                        </div>
                        <div>
                          <label className={labelCls}>Location</label>
                          <input value={h.location} onChange={e => setHotel(i, 'location', e.target.value)} className={inp} placeholder="Paro" />
                        </div>
                        <div>
                          <label className={labelCls}>Category</label>
                          <input value={h.category} onChange={e => setHotel(i, 'category', e.target.value)} className={inp} placeholder="5-Star" />
                        </div>
                        <div>
                          <label className={labelCls}>Property Type</label>
                          <input value={h.type} onChange={e => setHotel(i, 'type', e.target.value)} className={inp} placeholder="Luxury Boutique Lodge" />
                        </div>
                        <div>
                          <label className={labelCls}>Nights</label>
                          <input type="number" min="1" value={h.nights} onChange={e => setHotel(i, 'nights', e.target.value)} className={inp} placeholder="2" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addHotel}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl py-3 text-sm text-stone-500 hover:border-amber-500/40 hover:text-amber-400 transition-colors">
                    <Plus className="w-4 h-4" /> Add Hotel
                  </button>
                </div>
              )}

              {/* ══ TAB: Package ══ */}
              {tab === 'package' && (
                <div className="space-y-6">
                  {/* Inclusions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Inclusions</p>
                      <button onClick={() => addItem('inclusions')}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {form.inclusions.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold text-sm w-4 flex-shrink-0">✓</span>
                          <input value={item} onChange={e => editItem('inclusions', i, e.target.value)} className={`${inp} flex-1`} />
                          <button onClick={() => removeItem('inclusions', i)} className="text-stone-300 hover:text-red-500 flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Exclusions</p>
                      <button onClick={() => addItem('exclusions')}
                        className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {form.exclusions.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-red-400 font-bold text-sm w-4 flex-shrink-0">✗</span>
                          <input value={item} onChange={e => editItem('exclusions', i, e.target.value)} className={`${inp} flex-1`} />
                          <button onClick={() => removeItem('exclusions', i)} className="text-stone-300 hover:text-red-500 flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Cancellation Policy</p>
                      <button onClick={addCancelRow}
                        className="flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-stone-200">
                        <Plus className="w-3 h-3" /> Add Row
                      </button>
                    </div>
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-2 bg-stone-950 px-3 py-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider gap-3">
                        <span>Cancellation Period</span><span>Refund Terms</span>
                      </div>
                      {form.cancellationPolicy.map((row, i) => (
                        <div key={i} className="grid grid-cols-2 gap-2 px-3 py-2 border-t border-white/5 items-start">
                          <input value={row.period} onChange={e => setCancelRow(i, 'period', e.target.value)}
                            className="border border-white/10 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50 bg-stone-800" />
                          <div className="flex gap-2">
                            <input value={row.refund} onChange={e => setCancelRow(i, 'refund', e.target.value)}
                              className="flex-1 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50 bg-stone-800" />
                            <button onClick={() => removeCancelRow(i)} className="text-stone-500 hover:text-red-400 flex-shrink-0 mt-0.5">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 bg-stone-950/50 px-5 py-4 flex items-center gap-2 flex-shrink-0 rounded-b-2xl flex-wrap">
              <div className="flex-1 min-w-0 text-xs">
                {saveStatus === 'saved' && (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <FileCheck className="w-3 h-3" /> Draft saved
                  </span>
                )}
                {saveStatus === 'saving' && (
                  <span className="text-stone-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                  </span>
                )}
                {saveStatus !== 'saved' && saveStatus !== 'saving' && (
                  canProceed
                    ? <span className="text-amber-400 font-semibold">{usd(costs.totalUSD)} · {nights} nights · {pax} pax</span>
                    : <span className="text-stone-500">Set arrival &amp; return dates to continue</span>
                )}
              </div>
              <button onClick={onClose} className="btn-outline text-sm px-4">Cancel</button>
              <button onClick={handleSave} disabled={saveStatus === 'saving'}
                className="flex items-center gap-1.5 text-sm font-semibold text-stone-300 border border-white/10 bg-stone-800 hover:bg-stone-700 rounded-xl px-4 py-2 disabled:opacity-40 transition-colors">
                {saveStatus === 'saving'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : saveStatus === 'saved'
                    ? <FileCheck className="w-4 h-4 text-emerald-400" />
                    : <Save className="w-4 h-4" />}
                {saveStatus === 'saved' ? 'Saved ✓' : 'Save Draft'}
              </button>
              <button onClick={handleDownload} disabled={!canProceed || downloading}
                className="flex items-center gap-1.5 text-sm font-semibold text-stone-300 border border-white/10 bg-stone-800 hover:bg-stone-700 rounded-xl px-4 py-2 disabled:opacity-40 transition-colors">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </button>
              <button onClick={handleSend} disabled={!canProceed || sending}
                className="btn-primary text-sm px-5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send to Client</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Enquiry Row ───────────────────────────────────────────────
function EnquiryRow({ enquiry, existingVoucher, onStatusChange, onDelete, onSendVoucher }) {
  const [open, setOpen]             = useState(false)
  const [updating, setUpdating]     = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const date = enquiry.submitted_at
    ? new Date(enquiry.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  async function updateStatus(status) {
    setUpdating(true)
    await supabase.from('itinerary_requests').update({ status }).eq('id', enquiry.id)
    setUpdating(false)
    onStatusChange()
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const jwt = session?.access_token
      if (!jwt) throw new Error('Not authenticated')
      const res = await fetch('/api/admin/delete-enquiry', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ enquiryId: enquiry.id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      onDelete(enquiry.id)
    } catch { setDeleting(false); setConfirmDel(false) }
  }

  return (
    <div className="bg-stone-800 rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-white text-sm">{enquiry.client_name || 'Unknown'}</p>
              <StatusBadge status={enquiry.status} />
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{date}</p>
          </div>
          <button onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-stone-400 mb-2">
          {enquiry.client_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-stone-500" />{enquiry.client_email}</span>}
          {enquiry.client_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-stone-500" />{enquiry.client_phone}</span>}
          {enquiry.client_country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-stone-500" />{enquiry.client_country}</span>}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-stone-400 mb-3">
          <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-stone-500" />{enquiry.nights}N</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3 text-stone-500" />{enquiry.guests} guests</span>
          <span className="flex items-center gap-1"><Hotel className="w-3 h-3 text-stone-500" />{enquiry.tier}</span>
          {enquiry.tour_interest && <span className="text-amber-400 font-medium">{enquiry.tour_interest}</span>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {enquiry.status === 'pending_review' && (
            <button onClick={() => updateStatus('in_progress')} disabled={updating}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-1.5 px-3 rounded-xl border border-blue-200 disabled:opacity-50 transition-colors">
              {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
              Mark In Progress
            </button>
          )}
          <button onClick={() => onSendVoucher(enquiry)}
            className={`flex items-center gap-1.5 text-white text-xs font-semibold py-1.5 px-3 rounded-xl shadow-sm transition-colors ${
              existingVoucher
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}>
            {existingVoucher
              ? <><FileEdit className="w-3 h-3" /> Edit Voucher</>
              : <><Send className="w-3 h-3" /> Create Voucher</>}
          </button>
          {existingVoucher && (
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <FileCheck className="w-2.5 h-2.5" /> Draft saved
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-white/5 px-5 py-4 bg-stone-900/40 space-y-3">
          {enquiry.tour_interest && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Tour Interest</p>
              <p className="text-sm text-stone-300">{enquiry.tour_interest}</p>
            </div>
          )}
          {enquiry.travel_date && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Preferred Travel Date</p>
              <p className="text-sm text-stone-300">{new Date(enquiry.travel_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
            </div>
          )}
          {Array.isArray(enquiry.interests) && enquiry.interests.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Special Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {enquiry.interests.map(i => (
                  <span key={i} className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">{i}</span>
                ))}
              </div>
            </div>
          )}
          {enquiry.message && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Client Notes</p>
              <p className="text-sm text-stone-400 whitespace-pre-wrap leading-relaxed">{enquiry.message}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <p className="text-xs text-stone-500 font-medium">Status:</p>
              <select value={enquiry.status} onChange={e => updateStatus(e.target.value)} disabled={updating}
                className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-stone-900 text-white focus:outline-none focus:border-amber-500 disabled:opacity-50">
                <option value="pending_review">New</option>
                <option value="in_progress">In Progress</option>
                <option value="quoted">Quoted</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
              {updating && <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin" />}
            </div>

            {!confirmDel ? (
              <button onClick={() => setConfirmDel(true)}
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-400 transition-colors font-medium">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400 font-medium">Delete this enquiry?</span>
                <button onClick={handleDelete} disabled={deleting}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg disabled:opacity-50 transition-colors">
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, delete'}
                </button>
                <button onClick={() => setConfirmDel(false)}
                  className="text-xs font-medium text-stone-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Section ──────────────────────────────────────────────
export default function AdminEnquirySection({ enquiries: initialEnquiries, vouchers: initialVouchers, onRefresh }) {
  const [enquiries, setEnquiries] = useState(initialEnquiries)
  const [voucherMap, setVoucherMap] = useState(() => {
    const map = {}
    for (const v of initialVouchers || []) map[v.enquiry_id] = v
    return map
  })
  const [voucherTarget, setVoucherTarget] = useState(null)

  useMemo(() => setEnquiries(initialEnquiries), [initialEnquiries])
  useMemo(() => {
    const map = {}
    for (const v of initialVouchers || []) map[v.enquiry_id] = v
    setVoucherMap(map)
  }, [initialVouchers])

  const newCount = enquiries.filter(e => e.status === 'pending_review').length

  function handleDelete(id) {
    setEnquiries(prev => prev.filter(e => e.id !== id))
    onRefresh()
  }

  function handleVoucherSaved(voucher) {
    setVoucherMap(m => ({ ...m, [voucher.enquiry_id]: voucher }))
  }

  function handleVoucherDeleted(enquiryId) {
    setVoucherMap(m => { const n = { ...m }; delete n[enquiryId]; return n })
  }

  if (enquiries.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-serif font-bold text-white mb-4">Enquiries</h2>
        <div className="bg-stone-800 rounded-2xl border border-white/5 flex flex-col items-center justify-center py-16 text-stone-500">
          <Inbox className="w-10 h-10 mb-3 opacity-25" />
          <p className="text-sm">No enquiries yet. They appear here when visitors submit the contact form.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-serif font-bold text-white">Enquiries</h2>
        {newCount > 0 && (
          <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
            {newCount} new
          </span>
        )}
        <span className="text-xs text-stone-400 ml-auto">{enquiries.length} total</span>
      </div>

      <div className="space-y-3">
        {enquiries.map(enq => (
          <EnquiryRow
            key={enq.id}
            enquiry={enq}
            existingVoucher={voucherMap[enq.id]}
            onStatusChange={onRefresh}
            onDelete={handleDelete}
            onSendVoucher={setVoucherTarget}
          />
        ))}
      </div>

      {voucherTarget && (
        <SendVoucherModal
          enquiry={voucherTarget}
          existingVoucher={voucherMap[voucherTarget.id]}
          onClose={() => setVoucherTarget(null)}
          onSent={() => { setVoucherTarget(null); onRefresh() }}
          onVoucherSaved={handleVoucherSaved}
          onVoucherDeleted={handleVoucherDeleted}
        />
      )}
    </div>
  )
}
