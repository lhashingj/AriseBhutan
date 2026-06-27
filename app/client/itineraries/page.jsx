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
    <div className="max-w-5xl mx-auto space-y-7">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">My Itineraries</h1>
          <p className="text-stone-500 text-sm mt-0.5">Prepared by the Arise Bhutan team</p>
        </div>
        {itineraries.length > 0 && (
          <span className="text-xs text-stone-400 pb-0.5">
            {itineraries.length} itinerar{itineraries.length === 1 ? 'y' : 'ies'}
          </span>
        )}
      </div>

      {itineraries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-16 text-center">
          <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">No itineraries yet</p>
          <p className="text-stone-400 text-sm mt-1">Our team will prepare your personalised Bhutan itinerary here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl">
          {itineraries.map(itin => (
            <ItineraryCard key={itin.id} itin={itin} />
          ))}
        </div>
      )}
    </div>
  )
}
