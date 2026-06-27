'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, FileText, Clock, CheckCircle2, XCircle, Package, Pencil, MapPin } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import PackageBuilder from '@/components/PackageBuilder'

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

    const [{ data: prof }, { data: bks }, { data: allItins }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('bookings').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      // Fetch all itineraries linked to this user — by user_id OR by email in client_info
      supabase.from('itineraries').select('*').or(
        `user_id.eq.${session.user.id},client_info->>email.eq.${session.user.email}`
      ).order('created_at', { ascending: false }),
    ])

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

      {/* Stats */}
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

      {/* Bookings Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-stone-900">My Packages</h2>
          <span className="text-xs text-stone-400">{bookings.length} total</span>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 border-dashed p-12 text-center">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">No packages submitted yet</p>
            <p className="text-stone-400 text-sm mt-1 mb-5">
              {adminItins.length > 0
                ? 'Your itineraries prepared by our team are shown below.'
                : 'Build your first custom Bhutan itinerary to get started.'}
            </p>
            <button onClick={() => setBuilder(true)} className="btn-primary text-sm">
              <PlusCircle className="w-4 h-4" /> Build Your First Package
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {bookings.map((booking) => {
              const cfg   = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING
              const Icon  = cfg.icon
              const ref   = getRef(booking)
              const itin  = itinMap[ref]
              const total = itin?.pricing?.grand_total || booking.total_cost || 0
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

                    {/* Cost + actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-50">
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">Total</p>
                        <p className="font-bold text-stone-900 text-base">
                          ${Number(total).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] text-stone-300 font-mono">{ref}</p>
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => setEditing(booking)}
                            title="Edit itinerary"
                            className="p-2 rounded-xl bg-stone-50 text-stone-500 hover:bg-stone-100 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/itinerary/${ref}`)}
                          title="View itinerary"
                          className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Payment instructions for pending bookings */}
                    {booking.status === 'PENDING' && (
                      <div className={`rounded-xl p-3 text-xs border ${
                        booking.payment_status === 'PAID'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-amber-50 border-amber-200'
                      }`}>
                        {booking.payment_status === 'PAID' ? (
                          <p className="font-semibold text-blue-700">✅ Payment received — awaiting confirmation from our team.</p>
                        ) : (
                          <>
                            <p className="font-semibold text-amber-800 mb-1">💳 Payment Required to Confirm Your Trip</p>
                            <p className="text-amber-700">Amount: <strong>${Number(total).toLocaleString()} USD</strong></p>
                            <p className="text-stone-600 mt-1.5">Transfer to our account and contact us with your booking reference: <span className="font-mono font-bold">{ref}</span></p>
                            <p className="text-stone-500 mt-1">📞 +975 77 319 405 &nbsp;·&nbsp; ✉ arisebhutan@gmail.com</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Admin-Created Itineraries */}
      {adminItins.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">My Itineraries</h2>
              <p className="text-xs text-stone-400 mt-0.5">Prepared by the Arise Bhutan team</p>
            </div>
            <span className="text-xs text-stone-400">{adminItins.length} itinerar{adminItins.length === 1 ? 'y' : 'ies'}</span>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {adminItins.map((itin) => {
              const status  = itin.status || 'pending_review'
              const isConfirmed = status === 'confirmed'
              const isQuoted    = status === 'quoted'

              const statusCfg = {
                enquiry_pending: { label: 'Enquiry',  color: 'bg-rose-100 text-rose-700',   barColor: 'bg-rose-400' },
                pending_review:  { label: 'In Review', color: 'bg-amber-100 text-amber-700', barColor: 'bg-amber-500' },
                quoted:          { label: 'Quoted',   color: 'bg-blue-100 text-blue-700',    barColor: 'bg-blue-400' },
                confirmed:       { label: 'Confirmed', color: 'bg-green-100 text-green-700', barColor: 'bg-green-500' },
              }[status] || { label: 'Review', color: 'bg-amber-100 text-amber-700', barColor: 'bg-amber-500' }

              const name    = itin.tour_summary?.tour_package || 'Custom Itinerary'
              const tier    = itin.tour_summary?.hotel_tier
              const nights  = itin.tour_summary?.duration_nights
              const guests  = itin.tour_summary?.group_size
              const total   = Number(itin.pricing?.grand_total || 0)
              const ref     = itin.booking_reference

              return (
                <div key={itin.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Status bar */}
                  <div className={`h-1 ${statusCfg.barColor}`} />

                  <div className="p-5 space-y-4">
                    {/* Title + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Admin Itinerary</p>
                        </div>
                        <p className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">{name}</p>
                        {tier && <p className="text-xs text-stone-400 mt-0.5">{tier}{guests ? ` · ${guests} pax` : ''}</p>}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${statusCfg.color}`}>
                        {isConfirmed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Trip summary */}
                    {(nights || guests) && (
                      <p className="text-xs text-stone-500">
                        {nights != null ? `${nights} night${nights !== 1 ? 's' : ''}` : ''}
                        {nights && guests ? ' · ' : ''}
                        {guests ? `${guests} pax` : ''}
                      </p>
                    )}

                    {/* Cost + actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-50">
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">Total</p>
                        {total > 0
                          ? <p className="font-bold text-stone-900 text-base">${total.toLocaleString()}</p>
                          : <p className="text-xs text-stone-400 italic">Pricing pending</p>
                        }
                      </div>
                      <div className="flex items-center gap-2">
                        {ref && <p className="text-[9px] text-stone-300 font-mono">{ref}</p>}
                        {ref && (
                          <button
                            onClick={() => router.push(`/itinerary/${ref}`)}
                            title="View voucher"
                            className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status message */}
                    {(isConfirmed && ref) ? (
                      <div className="rounded-xl p-3 text-xs bg-green-50 border border-green-200">
                        <p className="font-semibold text-green-700">✅ Your trip is confirmed! View your full voucher below.</p>
                      </div>
                    ) : isQuoted ? (
                      <div className="rounded-xl p-3 text-xs bg-blue-50 border border-blue-200">
                        <p className="font-semibold text-blue-700 mb-1">💰 Your quote is ready</p>
                        <p className="text-stone-600">Contact us to confirm your booking.</p>
                        <p className="text-stone-500 mt-1">📞 +975 77 319 405 &nbsp;·&nbsp; ✉ arisebhutan@gmail.com</p>
                      </div>
                    ) : (
                      <div className="rounded-xl p-3 text-xs bg-amber-50 border border-amber-200">
                        <p className="font-semibold text-amber-800">⏳ Our team is preparing your itinerary</p>
                        <p className="text-stone-600 mt-1">We'll be in touch shortly with your personalised quote.</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
