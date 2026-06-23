'use client'

import { useState } from 'react'
import {
  Inbox, Mail, Phone, MapPin, Moon, Users, Hotel,
  Send, Check, AlertCircle, X, ChevronDown, ChevronUp,
  Loader2, Clock, CheckCircle2,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const STATUS_CFG = {
  pending_review: { label: 'New',        cls: 'bg-amber-100 text-amber-700 border-amber-200' },
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

// ── Send Voucher Modal ────────────────────────────────────────
function SendVoucherModal({ enquiry, onClose, onSent }) {
  const [form, setForm] = useState({
    tourTitle:   enquiry.tour_interest || '',
    arrivalDate: enquiry.travel_date   || '',
    returnDate:  '',
    totalCost:   '',
  })
  const [sending, setSending] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)
  const [ref, setRef]         = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSend(e) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const jwt = session?.access_token
      if (!jwt) throw new Error('Not authenticated')

      const res = await fetch('/api/send-voucher-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          enquiryId:   enquiry.id,
          tourTitle:   form.tourTitle,
          arrivalDate: form.arrivalDate,
          returnDate:  form.returnDate,
          totalCost:   parseFloat(form.totalCost) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setRef(data.ref)
      setSent(true)
      onSent()
    } catch (err) {
      setError(err.message || 'Something went wrong. Check API keys and try again.')
    } finally {
      setSending(false)
    }
  }

  const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors bg-white'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-base">Send Voucher to Client</p>
            <p className="text-stone-400 text-xs mt-0.5">{enquiry.client_name} · {enquiry.client_email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Voucher Sent!</h3>
            <p className="text-stone-500 text-sm mb-1">
              The PDF voucher has been emailed to <strong>{enquiry.client_email}</strong>.
            </p>
            <p className="text-stone-400 text-xs font-mono mb-5">{ref}</p>
            <button onClick={onClose} className="btn-primary text-sm">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 space-y-4">
            {/* Enquiry summary */}
            <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-500 space-y-1">
              <p><span className="text-stone-400">Nights:</span> {enquiry.nights} · <span className="text-stone-400">Guests:</span> {enquiry.guests} · <span className="text-stone-400">Tier:</span> {enquiry.tier}</p>
              {enquiry.interests?.length > 0 && (
                <p><span className="text-stone-400">Interests:</span> {enquiry.interests.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Tour Title</label>
              <input required value={form.tourTitle} onChange={(e) => set('tourTitle', e.target.value)}
                className={inputCls} placeholder="e.g. Classic Bhutan Cultural Tour" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Arrival Date *</label>
                <input required type="date" value={form.arrivalDate} onChange={(e) => set('arrivalDate', e.target.value)}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Return Date *</label>
                <input required type="date" value={form.returnDate}
                  min={form.arrivalDate || undefined}
                  onChange={(e) => set('returnDate', e.target.value)}
                  className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Total Cost (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input type="number" min="0" step="1" value={form.totalCost}
                  onChange={(e) => set('totalCost', e.target.value)}
                  className={`${inputCls} pl-8`} placeholder="e.g. 3200" />
              </div>
              <p className="text-xs text-stone-400 mt-1">Leave blank to omit pricing from voucher.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-outline flex-1" disabled={sending}>
                Cancel
              </button>
              <button type="submit" disabled={sending || !form.arrivalDate || !form.returnDate}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {sending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send Voucher</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Enquiry Row ───────────────────────────────────────────────
function EnquiryRow({ enquiry, onStatusChange, onSendVoucher }) {
  const [open, setOpen]         = useState(false)
  const [updating, setUpdating] = useState(false)

  const date = enquiry.submitted_at
    ? new Date(enquiry.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  async function updateStatus(status) {
    setUpdating(true)
    const { createClient } = await import('@supabase/supabase-js')
    const adminSb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
    // Use the logged-in user's session (admin RLS allows update)
    await adminSb.from('itinerary_requests').update({ status }).eq('id', enquiry.id)
    setUpdating(false)
    onStatusChange()
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

        {/* Quick info chips */}
        <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-3">
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
        <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-3">
          <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-stone-400" />{enquiry.nights}N</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3 text-stone-400" />{enquiry.guests} guests</span>
          <span className="flex items-center gap-1"><Hotel className="w-3 h-3 text-stone-400" />{enquiry.tier}</span>
          {enquiry.tour_interest && <span className="text-amber-700 font-medium">{enquiry.tour_interest}</span>}
        </div>

        {/* Actions */}
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
              <p className="text-sm text-stone-700">{new Date(enquiry.travel_date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Notes</p>
              <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{enquiry.message}</p>
            </div>
          )}
          {/* Status control */}
          <div className="flex items-center gap-2 pt-1">
            <p className="text-xs text-stone-400 font-medium">Status:</p>
            <select
              value={enquiry.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              <option value="pending_review">New</option>
              <option value="in_progress">In Progress</option>
              <option value="quoted">Quoted</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </select>
            {updating && <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin" />}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Section ──────────────────────────────────────────────
export default function AdminEnquirySection({ enquiries, onRefresh }) {
  const [voucherTarget, setVoucherTarget] = useState(null)

  const newCount = enquiries.filter((e) => e.status === 'pending_review').length

  if (enquiries.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-serif font-bold text-stone-900 mb-4">
          Enquiries
        </h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center justify-center py-16 text-stone-400">
          <Inbox className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No enquiries yet. They will appear here when visitors submit the contact form.</p>
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
        {enquiries.map((enq) => (
          <EnquiryRow
            key={enq.id}
            enquiry={enq}
            onStatusChange={onRefresh}
            onSendVoucher={setVoucherTarget}
          />
        ))}
      </div>

      {voucherTarget && (
        <SendVoucherModal
          enquiry={voucherTarget}
          onClose={() => setVoucherTarget(null)}
          onSent={() => { onRefresh(); setVoucherTarget(null) }}
        />
      )}
    </div>
  )
}
