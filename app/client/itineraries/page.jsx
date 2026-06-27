'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, ChevronRight, ExternalLink, CheckCircle2, Clock } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

const STATUS = {
  enquiry_pending: {
    label:  'Enquiry',
    bg:     'bg-rose-500/15',
    text:   'text-rose-400',
    border: 'border-rose-500/30',
    dot:    'bg-rose-400',
    card:   'border-rose-500/20',
  },
  pending_review: {
    label:  'In Review',
    bg:     'bg-amber-500/15',
    text:   'text-amber-400',
    border: 'border-amber-500/30',
    dot:    'bg-amber-400',
    card:   'border-amber-500/20',
  },
  quoted: {
    label:  'Quoted',
    bg:     'bg-blue-500/15',
    text:   'text-blue-400',
    border: 'border-blue-500/30',
    dot:    'bg-blue-400',
    card:   'border-blue-500/20',
  },
  confirmed: {
    label:  'Confirmed',
    bg:     'bg-emerald-500/15',
    text:   'text-emerald-400',
    border: 'border-emerald-500/30',
    dot:    'bg-emerald-400',
    card:   'border-emerald-500/20',
  },
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending_review
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${s.bg} ${s.text} border ${s.border} flex-shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
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
          {itineraries.map((it) => {
            const s        = STATUS[it.status] || STATUS.pending_review
            const hasPrice = it.pricing?.grand_total > 0
            const ref      = it.booking_reference

            return (
              <div
                key={it.id}
                className={`bg-stone-900 rounded-2xl border ${s.card} p-5 flex flex-col gap-4 hover:border-opacity-60 transition-all`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-stone-500 tracking-wider">
                      {ref || '—'}
                    </p>
                    <p className="text-white font-serif font-semibold text-base mt-0.5 line-clamp-1">
                      {it.tour_summary?.tour_package || 'Custom Itinerary'}
                    </p>
                  </div>
                  <StatusBadge status={it.status} />
                </div>

                {/* Tour meta */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-stone-800/60 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-stone-600 uppercase tracking-wider">Nights</p>
                    <p className="text-stone-200 font-bold text-sm mt-0.5">
                      {it.tour_summary?.duration_nights || '—'}
                    </p>
                  </div>
                  <div className="bg-stone-800/60 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-stone-600 uppercase tracking-wider">Guests</p>
                    <p className="text-stone-200 font-bold text-sm mt-0.5">
                      {it.tour_summary?.group_size || '—'}
                    </p>
                  </div>
                  <div className="bg-stone-800/60 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-stone-600 uppercase tracking-wider">Tier</p>
                    <p className="text-stone-200 font-bold text-[11px] mt-0.5 truncate">
                      {it.tour_summary?.hotel_tier || '—'}
                    </p>
                  </div>
                </div>

                {/* Departure */}
                {it.tour_summary?.departure_date && (
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {new Date(it.tour_summary.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {it.tour_summary?.return_date && (
                        <> → {new Date(it.tour_summary.return_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                      )}
                    </span>
                  </div>
                )}

                {/* Price */}
                {hasPrice && (
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-xs text-stone-500">Grand Total</span>
                    <span className="text-amber-400 font-bold font-mono text-sm">
                      ${Number(it.pricing.grand_total).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {ref ? (
                    <>
                      <button
                        onClick={() => router.push(`/itinerary/${ref}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-colors"
                      >
                        View Itinerary
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`/itinerary/${ref}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-white/5 text-stone-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-800/60 border border-white/5 text-stone-600 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Itinerary being prepared
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
