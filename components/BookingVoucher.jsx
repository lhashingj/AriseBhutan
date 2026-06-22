'use client'

import { useRef, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { generateVoucherPDF, computePricing } from '@/utils/pdfGenerator'

// ─── Sample / demo booking ────────────────────────────────────────────────────
export const SAMPLE_BOOKING = {
  bookingRef:  'ARB-2025-001247',
  issueDate:   'June 3, 2025',
  status:      'CONFIRMED',

  client: {
    name:             'Jonathan & Sarah Mitchell',
    email:            'j.mitchell@email.com',
    phone:            '+1 650 555 0199',
    nationality:      'American',
    passportNo:       'US4892017X',
    passportExpiry:   'March 14, 2029',
    emergencyContact: 'Robert Mitchell — +1 650 555 0188',
  },

  tour: {
    title:    'Classic Bhutan Cultural Tour',
    category: 'Cultural Tour',
    duration: '5 Days / 4 Nights',
    pax:       2,
    startDate: 'November 15, 2025',
    endDate:   'November 19, 2025',
    guide:     'Karma Wangchuk (Licensed ATCB Guide)',
    vehicle:   'Private Toyota Fortuner + Driver',
  },

  flights: [
    { sector: 'New Delhi (DEL) → Paro (PBH)', date: 'Nov 15, 2025', flightNo: 'KB-211', depart: '08:30', arrive: '10:45', airline: 'Druk Air' },
    { sector: 'Paro (PBH) → New Delhi (DEL)', date: 'Nov 19, 2025', flightNo: 'KB-212', depart: '11:30', arrive: '13:45', airline: 'Druk Air' },
  ],

  itinerary: [
    {
      day: 1, date: 'Nov 15', title: 'Arrival Paro → Thimphu',
      activities: ['Airport pick-up & kata welcome scarf', 'Motithang Takin Preserve (national animal)', 'Buddha Dordenma — 169-ft gilded bronze statue', 'Thimphu orientation walk', 'Welcome dinner at local restaurant'],
      hotel: 'Hotel Zhingkham, Thimphu ★★★', meals: 'L · D',
    },
    {
      day: 2, date: 'Nov 16', title: 'Thimphu Culture & Crafts Day',
      activities: ['National Textile Museum', 'Jungshi Handmade Paper Factory', 'Folk Heritage Museum', 'Tashichho Dzong (seat of the King)', 'National Memorial Chorten'],
      hotel: 'Hotel Zhingkham, Thimphu ★★★', meals: 'B · L · D',
    },
    {
      day: 3, date: 'Nov 17', title: 'Thimphu → Punakha via Dochu La',
      activities: ['Dochu La pass (3,150 m) — 108 memorial chortens', 'Punakha Dzong (1637) — Royal Wedding site', 'Chimi Lhakhang — Temple of the Divine Madman', 'Hanging bridge over Mo Chhu river', 'Traditional farmhouse lunch with local family'],
      hotel: 'Damchen Resort, Punakha ★★★', meals: 'B · L · D',
    },
    {
      day: 4, date: 'Nov 18', title: "Punakha → Paro · Tiger's Nest Hike",
      activities: ["Tiger's Nest Monastery hike (4 hrs, 900 m ascent)", 'Viewpoint café — authentic butter tea', 'Sacred inner shrines & meditation cave tour', 'Drukgyal Dzong ruins (repelled Tibetan invasions, 1647)', 'Traditional hot stone bath (dotsho) — herbal soak'],
      hotel: 'Tenzinling Resort, Paro ★★★', meals: 'B · L · D',
    },
    {
      day: 5, date: 'Nov 19', title: 'Departure Day',
      activities: ['Kichu Lhakhang Temple (founded 7th century)', 'Paro Bazaar — souvenir & handicraft shopping', 'Airport drop-off for flight KB-212'],
      hotel: '—', meals: 'B',
    },
  ],

  hotels: [
    { name: 'Hotel Zhingkham',  location: 'Thimphu', stars: 3, nights: 2, type: 'Heritage Boutique' },
    { name: 'Damchen Resort',   location: 'Punakha', stars: 3, nights: 1, type: 'River-view Resort' },
    { name: 'Tenzinling Resort',location: 'Paro',    stars: 3, nights: 1, type: 'Valley-view Hotel' },
  ],

  pricing: {
    pricePerPerson:       1850,
    pax:                  2,
    sdfPerPersonPerNight: 200,
    nights:               4,
    serviceFeePerPax:     150,
    gstRate:              0.05,
    inrRate:              83.5,
  },

  inclusions: [
    'Bhutan Sustainable Development Fee (SDF) — $200/person/night',
    'Bhutan visa & permit processing',
    'All accommodation per itinerary (3-star heritage hotels)',
    'All meals as specified (B = Breakfast, L = Lunch, D = Dinner)',
    'Licensed English-speaking ATCB guide (throughout)',
    'Private vehicle & dedicated driver (throughout)',
    'All monument, museum & dzong entry fees',
    'Traditional welcome scarf (kata)',
    'Arise Bhutan 24/7 in-country emergency support',
  ],

  exclusions: [
    'International airfare to/from Paro (DEL–PBH–DEL)',
    'Druk Air / Bhutan Airlines tickets',
    'Travel & medical insurance (strongly recommended)',
    'Personal expenses & minibar charges',
    'Gratuities for guide and driver',
    'Alcoholic & premium beverages',
    'Laundry & room service',
    'Optional adventure activities (paragliding, rafting, biking)',
  ],

  cancellation: [
    { period: '60+ days before departure',    refund: 'Full refund less $150 processing fee' },
    { period: '30–59 days before departure',  refund: '50% refund of total package cost' },
    { period: '15–29 days before departure',  refund: '25% refund of total package cost' },
    { period: 'Under 15 days / No-show',      refund: 'No refund — non-refundable' },
  ],

  payment: [
    '30% deposit required to confirm & hold reservation',
    'Full balance due 30 days prior to departure',
    'Bank transfer (SWIFT) or major credit card accepted',
    'All payments in USD; INR transfers by prior arrangement',
  ],
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
const usd = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const inr = (n) => '₹' + n.toLocaleString('en-IN')

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHead({ children }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px flex-1 bg-amber-200" />
      <span
        style={{ fontSize: 10, letterSpacing: '0.18em' }}
        className="font-bold uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 whitespace-nowrap"
      >
        {children}
      </span>
      <div className="h-px flex-1 bg-amber-200" />
    </div>
  )
}

function TH({ children, right = false, className = '' }) {
  return (
    <th
      style={{ fontSize: 10, letterSpacing: '0.06em' }}
      className={`bg-stone-800 text-white font-semibold uppercase px-3 py-2 ${right ? 'text-right' : 'text-left'} ${className}`}
    >
      {children}
    </th>
  )
}

function TD({ children, right = false, center = false, className = '' }) {
  return (
    <td
      style={{ fontSize: 11 }}
      className={`border border-stone-200 px-3 py-2.5 text-stone-700 align-top ${right ? 'text-right' : ''} ${center ? 'text-center' : ''} ${className}`}
    >
      {children}
    </td>
  )
}

function InfoGrid({ rows }) {
  return (
    <div className="p-4 space-y-2">
      {rows.map(([label, val]) => (
        <div key={label} className="flex gap-2">
          <span style={{ fontSize: 10 }} className="text-stone-400 w-32 flex-shrink-0 font-medium leading-snug pt-px">
            {label}
          </span>
          <span style={{ fontSize: 11 }} className="text-stone-800 font-medium leading-snug">
            {val}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookingVoucher({ booking = SAMPLE_BOOKING }) {
  const [loading, setLoading] = useState(false)
  const { pricePerPerson, pax, sdfPerPersonPerNight, nights, serviceFeePerPax, gstRate, inrRate } = booking.pricing
  const costs = computePricing(booking.pricing)

  async function handleDownload() {
    setLoading(true)
    try {
      await generateVoucherPDF('booking-voucher-doc', `Arise-Bhutan-${booking.bookingRef}.pdf`)
    } catch (e) {
      console.error('PDF generation failed:', e)
      alert('PDF generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 py-10 px-4">

      {/* ── Toolbar (outside PDF capture area) ────────────────────── */}
      <div className="max-w-[920px] mx-auto mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Booking Voucher</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Ref: <strong className="text-amber-700">{booking.bookingRef}</strong>
            &nbsp;·&nbsp; Issued {booking.issueDate}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF…</>
            : <><Download className="w-4 h-4" /> Download Official PDF</>
          }
        </button>
      </div>

      {/* ── Voucher Document ───────────────────────────────────────── */}
      <div
        id="booking-voucher-doc"
        className="max-w-[920px] mx-auto bg-white shadow-2xl overflow-hidden rounded-sm"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >

        {/* ══ 1. BRAND HEADER ══════════════════════════════════════════ */}
        <div style={{ background: 'linear-gradient(135deg, #92400e 0%, #d97706 55%, #f59e0b 100%)' }} className="px-8 py-7">
          <div className="flex items-start justify-between gap-6">
            {/* Logo + brand */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="/images/logo.jpeg" alt="Arise Bhutan" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="text-white">
                <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }} className="font-serif leading-tight">
                  Arise Bhutan
                </p>
                <p style={{ fontSize: 10, letterSpacing: '0.22em' }} className="uppercase opacity-70 font-semibold mt-0.5">
                  Tours &amp; Travels · ATCB Licensed
                </p>
                <p style={{ fontSize: 10 }} className="opacity-55 mt-1">
                  Booking Confirmation &amp; Itinerary Voucher
                </p>
              </div>
            </div>

            {/* Ref card */}
            <div className="text-right flex-shrink-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/30 text-white">
                <p style={{ fontSize: 9, letterSpacing: '0.15em' }} className="uppercase opacity-70 mb-0.5">Booking Reference</p>
                <p style={{ fontSize: 20, letterSpacing: '0.12em' }} className="font-bold">{booking.bookingRef}</p>
                <p style={{ fontSize: 9 }} className="opacity-65 mt-1">Issued: {booking.issueDate}</p>
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1.5 bg-green-400 text-green-900 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-800 flex-shrink-0" />
                <span style={{ fontSize: 10, letterSpacing: '0.12em' }} className="font-bold uppercase">{booking.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BODY ═════════════════════════════════════════════════════ */}
        <div className="px-8 py-7 space-y-7">

          {/* ── 2. CLIENT + TOUR SUMMARY ─────────────────────────── */}
          <div className="grid grid-cols-2 gap-5">
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <div className="bg-stone-800 px-4 py-2.5">
                <p style={{ fontSize: 10, letterSpacing: '0.14em' }} className="text-white font-bold uppercase">Client Information</p>
              </div>
              <InfoGrid rows={[
                ['Guest Name',         booking.client.name],
                ['Email Address',      booking.client.email],
                ['Phone / WhatsApp',   booking.client.phone],
                ['Nationality',        booking.client.nationality],
                ['Passport No.',       booking.client.passportNo],
                ['Passport Expiry',    booking.client.passportExpiry],
                ['Emergency Contact',  booking.client.emergencyContact],
              ]} />
            </div>

            <div className="border border-amber-200 rounded-lg overflow-hidden">
              <div className="bg-amber-700 px-4 py-2.5">
                <p style={{ fontSize: 10, letterSpacing: '0.14em' }} className="text-white font-bold uppercase">Tour Summary</p>
              </div>
              <InfoGrid rows={[
                ['Tour Package',  booking.tour.title],
                ['Category',      booking.tour.category],
                ['Duration',      booking.tour.duration],
                ['Group Size',    `${booking.tour.pax} Pax`],
                ['Departure',     booking.tour.startDate],
                ['Return',        booking.tour.endDate],
                ['Guide',         booking.tour.guide],
                ['Vehicle',       booking.tour.vehicle],
              ]} />
            </div>
          </div>

          {/* ── 3. FLIGHT DETAILS ───────────────────────────────── */}
          <div>
            <SectionHead>Flight Details</SectionHead>
            <div className="rounded-lg border border-stone-200 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Sector', 'Date', 'Flight No.', 'Departs', 'Arrives', 'Airline'].map((h) => (
                      <TH key={h}>{h}</TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {booking.flights.map((f, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <TD className="font-semibold text-stone-900">{f.sector}</TD>
                      <TD>{f.date}</TD>
                      <TD>
                        <span className="font-mono font-bold text-amber-700">{f.flightNo}</span>
                      </TD>
                      <TD center className="font-medium">{f.depart}</TD>
                      <TD center className="font-medium">{f.arrive}</TD>
                      <TD>{f.airline}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 10 }} className="text-stone-400 mt-1.5 pl-1">
              * Confirm flight schedules directly with the airline. Arise Bhutan is not responsible for schedule changes.
            </p>
          </div>

          {/* ── 4. DAY-BY-DAY ITINERARY ─────────────────────────── */}
          <div>
            <SectionHead>Day-by-Day Itinerary Programme</SectionHead>
            <div className="rounded-lg border border-stone-200 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TH className="w-10 text-center">Day</TH>
                    <TH className="w-16 text-center">Date</TH>
                    <TH>Programme &amp; Activities</TH>
                    <TH className="w-44">Accommodation</TH>
                    <TH className="w-20 text-center">Meals</TH>
                  </tr>
                </thead>
                <tbody>
                  {booking.itinerary.map((day, i) => (
                    <tr key={day.day} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <TD center className="font-bold text-amber-700" style={{ fontSize: 14 }}>
                        {String(day.day).padStart(2, '0')}
                      </TD>
                      <TD center className="text-stone-500 font-medium">{day.date}</TD>
                      <TD>
                        <p className="font-semibold text-stone-900 mb-1" style={{ fontSize: 11 }}>{day.title}</p>
                        <ul className="space-y-0.5">
                          {day.activities.map((a, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-stone-600" style={{ fontSize: 10 }}>
                              <span className="text-amber-500 flex-shrink-0 mt-px">▸</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </TD>
                      <TD className="text-stone-700">{day.hotel}</TD>
                      <TD center className="font-semibold text-stone-700" style={{ fontSize: 10 }}>
                        {day.meals}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 10 }} className="text-stone-400 mt-1.5 pl-1">
              B = Breakfast &nbsp;·&nbsp; L = Lunch &nbsp;·&nbsp; D = Dinner
            </p>
          </div>

          {/* ── 5. COST BREAKDOWN ───────────────────────────────── */}
          <div>
            <SectionHead>Cost Breakdown &amp; Pricing Summary</SectionHead>
            <div className="grid grid-cols-5 gap-5">

              {/* Cost table — 3 cols wide */}
              <div className="col-span-3 rounded-lg border border-stone-200 overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <TH className="w-44">Cost Item</TH>
                      <TH right>Calculation</TH>
                      <TH right>Amount (USD)</TH>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <TD className="font-medium text-stone-900">Package Rate (per person)</TD>
                      <TD right className="text-stone-500">
                        {usd(pricePerPerson)} × {pax} pax
                      </TD>
                      <TD right className="font-semibold text-stone-900">{usd(costs.packageTotal)}</TD>
                    </tr>
                    <tr className="bg-stone-50">
                      <TD>
                        <p className="font-medium text-stone-900">Sustainable Development Fee</p>
                        <p style={{ fontSize: 9 }} className="text-stone-400 mt-0.5">Mandatory Royal Govt. of Bhutan levy</p>
                      </TD>
                      <TD right className="text-stone-500">
                        ${sdfPerPersonPerNight}/pax/night × {nights}N × {pax}
                      </TD>
                      <TD right className="font-semibold text-stone-900">{usd(costs.sdfTotal)}</TD>
                    </tr>
                    <tr className="bg-white">
                      <TD className="font-medium text-stone-900">Service &amp; Handling Fee</TD>
                      <TD right className="text-stone-500">
                        ${serviceFeePerPax}/pax × {pax}
                      </TD>
                      <TD right className="font-semibold text-stone-900">{usd(costs.serviceTotal)}</TD>
                    </tr>
                    <tr style={{ background: '#fef3c7' }}>
                      <TD colSpan={2} className="font-semibold text-stone-800">Sub-total</TD>
                      <TD right className="font-bold text-stone-900">{usd(costs.subtotal)}</TD>
                    </tr>
                    <tr className="bg-white">
                      <TD className="font-medium text-stone-900">
                        GST ({(gstRate * 100).toFixed(0)}%)
                      </TD>
                      <TD right className="text-stone-500">
                        {(gstRate * 100).toFixed(0)}% on sub-total
                      </TD>
                      <TD right className="font-semibold text-stone-900">{usd(costs.gst)}</TD>
                    </tr>
                    {/* Total rows */}
                    <tr style={{ background: '#1c1917' }}>
                      <td
                        colSpan={2}
                        style={{ fontSize: 11, letterSpacing: '0.06em' }}
                        className="px-3 py-3 text-white font-bold uppercase"
                      >
                        Grand Total (USD)
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span style={{ fontSize: 18 }} className="font-bold text-amber-400">{usd(costs.totalUSD)}</span>
                      </td>
                    </tr>
                    <tr style={{ background: '#b45309' }}>
                      <td
                        colSpan={2}
                        style={{ fontSize: 11, letterSpacing: '0.06em' }}
                        className="px-3 py-3 text-white font-bold uppercase"
                      >
                        Equivalent (INR @ ₹{inrRate})
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span style={{ fontSize: 18 }} className="font-bold text-white">{inr(costs.totalINR)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Side notes — 2 cols */}
              <div className="col-span-2 flex flex-col gap-4">
                <div className="border border-blue-200 rounded-lg overflow-hidden flex-1">
                  <div className="bg-blue-800 px-4 py-2">
                    <p style={{ fontSize: 10, letterSpacing: '0.1em' }} className="text-white font-bold uppercase">Payment Schedule</p>
                  </div>
                  <div className="p-3 space-y-2">
                    {booking.payment.map((p, i) => (
                      <div key={i} className="flex items-start gap-1.5" style={{ fontSize: 10 }}>
                        <span className="text-blue-500 flex-shrink-0 mt-px">•</span>
                        <span className="text-stone-700">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-amber-200 rounded-lg overflow-hidden flex-1">
                  <div className="bg-amber-700 px-4 py-2">
                    <p style={{ fontSize: 10, letterSpacing: '0.1em' }} className="text-white font-bold uppercase">Pricing Notes</p>
                  </div>
                  <div className="p-3 space-y-2">
                    {[
                      'SDF is non-negotiable — set by Royal Govt.',
                      'INR equivalent shown for reference only.',
                      'Quote valid 14 days from issue date.',
                      'Child rates available on request.',
                      'Group discounts available (10+ pax).',
                    ].map((note, i) => (
                      <div key={i} className="flex items-start gap-1.5" style={{ fontSize: 10 }}>
                        <span className="text-amber-500 flex-shrink-0 mt-px">•</span>
                        <span className="text-stone-700">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 6. ACCOMMODATION SCHEDULE ───────────────────────── */}
          <div>
            <SectionHead>Accommodation Schedule</SectionHead>
            <div className="rounded-lg border border-stone-200 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Hotel Name', 'Location', 'Category', 'Property Type', 'Nights'].map((h) => (
                      <TH key={h}>{h}</TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {booking.hotels.map((h, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <TD className="font-semibold text-stone-900">{h.name}</TD>
                      <TD>{h.location}</TD>
                      <TD>
                        <span className="text-amber-500" style={{ letterSpacing: 2 }}>
                          {'★'.repeat(h.stars)}
                        </span>
                      </TD>
                      <TD>{h.type}</TD>
                      <TD center className="font-semibold text-stone-900">
                        {h.nights} {h.nights === 1 ? 'Night' : 'Nights'}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 10 }} className="text-stone-400 mt-1.5 pl-1">
              Hotels may be substituted with a property of equal or superior category if unavailability arises. Arise Bhutan will notify you with at least 72 hours notice.
            </p>
          </div>

          {/* ── 7. INCLUSIONS & EXCLUSIONS ──────────────────────── */}
          <div>
            <SectionHead>Package Inclusions &amp; Exclusions</SectionHead>
            <div className="grid grid-cols-2 gap-5">
              <div className="border border-green-200 rounded-lg overflow-hidden">
                <div className="bg-green-800 px-4 py-2.5">
                  <p style={{ fontSize: 10, letterSpacing: '0.12em' }} className="text-white font-bold uppercase">✓ Included in Package</p>
                </div>
                <div className="p-4 space-y-2">
                  {booking.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-green-600 flex-shrink-0 mt-px font-bold" style={{ fontSize: 12 }}>✓</span>
                      <span style={{ fontSize: 11 }} className="text-stone-700">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-800 px-4 py-2.5">
                  <p style={{ fontSize: 10, letterSpacing: '0.12em' }} className="text-white font-bold uppercase">✗ Not Included</p>
                </div>
                <div className="p-4 space-y-2">
                  {booking.exclusions.map((exc, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-500 flex-shrink-0 mt-px font-bold" style={{ fontSize: 12 }}>✗</span>
                      <span style={{ fontSize: 11 }} className="text-stone-700">{exc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── 8. CANCELLATION POLICY ──────────────────────────── */}
          <div>
            <SectionHead>Cancellation &amp; Refund Policy</SectionHead>
            <div className="rounded-lg border border-stone-200 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TH>Cancellation Period</TH>
                    <TH>Refund Terms</TH>
                  </tr>
                </thead>
                <tbody>
                  {booking.cancellation.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <TD className="font-semibold text-stone-900">{c.period}</TD>
                      <TD>{c.refund}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 10 }} className="text-stone-400 mt-1.5 pl-1">
              Force majeure events (natural disasters, civil unrest, airline cancellations) handled on a case-by-case basis. Travel insurance strongly recommended.
            </p>
          </div>

          {/* ── 9. BRAND NARRATIVE ──────────────────────────────── */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)' }}>
            <div className="px-7 py-6">
              <p style={{ fontSize: 18 }} className="font-serif font-bold text-amber-400 mb-3">
                To Arise is to Awaken.
              </p>
              <p style={{ fontSize: 11, lineHeight: 1.75 }} className="text-stone-300 mb-3">
                At Arise Bhutan, we believe the finest journey is one that transforms. Each itinerary we craft carries the weight of our founder&apos;s conviction — born in the shadows of Paro&apos;s fortress walls, refined through seasons of walking Bhutan&apos;s ancient trails. We do not simply take you through Bhutan. We introduce you to it.
              </p>
              <p style={{ fontSize: 11, lineHeight: 1.75 }} className="text-stone-300">
                Your booking is a promise — of early morning monastery bells, of steaming ema datshi in a farmhouse kitchen, of prayer flags catching the first Himalayan light. We honour this promise with meticulous care, passionate guides, and the quiet confidence of a team who calls this kingdom home. Welcome to Bhutan. Welcome to your awakening.
              </p>
            </div>
            <div style={{ background: 'rgba(217,119,6,0.15)', borderTop: '1px solid rgba(217,119,6,0.25)' }} className="px-7 py-3 flex items-center gap-6">
              {[
                ['100% ATCB Compliant', '✓'],
                ['SDF Directly Remitted', '✓'],
                ['24/7 In-Country Support', '✓'],
                ['Licensed Guides Only', '✓'],
              ].map(([label, icon]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold" style={{ fontSize: 11 }}>{icon}</span>
                  <span style={{ fontSize: 10 }} className="text-amber-200 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ 10. FOOTER ═══════════════════════════════════════════════ */}
        <div style={{ background: '#111827' }} className="px-8 py-6">
          <div className="grid grid-cols-3 gap-6 mb-5">
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.14em' }} className="text-amber-400 font-bold uppercase mb-2">Arise Bhutan Tours &amp; Travels</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">ATCB License No: ATCB/TA-2024/1047</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">Tourism Council of Bhutan — Registered</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">Main Street, Paro, Kingdom of Bhutan</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">P.O. Box 1234, Paro 11001</p>
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.14em' }} className="text-amber-400 font-bold uppercase mb-2">Contact &amp; Support</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">📞 +975 17 288 286</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">📞 +975 2 272 929 (Office)</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">✉ arisebhutan@gmail.com</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">🌐 www.arisebhutan.com</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">💬 WhatsApp: +975 17 288 286</p>
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.14em' }} className="text-amber-400 font-bold uppercase mb-2">Travel Assurance</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">✓ ATCB Licensed &amp; Inspected</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">✓ SDF Remitted to Royal Govt.</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">✓ All Guides ATCB Certified</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">✓ Comprehensive In-Country Support</p>
              <p style={{ fontSize: 10 }} className="text-stone-400">✓ Emergency Evacuation Protocol</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #374151' }} className="pt-4 flex items-center justify-between flex-wrap gap-2">
            <p style={{ fontSize: 9 }} className="text-stone-500">
              This voucher is computer-generated and is valid without a physical signature. Document issued on {booking.issueDate}.
            </p>
            <p style={{ fontSize: 9 }} className="text-stone-500 font-mono">
              Ref: {booking.bookingRef}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
