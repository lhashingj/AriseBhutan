'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search, AlertTriangle } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { claimGuestInvitations, fetchGuestItineraries } from '@/utils/bookingGuests'
import ItineraryCard from '@/components/ItineraryCard'
import { collectPassportWarnings } from '@/utils/passportExpiry'

const STATUS_OPTIONS = [
  { value: 'all',             label: 'All Statuses' },
  { value: 'enquiry_pending', label: 'Enquiry' },
  { value: 'pending_review',  label: 'In Review' },
  { value: 'quoted',          label: 'Quoted' },
  { value: 'confirmed',       label: 'Confirmed' },
]

export default function ClientItinerariesPage() {
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Redeem any pending group-booking invitations (idempotent)
      await claimGuestInvitations()

      const [{ data: byUserId }, { data: byEmail }, byMembership] = await Promise.all([
        supabase.from('itineraries').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('itineraries').select('*').filter('client_info->>email', 'eq', session.user.email).order('created_at', { ascending: false }),
        fetchGuestItineraries(),
      ])

      const seen = new Set()
      const merged = [...(byUserId || []), ...(byEmail || []), ...(byMembership || [])].filter(i => {
        if (seen.has(i.id)) return false
        seen.add(i.id)
        return true
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setItineraries(merged)
      setLoading(false)
    }
    load()
  }, [])

  const passportWarnings = useMemo(() => collectPassportWarnings(itineraries), [itineraries])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return itineraries.filter(itin => {
      if (statusFilter !== 'all' && itin.status !== statusFilter) return false
      if (!q) return true
      const haystack = [itin.tour_summary?.tour_package, itin.booking_reference].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [itineraries, search, statusFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-white dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border border-amber-100 dark:border-stone-800 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4 transition-colors duration-300">
        <div>
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">Arise Bhutan · Client Portal</p>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">My Itineraries</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Personalised itineraries prepared by the Arise Bhutan team</p>
        </div>
        {itineraries.length > 0 && (
          <span className="text-xs font-semibold text-stone-400 bg-stone-100 dark:bg-stone-800 dark:text-stone-400 px-3 py-1 rounded-full">
            {itineraries.length} itinerar{itineraries.length === 1 ? 'y' : 'ies'}
          </span>
        )}
      </div>

      {/* Passport expiry warnings */}
      {passportWarnings.length > 0 && (
        <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-5 py-4 flex items-start gap-3 transition-colors duration-300">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Passport renewal needed soon</p>
            <ul className="mt-1.5 space-y-1">
              {passportWarnings.map((w, i) => (
                <li key={i} className="text-xs text-red-700 dark:text-red-400">
                  <span className="font-semibold">{w.name}</span> — passport expires {new Date(w.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' '}(booking {w.ref}). Bhutan requires 6+ months validity beyond travel dates.
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {itineraries.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700 p-16 text-center transition-colors duration-300">
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-amber-400" />
          </div>
          <p className="text-stone-700 dark:text-stone-200 font-semibold">No itineraries yet</p>
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
            Our team will prepare your personalised Bhutan itinerary here once your package is confirmed.
          </p>
        </div>
      ) : (
        <>
          {/* Search + status filter */}
          {itineraries.length > 1 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by tour name or booking reference…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-amber-500 dark:focus:border-amber-500/60 transition-colors"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-amber-500 dark:focus:border-amber-500/60 transition-colors sm:w-56"
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700 p-12 text-center transition-colors duration-300">
              <p className="text-stone-500 dark:text-stone-400 text-sm">No itineraries match your search.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {filtered.map(itin => (
                <ItineraryCard key={itin.id} itin={itin} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
