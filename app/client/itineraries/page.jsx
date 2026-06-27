'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, FileText, Clock, CheckCircle2, Package } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

function StatusBadge({ status }) {
  const cfg = {
    enquiry_pending: { label: 'Enquiry',    color: 'bg-rose-100 text-rose-700',   bar: 'bg-rose-400' },
    pending_review:  { label: 'In Review',  color: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
    quoted:          { label: 'Quoted',     color: 'bg-blue-100 text-blue-700',   bar: 'bg-blue-400' },
    confirmed:       { label: 'Confirmed',  color: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
  }[status] || { label: 'In Review', color: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${cfg.color}`}>
      {status === 'confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {cfg.label}
    </span>
  )
}

export default function ClientItinerariesPage() {
  const router = useRouter()
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const [{ data: byUserId }, { data: byEmail }] = await Promise.all([
        supabase.from('itineraries').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('itineraries').select('*').filter('client_info->>email', 'eq', session.user.email).order('created_at', { ascending: false }),
      ])

      const seen = new Set()
      const merged = [...(byUserId || []), ...(byEmail || [])].filter(i => {
        if (seen.has(i.id)) return false
        seen.add(i.id)
        return true
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setItineraries(merged)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">My Itineraries</h1>
        <p className="text-stone-500 text-sm mt-0.5">Itineraries prepared for you by the Arise Bhutan team</p>
      </div>

      {itineraries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 border-dashed p-16 text-center">
          <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">No itineraries yet</p>
          <p className="text-stone-400 text-sm mt-1">Our team will prepare your personalised Bhutan itinerary here.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {itineraries.map((itin) => {
            const barColor = {
              enquiry_pending: 'bg-rose-400',
              pending_review:  'bg-amber-500',
              quoted:          'bg-blue-400',
              confirmed:       'bg-green-500',
            }[itin.status] || 'bg-amber-500'

            const name   = itin.tour_summary?.tour_package || 'Custom Itinerary'
            const tier   = itin.tour_summary?.hotel_tier
            const nights = itin.tour_summary?.duration_nights
            const guests = itin.tour_summary?.group_size
            const total  = Number(itin.pricing?.grand_total || 0)
            const ref    = itin.booking_reference
            const isConfirmed = itin.status === 'confirmed'
            const isQuoted    = itin.status === 'quoted'

            return (
              <div key={itin.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className={`h-1 ${barColor}`} />

                <div className="p-5 space-y-4 flex-1 flex flex-col">
                  {/* Title + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">{name}</p>
                      {tier && (
                        <p className="text-xs text-stone-400 mt-0.5">
                          {tier}{guests ? ` · ${guests} pax` : ''}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={itin.status} />
                  </div>

                  {/* Trip details */}
                  {(nights || guests) && (
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      {nights != null && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {nights} night{nights !== 1 ? 's' : ''}
                        </span>
                      )}
                      {guests && (
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" /> {guests} pax
                        </span>
                      )}
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Cost + voucher */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider">Total</p>
                      {total > 0
                        ? <p className="font-bold text-stone-900 text-base">${total.toLocaleString()}</p>
                        : <p className="text-xs text-stone-400 italic">Pricing pending</p>
                      }
                    </div>
                    {ref && (
                      <button
                        onClick={() => router.push(`/itinerary/${ref}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Voucher
                      </button>
                    )}
                  </div>

                  {ref && (
                    <p className="text-[9px] text-stone-300 font-mono">{ref}</p>
                  )}

                  {/* Status message */}
                  {isConfirmed && ref ? (
                    <div className="rounded-xl p-3 text-xs bg-green-50 border border-green-200">
                      <p className="font-semibold text-green-700">✅ Your trip is confirmed! Open your voucher above.</p>
                    </div>
                  ) : isQuoted ? (
                    <div className="rounded-xl p-3 text-xs bg-blue-50 border border-blue-200">
                      <p className="font-semibold text-blue-700 mb-1">💰 Your quote is ready</p>
                      <p className="text-stone-600">Contact us to confirm your booking.</p>
                      <p className="text-stone-500 mt-1">📞 +975 77 319 405 · ✉ arisebhutan@gmail.com</p>
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
      )}
    </div>
  )
}
