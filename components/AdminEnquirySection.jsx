'use client'

import { useState, useMemo } from 'react'
import {
  Inbox, Mail, Phone, MapPin, Moon, Users, Hotel,
  Send, AlertCircle, X, ChevronDown, ChevronUp,
  Loader2, Clock, CheckCircle2, Trash2, Download, Plus,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { computePricing } from '@/utils/pdfGenerator'

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG = {
  pending_review: { label: 'New',         cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  in_progress:    { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  quoted:         { label: 'Quoted',      cls: 'bg-green-100 text-green-700 border-green-200' },
  confirmed:      { label: 'Confirmed',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  declined:       { label: 'Declined',    cls: 'bg-stone-100 text-stone-500 border-stone-200' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending_review
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ── Voucher Modal ─────────────────────────────────────────────
const DEFAULT_INCLUSIONS = [
  'Bhutan Sustainable Development Fee (SDF)',
  'Bhutan visa & permit processing',
  'All accommodation per itinerary',
  'All meals as specified',
  'Licensed English-speaking ATCB guide',
  'Private vehicle & dedicated driver',
  'All monument & dzong entry fees',
  'Arise Bhutan 24/7 in-country support',
]
const DEFAULT_EXCLUSIONS = [
  'International airfare to/from Paro',
  'Travel & medical insurance',
  'Personal expenses & gratuities',
  'Alcoholic & premium beverages',
  'Optional adventure activities',
]

function SendVoucherModal({ enquiry, onClose, onSent }) {
  const pax = enquiry.guests || 2

  const [tab, setTab]     = useState('trip')
  const [sending, setSending]     = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError]         = useState('')
  const [sent, setSent]           = useState(false)
  const [ref, setRef]             = useState('')

  const [form, setFormRaw] = useState({
    tourTitle:   enquiry.tour_interest || '',
    arrivalDate: enquiry.travel_date ? enquiry.travel_date.split('T')[0] : '',
    returnDate:  '',
    guide:       'Licensed ATCB Guide',
    vehicle:     'Private Vehicle & Driver',
    pricePerPerson: '',
    sdfRate:     '100',
    serviceFee:  '0',
    gstRate:     '0',
    inrRate:     '83.5',
    inclusions:  [...DEFAULT_INCLUSIONS],
    exclusions:  [...DEFAULT_EXCLUSIONS],
  })

  function set(k, v) { setFormRaw(f => ({ ...f, [k]: v })) }

  function addItem(field)         { setFormRaw(f => ({ ...f, [field]: [...f[field], ''] })) }
  function removeItem(field, idx) { setFormRaw(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) })) }
  function editItem(field, idx, v) {
    setFormRaw(f => { const a = [...f[field]]; a[idx] = v; return { ...f, [field]: a } })
  }

  const nights = useMemo(() => {
    if (!form.arrivalDate || !form.returnDate) return enquiry.nights || 5
    const diff = (new Date(form.returnDate) - new Date(form.arrivalDate)) / 86_400_000
    return Math.max(1, Math.ceil(diff))
  }, [form.arrivalDate, form.returnDate, enquiry.nights])

  const costs = useMemo(() => computePricing({
    pricePerPerson:       parseFloat(form.pricePerPerson) || 0,
    pax,
    sdfPerPersonPerNight: parseFloat(form.sdfRate)        || 100,
    nights,
    serviceFeePerPax:     parseFloat(form.serviceFee)     || 0,
    gstRate:              (parseFloat(form.gstRate) || 0) / 100,
    inrRate:              parseFloat(form.inrRate)         || 83.5,
  }), [form.pricePerPerson, form.sdfRate, form.serviceFee, form.gstRate, form.inrRate, pax, nights])

  function buildPayload() {
    return {
      enquiryId:   enquiry.id,
      tourTitle:   form.tourTitle,
      arrivalDate: form.arrivalDate,
      returnDate:  form.returnDate,
      guide:       form.guide,
      vehicle:     form.vehicle,
      pricing: {
        pricePerPerson:       parseFloat(form.pricePerPerson) || 0,
        sdfPerPersonPerNight: parseFloat(form.sdfRate)        || 100,
        serviceFeePerPax:     parseFloat(form.serviceFee)     || 0,
        gstRate:              (parseFloat(form.gstRate) || 0) / 100,
        inrRate:              parseFloat(form.inrRate)         || 83.5,
      },
      inclusions: form.inclusions.filter(Boolean),
      exclusions: form.exclusions.filter(Boolean),
    }
  }

  async function getJwt() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated. Please log in again.')
    return session.access_token
  }

  async function handleDownload() {
    setDownloading(true)
    setError('')
    try {
      const jwt = await getJwt()
      const res = await fetch('/api/admin/download-voucher', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body:    JSON.stringify(buildPayload()),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Download failed') }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `Arise-Bhutan-ARB-${enquiry.id.slice(0, 8).toUpperCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setDownloading(false)
    }
  }

  async function handleSend() {
    setSending(true)
    setError('')
    try {
      const jwt = await getJwt()
      const res = await fetch('/api/send-voucher-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body:    JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setRef(data.ref)
      setSent(true)
      onSent()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const canProceed = Boolean(form.arrivalDate && form.returnDate)
  const usd = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const inp = 'w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="bg-stone-900 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div>
            <p className="font-bold text-white text-base">Booking Voucher</p>
            <p className="text-stone-400 text-xs mt-0.5">{enquiry.client_name || 'Guest'} · {enquiry.client_email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="p-10 text-center flex-1">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Voucher Sent!</h3>
            <p className="text-stone-500 text-sm mb-1">PDF emailed to <strong>{enquiry.client_email}</strong></p>
            <p className="font-mono text-xs text-stone-400 mb-6">{ref}</p>
            <button onClick={onClose} className="btn-primary text-sm px-6">Done</button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-stone-100 flex-shrink-0">
              {[['trip', 'Trip Details'], ['pricing', 'Pricing'], ['package', 'Package']].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === id
                      ? 'text-amber-700 border-amber-600'
                      : 'text-stone-500 border-transparent hover:text-stone-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6">

              {/* Enquiry context strip */}
              <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 mb-5">
                <span><span className="text-stone-400">Nights:</span> {enquiry.nights}</span>
                <span><span className="text-stone-400">Guests:</span> {pax}</span>
                <span><span className="text-stone-400">Tier:</span> {enquiry.tier || '—'}</span>
                {enquiry.interests?.length > 0 && (
                  <span><span className="text-stone-400">Interests:</span> {enquiry.interests.join(', ')}</span>
                )}
              </div>

              {/* ── TAB: Trip Details ── */}
              {tab === 'trip' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Tour Title</label>
                    <input value={form.tourTitle} onChange={e => set('tourTitle', e.target.value)}
                      className={inp} placeholder="e.g. Classic Bhutan Cultural Tour 7D/6N" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Arrival Date <span className="text-red-500">*</span></label>
                      <input type="date" value={form.arrivalDate}
                        onChange={e => set('arrivalDate', e.target.value)} className={inp} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Return Date <span className="text-red-500">*</span></label>
                      <input type="date" value={form.returnDate} min={form.arrivalDate || undefined}
                        onChange={e => set('returnDate', e.target.value)} className={inp} />
                    </div>
                  </div>
                  {form.arrivalDate && form.returnDate && (
                    <p className="text-xs text-amber-700 font-medium">
                      → {nights} night{nights !== 1 ? 's' : ''} · {nights + 1} days
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Tour Guide</label>
                      <input value={form.guide} onChange={e => set('guide', e.target.value)} className={inp} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Vehicle</label>
                      <input value={form.vehicle} onChange={e => set('vehicle', e.target.value)} className={inp} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: Pricing ── */}
              {tab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Package Rate / Person (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                        <input type="number" min="0" step="10" value={form.pricePerPerson}
                          onChange={e => set('pricePerPerson', e.target.value)}
                          className={`${inp} pl-7`} placeholder="e.g. 1500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">SDF / Person / Night (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                        <input type="number" min="0" step="1" value={form.sdfRate}
                          onChange={e => set('sdfRate', e.target.value)}
                          className={`${inp} pl-7`} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Service Fee / Pax (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                        <input type="number" min="0" step="10" value={form.serviceFee}
                          onChange={e => set('serviceFee', e.target.value)}
                          className={`${inp} pl-7`} placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">GST / Tax Rate</label>
                      <div className="relative">
                        <input type="number" min="0" max="30" step="0.5" value={form.gstRate}
                          onChange={e => set('gstRate', e.target.value)}
                          className={`${inp} pr-7`} placeholder="0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">INR Exchange Rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">₹</span>
                        <input type="number" min="1" step="0.5" value={form.inrRate}
                          onChange={e => set('inrRate', e.target.value)}
                          className={`${inp} pl-7`} />
                      </div>
                    </div>
                  </div>

                  {/* Live cost breakdown */}
                  <div className="bg-stone-900 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-stone-800 flex items-center justify-between">
                      <p className="text-xs font-bold text-stone-300 uppercase tracking-wider">Live Cost Breakdown</p>
                      <p className="text-xs text-stone-500">{pax} pax · {nights} nights</p>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-400">Package ({usd(parseFloat(form.pricePerPerson) || 0)} × {pax} pax)</span>
                        <span className="text-white font-semibold">{usd(costs.packageTotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-400">SDF (${form.sdfRate}/pax/night × {nights}N × {pax})</span>
                        <span className="text-white font-semibold">{usd(costs.sdfTotal)}</span>
                      </div>
                      {parseFloat(form.serviceFee) > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-stone-400">Service Fee (${form.serviceFee} × {pax} pax)</span>
                          <span className="text-white font-semibold">{usd(costs.serviceTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs border-t border-stone-700 pt-2">
                        <span className="text-stone-400">Sub-total</span>
                        <span className="text-stone-300">{usd(costs.subtotal)}</span>
                      </div>
                      {parseFloat(form.gstRate) > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-stone-400">GST / Tax ({form.gstRate}%)</span>
                          <span className="text-stone-300">{usd(costs.gst)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-stone-700 pt-2.5 mt-1">
                        <span className="text-amber-400 font-bold text-sm">Grand Total (USD)</span>
                        <span className="text-amber-400 font-bold text-lg">{usd(costs.totalUSD)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-500">≈ INR equivalent @ ₹{form.inrRate}</span>
                        <span className="text-stone-400">₹{Math.round(costs.totalINR).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: Package ── */}
              {tab === 'package' && (
                <div className="space-y-6">
                  {/* Inclusions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">Inclusions</p>
                      <button type="button" onClick={() => addItem('inclusions')}
                        className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors">
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>
                    <div className="space-y-2">
                      {form.inclusions.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-green-600 font-bold text-sm flex-shrink-0 w-4">✓</span>
                          <input value={item} onChange={e => editItem('inclusions', i, e.target.value)}
                            className={`${inp} flex-1`} placeholder="Included item…" />
                          <button type="button" onClick={() => removeItem('inclusions', i)}
                            className="text-stone-300 hover:text-red-500 transition-colors flex-shrink-0 p-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">Exclusions</p>
                      <button type="button" onClick={() => addItem('exclusions')}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>
                    <div className="space-y-2">
                      {form.exclusions.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-red-500 font-bold text-sm flex-shrink-0 w-4">✗</span>
                          <input value={item} onChange={e => editItem('exclusions', i, e.target.value)}
                            className={`${inp} flex-1`} placeholder="Excluded item…" />
                          <button type="button" onClick={() => removeItem('exclusions', i)}
                            className="text-stone-300 hover:text-red-500 transition-colors flex-shrink-0 p-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-stone-100 bg-stone-50 px-6 py-4 flex items-center gap-3 flex-shrink-0 rounded-b-2xl">
              <div className="flex-1 text-xs">
                {canProceed
                  ? <span className="text-amber-700 font-semibold">{usd(costs.totalUSD)} · {nights} nights · {pax} pax</span>
                  : <span className="text-stone-400">Set arrival &amp; return dates to continue</span>
                }
              </div>
              <button type="button" onClick={onClose} className="btn-outline text-sm px-4">
                Cancel
              </button>
              <button type="button" onClick={handleDownload} disabled={!canProceed || downloading}
                className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 border border-stone-300 bg-white rounded-xl px-4 py-2 hover:bg-stone-100 disabled:opacity-40 transition-colors">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </button>
              <button type="button" onClick={handleSend} disabled={!canProceed || sending}
                className="btn-primary text-sm px-5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send to Client</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Enquiry Row ───────────────────────────────────────────────
function EnquiryRow({ enquiry, onStatusChange, onDelete, onSendVoucher }) {
  const [open, setOpen]           = useState(false)
  const [updating, setUpdating]   = useState(false)
  const [deleting, setDeleting]   = useState(false)
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
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body:    JSON.stringify({ enquiryId: enquiry.id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      onDelete(enquiry.id)
    } catch {
      setDeleting(false)
      setConfirmDel(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      {/* Main row */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-stone-900 text-sm">{enquiry.client_name || 'Unknown'}</p>
              <StatusBadge status={enquiry.status} />
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{date}</p>
          </div>
          <button onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors flex-shrink-0">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Contact chips */}
        <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-2">
          {enquiry.client_email && (
            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-stone-400" />{enquiry.client_email}</span>
          )}
          {enquiry.client_phone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-stone-400" />{enquiry.client_phone}</span>
          )}
          {enquiry.client_country && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-stone-400" />{enquiry.client_country}</span>
          )}
        </div>

        {/* Trip chips */}
        <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-3">
          <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-stone-400" />{enquiry.nights}N</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3 text-stone-400" />{enquiry.guests} guests</span>
          <span className="flex items-center gap-1"><Hotel className="w-3 h-3 text-stone-400" />{enquiry.tier}</span>
          {enquiry.tour_interest && <span className="text-amber-700 font-medium">{enquiry.tour_interest}</span>}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {enquiry.status === 'pending_review' && (
            <button onClick={() => updateStatus('in_progress')} disabled={updating}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-1.5 px-3 rounded-xl transition-colors border border-blue-200 disabled:opacity-50">
              {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
              Mark In Progress
            </button>
          )}
          {enquiry.client_email && (
            <button onClick={() => onSendVoucher(enquiry)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-1.5 px-3 rounded-xl transition-colors shadow-sm">
              <Send className="w-3 h-3" />
              Send Voucher
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-stone-100 px-5 py-4 bg-stone-50 space-y-3">
          {enquiry.tour_interest && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Tour Interest</p>
              <p className="text-sm text-stone-700">{enquiry.tour_interest}</p>
            </div>
          )}
          {enquiry.travel_date && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Preferred Travel Date</p>
              <p className="text-sm text-stone-700">
                {new Date(enquiry.travel_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </p>
            </div>
          )}
          {Array.isArray(enquiry.interests) && enquiry.interests.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Special Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {enquiry.interests.map((i) => (
                  <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{i}</span>
                ))}
              </div>
            </div>
          )}
          {enquiry.message && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Client Notes</p>
              <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{enquiry.message}</p>
            </div>
          )}

          {/* Status + Delete row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <p className="text-xs text-stone-400 font-medium">Status:</p>
              <select value={enquiry.status} onChange={e => updateStatus(e.target.value)} disabled={updating}
                className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-amber-500 disabled:opacity-50">
                <option value="pending_review">New</option>
                <option value="in_progress">In Progress</option>
                <option value="quoted">Quoted</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
              {updating && <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin" />}
            </div>

            {/* Delete */}
            {!confirmDel ? (
              <button onClick={() => setConfirmDel(true)}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-600 transition-colors font-medium">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Delete this enquiry?</span>
                <button onClick={handleDelete} disabled={deleting}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg disabled:opacity-50 transition-colors">
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, delete'}
                </button>
                <button onClick={() => setConfirmDel(false)}
                  className="text-xs font-medium text-stone-500 hover:text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors">
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
export default function AdminEnquirySection({ enquiries: initialEnquiries, onRefresh }) {
  const [enquiries, setEnquiries]       = useState(initialEnquiries)
  const [voucherTarget, setVoucherTarget] = useState(null)

  // Keep in sync when parent refreshes
  useMemo(() => setEnquiries(initialEnquiries), [initialEnquiries])

  const newCount = enquiries.filter(e => e.status === 'pending_review').length

  function handleDelete(id) {
    setEnquiries(prev => prev.filter(e => e.id !== id))
    onRefresh()
  }

  if (enquiries.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-serif font-bold text-stone-900 mb-4">Enquiries</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center justify-center py-16 text-stone-400">
          <Inbox className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No enquiries yet. They appear here when visitors submit the contact form.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-serif font-bold text-stone-900">Enquiries</h2>
        {newCount > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full border border-amber-200">
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
            onStatusChange={onRefresh}
            onDelete={handleDelete}
            onSendVoucher={setVoucherTarget}
          />
        ))}
      </div>

      {voucherTarget && (
        <SendVoucherModal
          enquiry={voucherTarget}
          onClose={() => setVoucherTarget(null)}
          onSent={() => { setVoucherTarget(null); onRefresh() }}
        />
      )}
    </div>
  )
}
