'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import {
  Search, RefreshCw, Users, CheckCircle2, AlertCircle,
  ChevronUp, ChevronDown, ShieldCheck, Shield, Eye,
} from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import AdminUserDrawer from '@/components/AdminUserDrawer'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminUsersPage() {
  const [profiles, setProfiles]     = useState([])
  const [bookings, setBookings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [sortKey, setSortKey]       = useState('created_at')
  const [sortDir, setSortDir]       = useState('desc')
  const [selected, setSelected]     = useState(null)

  async function load() {
    setRefreshing(true)
    const [{ data: prof }, { data: bks }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('itineraries').select('*').order('created_at', { ascending: false }),
    ])
    setProfiles(prof || [])
    setBookings(bks  || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  const bookingsFor = (uid, email) => bookings.filter((b) =>
    b.user_id === uid || b.client_info?.email === email
  )
  const bookingCount = (uid, email) => bookingsFor(uid, email).length
  const pendingCount = (uid, email) => bookingsFor(uid, email).filter((b) =>
    ['enquiry_pending', 'pending_review', 'PENDING'].includes(b.status)
  ).length

  function passportExpiry(uid, email) {
    const bks = bookingsFor(uid, email).filter((b) => b.passport_expiry || b.client_info?.passport_expiry)
    if (!bks.length) return null
    const sorted = bks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    return sorted.passport_expiry || sorted.client_info?.passport_expiry
  }

  function expiryWarning(exp) {
    if (!exp) return false
    const months6 = new Date()
    months6.setMonth(months6.getMonth() + 6)
    return new Date(exp) <= months6
  }

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

  const filtered = profiles
    .filter((p) => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
      const matchRole = roleFilter === 'ALL' || p.role === roleFilter
      return matchSearch && matchRole
    })
    .sort((a, b) => {
      let va = sortKey === 'bookings' ? bookingCount(a.id) : (a[sortKey] ?? '')
      let vb = sortKey === 'bookings' ? bookingCount(b.id) : (b[sortKey] ?? '')
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  const clientCount = profiles.filter((p) => p.role === 'CLIENT').length
  const passportWarnings = profiles.filter((p) => expiryWarning(passportExpiry(p.id, p.email))).length

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
          <h1 className="text-2xl font-serif font-bold text-white">Client Management</h1>
          <p className="text-stone-400 text-sm mt-0.5">View, edit, and manage all registered users</p>
        </div>
        <button onClick={load} disabled={refreshing}
          className="btn-outline text-sm gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-stone-800 rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Total Clients</p>
            <p className="text-2xl font-bold text-white">{clientCount}</p>
          </div>
        </div>
        <div className="bg-stone-800 rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">With Bookings</p>
            <p className="text-2xl font-bold text-white">
              {profiles.filter((p) => bookingCount(p.id, p.email) > 0).length}
            </p>
          </div>
        </div>
        <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
          passportWarnings > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-stone-800 border-white/5'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            passportWarnings > 0 ? 'bg-red-500/20' : 'bg-stone-700'
          }`}>
            <AlertCircle className={`w-5 h-5 ${passportWarnings > 0 ? 'text-red-400' : 'text-stone-500'}`} />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Passport Expiry Alerts</p>
            <p className={`text-2xl font-bold ${passportWarnings > 0 ? 'text-red-400' : 'text-white'}`}>
              {passportWarnings}
            </p>
            {passportWarnings > 0 && <p className="text-[10px] text-red-400">Expiring within 6 months</p>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-white/10 rounded-xl bg-stone-900 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {['ALL', 'CLIENT', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors ${
                roleFilter === r
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 border border-white/10 text-stone-300 hover:border-amber-500/40 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-stone-800 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-900/50 border-b border-white/5">
                {[
                  { key: 'name',       label: 'Client' },
                  { key: 'role',       label: 'Role' },
                  { key: 'bookings',   label: 'Bookings' },
                  { key: null,         label: 'Passport Expiry' },
                  { key: 'created_at', label: 'Joined' },
                ].map(({ key, label }) => (
                  <th
                    key={label}
                    onClick={key ? () => toggleSort(key) : undefined}
                    className={`px-5 py-3.5 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider select-none ${key ? 'cursor-pointer hover:text-white' : ''}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {label}
                      {key && <SortIcon col={key} />}
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => {
                const count   = bookingCount(p.id, p.email)
                const pending = pendingCount(p.id, p.email)
                const expiry  = passportExpiry(p.id, p.email)
                const warn    = expiryWarning(expiry)

                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                          {p.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{p.name || '—'}</p>
                          <p className="text-xs text-stone-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                        p.role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-stone-700 text-stone-300'
                      }`}>
                        {p.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {p.role}
                      </span>
                    </td>
                    {/* Bookings */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{count}</span>
                        {pending > 0 && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-1.5 py-0.5 rounded-full">
                            {pending} pending
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Passport expiry */}
                    <td className="px-5 py-4">
                      {expiry ? (
                        <span className={`text-sm font-mono ${warn ? 'text-red-400 font-semibold' : 'text-stone-300'}`}>
                          {warn && <AlertCircle className="w-3.5 h-3.5 inline mr-1 mb-0.5" />}
                          {fmtDate(expiry)}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-600">No data</span>
                      )}
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-4 text-sm text-stone-500">{fmtDate(p.created_at)}</td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(p)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-stone-500 text-sm">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/5 bg-stone-900/30">
          <p className="text-xs text-stone-500">{filtered.length} of {profiles.length} users shown</p>
        </div>
      </div>

      {/* User drawer */}
      {selected && (
        <AdminUserDrawer
          profile={selected}
          bookings={bookingsFor(selected.id, selected.email)}
          onClose={() => setSelected(null)}
          onDelete={(deletedId) => {
            setProfiles((prev) => prev.filter((p) => p.id !== deletedId))
            setBookings((prev) => prev.filter((b) => b.user_id !== deletedId && b.client_info?.email !== selected?.email))
          }}
          onUpdate={(updated) => {
            setProfiles((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p))
            setSelected(updated)
          }}
        />
      )}
    </div>
  )
}
