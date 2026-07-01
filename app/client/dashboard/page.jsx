'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, FileText, Clock, CheckCircle2, XCircle, Package, Pencil, Calendar, ChevronRight, ExternalLink } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import PackageBuilder from '@/components/PackageBuilder'
import ItineraryCard from '@/components/ItineraryCard'

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700',  icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-600',      icon: XCircle },
}

function getRef(booking) {
  const year = new Date(booking.created_at).getFullYear()
  return `ARB-${year}-${booking.id.slice(0, 6).toUpperCase()}`
}

export default function ClientDashboard() {
  const router = useRouter()
  const [profile, setProfile]         = useState(null)
  const [bookings, setBookings]       = useState([])
  const [itinMap, setItinMap]         = useState({})
  const [adminItins, setAdminItins]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [showBuilder, setBuilder]     = useState(false)
  const [editingBooking, setEditing]  = useState(null)

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const [{ data: prof }, { data: bks }, { data: itinsByUserId }, { data: itinsByEmail }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('bookings').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      supabase.from('itineraries').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      supabase.from('itineraries').select('*').filter('client_info->>email', 'eq', session.user.email).order('created_at', { ascending: false }),
    ])

    // Merge and deduplicate itineraries from both queries
    const seen = new Set()
    const allItins = [...(itinsByUserId || []), ...(itinsByEmail || [])].filter(i => {
      if (seen.has(i.id)) return false
      seen.add(i.id)
      return true
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    setProfile(prof)
    const bookingList = bks || []
    setBookings(bookingList)

    const itineraryList = allItins || []

    // Build ref map for bookings that have a matching admin itinerary
    const selfRefs = new Set(bookingList.map(b => getRef(b)))
    const map = Object.fromEntries(
      itineraryList
        .filter(i => i.booking_reference && selfRefs.has(i.booking_reference))
        .map(i => [i.booking_reference, i])
    )
    setItinMap(map)

    // Admin-created itineraries: those NOT already represented by a self-submitted booking
    const adminCreated = itineraryList.filter(
      i => !i.booking_reference || !selfRefs.has(i.booking_reference)
    )
    setAdminItins(adminCreated)

    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const adminConfirmed = adminItins.filter(i => i.status === 'confirmed').length
  const stats = {
    total:     bookings.length + adminItins.length,
    pending:   bookings.filter((b) => b.status === 'PENDING').length +
               adminItins.filter(i => ['enquiry_pending','pending_review','quoted'].includes(i.status)).length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length + adminConfirmed,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-white border border-amber-100 rounded-2xl px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest mb-1.5">Arise Bhutan · Client Portal</p>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Welcome back, {profile?.name?.split(' ')[0] || 'Traveller'} 👋
            </h1>
            <p className="text-stone-500 text-sm mt-1 hidden sm:block">
              Manage your Bhutan journey and build custom itinerary packages.
            </p>
          </div>
        </div>
        <button onClick={() => setBuilder(true)} className="btn-primary w-full sm:w-auto mt-4">
          <PlusCircle className="w-4 h-4" /> Build New Package
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Packages',  value: stats.total,     color: 'text-stone-900',  bg: 'bg-white',     Icon: Package,      iconBg: 'bg-stone-100',  iconColor: 'text-stone-500' },
          { label: 'Pending',   value: stats.pending,   color: 'text-amber-600',  bg: 'bg-amber-50',  Icon: Clock,        iconBg: 'bg-amber-100',  iconColor: 'text-amber-500' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-green-600',  bg: 'bg-green-50',  Icon: CheckCircle2, iconBg: 'bg-green-100',  iconColor: 'text-green-600' },
        ].map(({ label, value, color, bg, Icon, iconBg, iconColor }) => (
          <div key={label} className={`${bg} rounded-2xl border border-stone-100 p-3 sm:p-5 shadow-sm`}>
            <div className="flex items-start justify-between gap-1">
              <p className="text-[10px] sm:text-xs text-stone-500 font-semibold uppercase tracking-wider leading-tight">{label}</p>
              <div className={`${iconBg} rounded-lg p-1.5 flex-shrink-0 hidden sm:flex`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            </div>
            <p className={`text-2xl sm:text-3xl font-bold mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* My Packages / Itineraries — unified section */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-7 rounded-full bg-amber-500 flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-tight">My Packages / Itineraries</h2>
          </div>
          <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-3 py-1 rounded-full flex-shrink-0">{bookings.length + adminItins.length} total</span>
        </div>
        <p className="text-xs text-stone-400 mb-5 pl-4">Your bookings and itineraries prepared by the Arise Bhutan team</p>

        {bookings.length === 0 && adminItins.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-12 text-center">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">No packages or itineraries yet</p>
            <p className="text-stone-400 text-sm mt-1 mb-5">Build your first custom Bhutan itinerary to get started.</p>
            <button onClick={() => setBuilder(true)} className="btn-primary text-sm">
              <PlusCircle className="w-4 h-4" /> Build Your First Package
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">

            {/* Self-submitted booking cards — styled to match ItineraryCard */}
            {bookings.map((booking) => {
              const ref    = getRef(booking)
              const itin   = itinMap[ref]
              const total    = itin?.pricing?.grand_total || booking.total_cost || 0
              const hasPrice = Number(total) > 0
              const isSaarc  = itin?.pricing?.is_saarc ?? false
              const currSym  = isSaarc ? '₹' : '$'
              const currLabel = isSaarc ? 'INR / Nu.' : 'USD'
              const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

              // Prefer admin itinerary data (tour_summary) over raw booking fields
              const nights  = itin?.tour_summary?.duration_nights
                ?? (booking.arrival_date && booking.return_date
                  ? Math.floor((new Date(booking.return_date) - new Date(booking.arrival_date)) / 86400000)
                  : null)
              const guests  = itin?.tour_summary?.group_size  || booking.group_size
              const tier    = itin?.tour_summary?.hotel_tier  || booking.hotel_tier
              const depDate = itin?.tour_summary?.departure_date || booking.arrival_date
              const retDate = itin?.tour_summary?.return_date    || booking.return_date

              const borderL    = booking.status === 'CONFIRMED' ? 'border-l-green-500' : booking.status === 'CANCELLED' ? 'border-l-red-400' : 'border-l-amber-400'
              const badge      = booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200' : booking.status === 'CANCELLED' ? 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200' : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
              const dot        = booking.status === 'CONFIRMED' ? 'bg-green-500' : booking.status === 'CANCELLED' ? 'bg-red-400' : 'bg-amber-400'
              const statusLabel = booking.status === 'CONFIRMED' ? 'Confirmed' : booking.status === 'CANCELLED' ? 'Cancelled' : 'Pending'

              return (
                <div key={booking.id} className={`bg-white rounded-2xl shadow-sm border border-stone-100 border-l-4 ${borderL} overflow-hidden`}>
                  <div className="p-5 sm:p-6">

                    {/* Header: ref + title + badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono text-stone-400 tracking-widest mb-1">{ref}</p>
                        <h3 className="font-serif font-bold text-stone-900 text-base sm:text-xl leading-snug line-clamp-2 sm:truncate sm:line-clamp-none">
                          {booking.tour_title || 'Custom Package'}
                        </h3>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0 ${badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {statusLabel}
                      </span>
                    </div>

                    {/* Stats + date */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { label: 'Nights', value: nights ?? '—' },
                          { label: 'Guests', value: guests  ?? '—' },
                          { label: 'Tier',   value: tier    || '—' },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5 text-center min-w-[64px]">
                            <p className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">{label}</p>
                            <p className="text-stone-800 font-bold text-sm sm:text-base mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                      {depDate && (
                        <div className="flex items-center gap-1 text-xs text-stone-500">
                          <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                          <span>
                            {fmtDate(depDate)}
                            {retDate && <> → {fmtDate(retDate)}</>}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price + actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100">
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-0.5">Grand Total</p>
                        {hasPrice
                          ? <p className="font-bold text-stone-900 text-xl sm:text-2xl leading-tight">{currSym}{Number(total).toLocaleString()}</p>
                          : <p className="text-sm text-stone-400 italic">Pricing pending</p>
                        }
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.status === 'PENDING' && (
                          <button onClick={() => setEditing(booking)} title="Edit booking"
                            className="p-2 rounded-xl bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => router.push(`/itinerary/${ref}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors whitespace-nowrap shadow-sm">
                          View Itinerary <ChevronRight className="w-4 h-4" />
                        </button>
                        <a href={`/itinerary/${ref}`} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-400 hover:text-stone-600 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Payment notice for pending bookings */}
                  {booking.status === 'PENDING' && (
                    <div className={`mx-5 sm:mx-6 mb-5 rounded-xl p-3 text-xs border ${
                      booking.payment_status === 'PAID' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      {booking.payment_status === 'PAID' ? (
                        <p className="font-semibold text-blue-700">✅ Payment received — awaiting confirmation from our team.</p>
                      ) : (
                        <>
                          <p className="font-semibold text-amber-800 mb-1">💳 Payment Required to Confirm Your Trip</p>
                          <p className="text-amber-700">Amount: <strong>{currSym}{Number(total).toLocaleString()} {currLabel}</strong></p>
                          <p className="text-stone-600 mt-1.5">Transfer to our account with reference: <span className="font-mono font-bold">{ref}</span></p>
                          <p className="text-stone-500 mt-1">📞 +975 77 319 405 &nbsp;·&nbsp; 💬 +61 435 341 033 &nbsp;·&nbsp; ✉ arisebhutan@gmail.com</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Admin-created itinerary cards */}
            {adminItins.map(itin => (
              <ItineraryCard key={itin.id} itin={itin} showDayPlan={false} />
            ))}

          </div>
        )}
      </div>

      {/* New Package Builder */}
      {showBuilder && (
        <PackageBuilder
          profile={profile}
          onClose={() => setBuilder(false)}
          onSaved={() => { setBuilder(false); load() }}
        />
      )}

      {/* Edit Existing Booking */}
      {editingBooking && (
        <PackageBuilder
          profile={profile}
          editBooking={editingBooking}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}
