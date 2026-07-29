'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Loader2, AlertCircle, Download, ArrowLeft, Settings, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import { generateVoucherPDF } from '@/utils/pdfGenerator'
import PaymentBadges from '@/components/PaymentBadges'

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
function fmtMoney(n, dec = 2) {
  return Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  })
}
function parseMeals(m) {
  if (!m) return []
  if (Array.isArray(m)) return m
  return m.split(/[,/\s]+/).map(x => x.trim().toUpperCase()[0]).filter(Boolean)
}

// The voucher must always print / export as a light "paper" document, even
// when the site is in dark mode. These helpers strip the dark class (with
// transitions disabled so html2canvas never captures a mid-transition frame)
// and restore it afterwards.
function stripDarkTheme() {
  const html = document.documentElement
  const wasDark = html.classList.contains('dark')
  if (wasDark) {
    html.classList.add('force-light-capture')
    html.classList.remove('dark')
  }
  return wasDark
}
function restoreDarkTheme(wasDark) {
  const html = document.documentElement
  if (wasDark) {
    html.classList.add('dark')
    setTimeout(() => html.classList.remove('force-light-capture'), 50)
  }
}

const DEFAULT_INCLUSIONS = [
  `Accommodation (${'{tier}'}) as per itinerary`,
  'Licensed English-speaking DOT-certified guide',
  'Private vehicle & dedicated driver',
  'Sustainable Development Fee (SDF) — $100/person/night',
  'All monument & dzong entry fees',
  'Meals as per itinerary',
]
const DEFAULT_EXCLUSIONS = [
  'International flights (DEL ↔ PBH)',
  'Travel & medical insurance',
  'Personal expenses',
  'Gratuities for guide & driver',
]
const DEFAULT_CANCELLATION = [
  { period: '60+ days before departure',   policy: 'Full refund less $150 processing fee' },
  { period: '30–59 days before departure', policy: '50% refund' },
  { period: 'Under 30 days / No-show',     policy: 'Non-refundable' },
]

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG = {
  enquiry_pending: { label: 'Under Review', dot: '#F87171', bg: '#1C1917', border: '#F87171' },
  pending_review:  { label: 'Under Review', dot: '#FBBF24', bg: '#1C1810', border: '#D97706' },
  quoted:          { label: 'Quoted',       dot: '#60A5FA', bg: '#0F1629', border: '#3B82F6' },
  confirmed:       { label: 'Confirmed',    dot: '#34D399', bg: '#0A1F16', border: '#10B981' },
}

// ── Main page ─────────────────────────────────────────────────
export default function ItineraryVoucherPage() {
  const { reference }            = useParams()
  const searchParams             = useSearchParams()
  const isAdminView              = searchParams.get('admin') === '1'
  const [it, setIt]              = useState(null)
  const [loading, setLoading]    = useState(true)
  const [error, setError]        = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { data, error: err } = await supabase
        .from('itineraries')
        .select('*')
        .eq('booking_reference', reference)
        .single()
      if (err || !data) setError('Itinerary not found. Please check your booking reference.')
      else setIt(data)
      setLoading(false)
    }
    if (reference) fetch()
  }, [reference])

  // Browser print (Ctrl+P / Save as PDF) must always output the light voucher
  useEffect(() => {
    let wasDark = false
    const before = () => { wasDark = stripDarkTheme() }
    const after  = () => { restoreDarkTheme(wasDark) }
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <Loader2 className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl shadow-md p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-50 mb-2">Voucher Not Found</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm">{error}</p>
        <p className="text-stone-400 dark:text-stone-500 text-xs mt-3 font-mono">{reference}</p>
      </div>
    </div>
  )

  const info   = it.client_info   || {}
  const tour   = it.tour_summary  || {}
  const px     = it.pricing       || {}
  const nights = Number(tour.duration_nights) || 1
  const guests = Number(tour.group_size) || 1
  const guestList = tour.guests || []
  const currSym  = px.is_saarc ? '₹' : '$'
  const isNewPricingFormat = px.service_total !== undefined || px.service_rate !== undefined
  const isPending  = it.status === 'enquiry_pending' || it.status === 'pending_review'
  const showPricing = it.status === 'quoted' || it.status === 'confirmed'
  const cfg = STATUS_CFG[it.status] || STATUS_CFG.pending_review

  const inclusions = (tour.inclusions?.length > 0)
    ? tour.inclusions
    : DEFAULT_INCLUSIONS.map(s => s.replace('{tier}', tour.hotel_tier || '5-Star'))
  const exclusions = (tour.exclusions?.length > 0) ? tour.exclusions : DEFAULT_EXCLUSIONS
  const cancellation = (tour.cancellation?.length > 0) ? tour.cancellation : DEFAULT_CANCELLATION

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          table, tr, img, .page-break-avoid { page-break-inside: avoid !important; }
          .voucher-root { padding: 0 !important; background: white !important; }
          @page { size: A4; margin: 10mm 12mm; }
        }
        /* Disable transitions while the dark class is temporarily stripped for print/PDF capture */
        .force-light-capture, .force-light-capture * { transition: none !important; }
      `}</style>

      {/* Page shell — pt-24 clears the fixed 72px navbar */}
      <div className="voucher-root min-h-screen bg-stone-100 dark:bg-stone-950 pt-24 pb-8 px-4 transition-colors duration-300 print:bg-white print:pt-0 print:pb-0 print:px-0">

        {/* Toolbar */}
        <div className="max-w-[900px] mx-auto mb-5 flex items-center justify-between no-print">
          {isAdminView ? (
            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard"
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500 bg-white dark:bg-stone-900 rounded-xl px-3 py-2 transition-colors shadow-sm">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin
              </Link>
              <Link href="/admin/itineraries"
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 border border-amber-300 dark:border-amber-500/40 hover:border-amber-400 dark:hover:border-amber-500/60 bg-amber-50 dark:bg-amber-500/10 rounded-xl px-3 py-2 transition-colors shadow-sm">
                <Settings className="w-3.5 h-3.5" /> Edit Itinerary
              </Link>
            </div>
          ) : (
            <a href="/client/dashboard" className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">← Back to dashboard</a>
          )}
          {/* PDF export only available once the itinerary carries a confirmed price — an
              enquiry/under-review voucher has no bank details or cost breakdown to export. */}
          {showPricing && (
            <button
              onClick={async () => {
                setPdfLoading(true)
                const wasDark = stripDarkTheme()
                // one settle frame so html2canvas captures the light styles
                await new Promise(r => setTimeout(r, 60))
                try {
                  await generateVoucherPDF('voucher-doc', `Arise-Bhutan-${it.booking_reference}.pdf`)
                } catch (e) {
                  console.error('PDF error:', e)
                } finally {
                  restoreDarkTheme(wasDark)
                  setPdfLoading(false)
                }
              }}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #D97706, #B45309)' }}
            >
              {pdfLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : <><Download className="w-4 h-4" /> Download PDF</>
              }
            </button>
          )}
        </div>

        {/* ── Voucher document ─────────────────────────────────── */}
        <div className="max-w-[900px] mx-auto bg-white dark:bg-stone-900 shadow-2xl print:shadow-none" id="voucher-doc">

          {/* ── HEADER ── */}
          <header style={{ background: 'linear-gradient(135deg, #92400E 0%, #D97706 60%, #F59E0B 100%)' }}
            className="px-4 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Logo + tagline */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur overflow-hidden flex items-center justify-center border-2 border-white/40 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo.jpeg" alt="Arise Bhutan" width={56} height={56} className="object-contain w-full h-full" crossOrigin="anonymous" />
                </div>
                <div>
                  <p className="font-serif font-bold text-white text-lg sm:text-xl leading-tight">Arise Bhutan</p>
                  <p className="text-amber-200 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">Tours &amp; Travels · DOT Certified</p>
                  <p className="text-amber-200/70 text-[10px] sm:text-xs mt-0.5">
                    {isPending ? 'Travel Enquiry & Itinerary Proposal' : 'Booking Confirmation & Itinerary Voucher'}
                  </p>
                </div>
              </div>

              {/* Reference box */}
              <div className="sm:text-right">
                <div className="inline-block bg-white/15 backdrop-blur border border-white/30 rounded-xl px-4 sm:px-5 py-3">
                  <p className="text-amber-200/80 text-[9px] font-bold uppercase tracking-widest mb-1">Booking Reference</p>
                  <p className="font-mono font-black text-white text-base sm:text-xl tracking-wider">{it.booking_reference}</p>
                  <p className="text-amber-200/70 text-[10px] mt-1">Issued: {fmtDate(it.created_at)}</p>
                </div>
                {/* Status badge */}
                <div className="mt-2 sm:mt-3 flex sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.border }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: cfg.dot, animation: it.status === 'confirmed' ? 'pulse 2s infinite' : 'none' }} />
                    ● {cfg.label}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ── BODY ── */}
          <div className="px-4 sm:px-8 py-6 sm:py-7 space-y-6 sm:space-y-7">

            {/* Under-review banner */}
            {isPending && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-5 py-4 flex items-start gap-3 page-break-avoid">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-amber-600 dark:text-amber-400 font-bold text-sm">⏳</div>
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Bespoke Package Pricing Under Concierge Review</p>
                  <p className="text-amber-700 dark:text-amber-400 text-xs mt-1 leading-relaxed">
                    Your travel concierge is reviewing your preferences and preparing a personalised pricing proposal.
                    A complete cost breakdown will be shared within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {/* ── CLIENT INFO + TOUR SUMMARY (side by side) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 page-break-avoid">
              {/* Client Info */}
              <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                <div className="bg-stone-800 dark:bg-stone-950 px-4 py-2.5">
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest">Client Information</p>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-700/60">
                  {[
                    ['Guest Name',        info.guest_name],
                    ['Email Address',     info.email],
                    ['Phone / WhatsApp',  info.phone],
                    ['Nationality',       info.nationality],
                    ['Passport No.',      info.passport_no || info.passport_number],
                    ['Passport Expiry',   info.passport_expiry ? fmtDate(info.passport_expiry) : null],
                    ['Emergency Contact', info.emergency_contact],
                  ].filter(([, v]) => v).map(([label, val]) => (
                    <div key={label} className="flex px-4 py-2">
                      <span className="text-stone-400 dark:text-stone-500 text-[10px] w-32 flex-shrink-0 font-medium pt-px">{label}</span>
                      <span className="text-stone-800 dark:text-stone-100 text-xs font-semibold leading-snug">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tour Summary */}
              <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                <div className="px-4 py-2.5" style={{ background: 'linear-gradient(90deg, #92400E, #D97706)' }}>
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest">Tour Summary</p>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-700/60">
                  {[
                    ['Tour Package',  tour.tour_package || '—'],
                    ['Category',      tour.category || '—'],
                    ['Duration',      tour.duration_nights ? `${Number(tour.duration_nights) + 1} Days / ${tour.duration_nights} Nights` : '—'],
                    ['Group Size',    tour.group_size ? `${tour.group_size} Pax` : '—'],
                    ['Room Config',   tour.room_config || null],
                    ['Departure',     fmtDate(tour.departure_date)],
                    ['Return',        fmtDate(tour.return_date)],
                    ['Guide',         tour.guide_name || (isPending ? 'Assigned on confirmation' : null)],
                    ['Vehicle',       tour.vehicle_details || (isPending ? 'Private vehicle + driver' : null)],
                  ].filter(([, v]) => v && v !== '—').map(([label, val]) => (
                    <div key={label} className="flex px-4 py-2">
                      <span className="text-stone-400 dark:text-stone-500 text-[10px] w-32 flex-shrink-0 font-medium pt-px">{label}</span>
                      <span className="text-stone-800 dark:text-stone-100 text-xs font-semibold leading-snug">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── GUEST LIST ── */}
            {guestList.length > 1 && (
              <div className="page-break-avoid">
                <SectionHead>Guest &amp; Passenger Details</SectionHead>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full border-collapse text-xs min-w-[480px]">
                    <thead>
                      <tr className="bg-stone-800 dark:bg-stone-950 text-white text-[10px] uppercase tracking-wider">
                        <th className="px-3 py-2.5 text-center font-semibold w-10">#</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Guest Name</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Nationality</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Category</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Passport No.</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Passport Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guestList.map((g, i) => {
                        const catLabel = g.age_category === 'child_6_11' ? 'Child (6–11)'
                          : g.age_category === 'infant' ? 'Infant / ≤5'
                          : 'Adult (12+)'
                        return (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50 dark:bg-stone-800/50'}>
                            <td className="px-3 py-2.5 text-center text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{i + 1}</td>
                            <td className="px-3 py-2.5 font-semibold text-stone-800 dark:text-stone-100 border border-stone-100 dark:border-stone-700/60">{g.name || '—'}</td>
                            <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{g.nationality || '—'}</td>
                            <td className="px-3 py-2.5 border border-stone-100 dark:border-stone-700/60">
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                g.age_category === 'infant' ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300'
                                : g.age_category === 'child_6_11' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                              }`}>{catLabel}</span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{g.passport_no || '—'}</td>
                            <td className="px-3 py-2.5 text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{g.passport_expiry ? fmtDate(g.passport_expiry) : '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── FLIGHT DETAILS ── */}
            {!isPending && (it.flights || []).length > 0 && (
              <div className="page-break-avoid">
                <SectionHead>Flight Details</SectionHead>
                <div className="overflow-x-auto mt-3">
                <table className="w-full border-collapse text-xs min-w-[520px]">
                  <thead>
                    <tr className="bg-stone-800 dark:bg-stone-950 text-white text-[10px] uppercase tracking-wider">
                      {['Sector', 'Date', 'Flight No.', 'Departs', 'Arrives', 'Airline'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {it.flights.map((f, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50 dark:bg-stone-800/50'}>
                        <td className="px-3 py-2.5 font-semibold text-stone-800 dark:text-stone-100 border border-stone-100 dark:border-stone-700/60">{f.sector || '—'}</td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{f.date ? fmtDate(f.date) : '—'}</td>
                        <td className="px-3 py-2.5 font-mono font-bold border border-stone-100 dark:border-stone-700/60" style={{ color: '#D97706' }}>{f.flight_no || '—'}</td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{f.departs || '—'}</td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{f.arrives || '—'}</td>
                        <td className="px-3 py-2.5 text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{f.airline || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1.5 italic">
                  * Confirm flight schedules directly with the airline. Arise Bhutan is not responsible for schedule changes.
                </p>
              </div>
            )}

            {/* ── DAY-BY-DAY ITINERARY ── */}
            {(it.day_by_day || []).length > 0 && (
              <div>
                <SectionHead>Day-by-Day Itinerary Programme</SectionHead>
                <div className="overflow-x-auto mt-3">
                <table className="w-full border-collapse text-xs min-w-[560px]">
                  <thead>
                    <tr className="bg-stone-800 dark:bg-stone-950 text-white text-[10px] uppercase tracking-wider">
                      <th className="px-3 py-2.5 text-center font-semibold w-10">Day</th>
                      <th className="px-3 py-2.5 text-left font-semibold w-20">Date</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Programme &amp; Activities</th>
                      <th className="px-3 py-2.5 text-left font-semibold w-40">Accommodation</th>
                      <th className="px-3 py-2.5 text-center font-semibold w-20">Meals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {it.day_by_day.map((d, i) => {
                      const meals = parseMeals(d.meals)
                      const lines = (d.programme || '').split('\n').filter(Boolean)
                      return (
                        <tr key={i} className={`page-break-avoid ${i % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50/70 dark:bg-stone-800/50'}`}>
                          <td className="px-3 py-3 text-center font-bold text-stone-800 dark:text-stone-100 border border-stone-100 dark:border-stone-700/60 align-top">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold"
                              style={{ background: 'linear-gradient(135deg, #92400E, #D97706)' }}>
                              {String(d.day ?? i + 1).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60 align-top whitespace-nowrap">
                            {d.date
                              ? new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </td>
                          <td className="px-3 py-3 border border-stone-100 dark:border-stone-700/60 align-top">
                            {lines.length > 0 ? (
                              <>
                                <p className="font-bold text-stone-800 dark:text-stone-100 mb-1">{lines[0]}</p>
                                {lines.slice(1).map((l, li) => (
                                  <p key={li} className="text-stone-500 dark:text-stone-400 text-[10px] flex items-start gap-1">
                                    <span className="text-amber-500 shrink-0 mt-0.5">›</span>{l}
                                  </p>
                                ))}
                              </>
                            ) : (
                              <span className="text-stone-400 dark:text-stone-500 italic">Programme TBC</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60 align-top">
                            {d.accommodation_name || 'N/A'}
                          </td>
                          <td className="px-3 py-3 text-center border border-stone-100 dark:border-stone-700/60 align-top">
                            <div className="flex items-center justify-center gap-0.5 flex-wrap">
                              {meals.map(m => {
                                const colors = { B: '#FEF3C7 #92400E', L: '#D1FAE5 #065F46', D: '#DBEAFE #1E40AF' }
                                const [bg, color] = (colors[m] || '#F3F4F6 #374151').split(' ')
                                return (
                                  <span key={m}
                                    className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded"
                                    style={{ background: bg, color }}>
                                    {m === 'B' ? 'B' : m === 'L' ? 'L' : m === 'D' ? 'D' : m}
                                  </span>
                                )
                              })}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                </div>
                <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1.5">B = Breakfast &nbsp;·&nbsp; L = Lunch &nbsp;·&nbsp; D = Dinner</p>
              </div>
            )}

            {/* ── REQUESTED TRAVEL EXPERIENCES ── */}
            {(tour.travel_interests || []).length > 0 && (
              <div className="page-break-avoid">
                <SectionHead>Requested Travel Experiences</SectionHead>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full border-collapse text-xs min-w-[480px]">
                    <thead>
                      <tr className="text-white text-[10px] uppercase tracking-wider" style={{ background: 'linear-gradient(90deg, #92400E, #D97706)' }}>
                        <th className="px-3 py-2.5 text-left font-semibold">Experience</th>
                        <th className="px-3 py-2.5 text-left font-semibold w-32">Category</th>
                        <th className="px-3 py-2.5 text-right font-semibold w-40">Price Indication</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tour.travel_interests.map((ti, i) => {
                        const isFree = (ti.price_label || ti.priceLabel || '') === 'No Additional Cost' || ti.free === true
                        return (
                          <tr key={i} className={`page-break-avoid ${i % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50 dark:bg-stone-800/50'}`}>
                            <td className="px-3 py-2.5 border border-stone-100 dark:border-stone-700/60">
                              <div className="flex items-center gap-2">
                                {ti.emoji && <span className="text-base">{ti.emoji}</span>}
                                <span className="font-semibold text-stone-800 dark:text-stone-100">{ti.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 border border-stone-100 dark:border-stone-700/60">
                              <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400">
                                {ti.category || '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right border border-stone-100 dark:border-stone-700/60">
                              <span className={`font-bold text-[11px] ${isFree ? 'text-green-600 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                {ti.price_label || ti.priceLabel || '—'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1.5 italic">
                  * Prices are indicative — your Arise Bhutan specialist will confirm exact costs and incorporate these experiences into your itinerary.
                </p>
              </div>
            )}

            {/* ── ACCOMMODATION SCHEDULE ── */}
            {!isPending && (tour.accommodations || []).length > 0 && (
              <div className="page-break-avoid">
                <SectionHead>Accommodation Schedule</SectionHead>
                <div className="overflow-x-auto mt-3">
                <table className="w-full border-collapse text-xs min-w-[600px]">
                  <thead>
                    <tr className="bg-stone-800 dark:bg-stone-950 text-white text-[10px] uppercase tracking-wider">
                      {['Hotel Name', 'Location', 'Category', 'Property Type', 'Check-in', 'Check-out', 'Room'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tour.accommodations.map((a, i) => (
                      <tr key={i} className={`page-break-avoid ${i % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50 dark:bg-stone-800/50'}`}>
                        <td className="px-3 py-2.5 font-semibold text-stone-800 dark:text-stone-100 border border-stone-100 dark:border-stone-700/60">{a.hotel || '—'}</td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{a.city || '—'}</td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{a.tier || '—'}</td>
                        <td className="px-3 py-2.5 text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">Hotel</td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{a.check_in ? fmtDate(a.check_in) : '—'}</td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{a.check_out ? fmtDate(a.check_out) : '—'}</td>
                        <td className="px-3 py-2.5 text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{a.room_type || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1.5 italic">
                  Hotels may be substituted with a property of equal or superior category if unavailability arises. Arise Bhutan will notify you with at least 72 hours notice.
                </p>
              </div>
            )}

            {/* ── COST BREAKDOWN ── */}
            {showPricing && px.grand_total > 0 && (
              <div className="page-break-avoid">
                <SectionHead>Package Cost &amp; Pricing Summary</SectionHead>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-3">
                  {/* Left: itemized breakdown table */}
                  <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 overflow-x-auto">
                    <table className="w-full border-collapse text-xs min-w-[320px]">
                      <thead>
                        <tr className="bg-stone-800 dark:bg-stone-950 text-white text-[10px] uppercase tracking-wider">
                          <th className="px-4 py-2.5 text-left font-semibold">Item</th>
                          <th className="px-4 py-2.5 text-right font-semibold">
                            Amount ({px.is_saarc ? 'INR / Nu.' : 'USD'})
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-700/60">
                        {/* SDF */}
                        {px.sdf_total > 0 && (
                          <tr className="bg-white dark:bg-stone-900">
                            <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">
                              Sustainable Development Fee (SDF)
                              <p className="text-[9px] text-stone-400 dark:text-stone-500">
                                {px.is_saarc
                                  ? `${px.is_saarc && info.nationality === 'India' ? '₹1,200/adult + ₹600/child' : '₹1,200'}/night · Royal Govt. levy`
                                  : `$100/pax/night × ${nights} nights × ${guests} pax`}
                              </p>
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-stone-800 dark:text-stone-100">
                              {currSym}{fmtMoney(px.sdf_total, 0)}
                            </td>
                          </tr>
                        )}

                        {/* Visa */}
                        {px.is_saarc ? (
                          <tr className="bg-stone-50 dark:bg-stone-800/50">
                            <td className="px-4 py-2.5 text-stone-500 dark:text-stone-400">
                              {info.nationality === 'India' ? 'Entry Permit (Visa)' : 'Visa on Arrival'}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">Exempt</td>
                          </tr>
                        ) : px.visa_total > 0 && (
                          <tr className="bg-stone-50 dark:bg-stone-800/50">
                            <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">
                              Visa Processing Fee
                              <p className="text-[9px] text-stone-400 dark:text-stone-500">$40 × {guests} pax</p>
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-stone-800 dark:text-stone-100">
                              ${fmtMoney(px.visa_total, 0)}
                            </td>
                          </tr>
                        )}

                        {/* Service */}
                        {isNewPricingFormat && px.service_total > 0 && (
                          <tr className="bg-white dark:bg-stone-900">
                            <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">
                              Guide, Vehicle, Meals &amp; Service
                              <p className="text-[9px] text-stone-400 dark:text-stone-500">{currSym}{fmtMoney(px.service_rate, 0)}/pax/night × {nights} nights</p>
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-stone-800 dark:text-stone-100">
                              {currSym}{fmtMoney(px.service_total, 0)}
                            </td>
                          </tr>
                        )}

                        {/* Old format package rate */}
                        {!isNewPricingFormat && px.package_rate_per_pax > 0 && (
                          <tr className="bg-white dark:bg-stone-900">
                            <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">Package Rate (per person)</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-stone-800 dark:text-stone-100">
                              ${fmtMoney(Number(px.package_rate_per_pax) * guests, 0)}
                            </td>
                          </tr>
                        )}

                        {/* Entrance Fees */}
                        {px.entrance_total > 0 && (
                          <tr className="bg-stone-50 dark:bg-stone-800/50">
                            <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">Entrance Fees</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-stone-800 dark:text-stone-100">
                              {currSym}{fmtMoney(px.entrance_total, 0)}
                            </td>
                          </tr>
                        )}

                        {/* Special Experiences */}
                        {px.specials_total > 0 && (
                          <tr className="bg-white dark:bg-stone-900">
                            <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">Signature Experiences &amp; Special Meals</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-stone-800 dark:text-stone-100">
                              {currSym}{fmtMoney(px.specials_total, 0)}
                            </td>
                          </tr>
                        )}

                        {/* Flights */}
                        {px.flights_total > 0 && (
                          <tr className="bg-stone-50 dark:bg-stone-800/50">
                            <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">International Flights</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-stone-800 dark:text-stone-100">
                              {currSym}{fmtMoney(px.flights_total, 0)}
                            </td>
                          </tr>
                        )}

                        {/* Wire transfer */}
                        {px.wire_transfer > 0 && (
                          <tr className="bg-white dark:bg-stone-900">
                            <td className="px-4 py-2.5 text-stone-700 dark:text-stone-300">Wire / Bank Transfer Fee</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-stone-800 dark:text-stone-100">
                              {currSym}{fmtMoney(px.wire_transfer, 0)}
                            </td>
                          </tr>
                        )}

                        {/* Package Cost */}
                        <tr className="bg-amber-50 dark:bg-amber-500/10">
                          <td className="px-4 py-2.5 font-bold text-stone-900 dark:text-stone-50">
                            Package Cost
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-stone-900 dark:text-stone-50">
                            {currSym}{fmtMoney(px.package_cost || px.subtotal, 0)}
                          </td>
                        </tr>

                        {/* GST — only on service charge */}
                        {px.gst > 0 && (
                          <tr className="bg-white dark:bg-stone-900">
                            <td className="px-4 py-2.5 text-stone-600 dark:text-stone-400">
                              GST (5%)
                              <p className="text-[9px] text-stone-400 dark:text-stone-500">Applicable on service charge only</p>
                            </td>
                            <td className="px-4 py-2.5 text-right text-stone-700 dark:text-stone-300 font-semibold">
                              {currSym}{fmtMoney(px.gst, 0)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: 'linear-gradient(90deg, #1C1410, #2D1A08)' }}>
                          <td className="px-4 py-3 font-bold text-white text-sm">
                            Grand Total ({px.is_saarc ? 'INR / Nu.' : 'USD'})
                          </td>
                          <td className="px-4 py-3 text-right font-black text-lg" style={{ color: '#F59E0B', fontFamily: 'monospace' }}>
                            {currSym}{fmtMoney(px.grand_total, 0)}
                          </td>
                        </tr>
                        {!px.is_saarc && px.equivalent_inr > 0 && (
                          <tr className="bg-stone-100 dark:bg-stone-700">
                            <td className="px-4 py-2 text-stone-500 dark:text-stone-400 text-[10px]">
                              Approx. equivalent (INR @ ₹{px.inr_rate || '83.5'})
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-stone-700 dark:text-stone-300 text-xs font-bold">
                              ₹{Number(px.equivalent_inr || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </td>
                          </tr>
                        )}
                      </tfoot>
                    </table>
                  </div>

                  {/* Right: payment schedule + pricing notes */}
                  <div className="space-y-4">
                    <div className="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                      <div className="px-4 py-2.5" style={{ background: 'linear-gradient(90deg, #92400E, #D97706)' }}>
                        <p className="text-white text-[10px] font-bold uppercase tracking-widest">Payment Schedule</p>
                      </div>
                      <ul className="divide-y divide-stone-100 dark:divide-stone-700/60">
                        {[
                          '50% deposit to confirm reservation & book flights',
                          'Balance due 60 days before arrival',
                          px.is_saarc ? 'Bank transfer (INR / Nu.)' : 'USD bank transfer or credit card (5% fee)',
                        ].map((t, i) => (
                          <li key={i} className="flex items-start gap-2 px-4 py-2.5 text-xs text-stone-600 dark:text-stone-400">
                            <span className="text-amber-500 shrink-0 mt-0.5">›</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                      <div className="bg-stone-800 dark:bg-stone-950 px-4 py-2.5">
                        <p className="text-white text-[10px] font-bold uppercase tracking-widest">Pricing Notes</p>
                      </div>
                      <ul className="divide-y divide-stone-100 dark:divide-stone-700/60">
                        {[
                          'SDF is mandatory — set by Royal Govt. of Bhutan.',
                          px.is_saarc
                            ? (info.nationality === 'India'
                                ? 'Indian nationals: SDF ₹1,200/adult/night, ₹600/child(6–11)/night. Children ≤5 exempt.'
                                : 'Regional rate applies: SDF ₹1,200/pax/night.')
                            : 'International SDF: $100/pax/night.',
                          'GST (5%) applies on guide, vehicle & meals charge only.',
                          'Quote valid 14 days from issue date.',
                          'Group discounts available for 10+ pax.',
                        ].map((n, i) => (
                          <li key={i} className="flex items-start gap-2 px-4 py-2.5 text-[10px] text-stone-500 dark:text-stone-400">
                            <span className="text-stone-300 dark:text-stone-600 shrink-0">›</span>{n}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PAYMENT OPTIONS (Credit Card + Bank Transfer) ── */}
            {/* Only shown once the itinerary is Quoted or Confirmed — enquiries
                and under-review itineraries have no confirmed price to pay against. */}
            {showPricing && (
              <div className="page-break-avoid">
                <SectionHead>Payment Options</SectionHead>
                <div className="no-print mt-2">
                  <PaymentBadges />
                </div>

                {/* Credit / Debit Card — Bhutan Payments */}
                {it.payment_link && (
                  <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 to-white dark:from-amber-500/10 dark:to-stone-900 overflow-hidden page-break-avoid">
                    <div className="px-5 py-4 sm:flex sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="flex items-center gap-2 font-serif font-bold text-stone-900 dark:text-stone-50 text-sm sm:text-base">
                          <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          Pay via Credit / Debit Card
                        </p>
                        <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 leading-relaxed max-w-md">
                          Credit card payments are processed securely via Bhutan Payments / BNB. International
                          processing fees may apply.
                        </p>
                      </div>
                      <a
                        href={it.payment_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-print mt-3 sm:mt-0 inline-flex items-center gap-2 shrink-0 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-md"
                        style={{ background: 'linear-gradient(135deg, #D97706, #B45309)' }}
                      >
                        <CreditCard className="w-4 h-4" /> Pay via Credit Card
                      </a>
                    </div>
                  </div>
                )}

                <p className="mt-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  {it.payment_link ? 'Or pay by international wire transfer (SWIFT)' : 'International Wire Transfer (SWIFT)'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-2">
                  {/* Local Currency (BTN) Account */}
                  <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                    <div className="bg-stone-800 dark:bg-stone-950 px-4 py-2.5">
                      <p className="text-white text-[10px] font-bold uppercase tracking-widest">Local Currency Account (BTN)</p>
                    </div>
                    <div className="divide-y divide-stone-100 dark:divide-stone-700/60">
                      {[
                        ['Account Holder', 'ARISE TOURS AND TRAVELS'],
                        ['Currency',       'BTN — Bhutanese Ngultrum'],
                        ['Account No.',    '642075256'],
                        ['Bank',           'Bhutan National Bank Ltd. (Paro Branch)'],
                        ['SWIFT Code',     'BNBTBTBT'],
                      ].map(([label, val]) => (
                        <div key={label} className="flex flex-col gap-0.5 px-4 py-2 sm:flex-row sm:gap-0 sm:items-baseline">
                          <span className="text-stone-400 dark:text-stone-500 text-[10px] sm:w-32 sm:flex-shrink-0 font-medium">{label}</span>
                          <span className="text-stone-800 dark:text-stone-100 text-xs font-semibold leading-snug font-mono break-words">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Foreign Currency (USD) Account */}
                  <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                    <div className="px-4 py-2.5" style={{ background: 'linear-gradient(90deg, #92400E, #D97706)' }}>
                      <p className="text-white text-[10px] font-bold uppercase tracking-widest">Foreign Currency Account (USD)</p>
                    </div>
                    <div className="divide-y divide-stone-100 dark:divide-stone-700/60">
                      {[
                        ['Account Holder', 'ARISE TOURS AND TRAVELS'],
                        ['Currency',       'USD — US Dollars'],
                        ['Account No.',    '642075482'],
                        ['Bank',           'Bhutan National Bank Ltd. (Paro Branch)'],
                        ['SWIFT Code',     'BNBTBTBT'],
                      ].map(([label, val]) => (
                        <div key={label} className="flex flex-col gap-0.5 px-4 py-2 sm:flex-row sm:gap-0 sm:items-baseline">
                          <span className="text-stone-400 dark:text-stone-500 text-[10px] sm:w-32 sm:flex-shrink-0 font-medium">{label}</span>
                          <span className="text-stone-800 dark:text-stone-100 text-xs font-semibold leading-snug font-mono break-words">{val}</span>
                        </div>
                      ))}
                      <div className="px-4 py-2.5 bg-stone-50 dark:bg-stone-800/50">
                        <p className="text-stone-400 dark:text-stone-500 text-[10px] font-medium mb-1.5">Intermediary Bank (for USD SWIFT wires)</p>
                        {[
                          ['Bank',        'Standard Chartered Bank, New York'],
                          ['SWIFT Code',  'SCBLUS33'],
                          ['Account No.', '358-202-171-9001'],
                        ].map(([label, val]) => (
                          <div key={label} className="flex flex-col gap-0.5 py-1 sm:flex-row sm:gap-0 sm:items-baseline">
                            <span className="text-stone-400 dark:text-stone-500 text-[10px] sm:w-24 sm:flex-shrink-0 font-medium">{label}</span>
                            <span className="text-stone-700 dark:text-stone-200 text-xs font-semibold leading-snug font-mono break-words">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OUR-fees instruction note */}
                <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-5 py-4 flex items-start gap-3 page-break-avoid">
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-400 font-bold text-xs">!</div>
                  <p className="text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                    <strong>Important:</strong> When initiating your wire transfer, SWIFT Field 71A must be selected as{' '}
                    <strong>&ldquo;OUR&rdquo;</strong> (sender pays all transfer fees) — not SHA or BEN. This ensures the full
                    quoted amount is received by Arise Bhutan without deduction. Transfers received short due to an
                    incorrect fee designation may delay confirmation of your booking.
                  </p>
                </div>
              </div>
            )}

            {/* ── INCLUSIONS & EXCLUSIONS ── */}
            <div className="page-break-avoid">
              <SectionHead>Package Inclusions &amp; Exclusions</SectionHead>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-3">
                <div className="rounded-xl border border-green-200 dark:border-green-500/30 overflow-hidden">
                  <div className="bg-green-700 px-4 py-2.5 flex items-center gap-2">
                    <span className="text-white text-xs font-bold">✓</span>
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">Included in Package</p>
                  </div>
                  <ul className="divide-y divide-green-50 dark:divide-stone-800">
                    {inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 px-4 py-2.5 bg-white dark:bg-stone-900">
                        <span className="text-green-600 dark:text-green-400 shrink-0 mt-0.5 font-bold text-xs">✓</span>
                        <span className="text-stone-700 dark:text-stone-300 text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-red-200 dark:border-red-500/30 overflow-hidden">
                  <div className="bg-red-700 px-4 py-2.5 flex items-center gap-2">
                    <span className="text-white text-xs font-bold">✗</span>
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">Not Included</p>
                  </div>
                  <ul className="divide-y divide-red-50 dark:divide-stone-800">
                    {exclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 px-4 py-2.5 bg-white dark:bg-stone-900">
                        <span className="text-red-500 dark:text-red-400 shrink-0 mt-0.5 font-bold text-xs">✗</span>
                        <span className="text-stone-700 dark:text-stone-300 text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ── CANCELLATION POLICY ── */}
            <div className="page-break-avoid">
              <SectionHead>Cancellation &amp; Refund Policy</SectionHead>
              <div className="overflow-x-auto mt-3">
              <table className="w-full border-collapse text-xs min-w-[360px]">
                <thead>
                  <tr className="bg-stone-800 dark:bg-stone-950 text-white text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-2.5 text-left font-semibold">Cancellation Period</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Refund Terms</th>
                  </tr>
                </thead>
                <tbody>
                  {cancellation.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50 dark:bg-stone-800/50'}>
                      <td className="px-4 py-2.5 font-semibold text-stone-800 dark:text-stone-100 border border-stone-100 dark:border-stone-700/60">{row.period}</td>
                      <td className="px-4 py-2.5 text-stone-600 dark:text-stone-400 border border-stone-100 dark:border-stone-700/60">{row.refund || row.policy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1.5 italic">
                Force majeure events (natural disasters, civil unrest, airline cancellations) handled on a case-by-case basis. Travel insurance strongly recommended.
              </p>
            </div>

            {/* ── ARISE BRAND FOOTER BLOCK ── */}
            <div className="rounded-2xl overflow-hidden page-break-avoid" style={{ background: 'linear-gradient(135deg, #1C1007, #2D1A08)' }}>
              <div className="px-8 py-7">
                <p className="font-serif font-bold text-2xl italic mb-3" style={{ color: '#F59E0B' }}>
                  To Arise is to Awaken.
                </p>
                <p className="text-amber-100/80 text-sm leading-relaxed mb-3">
                  At Arise Bhutan, we believe the finest journey is one that transforms. Each itinerary we craft carries
                  the weight of our founder's conviction — born in the shadows of Paro's fortress walls, refined through
                  seasons of walking Bhutan's ancient trails. We do not simply take you through Bhutan. We introduce you to it.
                </p>
                <p className="text-amber-200/60 text-xs leading-relaxed">
                  Your booking is a promise — of early morning monastery bells, of steaming ema datshi in a farmhouse
                  kitchen, of prayer flags catching the first Himalayan light. We honour this promise with meticulous care,
                  passionate guides, and the quiet confidence of a team that calls this kingdom home. Welcome to Bhutan.
                  Welcome to your awakening.
                </p>
                <div className="flex flex-wrap gap-4 mt-5">
                  {['100% DOT Compliant', 'SDF Directly Remitted', '24/7 In-Country Support', 'Licensed Guides Only'].map(b => (
                    <span key={b} className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <span className="text-amber-500">✓</span> {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── DOCUMENT FOOTER ── */}
          <footer className="border-t border-stone-200 dark:border-stone-700 px-4 sm:px-8 py-5 sm:py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-50 text-sm mb-2">Arise Bhutan Tours &amp; Travels</p>
                <div className="space-y-0.5 text-xs text-stone-500 dark:text-stone-400">
                  <p>DOT License No: 50001567</p>
                  <p>Dept. of Industry, Royal Govt. of Bhutan</p>
                  <p>Nyamaizampa, Paro 12001, Bhutan</p>
                  <p>P.O. Box 1234, Paro 11001</p>
                </div>
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-50 text-sm mb-2">Contact &amp; Support</p>
                <div className="space-y-0.5 text-xs text-stone-500 dark:text-stone-400">
                  <p>📞 +975 77 319 405</p>
                  <p>📞 +61 435 341 033</p>
                  <p>✉ arisebhutan@gmail.com</p>
                  <p>🌐 www.arisebhutan.com</p>

                </div>
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-50 text-sm mb-2">Travel Assurance</p>
                <div className="space-y-0.5 text-xs text-stone-500 dark:text-stone-400">
                  <p>✓ DOT Certified &amp; Licensed</p>
                  <p>✓ SDF Remitted to Royal Govt.</p>
                  <p>✓ All Guides DOT Certified</p>
                  <p>✓ Comprehensive In-Country Support</p>
                  <p>✓ Emergency Evacuation Protocol</p>
                </div>
              </div>
            </div>
            <div className="border-t border-stone-100 dark:border-stone-700/60 mt-5 pt-4 flex items-center justify-between">
              <p className="text-[9px] text-stone-400 dark:text-stone-500 italic">
                This voucher is computer-generated and is valid without a physical signature. Document issued on {fmtDate(it.created_at)}.
              </p>
              <p className="text-[9px] text-stone-400 dark:text-stone-500 font-mono">Ref: {it.booking_reference}</p>
            </div>
          </footer>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-5 no-print">
          Reference: {it.booking_reference} · Issued {fmtDate(it.created_at)}
        </p>
      </div>
    </>
  )
}

// ── Section heading component ─────────────────────────────────
function SectionHead({ children }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-amber-200 dark:bg-amber-500/30" />
      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/30 whitespace-nowrap text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-500/15">
        {children}
      </span>
      <div className="h-px flex-1 bg-amber-200 dark:bg-amber-500/30" />
    </div>
  )
}
