'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { PlusCircle, FileText, Clock, CheckCircle2, XCircle, Download, Package } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import PackageBuilder from '@/components/PackageBuilder'
import BookingVoucher from '@/components/BookingVoucher'
import { buildVoucherData } from '@/utils/bookingTransformer'

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700',   icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-600',       icon: XCircle },
}

export default function ClientDashboard() {
  const [profile, setProfile]     = useState(null)
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showBuilder, setBuilder] = useState(false)
  const [viewBooking, setView]    = useState(null) // booking to show as voucher

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const [{ data: prof }, { data: bks }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('bookings').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
    ])

    setProfile(prof)
    setBookings(bks || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If viewing a booking as full voucher
  if (viewBooking) {
    return (
      <div>
        <button
          onClick={() => setView(null)}
          className="btn-outline mb-6 text-sm"
        >
          ← Back to Dashboard
        </button>
        <BookingVoucher booking={buildVoucherData(viewBooking, profile)} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Welcome back, {profile?.name?.split(' ')[0] || 'Traveller'} 👋
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage your Bhutan journey and build custom itinerary packages.
          </p>
        </div>
        <button onClick={() => setBuilder(true)} className="btn-primary">
          <PlusCircle className="w-4 h-4" /> Build New Package
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Packages',  value: stats.total,     color: 'text-stone-900',  bg: 'bg-white' },
          { label: 'Pending Review',  value: stats.pending,   color: 'text-amber-600',  bg: 'bg-amber-50' },
          { label: 'Confirmed',       value: stats.confirmed, color: 'text-green-600',  bg: 'bg-green-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-stone-100 p-5 shadow-sm`}>
            <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Bookings Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-stone-900">My Packages</h2>
          <span className="text-xs text-stone-400">{bookings.length} total</span>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 border-dashed p-16 text-center">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">No packages yet</p>
            <p className="text-stone-400 text-sm mt-1 mb-5">Build your first custom Bhutan itinerary to get started.</p>
            <button onClick={() => setBuilder(true)} className="btn-primary text-sm">
              <PlusCircle className="w-4 h-4" /> Build Your First Package
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {bookings.map((booking) => {
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING
              const Icon = cfg.icon
              const nights = booking.arrival_date && booking.return_date
                ? Math.floor((new Date(booking.return_date) - new Date(booking.arrival_date)) / 86400000)
                : null

              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Status bar */}
                  <div className={`h-1 ${booking.status === 'CONFIRMED' ? 'bg-green-500' : booking.status === 'CANCELLED' ? 'bg-red-400' : 'bg-amber-500'}`} />

                  <div className="p-5 space-y-4">
                    {/* Title + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">
                          {booking.tour_title || 'Custom Package'}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {booking.hotel_tier} · {booking.group_size || '1'} pax
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </div>

                    {/* Dates */}
                    {booking.arrival_date && (
                      <div className="text-xs text-stone-500 space-y-0.5">
                        <p>✈ {booking.flight_arrival || '—'}</p>
                        <p>📅 {new Date(booking.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {nights !== null && ` · ${nights}N`}</p>
                      </div>
                    )}

                    {/* Cost */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-50">
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">Total</p>
                        <p className="font-bold text-stone-900 text-base">
                          ${Number(booking.total_cost || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] text-stone-300 font-mono">
                          {booking.id?.slice(0, 8).toUpperCase()}
                        </p>
                        <button
                          onClick={() => setView(booking)}
                          title="View voucher"
                          className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Package Builder Slide-over ── */}
      {showBuilder && (
        <PackageBuilder
          profile={profile}
          onClose={() => setBuilder(false)}
          onSaved={() => { setBuilder(false); load() }}
        />
      )}
    </div>
  )
}
