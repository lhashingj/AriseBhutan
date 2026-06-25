'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import {
  Clock, CheckCircle2,
  Search, RefreshCw, DollarSign,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import AdminBookingDrawer from '@/components/AdminBookingDrawer'

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED']

const STATUS_STYLE = {
  PENDING:   'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminBookingsPage() {
  const [profiles, setProfiles]     = useState([])
  const [bookings, setBookings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch]         = useState('')
  const [statusTab, setStatusTab]   = useState('ALL')
  const [selected, setSelected]     = useState(null)

  async function load() {
    setRefreshing(true)
    const [{ data: prof }, { data: bks }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
    ])
    setProfiles(prof || [])
    setBookings(bks  || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  const pending   = bookings.filter((b) => b.status === 'PENDING').length
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length
  const revenue   = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((s, b) => s + Number(b.total_cost || 0), 0)

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      b.tour_title?.toLowerCase().includes(q) ||
      b.client_name?.toLowerCase().includes(q) ||
      b.client_email?.toLowerCase().includes(q)
    const matchStatus = statusTab === 'ALL' || b.status === statusTab
    return matchSearch && matchStatus
  })

  function ownerOf(bk) {
    return profiles.find((p) => p.id === bk.user_id) || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Bookings</h1>
          <p className="text-stone-500 text-sm mt-0.5">All tour bookings — manage status, view details & vouchers</p>
        </div>
        <button onClick={load} disabled={refreshing}
          className="btn-outline text-sm gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{confirmed}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Confirmed Revenue</p>
            <p className="text-2xl font-bold text-emerald-700">
              ${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or tour name…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUS_TABS.map((s) => (
            <button key={s} onClick={() => setStatusTab(s)}
              className={`text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors ${
                statusTab === s
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300'
              }`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3.5 text-left">Client</th>
                <th className="px-5 py-3.5 text-left">Tour</th>
                <th className="px-5 py-3.5 text-left">Dates</th>
                <th className="px-5 py-3.5 text-left">Guests</th>
                <th className="px-5 py-3.5 text-left">Total</th>
                <th className="px-5 py-3.5 text-left">Status</th>
                <th className="px-5 py-3.5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((bk) => {
                const owner = ownerOf(bk)
                return (
                  <tr key={bk.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
                          {(owner?.name || bk.client_name || '?')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900 text-sm">{owner?.name || bk.client_name || '—'}</p>
                          <p className="text-xs text-stone-400">{bk.client_email || owner?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <p className="text-sm text-stone-700 line-clamp-1">{bk.tour_title || 'Custom Package'}</p>
                      <p className="text-xs text-stone-400">{bk.hotel_tier || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-stone-500 whitespace-nowrap">
                      {bk.arrival_date
                        ? `${new Date(bk.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${fmtDate(bk.return_date)}`
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-stone-700">{bk.group_size || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-stone-900">${Number(bk.total_cost || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${STATUS_STYLE[bk.status] || 'bg-stone-100 text-stone-500'}`}>
                        {bk.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(owner || { id: bk.user_id, name: bk.client_name, email: bk.client_email })}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 hover:border-amber-300 px-3 py-1.5 rounded-xl transition-colors">
                        View →
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-stone-400 text-sm">
                    {search ? 'No bookings match your search.' : 'No bookings yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-stone-50 bg-stone-50/50">
          <p className="text-xs text-stone-400">{filtered.length} of {bookings.length} bookings shown</p>
        </div>
      </div>

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
