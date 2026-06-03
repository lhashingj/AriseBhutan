/**
 * Transforms a raw Supabase booking row into the data shape
 * that BookingVoucher.jsx expects.
 */
export function buildVoucherData(booking, profile) {
  const refSuffix = booking.id?.slice(0, 6).toUpperCase() ?? 'XXXXXX'
  const year      = booking.created_at ? new Date(booking.created_at).getFullYear() : new Date().getFullYear()
  const pax       = parseInt(booking.group_size, 10) || 1
  const nights    = booking.arrival_date && booking.return_date
    ? Math.max(0, Math.floor((new Date(booking.return_date) - new Date(booking.arrival_date)) / 86400000))
    : (booking.itinerary_days?.length ?? 1)
  const issueDate = booking.created_at
    ? new Date(booking.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

  // Rebuild pricing from stored totals so the voucher shows exact figures
  const subtotal = Number(booking.subtotal ?? 0)
  const gst      = Number(booking.gst ?? 0)
  const total    = Number(booking.total_cost ?? 0)

  // Derive cost items from stored jsonb or build a minimal fallback
  const costItems = Array.isArray(booking.cost_items) && booking.cost_items.length > 0
    ? booking.cost_items
    : [{ label: 'Package Total', calculation: `${pax} pax`, amount: subtotal }]

  return {
    bookingRef: `ARB-${year}-${refSuffix}`,
    issueDate,
    status: booking.status || 'PENDING',

    client: {
      name:             booking.client_name || profile?.name || '—',
      email:            profile?.email || '—',
      phone:            '—',
      nationality:      '—',
      passportNo:       'On file',
      passportExpiry:   'On file',
      emergencyContact: '—',
    },

    tour: {
      title:    booking.tour_title || 'Custom Package',
      category: 'Custom Package',
      duration: `${nights + 1} Days / ${nights} Nights`,
      pax,
      startDate: fmtDate(booking.arrival_date),
      endDate:   fmtDate(booking.return_date),
      guide:     'Assigned on confirmation',
      vehicle:   'Private vehicle + driver',
    },

    flights: [
      {
        sector:   booking.flight_arrival || '—',
        date:     fmtDate(booking.arrival_date),
        flightNo: '—',
        depart:   '—',
        arrive:   '—',
        airline:  'Druk Air / Bhutan Airlines',
      },
      {
        sector:   booking.flight_return || '—',
        date:     fmtDate(booking.return_date),
        flightNo: '—',
        depart:   '—',
        arrive:   '—',
        airline:  'Druk Air / Bhutan Airlines',
      },
    ],

    itinerary: (booking.itinerary_days || []).map((d, i) => ({
      day:         i + 1,
      date:        d.date || `Day ${i + 1}`,
      title:       d.title || `Day ${i + 1}`,
      activities:  Array.isArray(d.activities)
        ? d.activities
        : (d.activities ? [d.activities] : ['As per itinerary']),
      hotel:       d.hotel || booking.hotel_tier || '—',
      meals:       [d.breakfast && 'B', d.lunch && 'L', d.dinner && 'D'].filter(Boolean).join(' · ') || '—',
    })),

    hotels: [],

    // Pass pre-calculated totals through a synthetic pricing object
    pricing: {
      pricePerPerson:       subtotal / pax,
      pax,
      sdfPerPersonPerNight: 100,
      nights,
      serviceFeePerPax:     0,
      gstRate:              nights > 0 && subtotal > 0 ? gst / subtotal : 0.05,
      inrRate:              83.5,
      // Override computed values with stored actuals
      _override: { subtotal, gst, totalUSD: total, totalINR: Math.round(total * 83.5) },
    },

    costItems,

    inclusions: [
      `Accommodation (${booking.hotel_tier || '3-Star'}) — ${nights} nights`,
      'Licensed English-speaking ATCB guide',
      'Private vehicle & dedicated driver',
      `Sustainable Development Fee (SDF) — $100/person/night`,
      'All monument & dzong entry fees',
      'Meals as per itinerary',
    ],
    exclusions: [
      'International flights (DEL ↔ PBH)',
      'Travel & medical insurance',
      'Personal expenses',
      'Gratuities for guide & driver',
    ],
    cancellation: [
      { period: '60+ days before departure',   refund: 'Full refund less $150 processing fee' },
      { period: '30–59 days before departure',  refund: '50% refund' },
      { period: 'Under 30 days / No-show',      refund: 'Non-refundable' },
    ],
    payment: [
      '30% deposit to confirm reservation',
      'Balance due 30 days before departure',
      'USD bank transfer or credit card',
    ],
  }
}
