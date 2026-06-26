'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

export default function AdminVoucherPreviewPage() {
  const { bookingId } = useParams()
  const router        = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    async function redirect() {
      const { data: booking, error: err } = await supabase
        .from('bookings')
        .select('id, created_at')
        .eq('id', bookingId)
        .single()

      if (err || !booking) {
        setError('Booking not found.')
        return
      }

      const year = new Date(booking.created_at).getFullYear()
      const ref  = `ARB-${year}-${booking.id.slice(0, 6).toUpperCase()}`
      router.replace(`/itinerary/${ref}?admin=1`)
    }
    redirect()
  }, [bookingId, router])

  if (error) {
    return (
      <div className="max-w-[920px] mx-auto pt-6 px-4">
        <Link href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-amber-700 border border-stone-200 hover:border-amber-300 bg-white rounded-xl px-4 py-2 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
    </div>
  )
}
