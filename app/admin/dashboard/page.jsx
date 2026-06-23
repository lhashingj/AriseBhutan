'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Users, Clock, DollarSign, CheckCircle2, Search, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import AdminBookingDrawer from '@/components/AdminBookingDrawer'
import AdminEnquirySection from '@/components/AdminEnquirySection'

const STATUS_BADGE = {
  PENDING:   'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

export default function AdminDashboard() {
  const [profiles, setProfiles]     = useState([])
  const [bookings, setBookings]     = useState([])
  const [enquiries, setEnquiries]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [sortKey, setSortKey]       = useState('created_at')
  const [sortDir, setSortDir]       = useState('desc')
  const [selected, setSelected]     = useState(null)    // selected profile for drawer
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setRefreshing(true)
    const [{ data: prof }, { data: bks }, { data: enqs }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('itinerary_requests').select('*').order('submitted_at', { ascending: false }),
    ])
    setProfiles(prof || [])
    setBookings(bks  || [])
    setEnquiries(enqs || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  // ── Metrics ──────────────────────────────────────────────────────────────
  const totalClients = profiles.filter((p) => p.role === 'CLIENT').length
  const pending      = bookings.filter((b) => b.status === 'PENDING').length
  const revenue      = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + Number(b.total_cost || 0), 0)

  // ── Filtered + sorted profiles ────────────────────────────────────────────
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
      ? <ChevronUp className="w-3 h-3 text-amber-600" />
      : <ChevronDown className="w-3 h-3 text-amber-600" />
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
          <h1 className="text-2xl font-serif font-bold text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500 text-sm mt-0.5">Arise Bhutan Tours — Operations Centre</p>
        </div>
        <button onClick={load} disabled={refreshing}
          className="btn-outline text-sm gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Metrics HUD ── */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Registered Clients</p>
            <p className="text-3xl font-bold text-stone-900 mt-0.5">{totalClients}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Pending Bookings</p>
            <p className="text-3xl font-bold text-amber-600 mt-0.5">{pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Confirmed Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-0.5">
              ${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Recent Bookings Strip ── */}
      {bookings.filter((b) => b.status === 'PENDING').length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-wider mb-3">
            Awaiting Confirmation
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookings.filter((b) => b.status === 'PENDING').slice(0, 6).map((bk) => {
              const owner = profiles.find((p) => p.id === bk.user_id)
              return (
                <div key={bk.id}
                  onClick={() => { setSelected(owner || { id: bk.user_id, name: bk.client_name }) }}
                  className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-stone-900 text-sm line-clamp-1">{bk.tour_title || 'Custom Package'}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">PENDING</span>
                  </div>
                  <p className="text-xs text-stone-500">{owner?.name || bk.client_name || '—'} · {bk.group_size || '—'} pax</p>
                  <p className="text-base font-bold text-stone-900 mt-2">${Number(bk.total_cost).toLocaleString()}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Enquiries ── */}
      <AdminEnquirySection enquiries={enquiries} onRefresh={load} />

      {/* ── Global Client Directory ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-serif font-bold text-stone-900">Client Directory</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, role…"
              className="pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-amber-500 w-64"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  {[
                    { key: 'name',       label: 'Name' },
                    { key: 'email',      label: 'Email' },
                    { key: 'role',       label: 'Role' },
                    { key: 'bookings',   label: 'Packages' },
                    { key: 'created_at', label: 'Joined' },
                  ].map(({ key, label }) => (
                    <th key={key}
                      onClick={() => toggleSort(key)}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider cursor-pointer hover:text-stone-800 select-none">
                      <span className="flex items-center gap-1.5">{label}<SortIcon col={key} /></span>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((p) => {
                  const count   = bookingCount(p.id)
                  const pending = bookings.filter((b) => b.user_id === p.id && b.status === 'PENDING').length

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                            {p.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-stone-900 text-sm">{p.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-stone-500">{p.email}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                          p.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                        }`}>{p.role}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 text-sm">{count}</span>
                          {pending > 0 && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded-full">
                              {pending} pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-stone-400">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelected(p)}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors border border-amber-200 hover:border-amber-300"
                        >
                          View Itineraries →
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-stone-400 text-sm">
                      No clients match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-stone-50 bg-stone-50/50">
            <p className="text-xs text-stone-400">{filtered.length} of {profiles.length} clients shown</p>
          </div>
        </div>
      </div>

      {/* ── Booking Drawer ── */}
      {selected && (
        <AdminBookingDrawer
          profile={selected}
          bookings={bookings.filter((b) => b.user_id === selected.id)}
          onClose={() => setSelected(null)}
          onStatusChange={load}
        />
      )}
    </div>
  )
}
