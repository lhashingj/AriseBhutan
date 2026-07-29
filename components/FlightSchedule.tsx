'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, ChevronDown, Info } from 'lucide-react'
import {
  FLIGHT_SCHEDULE, getSectors, getAirlinesForSector, airportLabel, AIRPORTS,
  daysLabel, dayOfWeek, SCHEDULE_EFFECTIVE, type Airline, type ScheduledFlight,
} from '@/data/flightSchedule'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function fmtDateLong(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function FlightRow({ f, showDays }: { f: ScheduledFlight; showDays?: boolean }) {
  return (
    <tr className="border-b border-stone-100 dark:border-stone-800 last:border-0">
      <td className="py-3 px-3 sm:px-4">
        <span className="font-semibold text-stone-800 dark:text-stone-200">{f.flightNo}</span>
        <span className="block text-[11px] text-stone-400 dark:text-stone-500">{f.airline}</span>
      </td>
      <td className="py-3 px-3 sm:px-4 text-stone-700 dark:text-stone-300">{fmtTime(f.departs)}</td>
      <td className="py-3 px-3 sm:px-4 text-stone-500 dark:text-stone-400">
        {f.via ? airportLabel(f.via) : '–'}
      </td>
      <td className="py-3 px-3 sm:px-4 text-stone-700 dark:text-stone-300">{fmtTime(f.arrives)}</td>
      {showDays && (
        <td className="py-3 px-3 sm:px-4 text-stone-500 dark:text-stone-400">{daysLabel(f.days)}</td>
      )}
    </tr>
  )
}

const AIRLINE_PARAM: Record<string, Airline> = {
  druk: 'Druk Air (KB)',
  bhutan: 'Bhutan Airlines (B3)',
}

const HERO_IMAGE: Record<string, string> = {
  'Druk Air (KB)': '/images/drukair-hero.jpg',
  'Bhutan Airlines (B3)': '/images/bhutan-airlines-hero.jpg',
}

export default function FlightSchedule() {
  const searchParams = useSearchParams()
  const filterAirline = AIRLINE_PARAM[searchParams.get('airline') ?? ''] ?? null
  const heroImage = (filterAirline && HERO_IMAGE[filterAirline]) || '/images/flight-schedule-hero.jpg'

  const sectors = useMemo(() => {
    const all = getSectors()
    return filterAirline ? all.filter(s => getAirlinesForSector(s.from, s.to).includes(filterAirline)) : all
  }, [filterAirline])
  const defaultSector = sectors.find(s => s.from === 'BKK' && s.to === 'PBH') ?? sectors[0]

  const [sectorKey, setSectorKey] = useState(`${defaultSector.from}|${defaultSector.to}`)
  const [date, setDate] = useState(todayStr())
  const [sectorMenuOpen, setSectorMenuOpen] = useState(false)
  const sectorMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (sectorMenuRef.current && !sectorMenuRef.current.contains(e.target as Node)) {
        setSectorMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const [from, to] = sectorKey.split('|')
  const allForRoute = useMemo(
    () => FLIGHT_SCHEDULE.filter(f => f.from === from && f.to === to && (!filterAirline || f.airline === filterAirline)),
    [from, to, filterAirline]
  )
  const dow = dayOfWeek(date)
  const onDate = useMemo(
    () => (dow === null ? [] : allForRoute.filter(f => f.days.includes(dow)).sort((a, b) => a.departs.localeCompare(b.departs))),
    [allForRoute, dow]
  )
  const weeklySorted = useMemo(
    () => [...allForRoute].sort((a, b) => a.departs.localeCompare(b.departs)),
    [allForRoute]
  )

  const airlinesOnRoute = Array.from(new Set(allForRoute.map(f => f.airline)))

  return (
    <div className="bg-white dark:bg-stone-950 font-sans transition-colors duration-300">

      {/* ── Hero ── */}
      <section
        className="relative pt-[120px] pb-10 sm:pt-[140px] sm:pb-14 overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-stone-950/90" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase mb-4 block">
            {filterAirline ?? 'Druk Air & Bhutan Airlines'}
          </span>
          <h1 className="font-serif text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] mb-4 max-w-2xl">
            {filterAirline === 'Druk Air (KB)' ? 'Drukair Flight Schedule'
              : filterAirline === 'Bhutan Airlines (B3)' ? 'Bhutan Airlines Flight Schedule'
              : 'Flight Schedule'}
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
            {filterAirline
              ? `Search real ${filterAirline} flight times to and from Paro International Airport to plan your journey to Bhutan.`
              : 'Search real Druk Air (KB) and Bhutan Airlines (B3) flight times to and from Paro International Airport to plan your journey to Bhutan.'}
          </p>

          {/* Search bar */}
          <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-3 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1" ref={sectorMenuRef}>
              <button
                type="button"
                onClick={() => setSectorMenuOpen(o => !o)}
                className="w-full flex items-center justify-between gap-2 bg-white/10 hover:bg-white/15 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors text-left"
              >
                <span className="truncate">{sectors.find(s => s.from === from && s.to === to)?.label ?? 'Select route…'}</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${sectorMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {sectorMenuOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-72 overflow-y-auto bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-2">
                  {sectors.map(s => {
                    const key = `${s.from}|${s.to}`
                    const isSelected = key === sectorKey
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setSectorKey(key); setSectorMenuOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-semibold'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-500/10 dark:hover:text-amber-400'
                        }`}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="sm:w-56 bg-white/10 hover:bg-white/15 focus:bg-white/15 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors [color-scheme:dark]"
            />
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">

        {/* Selected-date results */}
        <section className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors duration-300">
          <div className="px-4 sm:px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2">
            <span className="font-bold text-stone-800 dark:text-stone-200">{airportLabel(from)}</span>
            <ArrowRight className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-stone-800 dark:text-stone-200">{airportLabel(to)}</span>
            <span className="text-stone-400 dark:text-stone-500 text-sm ml-1">{fmtDateLong(date)}</span>
          </div>

          {onDate.length === 0 ? (
            <p className="px-4 sm:px-6 py-6 text-sm text-stone-500 dark:text-stone-400">
              No flights operate on {dow !== null ? WEEKDAYS[dow] + 's' : 'this day'} on this route. See the full weekly schedule below for days of operation.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-950/60 text-left text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    <th className="py-2.5 px-3 sm:px-4">Flight No</th>
                    <th className="py-2.5 px-3 sm:px-4">Depart</th>
                    <th className="py-2.5 px-3 sm:px-4">Layover</th>
                    <th className="py-2.5 px-3 sm:px-4">Arrive</th>
                  </tr>
                </thead>
                <tbody>
                  {onDate.map(f => <FlightRow key={f.id} f={f} />)}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Full weekly schedule for the route */}
        <section className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors duration-300">
          <div className="px-4 sm:px-6 py-4 border-b border-stone-100 dark:border-stone-800">
            <h2 className="font-bold text-stone-800 dark:text-stone-200">Full weekly schedule</h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">All {airportLabel(from)} → {airportLabel(to)} flights, any day of the week.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-950/60 text-left text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  <th className="py-2.5 px-3 sm:px-4">Flight No</th>
                  <th className="py-2.5 px-3 sm:px-4">Depart</th>
                  <th className="py-2.5 px-3 sm:px-4">Layover</th>
                  <th className="py-2.5 px-3 sm:px-4">Arrive</th>
                  <th className="py-2.5 px-3 sm:px-4">Days</th>
                </tr>
              </thead>
              <tbody>
                {weeklySorted.map(f => <FlightRow key={f.id} f={f} showDays />)}
              </tbody>
            </table>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="flex gap-2.5 text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-2xl p-4">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <p>
            Times are local and sourced from each airline&apos;s official published timetable
            {airlinesOnRoute.length > 0 && (
              <> ({airlinesOnRoute.map((a, i) => (
                <span key={a}>{i > 0 ? ', ' : ' '}{a} — effective {SCHEDULE_EFFECTIVE[a]}</span>
              ))})</>
            )}. Schedules are set seasonally and subject to change by the airline — Arise Bhutan reconfirms exact flight times when booking your tickets.
          </p>
        </div>
      </div>
    </div>
  )
}
