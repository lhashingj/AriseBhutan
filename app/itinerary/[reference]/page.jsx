'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Loader2, AlertCircle, Printer, Clock } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

// ── Formatting helpers ────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtMoney(n, decimals = 2) {
  return Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// ── Standard inclusions / exclusions ─────────────────────────
const DEFAULT_INCLUSIONS = [
  'Bhutan Sustainable Development Fee (SDF) — $100 per person per night',
  'Bhutan visa and entry permit processing',
  'All accommodation per the confirmed itinerary',
  'All meals as specified (B = Breakfast, L = Lunch, D = Dinner)',
  'Licensed English-speaking DOT-certified guide',
  'Private air-conditioned vehicle with dedicated driver',
  'All monument, dzong and protected-area entry fees',
  'Arise Bhutan 24/7 in-country emergency support',
]

const DEFAULT_EXCLUSIONS = [
  'International airfare to / from Paro (PBH)',
  'Travel insurance and medical evacuation cover',
  'Personal expenses, gratuities and tips',
  'Alcoholic beverages and premium room-service items',
  'Optional adventure activities (archery, cycling, hot springs)',
  'Any services not explicitly listed under Inclusions',
]

const DEFAULT_CANCELLATION = [
  { period: '60 days or more before departure', policy: 'Full refund, less USD 150 administration fee' },
  { period: '30 – 59 days before departure',    policy: '50 % of total tour cost forfeited' },
  { period: '15 – 29 days before departure',    policy: '75 % of total tour cost forfeited' },
  { period: 'Under 15 days / No-show',          policy: '100 % non-refundable' },
]

// ── Meal badge ────────────────────────────────────────────────
function MealBadge({ code }) {
  const colors = { B: 'bg-amber-100 text-amber-700', L: 'bg-green-100 text-green-700', D: 'bg-blue-100 text-blue-700' }
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[code] || 'bg-stone-100 text-stone-600'}`}>
      {code}
    </span>
  )
}

function parseMeals(meals) {
  if (!meals) return []
  if (Array.isArray(meals)) return meals
  return meals.split(/[,/\s]+/).map(m => m.trim()).filter(Boolean)
}

// ── Small layout components ───────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest whitespace-nowrap">{children}</h2>
      <div className="flex-1 h-px bg-stone-100" />
    </div>
  )
}

function InfoRow({ label, value, span }) {
  if (!value) return null
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-stone-800 text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}

function PricingRow({ label, value, bold }) {
  return (
    <tr>
      <td className={`px-5 py-3 ${bold ? 'font-semibold text-stone-900' : 'text-stone-600'}`}>{label}</td>
      <td className={`px-5 py-3 text-right font-mono ${bold ? 'font-bold text-stone-900' : 'text-stone-700'}`}>{value}</td>
    </tr>
  )
}

// ── Status badge config ───────────────────────────────────────
const STATUS_BADGE = {
  enquiry_pending: { label: 'Under Review',   cls: 'bg-rose-100 text-rose-700' },
  pending_review:  { label: 'Under Review',   cls: 'bg-amber-100 text-amber-700' },
  quoted:          { label: 'Quoted',         cls: 'bg-blue-100 text-blue-700' },
  confirmed:       { label: 'Confirmed',      cls: 'bg-green-100 text-green-700' },
}

// ── Main page ─────────────────────────────────────────────────
export default function ItineraryVoucherPage() {
  const { reference }             = useParams()
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    async function fetchItinerary() {
      const { data, error: err } = await supabase
        .from('itineraries')
        .select('*')
        .eq('booking_reference', reference)
        .single()
      if (err || !data) {
        setError('Itinerary not found. Please check your booking reference.')
      } else {
        setItinerary(data)
      }
      setLoading(false)
    }
    if (reference) fetchItinerary()
  }, [reference])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-serif font-bold text-stone-900 mb-2">Voucher Not Found</h2>
          <p className="text-stone-500 text-sm">{error}</p>
          <p className="text-stone-400 text-xs mt-3">Reference: <span className="font-mono">{reference}</span></p>
        </div>
      </div>
    )
  }

  const it          = itinerary
  const info        = it.client_info   || {}
  const tour        = it.tour_summary  || {}
  const px          = it.pricing       || {}

  const isPending   = it.status === 'enquiry_pending' || it.status === 'pending_review'
  const showPricing = it.status === 'quoted'          || it.status === 'confirmed'

  const badge = STATUS_BADGE[it.status] || STATUS_BADGE.pending_review

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .voucher-page { box-shadow: none !important; }
          @page { size: A4; margin: 12mm 15mm; }
          .page-break-avoid { break-inside: avoid; }
        }
      `}</style>

      <div className="min-h-screen bg-stone-100 py-8 px-4 print:bg-white print:py-0 print:px-0">

        {/* Print button */}
        <div className="max-w-[860px] mx-auto mb-4 flex justify-end no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

        {/* ── Voucher document ── */}
        <div className="voucher-page max-w-[860px] mx-auto bg-white shadow-xl print:shadow-none">

          {/* Amber top border */}
          <div className="h-1.5" style={{ backgroundColor: '#D97706' }} />

          {/* ── Header ── */}
          <header className="px-10 py-7 flex items-start justify-between gap-6 border-b border-stone-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white border border-stone-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                <Image src="/images/logo.jpeg" alt="Arise Bhutan" width={56} height={56} className="object-contain" />
              </div>
              <div>
                <p className="font-serif font-bold text-stone-900 text-lg leading-tight">Arise Bhutan</p>
                <p className="text-stone-500 text-xs">Tours &amp; Travels</p>
                <p className="text-stone-400 text-[11px] mt-0.5">www.arisebhutan.com</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-2">
                ✦ Licensed DOT Operator
              </div>
              <p className="font-mono font-bold text-stone-900 text-lg tracking-wider">
                {it.booking_reference}
              </p>
              <p className="text-stone-400 text-xs uppercase tracking-wider mt-0.5">
                {isPending ? 'Travel Enquiry' : 'Booking Voucher'}
              </p>
              <span className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${badge.cls}`}>
                ● {badge.label}
              </span>
            </div>
          </header>

          <div className="px-10 py-8 space-y-8">

            {/* ── Pending status banner ── */}
            {isPending && (
              <section className="page-break-avoid">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900 text-sm leading-snug">
                      Bespoke Package Pricing Under Operational Review
                    </p>
                    <p className="text-amber-700 text-xs mt-1.5 leading-relaxed">
                      Your dedicated travel concierge is reviewing your preferences and preparing a personalised
                      pricing proposal. A complete cost breakdown will be shared with you within 24 hours.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-100 border border-amber-200 rounded-full px-3 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                      Concierge Desk Review In Progress
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Client Information ── */}
            <section className="page-break-avoid">
              <SectionTitle>Client Information</SectionTitle>
              <div className="grid grid-cols-2 gap-x-10 gap-y-3 mt-4">
                <InfoRow label="Guest Name"        value={info.guest_name} />
                <InfoRow label="Email"             value={info.email} />
                <InfoRow label="Phone"             value={info.phone} />
                <InfoRow label="Nationality"       value={info.nationality} />
                <InfoRow label="Passport No."      value={info.passport_no} />
                <InfoRow label="Passport Expiry"   value={fmtDate(info.passport_expiry)} />
                <InfoRow label="Emergency Contact" value={info.emergency_contact} span />
              </div>
            </section>

            {/* ── Tour Summary ── */}
            <section className="page-break-avoid">
              <SectionTitle>Tour Summary</SectionTitle>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
                {[
                  { label: 'Tour Package', value: tour.tour_package, wide: true },
                  { label: 'Category',     value: tour.category },
                  { label: 'Duration',     value: tour.duration_nights ? `${tour.duration_nights} Nights` : '—' },
                  { label: 'Group Size',   value: tour.group_size ? `${tour.group_size} Pax` : '—' },
                  { label: 'Departure',    value: fmtDate(tour.departure_date) },
                  { label: 'Return',       value: fmtDate(tour.return_date) },
                ].map(({ label, value, wide }) => (
                  <div key={label} className={`bg-stone-50 rounded-xl p-3 ${wide ? 'col-span-3 sm:col-span-2' : ''}`}>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">{label}</p>
                    <p className="text-stone-800 font-semibold text-sm mt-0.5">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Travel Preferences (pending enquiries only) ── */}
            {isPending && (tour.hotel_tier || tour.interests?.length > 0 || tour.message) && (
              <section className="page-break-avoid">
                <SectionTitle>Your Travel Preferences</SectionTitle>
                <div className="grid grid-cols-2 gap-x-10 gap-y-4 mt-4">
                  {tour.hotel_tier && (
                    <InfoRow label="Preferred Accommodation" value={tour.hotel_tier} />
                  )}
                  {tour.interests?.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mb-2">Special Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {tour.interests.map((interest, idx) => (
                          <span key={idx} className="text-xs px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-medium">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {tour.message && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mb-1">Additional Notes</p>
                      <p className="text-stone-700 text-sm leading-relaxed">{tour.message}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Specialist Team ── */}
            {(isPending || tour.guide_name) && (
              <section className="page-break-avoid">
                <SectionTitle>Your Specialist Team</SectionTitle>
                <div className="grid grid-cols-2 gap-x-10 gap-y-3 mt-4">
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Assigned Guide</p>
                    <p className="text-stone-800 text-sm font-medium mt-0.5">
                      {tour.guide_name || (isPending ? 'Assigned on confirmation' : '—')}
                    </p>
                  </div>
                  {tour.vehicle_details && (
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Private Vehicle &amp; Driver</p>
                      <p className="text-stone-800 text-sm font-medium mt-0.5">{tour.vehicle_details}</p>
                    </div>
                  )}
                  {isPending && !tour.vehicle_details && (
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Private Vehicle &amp; Driver</p>
                      <p className="text-stone-500 text-sm mt-0.5 italic">Assigned on confirmation</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Flight Details (quoted/confirmed) ── */}
            {!isPending && (it.flights || []).length > 0 && (
              <section className="page-break-avoid">
                <SectionTitle>Flight Details</SectionTitle>
                <div className="mt-4 overflow-hidden rounded-xl border border-stone-100">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-stone-800 text-stone-200 text-xs uppercase tracking-wider">
                        {['Sector', 'Date', 'Flight No.', 'Departs', 'Arrives', 'Airline'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {it.flights.map((f, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'}>
                          <td className="px-4 py-3 font-semibold text-stone-800">{f.sector || '—'}</td>
                          <td className="px-4 py-3 text-stone-600">{f.date || '—'}</td>
                          <td className="px-4 py-3 font-mono text-amber-700">{f.flight_no || '—'}</td>
                          <td className="px-4 py-3 text-stone-600">{f.departs || '—'}</td>
                          <td className="px-4 py-3 text-stone-600">{f.arrives || '—'}</td>
                          <td className="px-4 py-3 text-stone-500">{f.airline || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ── Day-by-Day Itinerary ── */}
            {(it.day_by_day || []).length > 0 && (
              <section>
                <SectionTitle>Day-by-Day Itinerary</SectionTitle>
                <div className="mt-4 space-y-3">
                  {it.day_by_day.map((d, i) => {
                    const meals = parseMeals(d.meals)
                    return (
                      <div key={i} className="page-break-avoid grid grid-cols-[56px_1fr] gap-0 rounded-xl overflow-hidden border border-stone-100">
                        <div className="flex flex-col items-center justify-center bg-stone-800 text-white py-4 px-2">
                          <p className="text-[9px] uppercase tracking-widest text-stone-400">Day</p>
                          <p className="text-xl font-bold leading-none mt-0.5">{d.day ?? i + 1}</p>
                          {d.date && (
                            <p className="text-[9px] text-stone-500 mt-1 text-center leading-tight">
                              {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <div className="bg-white px-5 py-4">
                          <p className="text-stone-800 text-sm leading-relaxed">{d.programme || '—'}</p>
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            {d.accommodation_name && (
                              <span className="flex items-center gap-1 text-xs text-stone-500">
                                <span className="text-amber-600">⌂</span> {d.accommodation_name}
                              </span>
                            )}
                            {meals.length > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="text-xs text-stone-400">Meals:</span>
                                {meals.map(m => <MealBadge key={m} code={m[0]?.toUpperCase()} />)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* ── Cost Breakdown (quoted / confirmed only) ── */}
            {showPricing && px.grand_total > 0 && (
              <section className="page-break-avoid">
                <SectionTitle>Cost Breakdown</SectionTitle>
                <div className="mt-4 rounded-xl border border-stone-200 overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <tbody className="divide-y divide-stone-100">
                      <PricingRow
                        label={`Package Rate — $${fmtMoney(px.package_rate_per_pax, 0)} per person × ${tour.group_size || 1} guests`}
                        value={`$${fmtMoney(Number(px.package_rate_per_pax || 0) * Number(tour.group_size || 1))}`}
                      />
                      <PricingRow
                        label={`Sustainable Development Fee — $100 × ${tour.duration_nights || 1} nights × ${tour.group_size || 1} guests`}
                        value={`$${fmtMoney(px.sdf_total)}`}
                      />
                      {px.service_fee > 0 && (
                        <PricingRow label="Service Fee" value={`$${fmtMoney(px.service_fee)}`} />
                      )}
                      <PricingRow label="Subtotal" value={`$${fmtMoney(px.subtotal)}`} bold />
                      <PricingRow label="GST (5%)"  value={`$${fmtMoney(px.gst)}`} />
                      <tr className="bg-amber-50">
                        <td className="px-5 py-4 font-bold text-stone-900">Grand Total (USD)</td>
                        <td className="px-5 py-4 text-right font-bold text-amber-700 text-lg font-mono">
                          ${fmtMoney(px.grand_total)}
                        </td>
                      </tr>
                      <tr className="bg-stone-50">
                        <td className="px-5 py-3 text-stone-500 text-xs">Equivalent Amount (INR @ ₹83.5 / USD)</td>
                        <td className="px-5 py-3 text-right text-stone-600 text-sm font-mono font-semibold">
                          ₹{Number(px.equivalent_inr || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-stone-400 mt-2 italic">
                  * INR equivalent is indicative only; final conversion at prevailing rate on payment date.
                </p>
              </section>
            )}

            {/* ── Inclusions & Exclusions ── */}
            <section className="page-break-avoid">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <SectionTitle>Inclusions</SectionTitle>
                  <ul className="mt-3 space-y-2">
                    {DEFAULT_INCLUSIONS.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                        <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <SectionTitle>Exclusions</SectionTitle>
                  <ul className="mt-3 space-y-2">
                    {DEFAULT_EXCLUSIONS.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                        <span className="text-red-500 mt-0.5 shrink-0">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ── Cancellation Policy ── */}
            <section className="page-break-avoid">
              <SectionTitle>Cancellation Policy</SectionTitle>
              <div className="mt-4 overflow-hidden rounded-xl border border-stone-100">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-stone-800 text-stone-200 text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 text-left font-semibold">Period</th>
                      <th className="px-5 py-3 text-left font-semibold">Cancellation Terms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {DEFAULT_CANCELLATION.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'}>
                        <td className="px-5 py-3 font-medium text-stone-700">{row.period}</td>
                        <td className="px-5 py-3 text-stone-600">{row.policy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Payment Terms (quoted / confirmed only) ── */}
            {showPricing && (
              <section className="page-break-avoid">
                <SectionTitle>Payment Terms</SectionTitle>
                <ul className="mt-3 space-y-1.5">
                  {[
                    '30% deposit required within 7 days of booking confirmation to secure the reservation.',
                    'Full balance due 30 days prior to the departure date.',
                    'Accepted methods: Bank Transfer (SWIFT / RTGS), major credit/debit cards.',
                    'All amounts are quoted and payable in USD unless prior arrangement for INR transfer is confirmed in writing.',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                      <span className="text-amber-600 shrink-0 mt-0.5">→</span> {t}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* ── Footer ── */}
          <footer className="mt-2">
            <div className="h-px" style={{ background: 'linear-gradient(to right, #D97706, transparent)' }} />
            <div className="px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="font-serif font-bold text-stone-900 text-xl italic">&ldquo;To Arise is to Awaken.&rdquo;</p>
                <p className="text-stone-400 text-xs mt-1.5 max-w-xs leading-relaxed">
                  We craft personal journeys into the Kingdom of Happiness — where every trail,
                  monastery and dzong reveals a deeper layer of the ancient world.
                </p>
              </div>
              <div className="text-right shrink-0 text-xs text-stone-400 space-y-0.5">
                <p className="font-semibold text-stone-700 text-sm">Arise Bhutan Tours &amp; Travels</p>
                <p>arisebhutan@gmail.com</p>
                <p>www.arisebhutan.com</p>
                <p className="mt-1 italic">Licensed by Tourism Council of Bhutan</p>
              </div>
            </div>
            <div className="h-1.5" style={{ backgroundColor: '#D97706' }} />
          </footer>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-stone-400 mt-4 no-print">
          Issued: {fmtDate(it.created_at)} · Reference: {it.booking_reference}
        </p>
      </div>
    </>
  )
}
