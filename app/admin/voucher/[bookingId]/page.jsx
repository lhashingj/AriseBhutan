'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import BookingVoucher from '@/components/BookingVoucher'

// ── Adapt voucherData (from itinerary_details JSONB) → BookingVoucher format ──
// Works even when itinerary_details is empty {} — falls back to booking row fields.
function adapt(v, booking) {
  const year    = new Date(booking.created_at).getFullYear()
  const refCode = `ARB-${year}-${booking.id.slice(0, 6).toUpperCase()}`

  const arrivalDate = booking.arrival_date
    ? new Date(booking.arrival_date).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : '—'
  const returnDate = booking.return_date
    ? new Date(booking.return_date).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : '—'
  const nights = booking.arrival_date && booking.return_date
    ? Math.max(1, Math.ceil((new Date(booking.return_date) - new Date(booking.arrival_date)) / 86_400_000))
    : 5
  const pax = Number(booking.group_size) || 2

  return {
    bookingRef: v.bookingRef || refCode,
    issueDate:  v.issueDate  || new Date(booking.created_at).toLocaleDateString('en-US', { dateStyle: 'long' }),
    status:     v.status     || booking.status || 'CONFIRMED',

    client: v.client || {
      name:             booking.client_name  || 'Valued Guest',
      email:            booking.client_email || '',
      phone:            booking.client_phone || '',
      nationality:      '',
      passportNo:       '',
      passportExpiry:   '',
      emergencyContact: '',
    },

    tour: v.tour || {
      title:     booking.tour_title || 'Custom Package',
      category:  booking.hotel_tier || '—',
      duration:  `${nights + 1} Days / ${nights} Nights`,
      pax,
      startDate: arrivalDate,
      endDate:   returnDate,
      guide:     'Licensed DOT Guide',
      vehicle:   'Private Vehicle & Driver',
    },

    // departs/arrives → depart/arrive
    flights: (v.flights || []).map(f => ({
      sector:   f.sector   || '',
      date:     f.date     || '',
      flightNo: f.flightNo || '',
      depart:   f.departs  ?? f.depart  ?? '',
      arrive:   f.arrives  ?? f.arrive  ?? '',
      airline:  f.airline  || '',
    })),

    // accommodation field → hotel; activitiesText → activities array
    itinerary: (v.itinerary || []).map(d => ({
      day:        d.day   || 0,
      date:       d.date  || '',
      title:      d.title || '',
      activities: Array.isArray(d.activities)
        ? d.activities
        : (d.activitiesText || '').split('\n').filter(Boolean),
      hotel: d.accommodation ?? d.hotel ?? '',
      meals: Array.isArray(d.meals)
        ? d.meals.join(' · ')
        : (d.meals || ''),
    })),

    // accommodation[] → hotels[] with parsed star rating
    hotels: (v.accommodation || []).map(h => ({
      name:     h.hotel    || h.name     || '',
      location: h.location || '',
      stars:    typeof h.stars === 'number'
        ? h.stars
        : parseInt(h.category) || 4,
      nights:   parseInt(h.nights) || 1,
      type:     h.type || '',
    })),

    pricing: v.pricing || {
      pricePerPerson:       Number(booking.final_calculated_price || booking.total_cost) / (pax || 1) / (nights || 1) || 0,
      pax,
      sdfPerPersonPerNight: 100,
      nights,
      serviceFeePerPax:     0,
      gstRate:              0,
      inrRate:              83.5,
    },

    inclusions: Array.isArray(v.inclusions) ? v.inclusions : [
      'Bhutan Sustainable Development Fee (SDF)',
      'Bhutan visa & permit processing',
      'All accommodation per itinerary',
      'All meals as specified',
      'Licensed English-speaking DOT-certified guide',
      'Private vehicle & dedicated driver',
      'All monument & dzong entry fees',
      'Arise Bhutan 24/7 in-country support',
    ],

    exclusions: Array.isArray(v.exclusions) ? v.exclusions : [
      'International airfare to/from Paro',
      'Travel & medical insurance',
      'Personal expenses & gratuities',
      'Alcoholic & premium beverages',
      'Optional adventure activities',
    ],

    cancellation: (v.cancellationPolicy || v.cancellation || []).length > 0
      ? (v.cancellationPolicy || v.cancellation).map(c => ({ period: c.period || '', refund: c.refund || '' }))
      : [
          { period: '60+ days before departure',   refund: 'Full refund less $150 processing fee' },
          { period: '30–59 days before departure', refund: '50% refund' },
          { period: 'Under 30 days / No-show',     refund: 'Non-refundable' },
        ],

    payment: v.payment || [
      '30% deposit required to confirm & hold reservation',
      'Full balance due 30 days prior to departure',
      'Bank transfer (SWIFT) or major credit card accepted',
      'All payments in USD; INR transfers by prior arrangement',
    ],
  }
}

export default function AdminVoucherPreviewPage() {
  const { bookingId } = useParams()
  const [voucherData, setVoucherData] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    async function fetchBooking() {
      const { data: booking, error: err } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (err || !booking) {
        setError('Booking not found.')
        setLoading(false)
        return
      }

        // Build from itinerary_details if available, otherwise use booking fields directly
      setVoucherData(adapt(booking.itinerary_details || {}, booking))
      setLoading(false)
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[920px] mx-auto pt-6">
        <Link href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-amber-700 border border-stone-200 hover:border-amber-300 bg-white rounded-xl px-4 py-2 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-sm mt-0.5 text-red-600">Go back to admin and create a voucher for this booking first.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Admin back button injected above the voucher */}
      <div className="max-w-[920px] mx-auto px-4 pt-4 pb-1">
        <Link href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-amber-700 border border-stone-200 hover:border-amber-300 bg-white rounded-xl px-4 py-2 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>
      </div>
      <BookingVoucher booking={voucherData} />
    </div>
  )
}
