'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import {
  Users, Clock, DollarSign, CheckCircle2, Search,
  ChevronUp, ChevronDown, RefreshCw, Trash2, Eye,
  XCircle, Loader2, FileText, ExternalLink, X, Mail, UserPlus, Send,
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import AdminUserDrawer from '@/components/AdminUserDrawer'

function getRef(booking) {
  const year = new Date(booking.created_at).getFullYear()
  return `ARB-${year}-${booking.id.slice(0, 6).toUpperCase()}`
}

function computePricing(packageRate, serviceFee, nights, guests, inrRate) {
  const rate = Number(packageRate) || 0
  const fee  = Number(serviceFee)  || 0
  const n    = Number(nights)      || 1
  const g    = Number(guests)      || 1
  const fx   = Number(inrRate)     || 83.5
  const sdf  = 100 * n * g
  const sub  = (rate * g) + sdf + fee
  const gst  = sub * 0.05
  const total = sub + gst
  const inr  = total * fx
  return { sdfTotal: sdf, subtotal: sub, gst, grandTotal: total, equivalentInr: inr }
}

function PricingModal({ itinerary, onClose, onSaved }) {
  const nights = Number(itinerary.tour_summary?.duration_nights) || 1
  const guests = Number(itinerary.tour_summary?.group_size)      || 1

  const [packageRate, setPackageRate] = useState(itinerary.pricing?.package_rate_per_pax ?? '')
  const [serviceFee,  setServiceFee]  = useState(itinerary.pricing?.service_fee ?? '')
  const [inrRate,     setInrRate]     = useState(itinerary.pricing?.inr_rate ?? 83.5)
  const [saving,      setSaving]      = useState(false)
  const [err,         setErr]         = useState('')

  const calc = useMemo(
    () => computePricing(packageRate, serviceFee, nights, guests, inrRate),
    [packageRate, serviceFee, nights, guests, inrRate]
  )
  const fmt = n => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const inp = 'w-full bg-stone-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 transition-colors'

  async function save() {
    setSaving(true)
    setErr('')
    const pricing = {
      package_rate_per_pax: Number(packageRate) || 0,
      sdf_total:            calc.sdfTotal,
      service_fee:          Number(serviceFee) || 0,
      subtotal:             calc.subtotal,
      gst:                  calc.gst,
      grand_total:          calc.grandTotal,
      inr_rate:             Number(inrRate) || 83.5,
      equivalent_inr:       calc.equivalentInr,
    }
    const { data, error } = await supabase
      .from('itineraries')
      .update({ pricing })
      .eq('id', itinerary.id)
      .select()
      .single()
    setSaving(false)
    if (error) { setErr(error.message); return }
    onSaved(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1C1C1F] border border-[#2E2E33] rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">{itinerary.booking_reference}</p>
            <h3 className="font-bold text-white text-base mt-0.5">Edit Pricing</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Nights / guests info */}
          <p className="text-xs text-stone-500">
            {nights} night{nights !== 1 ? 's' : ''} · {guests} guest{guests !== 1 ? 's' : ''}
            {' '}— edit nights &amp; group size in the Full Editor
          </p>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold block mb-1.5">Package Rate / Pax (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                <input type="number" min="0" step="50" value={packageRate}
                  onChange={e => setPackageRate(e.target.value)} placeholder="0"
                  className={`${inp} pl-7`} />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold block mb-1.5">Service Fee (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                <input type="number" min="0" step="10" value={serviceFee}
                  onChange={e => setServiceFee(e.target.value)} placeholder="0"
                  className={`${inp} pl-7`} />
              </div>
            </div>
          </div>

          {/* Live breakdown */}
          <div className="bg-stone-950 rounded-2xl p-4 space-y-2.5 border border-white/5">
            <div className="flex justify-between text-stone-400 text-sm">
              <span>Package Rate × {guests} guests</span>
              <span className="font-mono text-stone-200">${fmt((Number(packageRate) || 0) * guests)}</span>
            </div>
            <div className="flex justify-between text-stone-400 text-sm">
              <span>SDF ($100 × {nights}N × {guests} guests)</span>
              <span className="font-mono text-stone-200">${fmt(calc.sdfTotal)}</span>
            </div>
            <div className="flex justify-between text-stone-400 text-sm">
              <span>Service Fee</span>
              <span className="font-mono text-stone-200">${fmt(Number(serviceFee) || 0)}</span>
            </div>
            <div className="border-t border-white/10 pt-2.5 flex justify-between text-white text-sm font-semibold">
              <span>Subtotal</span>
              <span className="font-mono">${fmt(calc.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-400 text-sm">
              <span>GST (5%)</span>
              <span className="font-mono text-stone-200">${fmt(calc.gst)}</span>
            </div>
            {/* Grand total */}
            <div className="rounded-xl overflow-hidden mt-1"
              style={{ background: 'linear-gradient(135deg, #1C1007, #2D1A08)', boxShadow: '0 0 20px 2px rgba(217,119,6,0.18), inset 0 1px 0 rgba(245,158,11,0.2)' }}>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70">Grand Total</p>
                  <p className="text-white text-xs font-bold mt-0.5">USD · All inclusive</p>
                </div>
                <p className="font-black text-2xl tracking-tight"
                  style={{ color: '#F59E0B', fontFamily: 'monospace', textShadow: '0 0 24px rgba(245,158,11,0.6)' }}>
                  ${fmt(calc.grandTotal)}
                </p>
              </div>
              <div className="border-t border-amber-900/40 px-4 py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-amber-700/60 whitespace-nowrap">INR Rate ₹</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={inrRate}
                    onChange={e => setInrRate(e.target.value)}
                    className="w-20 bg-transparent border border-amber-900/50 rounded-lg px-2 py-0.5 text-xs text-amber-600 font-mono focus:outline-none focus:border-amber-600/60 text-center"
                  />
                </div>
                <span className="font-mono text-amber-600 text-xs font-semibold">
                  ₹{calc.equivalentInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {err && <p className="text-red-400 text-xs">{err}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/10">
          <button onClick={onClose}
            className="flex-1 text-sm font-semibold text-stone-300 bg-stone-700 hover:bg-stone-600 py-2.5 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
            Save Pricing
          </button>
        </div>
      </div>
    </div>
  )
}

const ITIN_STATUS = {
  enquiry_pending: { label: 'New Enquiry', cls: 'bg-rose-500/20 text-rose-300 ring-1 ring-inset ring-rose-400/50' },
  pending_review:  { label: 'Review',      cls: 'bg-amber-500/20 text-amber-300 ring-1 ring-inset ring-amber-400/50' },
  quoted:          { label: 'Quoted',      cls: 'bg-blue-500/20 text-blue-300 ring-1 ring-inset ring-blue-400/50' },
  confirmed:       { label: 'Confirmed',   cls: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-400/50' },
}

function InviteModal({ onClose }) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [err,     setErr]     = useState('')

  async function send() {
    if (!email.trim()) { setErr('Email is required.'); return }
    setSending(true)
    setErr('')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/invite-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    })
    const json = await res.json()
    setSending(false)
    if (!res.ok) { setErr(json.error || 'Failed to send invitation.'); return }
    setSent(true)
  }

  const inp = 'w-full bg-stone-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#1C1C1F] border border-[#2E2E33] rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Invite Client</h3>
              <p className="text-[11px] text-stone-500">Send a registration invitation by email</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          /* Success state */
          <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center">
              <Send className="w-6 h-6 text-green-400" />
            </div>
            <p className="font-bold text-white text-base">Invitation sent!</p>
            <p className="text-sm text-stone-400">
              An invitation email has been sent to <span className="text-white font-medium">{email}</span> with a link to register.
            </p>
            <button onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-sm font-semibold transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-stone-400">
                The client will receive a branded invitation email with a link to create their Arise Bhutan account.
              </p>
              <div>
                <label className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold block mb-1.5">
                  Client Name <span className="text-stone-600 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Tenzin Wangchuk"
                  className={inp}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold block mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErr('') }}
                    placeholder="client@example.com"
                    className={`${inp} pl-9`}
                    onKeyDown={e => e.key === 'Enter' && send()}
                  />
                </div>
              </div>
              {err && <p className="text-red-400 text-xs">{err}</p>}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-white/10">
              <button onClick={onClose}
                className="flex-1 text-sm font-semibold text-stone-300 bg-stone-700 hover:bg-stone-600 py-2.5 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={send} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Invitation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [profiles, setProfiles]           = useState([])
  const [bookings, setBookings]           = useState([])
  const [itineraries, setItineraries]     = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [sortKey, setSortKey]             = useState('created_at')
  const [sortDir, setSortDir]             = useState('desc')
  const [selected, setSelected]           = useState(null)
  const [refreshing, setRefreshing]       = useState(false)
  const [activePanel, setActivePanel]     = useState(null)
  const [processingId, setProcessingId]   = useState(null)
  const [confirmDeleteBk, setConfirmDeleteBk]     = useState(null)
  const [confirmDeleteItin, setConfirmDeleteItin] = useState(null)
  const [deletingItin, setDeletingItin]   = useState(false)
  const [pricingTarget, setPricingTarget] = useState(null)
  const [showInvite, setShowInvite]       = useState(false)

  async function load() {
    setRefreshing(true)
    const [{ data: prof }, { data: bks }, { data: itins }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('itineraries').select('*').order('created_at', { ascending: false }),
    ])
    setProfiles(prof || [])
    setBookings(bks  || [])
    setItineraries(itins || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  // ── Metrics ──────────────────────────────────────────────────────────────────
  const totalClients    = profiles.filter((p) => p.role === 'CLIENT').length
  const pendingCount    = bookings.filter((b) => b.status === 'PENDING').length
  const confirmedItins  = itineraries.filter((i) => i.status === 'confirmed')
  // Sum all confirmed into both currencies for the revenue card
  const totalInr = confirmedItins.reduce((s, i) => {
    const isInr = i.pricing?.is_saarc || i.pricing?.currency === 'INR'
    const val   = Number(i.pricing?.grand_total || 0)
    if (isInr) return s + val
    const fx = Number(i.pricing?.inr_rate) || 83.5
    return s + (Number(i.pricing?.equivalent_inr) || val * fx)
  }, 0)
  const totalUsd = confirmedItins.reduce((s, i) => {
    const isInr = i.pricing?.is_saarc || i.pricing?.currency === 'INR'
    const val   = Number(i.pricing?.grand_total || 0)
    if (!isInr) return s + val
    const fx = Number(i.pricing?.inr_rate) || 83.5
    return s + val / fx
  }, 0)
  // Still keep separate for panel header text
  const inrRevenue = confirmedItins
    .filter(i => i.pricing?.is_saarc || i.pricing?.currency === 'INR')
    .reduce((s, i) => s + Number(i.pricing?.grand_total || 0), 0)
  const usdRevenue = confirmedItins
    .filter(i => !i.pricing?.is_saarc && i.pricing?.currency !== 'INR')
    .reduce((s, i) => s + Number(i.pricing?.grand_total || 0), 0)

  function itinFmt(it) {
    const isInr  = it.pricing?.is_saarc || it.pricing?.currency === 'INR'
    const total  = Number(it.pricing?.grand_total || 0)
    if (!total) return null
    if (isInr) {
      const inrStr = `Nu. ${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      const fx     = Number(it.pricing?.inr_rate) || 83.5
      const usdStr = `$${(total / fx).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      return { primary: inrStr, secondary: usdStr }
    } else {
      const usdStr = `$${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      const fx     = Number(it.pricing?.inr_rate) || 83.5
      const eqInr  = Number(it.pricing?.equivalent_inr) || total * fx
      const inrStr = `Nu. ${eqInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      return { primary: usdStr, secondary: inrStr }
    }
  }

  // ── Booking CRUD ─────────────────────────────────────────────────────────────
  async function confirmBookingInline(bkId) {
    setProcessingId(bkId)
    const bk = bookings.find(b => b.id === bkId)
    const { error } = await supabase.from('bookings').update({ status: 'CONFIRMED' }).eq('id', bkId)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === bkId ? { ...b, status: 'CONFIRMED' } : b))
      // Sync status to the linked itinerary record
      if (bk?.client_email) {
        const { data: synced } = await supabase
          .from('itineraries')
          .update({ status: 'confirmed' })
          .filter('client_info->>email', 'eq', bk.client_email)
          .filter('tour_summary->>tour_package', 'eq', bk.tour_title || 'Custom Package')
          .select()
        if (synced?.length) {
          setItineraries(prev => prev.map(i => synced.find(u => u.id === i.id) || i))
        }
      }
    }
    setProcessingId(null)
  }

  async function cancelBookingInline(bkId) {
    setProcessingId(bkId)
    const bk = bookings.find(b => b.id === bkId)
    const { error } = await supabase.from('bookings').update({ status: 'CANCELLED' }).eq('id', bkId)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === bkId ? { ...b, status: 'CANCELLED' } : b))
      // Sync cancellation to the linked itinerary record
      if (bk?.client_email) {
        const { data: synced } = await supabase
          .from('itineraries')
          .update({ status: 'pending_review' })
          .filter('client_info->>email', 'eq', bk.client_email)
          .filter('tour_summary->>tour_package', 'eq', bk.tour_title || 'Custom Package')
          .eq('status', 'confirmed')
          .select()
        if (synced?.length) {
          setItineraries(prev => prev.map(i => synced.find(u => u.id === i.id) || i))
        }
      }
    }
    setProcessingId(null)
  }

  async function deleteBookingById(bkId) {
    setProcessingId(bkId)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/delete-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ type: 'booking', id: bkId }),
    })
    if (res.ok) {
      setBookings(prev => prev.filter(b => b.id !== bkId))
      // Also remove any matching itinerary that was synced from this booking
      const bk = bookings.find(b => b.id === bkId)
      if (bk) setItineraries(prev => prev.filter(i => i.client_info?.email !== bk.client_email || i.tour_summary?.tour_package !== bk.tour_title))
    }
    setProcessingId(null)
    setConfirmDeleteBk(null)
  }

  // ── Itinerary CRUD ───────────────────────────────────────────────────────────
  async function updateItinStatus(itinId, status) {
    setProcessingId(itinId)
    const { error } = await supabase.from('itineraries').update({ status }).eq('id', itinId)
    if (!error) setItineraries(prev => prev.map(i => i.id === itinId ? { ...i, status } : i))
    setProcessingId(null)
  }

  async function deleteItinById(itinId) {
    setDeletingItin(true)
    const { data: { session } } = await supabase.auth.getSession()
    const itin = itineraries.find(i => i.id === itinId)
    const res = await fetch('/api/admin/delete-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ type: 'itinerary', id: itinId }),
    })
    if (res.ok) {
      setItineraries(prev => prev.filter(i => i.id !== itinId))
      // Also remove matching booking from local state
      if (itin) setBookings(prev => prev.filter(b => b.client_email !== itin.client_info?.email || b.tour_title !== itin.tour_summary?.tour_package))
    }
    setDeletingItin(false)
    setConfirmDeleteItin(null)
  }

  // ── Profile CRUD callbacks ───────────────────────────────────────────────────
  function handleProfileDelete(id) {
    setProfiles(prev => prev.filter(p => p.id !== id))
    setBookings(prev => prev.filter(b => b.user_id !== id))
    setSelected(null)
  }

  function handleProfileUpdate(updated) {
    setProfiles(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))
    setSelected(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev)
  }

  // ── Sort / filter ────────────────────────────────────────────────────────────
  const bookingCount = (uid) => {
    const profile = profiles.find(p => p.id === uid)
    if (!profile?.email) return bookings.filter((b) => b.user_id === uid).length
    return itineraries.filter((i) => i.client_info?.email === profile.email).length
  }

  const filtered = profiles
    .filter((p) => {
      const q = search.toLowerCase()
      return p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.role?.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      let va = sortKey === 'bookings' ? bookingCount(a.id) : (a[sortKey] ?? '')
      let vb = sortKey === 'bookings' ? bookingCount(b.id) : (b[sortKey] ?? '')
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-amber-500" />
      : <ChevronDown className="w-3 h-3 text-amber-500" />
  }

  // Map booking_reference → itinerary for quick lookup in the Awaiting Confirmation cards
  const itinByRef = Object.fromEntries(
    itineraries.filter(i => i.booking_reference).map(i => [i.booking_reference, i])
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Admin Dashboard</h1>
          <p className="text-stone-400 text-sm mt-0.5">Arise Bhutan Tours — Operations Centre</p>
        </div>
        <button onClick={load} disabled={refreshing}
          className="btn-outline text-sm gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Metrics HUD ── */}
      <div className="grid sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActivePanel(activePanel === 'clients' ? null : 'clients')}
          className={`group bg-[#1A1A1D] rounded-2xl border p-6 flex items-center gap-4 text-left w-full transition-all shadow-lg
            ${activePanel === 'clients'
              ? 'border-blue-500/50 shadow-blue-950/40'
              : 'border-[#2A2A2E] hover:border-blue-500/40 hover:shadow-blue-950/30'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all
            ${activePanel === 'clients' ? 'bg-blue-500/25' : 'bg-blue-500/15 group-hover:bg-blue-500/20'}`}>
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Registered Clients</p>
            <p className="text-3xl font-bold text-white mt-0.5">{totalClients}</p>
          </div>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'pending' ? null : 'pending')}
          className={`group bg-[#1A1A1D] rounded-2xl border p-6 flex items-center gap-4 text-left w-full transition-all shadow-lg
            ${activePanel === 'pending'
              ? 'border-[#D97706]/50 shadow-amber-950/40'
              : 'border-[#2A2A2E] hover:border-[#D97706]/40 hover:shadow-amber-950/30'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all
            ${activePanel === 'pending' ? 'bg-amber-500/25' : 'bg-amber-500/15 group-hover:bg-amber-500/20'}`}>
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Pending Bookings</p>
            <p className="text-3xl font-bold text-[#F59E0B] mt-0.5">{pendingCount}</p>
          </div>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'confirmed' ? null : 'confirmed')}
          className={`group bg-[#1A1A1D] rounded-2xl border p-6 flex items-center gap-4 text-left w-full transition-all shadow-lg
            ${activePanel === 'confirmed'
              ? 'border-emerald-500/50 shadow-emerald-950/40'
              : 'border-[#2A2A2E] hover:border-emerald-500/40 hover:shadow-emerald-950/30'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all
            ${activePanel === 'confirmed' ? 'bg-emerald-500/25' : 'bg-emerald-500/15 group-hover:bg-emerald-500/20'}`}>
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Confirmed Revenue</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5 leading-tight">
              Nu. {totalInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-base font-bold text-emerald-600 leading-tight">
              ${totalUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-stone-500 mt-0.5">{confirmedItins.length} itinerar{confirmedItins.length === 1 ? 'y' : 'ies'}</p>
          </div>
        </button>
      </div>

      {/* ── Clients Panel ── */}
      {activePanel === 'clients' && (
        <div className="bg-[#1A1A1D] rounded-2xl border border-blue-500/25 overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-blue-500/20 bg-blue-500/10 flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Registered Clients
              <span className="text-xs font-normal text-stone-400 ml-1">({totalClients} total)</span>
            </h2>
            <button onClick={() => setActivePanel(null)} className="text-xs text-stone-400 hover:text-white">✕ Close</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#111114] border-b border-white/5 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Packages</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles.filter((p) => p.role === 'CLIENT').map((p) => {
                  const cnt  = bookingCount(p.id)
                  const pend = bookings.filter((b) => b.user_id === p.id && b.status === 'PENDING').length
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                            {p.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-white text-sm">{p.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-400">{p.email}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{cnt}</span>
                          {pend > 0 && <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-1.5 py-0.5 rounded-full">{pend} pending</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-500">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setSelected(p)}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/30">
                          Manage →
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {profiles.filter((p) => p.role === 'CLIENT').length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-stone-500 text-sm">No registered clients yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pending Bookings Panel ── */}
      {activePanel === 'pending' && (
        <div className="bg-[#1A1A1D] rounded-2xl border border-[#D97706]/25 overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-amber-500/20 bg-amber-500/10 flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Pending Bookings
              <span className="text-xs font-normal text-stone-400 ml-1">({pendingCount} total)</span>
            </h2>
            <button onClick={() => setActivePanel(null)} className="text-xs text-stone-400 hover:text-white">✕ Close</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-900/50 border-b border-white/5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Client</th>
                  <th className="px-5 py-3 text-left">Tour</th>
                  <th className="px-5 py-3 text-left">Dates</th>
                  <th className="px-5 py-3 text-left">Guests</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.filter((b) => b.status === 'PENDING').map((bk) => {
                  const owner = profiles.find((p) => p.id === bk.user_id)
                  const busy  = processingId === bk.id
                  return (
                    <tr key={bk.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                            {(owner?.name || bk.client_name || '?')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{owner?.name || bk.client_name || '—'}</p>
                            <p className="text-xs text-stone-500">{bk.client_email || owner?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-300 max-w-[200px]">
                        <p className="line-clamp-1">{bk.tour_title || 'Custom Package'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-stone-500">{bk.hotel_tier || '—'}</p>
                          {bk.travel_interests?.length > 0 && (
                            <span
                              title={bk.travel_interests.map(ti => ti.name).join(', ')}
                              className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30 cursor-help"
                            >
                              {bk.travel_interests.length} interests
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-400">
                        {bk.arrival_date ? new Date(bk.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        {bk.return_date ? ` – ${new Date(bk.return_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-300">{bk.group_size || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-white">${Number(bk.total_cost || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => confirmBookingInline(bk.id)} disabled={busy}
                            className="flex items-center gap-1 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
                            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Confirm
                          </button>
                          <button onClick={() => cancelBookingInline(bk.id)} disabled={busy}
                            className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/30 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                          <button onClick={() => setSelected(owner || { id: bk.user_id, name: bk.client_name })}
                            className="flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-stone-300 hover:bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button onClick={() => setConfirmDeleteBk(bk.id)}
                            className="text-stone-600 hover:text-red-400 transition-colors p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {bookings.filter((b) => b.status === 'PENDING').length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-stone-500 text-sm">No pending bookings.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Confirmed Itineraries Panel ── */}
      {activePanel === 'confirmed' && (
        <div className="bg-[#1A1A1D] rounded-2xl border border-emerald-500/25 overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-green-500/20 bg-green-500/10 flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> Confirmed Itineraries
              <span className="text-xs font-normal text-stone-400 ml-1">
                ({confirmedItins.length}{inrRevenue > 0 ? ` · Nu. ${inrRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : ''}{usdRevenue > 0 ? ` · $${usdRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : ''} total)
              </span>
            </h2>
            <button onClick={() => setActivePanel(null)} className="text-xs text-stone-400 hover:text-white">✕ Close</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-900/50 border-b border-white/5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Client</th>
                  <th className="px-5 py-3 text-left">Tour</th>
                  <th className="px-5 py-3 text-left">Trip</th>
                  <th className="px-5 py-3 text-left">Reference</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {confirmedItins.map((it) => {
                  const name  = it.client_info?.guest_name || it.client_info?.email || '—'
                  const email = it.client_info?.email || ''
                  const tour  = it.tour_summary?.tour_package || 'Custom Package'
                  const nights = it.tour_summary?.duration_nights
                  const guests = it.tour_summary?.group_size
                  const total  = Number(it.pricing?.grand_total || 0)
                  return (
                    <tr key={it.id} className="hover:bg-green-500/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-xs flex-shrink-0">
                            {name[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{name}</p>
                            {email && <p className="text-xs text-stone-500">{email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-300 max-w-[200px]">
                        <p className="line-clamp-1">{tour}</p>
                        <p className="text-xs text-stone-500">{it.tour_summary?.hotel_tier || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-400">
                        {nights != null ? `${nights}N` : '—'}
                        {guests ? ` · ${guests} pax` : ''}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-stone-500">{it.booking_reference || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {(() => { const f = itinFmt(it); return f ? (
                          <div>
                            <p className="font-bold text-green-400 text-sm">{f.primary}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{f.secondary}</p>
                          </div>
                        ) : <span className="text-stone-600 text-xs italic">Not set</span> })()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {it.booking_reference && (
                            <Link href={`/itinerary/${it.booking_reference}`} target="_blank"
                              className="flex items-center gap-1 text-xs font-semibold text-green-400 hover:text-green-300 hover:bg-green-500/10 border border-green-500/30 px-2.5 py-1.5 rounded-lg transition-colors">
                              <Eye className="w-3 h-3" /> Voucher
                            </Link>
                          )}
                          <button onClick={() => setConfirmDeleteItin(it)}
                            className="text-stone-600 hover:text-red-400 transition-colors p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {confirmedItins.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-stone-500 text-sm">No confirmed itineraries yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {confirmedItins.length > 0 && (
            <div className="px-5 py-3 border-t border-white/5 bg-stone-900/30 flex items-center justify-between">
              <p className="text-xs text-stone-500">{confirmedItins.length} confirmed itineraries</p>
              <p className="text-sm font-bold text-green-400">
                Total:{inrRevenue > 0 ? ` Nu. ${inrRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : ''}{inrRevenue > 0 && usdRevenue > 0 ? ' +' : ''}{usdRevenue > 0 ? ` $${usdRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Awaiting Confirmation Strip ── */}
      {bookings.filter((b) => b.status === 'PENDING').length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-5 rounded-full bg-[#D97706]" />
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Awaiting Confirmation
            </h2>
            <div className="flex-1 h-px bg-[#2A2A2E]" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookings.filter((b) => b.status === 'PENDING').slice(0, 6).map((bk) => {
              const owner   = profiles.find((p) => p.id === bk.user_id)
              const busy    = processingId === bk.id
              const itin    = itinByRef[getRef(bk)]
              const total   = Number(itin?.pricing?.grand_total || bk.total_cost || 0)
              const isSaarc = itin?.pricing?.is_saarc ?? false
              const currSym = isSaarc ? '₹' : '$'
              const fmtTotal = isSaarc
                ? total.toLocaleString('en-IN', { maximumFractionDigits: 0 })
                : total.toLocaleString('en-US', { maximumFractionDigits: 0 })
              return (
                <div key={bk.id} className="bg-[#1C1914] rounded-2xl border border-[#D97706]/30 p-4 hover:border-[#D97706]/50 transition-all shadow-lg shadow-amber-950/20">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-white text-sm line-clamp-1">{bk.tour_title || 'Custom Package'}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">PENDING</span>
                  </div>
                  <p className="text-xs text-stone-400">{owner?.name || bk.client_name || '—'} · {bk.group_size || '—'} pax</p>
                  <p className="text-base font-bold text-[#F59E0B] mt-1 mb-3">
                    {total > 0 ? <>{currSym}{fmtTotal}</> : <span className="text-stone-500 text-sm font-normal italic">Pricing pending</span>}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap border-t border-[#D97706]/15 pt-2.5">
                    <button onClick={() => confirmBookingInline(bk.id)} disabled={busy}
                      className="flex items-center gap-1 text-[11px] font-semibold bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Confirm
                    </button>
                    <button onClick={() => cancelBookingInline(bk.id)} disabled={busy}
                      className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/30 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
                      <XCircle className="w-3 h-3" /> Cancel
                    </button>
                    <button onClick={() => setSelected(owner || { id: bk.user_id, name: bk.client_name })}
                      className="flex items-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-stone-300 hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors">
                      <Eye className="w-3 h-3" /> Details
                    </button>
                    <button onClick={() => setConfirmDeleteBk(bk.id)}
                      className="ml-auto text-stone-600 hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Itineraries Section ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-white">Itineraries</h2>
            {itineraries.filter(i => i.status === 'enquiry_pending' || i.status === 'pending_review').length > 0 && (
              <span className="text-xs bg-rose-500/20 text-rose-400 font-bold px-2.5 py-1 rounded-full border border-rose-500/20">
                {itineraries.filter(i => i.status === 'enquiry_pending' || i.status === 'pending_review').length} need review
              </span>
            )}
          </div>
          <Link href="/admin/itineraries"
            className="text-xs font-semibold text-amber-500 hover:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors">
            Full Editor →
          </Link>
        </div>

        {itineraries.length === 0 ? (
          <div className="bg-[#1A1A1D] rounded-2xl border border-[#2A2A2E] flex flex-col items-center justify-center py-14 text-stone-500">
            <FileText className="w-9 h-9 mb-2 opacity-20" />
            <p className="text-sm">No itineraries yet. They appear when guests submit enquiries.</p>
          </div>
        ) : (
          <div className="bg-[#1A1A1D] rounded-2xl border border-[#D97706]/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#111114] border-b border-[#D97706]/15 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                    <th className="px-5 py-3.5 text-left">Client</th>
                    <th className="px-5 py-3.5 text-left">Tour Package</th>
                    <th className="px-5 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-left">Trip</th>
                    <th className="px-5 py-3.5 text-left">Total</th>
                    <th className="px-5 py-3.5 text-left">Reference</th>
                    <th className="px-5 py-3.5 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {itineraries.map((it) => {
                    const cfg    = ITIN_STATUS[it.status] || ITIN_STATUS.pending_review
                    const name   = it.client_info?.guest_name || it.client_info?.email || '—'
                    const email  = it.client_info?.email || ''
                    const tour   = it.tour_summary?.tour_package || 'Custom Package'
                    const nights = it.tour_summary?.duration_nights
                    const guests = it.tour_summary?.group_size
                    const total  = it.pricing?.grand_total
                    const busy   = processingId === it.id
                    return (
                      <tr key={it.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                              {name[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white text-sm truncate">{name}</p>
                              {email && <p className="text-[11px] text-stone-500 truncate">{email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 max-w-[200px]">
                          <p className="text-sm text-stone-300 line-clamp-1">{tour}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-stone-500">{it.tour_summary?.hotel_tier || '—'}</p>
                            {it.tour_summary?.travel_interests?.length > 0 && (
                              <span
                                title={it.tour_summary.travel_interests.map(ti => ti.name).join(', ')}
                                className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30 cursor-help"
                              >
                                {it.tour_summary.travel_interests.length} interests
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={it.status}
                            onChange={e => updateItinStatus(it.id, e.target.value)}
                            disabled={busy}
                            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border-0 ring-1 ring-inset focus:outline-none focus:ring-amber-500 disabled:opacity-50 cursor-pointer ${cfg.cls}`}
                          >
                            <option value="enquiry_pending">Enquiry</option>
                            <option value="pending_review">Review</option>
                            <option value="quoted">Quoted</option>
                            <option value="confirmed">Confirmed</option>
                          </select>
                          {busy && <Loader2 className="w-3 h-3 animate-spin inline ml-1 text-stone-400" />}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-stone-400">
                          {nights != null ? `${nights}N` : '—'}
                          {guests ? ` · ${guests} pax` : ''}
                        </td>
                        <td className="px-5 py-3.5">
                          {(() => { const f = itinFmt(it); return f ? (
                            <div>
                              <p className="font-bold font-mono text-amber-400 text-sm">{f.primary}</p>
                              <p className="text-xs text-stone-500 mt-0.5 font-mono">{f.secondary}</p>
                            </div>
                          ) : <span className="text-stone-600 text-xs italic">Not set</span> })()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-stone-500">{it.booking_reference || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {it.booking_reference && (
                              <Link
                                href={`/itinerary/${it.booking_reference}`}
                                target="_blank"
                                className="flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors">
                                <Eye className="w-3 h-3" /> Voucher
                              </Link>
                            )}
                            <Link
                              href="/admin/itineraries"
                              className="flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-stone-300 hover:bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors">
                              <ExternalLink className="w-3 h-3" /> Edit
                            </Link>
                            <button onClick={() => setConfirmDeleteItin(it)}
                              className="text-stone-600 hover:text-red-400 transition-colors p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-[#D97706]/10 bg-[#111114]">
              <p className="text-xs text-stone-600">{itineraries.length} total itineraries</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Global Client Directory ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-serif font-bold text-white">Client Directory</h2>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 px-3 py-2 rounded-xl transition-colors">
              <UserPlus className="w-3.5 h-3.5" /> Invite Client
            </button>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, role…"
                className="pl-9 pr-4 py-2.5 text-sm border border-white/10 rounded-xl bg-stone-900 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1D] rounded-2xl border border-[#2A2A2E] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#111114] border-b border-[#2A2A2E]">
                  {[
                    { key: 'name',       label: 'Name' },
                    { key: 'email',      label: 'Email' },
                    { key: 'role',       label: 'Role' },
                    { key: 'bookings',   label: 'Packages' },
                    { key: 'created_at', label: 'Joined' },
                  ].map(({ key, label }) => (
                    <th key={key}
                      onClick={() => toggleSort(key)}
                      className="px-5 py-3.5 text-left text-[10px] font-bold text-stone-500 uppercase tracking-widest cursor-pointer hover:text-stone-300 select-none transition-colors">
                      <span className="flex items-center gap-1.5">{label}<SortIcon col={key} /></span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold text-stone-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => {
                  const count   = bookingCount(p.id)
                  const pend    = bookings.filter((b) => b.user_id === p.id && b.status === 'PENDING').length
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                            {p.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-white text-sm">{p.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-stone-400">{p.email}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                          p.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-700 text-stone-300'
                        }`}>{p.role}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{count}</span>
                          {pend > 0 && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-1.5 py-0.5 rounded-full">
                              {pend} pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-stone-500">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelected(p)}
                          className="text-xs font-semibold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors border border-amber-500/30">
                          Manage →
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-stone-500 text-sm">
                      No clients match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[#2A2A2E] bg-[#111114]">
            <p className="text-xs text-stone-600">{filtered.length} of {profiles.length} clients shown</p>
          </div>
        </div>
      </div>

      {/* ── Delete Booking Confirm Modal ── */}
      {confirmDeleteBk && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#1C1C1F] border border-[#2E2E33] rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-white mb-1">Delete this booking?</h3>
            <p className="text-sm text-stone-400 mb-5">This will permanently remove the booking record. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteBk(null)}
                className="flex-1 text-sm font-semibold text-stone-300 bg-stone-700 hover:bg-stone-600 py-2.5 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteBookingById(confirmDeleteBk)} disabled={processingId === confirmDeleteBk}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition-colors disabled:opacity-60">
                {processingId === confirmDeleteBk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Itinerary Confirm Modal ── */}
      {confirmDeleteItin && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#1C1C1F] border border-[#2E2E33] rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-white mb-1">Delete itinerary?</h3>
            <p className="text-sm text-stone-400 mb-1">
              <span className="font-semibold text-white">{confirmDeleteItin.client_info?.guest_name || 'Guest'}</span> — {confirmDeleteItin.tour_summary?.tour_package || 'Custom Package'}
            </p>
            {confirmDeleteItin.booking_reference && (
              <p className="text-xs font-mono text-stone-500 mb-4">{confirmDeleteItin.booking_reference}</p>
            )}
            <p className="text-sm text-red-400 mb-5">This permanently removes the itinerary and the guest's voucher link will stop working.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteItin(null)}
                className="flex-1 text-sm font-semibold text-stone-300 bg-stone-700 hover:bg-stone-600 py-2.5 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteItinById(confirmDeleteItin.id)} disabled={deletingItin}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition-colors disabled:opacity-60">
                {deletingItin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── User Management Drawer ── */}
      {selected && (
        <AdminUserDrawer
          profile={selected}
          bookings={bookings.filter((b) => b.user_id === selected.id)}
          onClose={() => setSelected(null)}
          onDelete={handleProfileDelete}
          onUpdate={handleProfileUpdate}
        />
      )}

      {/* ── Invite Client Modal ── */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      {/* ── Pricing Modal ── */}
      {pricingTarget && (
        <PricingModal
          itinerary={pricingTarget}
          onClose={() => setPricingTarget(null)}
          onSaved={(updated) => {
            setItineraries(prev => prev.map(i => i.id === updated.id ? updated : i))
            setPricingTarget(null)
          }}
        />
      )}
    </div>
  )
}
