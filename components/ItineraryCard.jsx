'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronDown, ChevronRight, ExternalLink, BedDouble, Clock, Utensils, MapPin, Mountain, Thermometer } from 'lucide-react'
import { tours } from '@/data/tours'
import TravelDocumentsSection from '@/components/TravelDocumentsSection'
import { parseDayProgramme } from '@/utils/dayProgramme'
import RouteMap from '@/components/RouteMap'
import { getLocationInfo } from '@/data/bhutanLocations'

const STATUS_CFG = {
  enquiry_pending: { label: 'Enquiry',   borderL: 'border-l-rose-400',  badge: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',   dot: 'bg-rose-400' },
  pending_review:  { label: 'In Review', borderL: 'border-l-amber-400', badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200', dot: 'bg-amber-400' },
  quoted:          { label: 'Quoted',    borderL: 'border-l-blue-400',  badge: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',    dot: 'bg-blue-400' },
  confirmed:       { label: 'Confirmed', borderL: 'border-l-green-500', badge: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200', dot: 'bg-green-500' },
}

const MEAL_LABELS = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' }

function parseMeals(raw) {
  if (!raw) return []
  return raw.split(/[,/\s]+/).map(m => m.trim().toUpperCase()).filter(m => m === 'B' || m === 'L' || m === 'D')
}

function DayAccordion({ d, index, open, onToggle, staticDay = null }) {
  const dayNum = d.day ?? index + 1

  const parsed      = parseDayProgramme(d)
  const title       = staticDay?.title       || parsed.title       || `Day ${dayNum}`
  const description = staticDay?.description || parsed.description || null
  const activities  = staticDay?.activities  || parsed.activities  || []
  const accom       = staticDay?.accommodation || d.accommodation_name || null
  const mealStr     = staticDay?.meals        || parseMeals(d.meals).map(m => MEAL_LABELS[m] || m).join(' · ')
  const location    = staticDay?.location     || d.location || null
  const locInfo     = getLocationInfo(location)

  const dateStr = d.date
    ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left"
      >
        {/* D1 badge */}
        <span className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-sm flex items-center justify-center shrink-0">
          D{dayNum}
        </span>

        <div className="flex-1 min-w-0">
          {/* Title + date on same row */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-sm sm:text-base font-semibold text-stone-800 dark:text-stone-100 leading-snug">{title}</p>
            {dateStr && (
              <span className="text-xs text-stone-400 dark:text-stone-500 font-normal shrink-0">{dateStr}</span>
            )}
          </div>
          {(location || locInfo) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {location && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-full px-2 py-0.5">
                  <MapPin className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />{location}
                </span>
              )}
              {locInfo && (
                <>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-full px-2 py-0.5">
                    <Mountain className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />{locInfo.elevation}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-full px-2 py-0.5">
                    <Thermometer className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />{locInfo.tempRange}
                  </span>
                </>
              )}
            </div>
          )}
          {mealStr && <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{mealStr}</p>}
        </div>

        <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 pt-3 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-100 dark:border-stone-800 space-y-4">
          {description && (
            <p className="text-sm sm:text-[15px] text-stone-600 dark:text-stone-400 leading-relaxed text-justify whitespace-pre-line">{description}</p>
          )}

          {activities.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Activities</p>
              <ul className="space-y-1.5">
                {activities.map((a, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accom && (
              <div>
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Accommodation</p>
                <p className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
                  <BedDouble className="w-4 h-4 text-stone-400 shrink-0" />
                  {accom}
                </p>
              </div>
            )}
            {mealStr && (
              <div>
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Meals</p>
                <p className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
                  <Utensils className="w-4 h-4 text-stone-400 shrink-0" />
                  {mealStr}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ItineraryCard({ itin, showDayPlan = true }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [openDayIdxs, setOpenDayIdxs] = useState(() => new Set([0]))

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
  const allDaysExpanded = days.length > 0 && days.every((_, i) => openDayIdxs.has(i))

  function toggleDay(i) {
    setOpenDayIdxs(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }
  function toggleAllDays() {
    setOpenDayIdxs(allDaysExpanded ? new Set() : new Set(days.map((_, i) => i)))
  }

  // Match to static tour for rich day descriptions
  const pkg = name.toLowerCase()
  const matchedTour = tours.find(t =>
    t.title.toLowerCase().includes(pkg) ||
    pkg.includes(t.title.toLowerCase().replace(' tour', '').replace(' trek', ''))
  )

  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 border-l-4 ${s.borderL} overflow-hidden transition-colors duration-300`}>

      {/* ── Main card body ── */}
      <div className="p-5 sm:p-6">

        {/* Header: ref + name + badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            {ref && <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 tracking-widest mb-1">{ref}</p>}
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-50 text-base sm:text-xl leading-snug line-clamp-2 sm:truncate sm:line-clamp-none" title={name}>{name}</h3>
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
                <div key={label} className="bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl px-3 py-2.5 text-center min-w-[64px]">
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">{label}</p>
                  <p className="text-stone-800 dark:text-stone-100 font-bold text-sm sm:text-base mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          {itin.tour_summary?.departure_date && (
            <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <Calendar className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 shrink-0" />
              <span>
                {fmtDate(itin.tour_summary.departure_date)}
                {itin.tour_summary.return_date && <> → {fmtDate(itin.tour_summary.return_date)}</>}
              </span>
            </div>
          )}
        </div>

        {/* Price + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
          <div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-0.5">Grand Total</p>
            {hasPrice
              ? <p className="font-bold text-stone-900 dark:text-stone-50 text-xl sm:text-2xl leading-tight">{currSym}{total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              : <p className="text-sm text-stone-400 dark:text-stone-500 italic">Pricing pending</p>
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
                className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-stone-400 dark:text-stone-500 italic">
              <Clock className="w-4 h-4" /> Being prepared
            </span>
          )}
        </div>
      </div>

      {/* ── Day Plan toggle ── */}
      {showDayPlan && days.length > 0 && (
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-stone-50 dark:bg-stone-950/60 hover:bg-stone-100 dark:hover:bg-stone-800 border-t border-stone-100 dark:border-stone-800 transition-colors text-left"
        >
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Day Plan · {days.length} day{days.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* ── Day Plan content ── */}
      {showDayPlan && open && days.length > 0 && (
        <div className="border-t border-stone-100 dark:border-stone-800 p-4 sm:p-6 space-y-2">
          <div className="flex justify-end">
            <button
              onClick={toggleAllDays}
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors mb-1"
            >
              {allDaysExpanded ? 'Collapse All' : 'Expand All'}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${allDaysExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {days.map((d, i) => {
            const dayNum    = d.day ?? i + 1
            const staticDay = matchedTour?.itinerary?.find(s => s.day === dayNum) || null
            return (
              <DayAccordion
                key={i} d={d} index={i} staticDay={staticDay}
                open={openDayIdxs.has(i)}
                onToggle={() => toggleDay(i)}
              />
            )
          })}
          <RouteMap locations={days.map(d => d.location)} className="pt-2" />
        </div>
      )}

      {/* ── Travel Documents & Clearances ── */}
      {ref && <TravelDocumentsSection bookingId={ref} />}

      {/* ── Requested Experiences ── */}
      {(() => {
        const interests = itin.tour_summary?.travel_interests || []
        if (!interests.length) return null
        return (
          <div className="border-t border-stone-100 dark:border-stone-800 px-4 sm:px-6 py-4">
            <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="w-1 h-4 rounded-full bg-amber-400 inline-block" />
              Requested Experiences · {interests.length}
            </p>
            <div className="flex flex-wrap gap-2">
              {interests.map((ti) => (
                <span
                  key={ti.id}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border ${
                    (ti.price_label || ti.priceLabel || '') !== 'No Additional Cost' && ti.free !== true
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25'
                      : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/25'
                  }`}
                >
                  {ti.emoji ? `${ti.emoji} ` : ''}{ti.name}
                  <span className="text-[10px] opacity-70">· {ti.price_label || ti.priceLabel}</span>
                </span>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-2.5 italic">
              Your specialist will incorporate these into your day-by-day itinerary.
            </p>
          </div>
        )
      })()}
    </div>
  )
}
