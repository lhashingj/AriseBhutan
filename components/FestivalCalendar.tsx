'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { allEvents2026, type FestivalEvent } from '@/data/bhutanEvents2026'
import { allEvents2027 } from '@/data/bhutanEvents2027'
import { BHUTANESE_DAY_MAP } from '@/data/bhutaneseDayMap'

// ─── constants ───────────────────────────────────────────────────────────────

const ALL_EVENTS = [...allEvents2026, ...allEvents2027]
const MIN_YEAR = 2026
const MAX_YEAR = 2027
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const LEGEND = [
  { label: 'Public Holiday', color: '#16A34A' },
  { label: 'Punakha',        color: '#3B82F6' },
  { label: 'Paro',           color: '#D97706' },
  { label: 'Thimphu',        color: '#7C3AED' },
  { label: 'Bumthang',       color: '#0D9488' },
  { label: 'East Bhutan',    color: '#EA580C' },
  { label: 'Phobjikha',      color: '#0EA5E9' },
  { label: 'Other',          color: '#E11D48' },
]

// ─── helpers ─────────────────────────────────────────────────────────────────

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const TIB_DIGITS = ['༠','༡','༢','༣','༤','༥','༦','༧','༨','༩']
function toTibetanNumeral(n: number): string {
  return String(n).split('').map(d => TIB_DIGITS[Number(d)]).join('')
}

function buildDateMap() {
  const map = new Map<string, { event: FestivalEvent; position: 'single' | 'start' | 'mid' | 'end' }[]>()

  for (const event of ALL_EVENTS) {
    const cur = new Date(event.start + 'T12:00:00')
    const end = new Date(event.end + 'T12:00:00')
    const isSingle = event.start === event.end

    while (cur <= end) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])

      const pos = isSingle ? 'single'
        : key === event.start ? 'start'
        : key === event.end   ? 'end'
        : 'mid'

      map.get(key)!.push({ event, position: pos })
      cur.setDate(cur.getDate() + 1)
    }
  }
  return map
}

const DATE_MAP = buildDateMap()

function getGridDays(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const prevTotal = new Date(year, month, 0).getDate()

  const cells: { dateStr: string; day: number; isCurrentMonth: boolean }[] = []

  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevTotal - i
    const m = month === 0 ? 11 : month - 1
    const y = month === 0 ? year - 1 : year
    cells.push({ dateStr: toKey(y, m, d), day: d, isCurrentMonth: false })
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ dateStr: toKey(year, month, d), day: d, isCurrentMonth: true })
  }
  const trailing = 42 - cells.length
  for (let d = 1; d <= trailing; d++) {
    const m = month === 11 ? 0 : month + 1
    const y = month === 11 ? year + 1 : year
    cells.push({ dateStr: toKey(y, m, d), day: d, isCurrentMonth: false })
  }
  return cells
}

function getMonthEvents(year: number, month: number): FestivalEvent[] {
  const seen = new Set<string>()
  const rangeStart = new Date(year, month, 1)
  const rangeEnd = new Date(year, month + 1, 0)
  return ALL_EVENTS
    .filter(ev => {
      if (seen.has(ev.id)) return false
      const s = new Date(ev.start + 'T12:00:00')
      const e = new Date(ev.end + 'T12:00:00')
      if (s <= rangeEnd && e >= rangeStart) { seen.add(ev.id); return true }
      return false
    })
    .sort((a, b) => a.start.localeCompare(b.start))
}

function fmtRange(ev: FestivalEvent) {
  const s = new Date(ev.start + 'T12:00:00')
  const e = new Date(ev.end + 'T12:00:00')
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (ev.start === ev.end) return s.toLocaleDateString('en-US', opts)
  if (s.getMonth() === e.getMonth()) return `${s.toLocaleDateString('en-US', opts)}–${e.getDate()}`
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`
}

function fmtFullDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

const TODAY = new Date().toISOString().slice(0, 10)
const MAX_BARS = 3

// ─── component ───────────────────────────────────────────────────────────────

function getDefaultYearMonth() {
  const now = new Date()
  const y = now.getFullYear()
  return (y >= MIN_YEAR && y <= MAX_YEAR) ? { year: y, month: now.getMonth() } : { year: MIN_YEAR, month: 0 }
}

const DEFAULT_YEAR_MONTH = getDefaultYearMonth()

export default function FestivalCalendar() {
  const [year, setYear]   = useState(DEFAULT_YEAR_MONTH.year)   // default to current year (if in range)
  const [month, setMonth] = useState(DEFAULT_YEAR_MONTH.month)  // default to current month
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const gridDays    = useMemo(() => getGridDays(year, month),    [year, month])
  const monthEvents = useMemo(() => getMonthEvents(year, month), [year, month])
  const selectedEvents = selectedDate ? (DATE_MAP.get(selectedDate) ?? []) : []

  const prevMonth = () => {
    setSelectedDate(null)
    if (month === 0) {
      if (year - 1 >= MIN_YEAR) { setYear(y => y - 1); setMonth(11) }
    } else {
      setMonth(m => m - 1)
    }
  }
  const nextMonth = () => {
    setSelectedDate(null)
    if (month === 11) {
      if (year + 1 <= MAX_YEAR) { setYear(y => y + 1); setMonth(0) }
    } else {
      setMonth(m => m + 1)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 font-sans transition-colors duration-300">

      {/* ── Header ── */}
      <header className="bg-amber-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-[60px] pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8">
          <div>
            <p className="text-amber-200 text-xs tracking-widest uppercase mb-1.5">འབྲུག་གི་དུས་ཆེན་ལོ་ཐོ།</p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">Bhutan Festival & Holiday Calendar 2026–2027</h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={prevMonth} aria-label="Previous month"
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-base sm:text-lg font-semibold w-44 text-center select-none">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} aria-label="Next month"
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-5 flex flex-col lg:flex-row gap-4">

        {/* ── Calendar grid ── */}
        <div className="flex-1 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-gray-200 dark:border-stone-800 overflow-hidden transition-colors duration-300">

          {/* Weekday strip */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60">
            {WEEKDAYS.map((w, i) => (
              <div key={w}
                className={`py-2.5 text-center text-xs font-bold uppercase tracking-wider ${
                  i === 0 || i === 6 ? 'text-red-400' : 'text-gray-400 dark:text-stone-500'
                }`}>
                {w}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-stone-800">
            {gridDays.map((cell, idx) => {
              const dayEvents   = cell.isCurrentMonth ? (DATE_MAP.get(cell.dateStr) ?? []) : []
              const isToday     = cell.dateStr === TODAY
              const isSunday    = idx % 7 === 0
              const isSaturday  = idx % 7 === 6
              const isSelected  = selectedDate === cell.dateStr && cell.isCurrentMonth
              const visibleBars = dayEvents.slice(0, MAX_BARS)
              const extra       = dayEvents.length - MAX_BARS
              const bhutaneseDay = BHUTANESE_DAY_MAP[cell.dateStr]

              return (
                <div
                  key={cell.dateStr + idx}
                  onClick={() => {
                    if (cell.isCurrentMonth)
                      setSelectedDate(prev => prev === cell.dateStr ? null : cell.dateStr)
                  }}
                  className={`relative min-h-[78px] sm:min-h-[108px] flex flex-col transition-colors ${
                    !cell.isCurrentMonth ? 'bg-stone-50/70 dark:bg-stone-950/50 cursor-default'
                    : isSelected         ? 'bg-amber-50 dark:bg-amber-500/10 cursor-pointer'
                    : isToday            ? 'bg-amber-50/60 dark:bg-amber-500/5 cursor-pointer'
                    :                      'hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer'
                  }`}
                >
                  {/* Day number */}
                  <div className="flex items-start justify-between px-1.5 pt-1.5 pb-0.5">
                    {bhutaneseDay && (
                      <span className="flex flex-col items-start leading-none mt-0.5 select-none">
                        <span className={`text-[11px] sm:text-xs font-medium ${
                          !cell.isCurrentMonth ? 'text-red-200 dark:text-red-900/40' : 'text-red-400 dark:text-red-400/70'
                        }`}>
                          {toTibetanNumeral(bhutaneseDay[0])}
                        </span>
                        <span className={`text-[7px] sm:text-[8px] leading-none ${
                          !cell.isCurrentMonth ? 'text-gray-200 dark:text-stone-800' : 'text-gray-300 dark:text-stone-600'
                        }`}>
                          {bhutaneseDay[0]}
                        </span>
                      </span>
                    )}
                    <span className={`text-xs sm:text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full leading-none ${
                      !cell.isCurrentMonth  ? 'text-gray-300 dark:text-stone-700'
                      : isToday             ? 'bg-amber-600 text-white'
                      : isSelected          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      : (isSunday || isSaturday) ? 'text-red-400'
                      : 'text-gray-700 dark:text-stone-300'
                    }`}>
                      {cell.day}
                    </span>
                  </div>

                  {/* Event bars */}
                  {cell.isCurrentMonth && (
                    <div className="flex flex-col gap-px mt-0.5 pb-1">
                      {visibleBars.map(({ event, position }, barIdx) => {
                        const isRowStart = position === 'start' || position === 'single' || isSunday
                        const isRowEnd   = position === 'end'   || position === 'single' || isSaturday

                        // Inline styles for spanning bars — Tailwind can't do dynamic negative margins
                        const style: React.CSSProperties =
                          isRowStart && isRowEnd
                            ? { backgroundColor: event.color, marginLeft: 4, marginRight: 4, borderRadius: 4 }
                          : isRowStart
                            ? { backgroundColor: event.color, marginLeft: 4, marginRight: -1, borderRadius: '4px 0 0 4px' }
                          : isRowEnd
                            ? { backgroundColor: event.color, marginLeft: -1, marginRight: 4, borderRadius: '0 4px 4px 0' }
                          : { backgroundColor: event.color, marginLeft: -1, marginRight: -1 }

                        return (
                          <div key={event.id + barIdx} style={style}
                            className="h-[14px] sm:h-4 overflow-hidden flex items-center">
                            {isRowStart && (
                              <span className="text-white text-[8px] sm:text-[10px] font-semibold leading-none px-1.5 truncate block w-full">
                                {event.title}
                              </span>
                            )}
                          </div>
                        )
                      })}
                      {extra > 0 && (
                        <p className="text-[8px] sm:text-[9px] font-semibold text-amber-600 px-2">
                          +{extra} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:w-64 xl:w-72 flex flex-col gap-3">

          {/* Legend */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-gray-200 dark:border-stone-800 p-4 transition-colors duration-300">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-wider mb-3">Legend</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {LEGEND.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-600 dark:text-stone-400 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected date detail */}
          {selectedDate && selectedEvents.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-2xl p-4 transition-colors duration-300">
              <h3 className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
                {fmtFullDate(selectedDate)}
              </h3>
              <div className="flex flex-col gap-3">
                {selectedEvents.map(({ event }) => (
                  <div key={event.id} className="flex gap-2.5">
                    <span className="w-1 rounded-full flex-shrink-0 self-stretch"
                      style={{ backgroundColor: event.color }} />
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-stone-200 leading-snug">{event.title}</p>
                      {event.location && (
                        <p className="text-[10px] text-gray-500 dark:text-stone-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{event.location}
                        </p>
                      )}
                      <span className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white mt-1.5"
                        style={{ backgroundColor: event.color }}>
                        {event.type === 'holiday' ? 'Public Holiday' : 'Festival'}
                      </span>
                      {event.bhutaneseDate && (
                        <p className="text-[10px] text-gray-500 dark:text-stone-400 mt-1">
                          Bhutanese Date: {event.bhutaneseDate}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-[11px] text-gray-600 dark:text-stone-400 leading-relaxed mt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Month event list */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-gray-200 dark:border-stone-800 p-4 flex-1 transition-colors duration-300">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-stone-500 uppercase tracking-wider mb-3">
              {MONTHS[month]} {year} Events
            </h3>

            {monthEvents.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-stone-500 italic">No events this month.</p>
            ) : (
              <div className="flex flex-col">
                {monthEvents.map((ev, i) => (
                  <div key={ev.id}
                    className={`flex gap-2.5 py-2.5 ${i < monthEvents.length - 1 ? 'border-b border-gray-100 dark:border-stone-800' : ''}`}>
                    <span className="w-0.5 rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: ev.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-stone-200 leading-snug">{ev.title}</p>
                      <p className="text-[10px] font-semibold mt-0.5" style={{ color: ev.color }}>
                        {fmtRange(ev)}
                      </p>
                      {ev.location && (
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{ev.location}
                        </p>
                      )}
                    </div>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white self-start mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: ev.color }}>
                      {ev.type === 'holiday' ? 'PH' : 'F'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
