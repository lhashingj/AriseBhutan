'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import ItineraryCard from '@/components/ItineraryCard'

export default function ClientItinerariesPage() {
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
    <div className="space-y-7">

      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-white border border-amber-100 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest mb-1.5">Arise Bhutan · Client Portal</p>
          <h1 className="text-2xl font-serif font-bold text-stone-900">My Itineraries</h1>
          <p className="text-stone-500 text-sm mt-1">Personalised itineraries prepared by the Arise Bhutan team</p>
        </div>
        {itineraries.length > 0 && (
          <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
            {itineraries.length} itinerar{itineraries.length === 1 ? 'y' : 'ies'}
          </span>
        )}
      </div>

      {itineraries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-amber-400" />
          </div>
          <p className="text-stone-700 font-semibold">No itineraries yet</p>
          <p className="text-stone-400 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
            Our team will prepare your personalised Bhutan itinerary here once your package is confirmed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {itineraries.map(itin => (
            <ItineraryCard key={itin.id} itin={itin} />
          ))}
        </div>
      )}
    </div>
  )
}
