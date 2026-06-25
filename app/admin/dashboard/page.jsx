'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import {
  Users, Clock, DollarSign, CheckCircle2, Search,
  ChevronUp, ChevronDown, RefreshCw, Trash2, Eye,
  XCircle, Loader2, FileText, ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import AdminUserDrawer from '@/components/AdminUserDrawer'
import AdminEnquirySection from '@/components/AdminEnquirySection'

const ITIN_STATUS = {
  enquiry_pending: { label: 'Enquiry',   cls: 'bg-rose-500/15 text-rose-400 ring-1 ring-inset ring-rose-500/30' },
  pending_review:  { label: 'Review',    cls: 'bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/30' },
  quoted:          { label: 'Quoted',    cls: 'bg-blue-500/15 text-blue-400 ring-1 ring-inset ring-blue-500/30' },
  confirmed:       { label: 'Confirmed', cls: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/30' },
}

export default function AdminDashboard() {
  const [profiles, setProfiles]           = useState([])
  const [bookings, setBookings]           = useState([])
  const [enquiries, setEnquiries]         = useState([])
  const [vouchers, setVouchers]           = useState([])
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

  async function load() {
    setRefreshing(true)
    const { data: { session } } = await supabase.auth.getSession()
    const jwt = session?.access_token
    const [{ data: prof }, { data: bks }, { data: enqs }, vouchersRes, { data: itins }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('itinerary_requests').select('*').order('submitted_at', { ascending: false }),
      jwt
        ? fetch('/api/admin/vouchers', { headers: { Authorization: `Bearer ${jwt}` } }).then(r => r.json()).catch(() => ({ vouchers: [] }))
        : Promise.resolve({ vouchers: [] }),
      supabase.from('itineraries').select('*').order('created_at', { ascending: false }),
    ])
    setProfiles(prof || [])
    setBookings(bks  || [])
    setEnquiries(enqs || [])
    setVouchers(vouchersRes?.vouchers || [])
    setItineraries(itins || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  // ── Metrics ──────────────────────────────────────────────────────────────────
  const totalClients = profiles.filter((p) => p.role === 'CLIENT').length
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length
  const revenue      = bookings.filter((b) => b.status === 'CONFIRMED').reduce((s, b) => s + Number(b.total_cost || 0), 0)

  // ── Booking CRUD ─────────────────────────────────────────────────────────────
  async function confirmBookingInline(bkId) {
    setProcessingId(bkId)
    const { error } = await supabase.from('bookings').update({ status: 'CONFIRMED' }).eq('id', bkId)
    if (!error) setBookings(prev => prev.map(b => b.id === bkId ? { ...b, status: 'CONFIRMED' } : b))
    setProcessingId(null)
  }

  async function cancelBookingInline(bkId) {
    setProcessingId(bkId)
    const { error } = await supabase.from('bookings').update({ status: 'CANCELLED' }).eq('id', bkId)
    if (!error) setBookings(prev => prev.map(b => b.id === bkId ? { ...b, status: 'CANCELLED' } : b))
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
  const bookingCount = (uid) => bookings.filter((b) => b.user_id === uid).length

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
      <div className="grid sm:grid-cols-3 gap-5">
        <button
          onClick={() => setActivePanel(activePanel === 'clients' ? null : 'clients')}
          className={`bg-stone-800 rounded-2xl border p-6 flex items-center gap-4 text-left w-full transition-all
            ${activePanel === 'clients' ? 'border-blue-500/40 ring-1 ring-blue-500/20' : 'border-white/5 hover:border-blue-500/30'}`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Registered Clients</p>
            <p className="text-3xl font-bold text-white mt-0.5">{totalClients}</p>
          </div>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'pending' ? null : 'pending')}
          className={`bg-stone-800 rounded-2xl border p-6 flex items-center gap-4 text-left w-full transition-all
            ${activePanel === 'pending' ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-white/5 hover:border-amber-500/30'}`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Pending Bookings</p>
            <p className="text-3xl font-bold text-amber-400 mt-0.5">{pendingCount}</p>
          </div>
        </button>

        <button
          onClick={() => setActivePanel(activePanel === 'confirmed' ? null : 'confirmed')}
          className={`bg-stone-800 rounded-2xl border p-6 flex items-center gap-4 text-left w-full transition-all
            ${activePanel === 'confirmed' ? 'border-green-500/40 ring-1 ring-green-500/20' : 'border-white/5 hover:border-green-500/30'}`}>
          <div className="w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Confirmed Revenue</p>
            <p className="text-3xl font-bold text-green-400 mt-0.5">
              ${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </button>
      </div>

      {/* ── Clients Panel ── */}
      {activePanel === 'clients' && (
        <div className="bg-stone-800 rounded-2xl border border-blue-500/20 overflow-hidden">
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
                <tr className="bg-stone-900/50 border-b border-white/5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
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
        <div className="bg-stone-800 rounded-2xl border border-amber-500/20 overflow-hidden">
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
                        <p className="text-xs text-stone-500">{bk.hotel_tier || '—'}</p>
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

      {/* ── Confirmed Bookings Panel ── */}
      {activePanel === 'confirmed' && (
        <div className="bg-stone-800 rounded-2xl border border-green-500/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-green-500/20 bg-green-500/10 flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> Confirmed Bookings
              <span className="text-xs font-normal text-stone-400 ml-1">
                ({bookings.filter((b) => b.status === 'CONFIRMED').length} · ${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} total)
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
                  <th className="px-5 py-3 text-left">Dates</th>
                  <th className="px-5 py-3 text-left">Guests</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.filter((b) => b.status === 'CONFIRMED').map((bk) => {
                  const owner = profiles.find((p) => p.id === bk.user_id)
                  return (
                    <tr key={bk.id} className="hover:bg-green-500/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-xs flex-shrink-0">
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
                        <p className="text-xs text-stone-500">{bk.hotel_tier || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-400">
                        {bk.arrival_date ? new Date(bk.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        {bk.return_date ? ` – ${new Date(bk.return_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-stone-300">{bk.group_size || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-green-400">${Number(bk.total_cost || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(owner || { id: bk.user_id, name: bk.client_name })}
                            className="flex items-center gap-1 text-xs font-semibold text-green-400 hover:text-green-300 hover:bg-green-500/10 border border-green-500/30 px-2.5 py-1.5 rounded-lg transition-colors">
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
                {bookings.filter((b) => b.status === 'CONFIRMED').length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-stone-500 text-sm">No confirmed bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {bookings.filter((b) => b.status === 'CONFIRMED').length > 0 && (
            <div className="px-5 py-3 border-t border-white/5 bg-stone-900/30 flex items-center justify-between">
              <p className="text-xs text-stone-500">{bookings.filter((b) => b.status === 'CONFIRMED').length} confirmed bookings</p>
              <p className="text-sm font-bold text-green-400">Total Revenue: ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Awaiting Confirmation Strip ── */}
      {bookings.filter((b) => b.status === 'PENDING').length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Awaiting Confirmation
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookings.filter((b) => b.status === 'PENDING').slice(0, 6).map((bk) => {
              const owner = profiles.find((p) => p.id === bk.user_id)
              const busy  = processingId === bk.id
              return (
                <div key={bk.id} className="bg-stone-800 rounded-2xl border border-amber-500/20 p-4 hover:border-amber-500/40 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-white text-sm line-clamp-1">{bk.tour_title || 'Custom Package'}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex-shrink-0">PENDING</span>
                  </div>
                  <p className="text-xs text-stone-400">{owner?.name || bk.client_name || '—'} · {bk.group_size || '—'} pax</p>
                  <p className="text-base font-bold text-white mt-1 mb-3">${Number(bk.total_cost).toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 flex-wrap border-t border-white/10 pt-2.5">
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
          <div className="bg-stone-800 rounded-2xl border border-white/5 flex flex-col items-center justify-center py-14 text-stone-500">
            <FileText className="w-9 h-9 mb-2 opacity-25" />
            <p className="text-sm">No itineraries yet. They appear when guests submit enquiries.</p>
          </div>
        ) : (
          <div className="bg-stone-800 rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-900/50 border-b border-white/5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Client</th>
                    <th className="px-5 py-3 text-left">Tour Package</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Trip</th>
                    <th className="px-5 py-3 text-left">Reference</th>
                    <th className="px-5 py-3 text-left">Actions</th>
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
                        <td className="px-5 py-3.5 max-w-[180px]">
                          <p className="text-sm text-stone-300 line-clamp-1">{tour}</p>
                          <p className="text-[11px] text-stone-500">{it.tour_summary?.hotel_tier || '—'}</p>
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
            <div className="px-5 py-3 border-t border-white/5 bg-stone-900/30">
              <p className="text-xs text-stone-500">{itineraries.length} total itineraries</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Enquiries ── */}
      <AdminEnquirySection enquiries={enquiries} vouchers={vouchers} onRefresh={load} />

      {/* ── Global Client Directory ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-serif font-bold text-white">Client Directory</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, role…"
              className="pl-9 pr-4 py-2.5 text-sm border border-white/10 rounded-xl bg-stone-900 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 w-64"
            />
          </div>
        </div>

        <div className="bg-stone-800 rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-900/50 border-b border-white/5">
                  {[
                    { key: 'name',       label: 'Name' },
                    { key: 'email',      label: 'Email' },
                    { key: 'role',       label: 'Role' },
                    { key: 'bookings',   label: 'Packages' },
                    { key: 'created_at', label: 'Joined' },
                  ].map(({ key, label }) => (
                    <th key={key}
                      onClick={() => toggleSort(key)}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider cursor-pointer hover:text-white select-none">
                      <span className="flex items-center gap-1.5">{label}<SortIcon col={key} /></span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Actions</th>
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
          <div className="px-5 py-3 border-t border-white/5 bg-stone-900/30">
            <p className="text-xs text-stone-500">{filtered.length} of {profiles.length} clients shown</p>
          </div>
        </div>
      </div>

      {/* ── Delete Booking Confirm Modal ── */}
      {confirmDeleteBk && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-stone-800 border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-stone-800 border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
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
    </div>
  )
}
