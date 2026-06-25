'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import PackageBuilder from '@/components/PackageBuilder'
import BookingVoucher from '@/components/BookingVoucher'
import { buildVoucherData } from '@/utils/bookingTransformer'

export default function BookTourButton({ tour, className, children }) {
  const router = useRouter()
  const [loading, setLoading]       = useState(false)
  const [showBuilder, setBuilder]   = useState(false)
  const [savedBooking, setSaved]    = useState(null)
  const [profile, setProfile]       = useState(null)

  async function handleClick() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Not logged in — send to register with ?next= so they come back here
      router.push(`/register?next=/tours/${tour.slug}`)
      return
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    setProfile(prof)
    setLoading(false)
    setBuilder(true)
  }

  // ── Full-screen voucher preview after booking ─────────────────────────────
  if (savedBooking) {
    return (
      <div className="fixed inset-0 z-[70] bg-stone-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => setSaved(null)}
            className="mb-6 inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm font-semibold transition-colors bg-white border border-stone-200 px-4 py-2 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tour
          </button>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
            <p className="font-semibold mb-1">🎉 Booking submitted successfully!</p>
            <p>Your package is under review. Download this voucher and contact us to arrange payment.</p>
            <p className="text-amber-600 mt-1">📞 +975 77 319 405 &nbsp;·&nbsp; ✉ arisebhutan@gmail.com</p>
          </div>

          <BookingVoucher booking={buildVoucherData(savedBooking, profile)} />
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className || 'btn-primary'}
      >
        {loading
          ? <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </span>
          : (children || 'Book This Tour')
        }
      </button>

      {showBuilder && (
        <PackageBuilder
          profile={profile}
          initialTourData={tour}
          onClose={() => setBuilder(false)}
          onSaved={(booking) => {
            setBuilder(false)
            setSaved(booking)
          }}
        />
      )}
    </>
  )
}
