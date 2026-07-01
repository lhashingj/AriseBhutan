'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronDown, ChevronRight, ExternalLink, BedDouble, Clock } from 'lucide-react'

const STATUS_CFG = {
  enquiry_pending: { label: 'Enquiry',   borderL: 'border-l-rose-400',  badge: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',   dot: 'bg-rose-400' },
  pending_review:  { label: 'In Review', borderL: 'border-l-amber-400', badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200', dot: 'bg-amber-400' },
  quoted:          { label: 'Quoted',    borderL: 'border-l-blue-400',  badge: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',    dot: 'bg-blue-400' },
  confirmed:       { label: 'Confirmed', borderL: 'border-l-green-500', badge: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200', dot: 'bg-green-500' },
}

function MealPills({ meals }) {
  if (!meals) return null
  const label = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' }
  return (
    <div className="flex items-center gap-1">
      {meals.split(',').map(m => m.trim()).filter(Boolean).map(m => (
        <span key={m} title={label[m] || m}
          className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-md">
          {m}
        </span>
      ))}
    </div>
  )
}

export default function ItineraryCard({ itin, showDayPlan = true }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const s      = STATUS_CFG[itin.status] || STATUS_CFG.pending_review
  const name   = itin.tour_summary?.tour_package || 'Custom Itinerary'
  const nights = itin.tour_summary?.duration_nights
  const guests = itin.tour_summary?.group_size
  const tier   = itin.tour_summary?.hotel_tier
  const total   = Number(itin.pricing?.grand_total || 0)
  const currSym = itin.pricing?.is_saarc ? '₹' : '$'
  const ref     = itin.booking_reference
  const days   = (itin.day_by_day || []).slice().sort((a, b) => (a.day ?? 0) - (b.day ?? 0))
  const hasPrice = total > 0

  const fmtDate  = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtShort = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-stone-100 border-l-4 ${s.borderL} overflow-hidden`}>

      {/* ── Main card body ── */}
      <div className="p-5 sm:p-6">

        {/* Header: ref + name + badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            {ref && <p className="text-[10px] font-mono text-stone-400 tracking-widest mb-1">{ref}</p>}
            <h3 className="font-serif font-bold text-stone-900 text-base sm:text-xl leading-snug line-clamp-2 sm:truncate sm:line-clamp-none" title={name}>{name}</h3>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0 ${s.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>

        {/* Stats + date row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(nights != null || guests || tier) && (
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Nights', value: nights ?? '—' },
                { label: 'Guests', value: guests ?? '—' },
                { label: 'Tier',   value: tier   || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5 text-center min-w-[64px]">
                  <p className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">{label}</p>
                  <p className="text-stone-800 font-bold text-sm sm:text-base mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          {itin.tour_summary?.departure_date && (
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <Calendar className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              <span>
                {fmtDate(itin.tour_summary.departure_date)}
                {itin.tour_summary.return_date && <> → {fmtDate(itin.tour_summary.return_date)}</>}
              </span>
            </div>
          )}
        </div>

        {/* Price + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100">
          <div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-0.5">Grand Total</p>
            {hasPrice
              ? <p className="font-bold text-stone-900 text-xl sm:text-2xl leading-tight">{currSym}{total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              : <p className="text-sm text-stone-400 italic">Pricing pending</p>
            }
          </div>

          {ref ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/itinerary/${ref}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors whitespace-nowrap shadow-sm"
              >
                View Itinerary <ChevronRight className="w-4 h-4" />
              </button>
              <a href={`/itinerary/${ref}`} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-400 hover:text-stone-600 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-stone-400 italic">
              <Clock className="w-4 h-4" /> Being prepared
            </span>
          )}
        </div>
      </div>

      {/* ── Day Plan toggle ── */}
      {showDayPlan && days.length > 0 && (
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-stone-50 hover:bg-stone-100 border-t border-stone-100 transition-colors text-left"
        >
          <span className="text-xs font-semibold text-stone-600 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Day Plan · {days.length} day{days.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* ── Day Plan content ── */}
      {showDayPlan && open && days.length > 0 && (
        <div className="border-t border-stone-100 divide-y divide-stone-50 sm:grid sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
          {days.map((d, i) => {
            const parts      = (d.programme || '').split('·').map(p => p.trim()).filter(Boolean)
            const route      = parts[0] || ''
            const activities = parts.slice(1)
            const dateStr    = d.date ? fmtShort(d.date) : ''

            return (
              <div key={i} className="flex gap-3 px-4 sm:px-6 py-4 border-b border-stone-50 last:border-b-0">

                {/* Day circle */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0 mt-0.5">
                  {d.day ?? i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    <span className="text-xs font-bold text-stone-800">Day {d.day ?? i + 1}</span>
                    {dateStr && <span className="text-[10px] text-stone-400">{dateStr}</span>}
                    <MealPills meals={d.meals} />
                  </div>

                  {/* Route / title */}
                  {route && (
                    <p className="text-xs font-medium text-stone-700 leading-relaxed mb-1">{route}</p>
                  )}

                  {/* Activities */}
                  {activities.length > 0 && (
                    <ul className="space-y-0.5 mb-1.5">
                      {activities.map((a, j) => (
                        <li key={j} className="text-[11px] text-stone-500 flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Accommodation */}
                  {d.accommodation_name && (
                    <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-1">
                      <BedDouble className="w-3 h-3 shrink-0" />
                      {d.accommodation_name}
                    </p>
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
