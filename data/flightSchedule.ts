// Real Drukair (KB) and Bhutan Airlines (B3) schedules to/from Paro (PBH),
// sourced directly from each airline's official published timetable:
//
//   Druk Air  — drukair.com.bt "SCHEDULE FOR PERIOD JULY 2026" (current month)
//   Bhutan Airlines — bhutanairlines.bt "FLIGHT SCHEDULE (15 SEP 2026 – 14 NOV 2026)"
//               (the earliest season published at the time this file was built;
//               Bhutan Airlines does not publish a schedule for Jul–mid-Sep 2026,
//               so this is the closest confirmed/current data available)
//
// Both airlines re-publish schedules seasonally and times can change — reconfirm
// close to departure. Domestic sectors (Bumthang, Yonphula) are Drukair-operated
// puddle-jumpers from Paro.

export type Airline = 'Druk Air (KB)' | 'Bhutan Airlines (B3)'

export interface ScheduledFlight {
  id: string
  flightNo: string
  airline: Airline
  from: string          // airport code, e.g. 'PBH'
  to: string             // airport code, e.g. 'BKK'
  via?: string            // airport code of intermediate stop, same flight no.
  departs: string          // 'HH:MM' 24-hour local time at origin
  arrives: string          // 'HH:MM' 24-hour local time at final destination
  days: number[]            // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
}

export const AIRPORTS: Record<string, string> = {
  PBH: 'Paro',
  BKK: 'Bangkok',
  DEL: 'Delhi',
  CCU: 'Kolkata',
  KTM: 'Kathmandu',
  GAU: 'Guwahati',
  IXB: 'Bagdogra',
  SIN: 'Singapore',
  DAC: 'Dhaka',
  DXB: 'Dubai',
  BUY: 'Bumthang',
  YON: 'Yonphula',
}

export function airportLabel(code: string) {
  const city = AIRPORTS[code]
  return city ? `${city} (${code})` : code
}

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function daysLabel(days: number[]) {
  if (days.length === 7) return 'Daily'
  return [...days].sort().map(d => WEEKDAYS_SHORT[d]).join(', ')
}

export function dayOfWeek(dateStr: string): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T12:00:00')
  return isNaN(d.getTime()) ? null : d.getDay()
}

// ─── Druk Air (KB) — SCHEDULE FOR PERIOD JULY 2026 ─────────────────────────────

const DRUKAIR: ScheduledFlight[] = [
  { id: 'kb141', flightNo: 'KB141', airline: 'Druk Air (KB)', from: 'BKK', to: 'PBH', via: 'GAU', departs: '06:00', arrives: '09:35', days: [1, 5] },
  { id: 'kb130', flightNo: 'KB130', airline: 'Druk Air (KB)', from: 'PBH', to: 'BKK', via: 'IXB', departs: '16:20', arrives: '22:00', days: [1, 5] },
  { id: 'kb200', flightNo: 'KB200', airline: 'Druk Air (KB)', from: 'PBH', to: 'DEL', departs: '09:40', arrives: '11:30', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'kb201', flightNo: 'KB201', airline: 'Druk Air (KB)', from: 'DEL', to: 'PBH', departs: '12:30', arrives: '15:20', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'kb400', flightNo: 'KB400', airline: 'Druk Air (KB)', from: 'PBH', to: 'KTM', departs: '07:10', arrives: '08:10', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'kb401', flightNo: 'KB401', airline: 'Druk Air (KB)', from: 'KTM', to: 'PBH', departs: '09:10', arrives: '10:30', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'kb800-mon', flightNo: 'KB800', airline: 'Druk Air (KB)', from: 'PBH', to: 'DXB', departs: '11:00', arrives: '13:40', days: [1] },
  { id: 'kb800-fri', flightNo: 'KB800', airline: 'Druk Air (KB)', from: 'PBH', to: 'DXB', departs: '11:10', arrives: '13:40', days: [5] },
  { id: 'kb540', flightNo: 'KB540', airline: 'Druk Air (KB)', from: 'PBH', to: 'SIN', via: 'GAU', departs: '07:50', arrives: '15:55', days: [1, 3, 6] },
  { id: 'kb300', flightNo: 'KB300', airline: 'Druk Air (KB)', from: 'PBH', to: 'DAC', departs: '10:30', arrives: '11:30', days: [1, 5] },
  { id: 'kb301', flightNo: 'KB301', airline: 'Druk Air (KB)', from: 'DAC', to: 'PBH', departs: '12:30', arrives: '13:30', days: [1, 5] },
  { id: 'kb210-a', flightNo: 'KB210', airline: 'Druk Air (KB)', from: 'PBH', to: 'CCU', departs: '11:20', arrives: '12:20', days: [1, 5, 6] },
  { id: 'kb210-wed', flightNo: 'KB210', airline: 'Druk Air (KB)', from: 'PBH', to: 'CCU', departs: '11:30', arrives: '12:20', days: [3] },
  { id: 'kb211-a', flightNo: 'KB211', airline: 'Druk Air (KB)', from: 'CCU', to: 'PBH', departs: '13:20', arrives: '15:20', days: [1, 5, 6] },
  { id: 'kb211-wed', flightNo: 'KB211', airline: 'Druk Air (KB)', from: 'CCU', to: 'PBH', departs: '13:20', arrives: '15:00', days: [3] },
  { id: 'kb131', flightNo: 'KB131', airline: 'Druk Air (KB)', from: 'BKK', to: 'PBH', via: 'IXB', departs: '07:30', arrives: '11:00', days: [2, 6] },
  { id: 'kb152', flightNo: 'KB152', airline: 'Druk Air (KB)', from: 'PBH', to: 'BKK', departs: '16:20', arrives: '20:30', days: [2, 3, 6] },
  { id: 'kb801', flightNo: 'KB801', airline: 'Druk Air (KB)', from: 'DXB', to: 'PBH', departs: '04:10', arrives: '11:10', days: [2, 6] },
  { id: 'kb541', flightNo: 'KB541', airline: 'Druk Air (KB)', from: 'SIN', to: 'PBH', via: 'GAU', departs: '12:30', arrives: '16:45', days: [0, 2, 4] },
  { id: 'kb153', flightNo: 'KB153', airline: 'Druk Air (KB)', from: 'BKK', to: 'PBH', departs: '05:00', arrives: '07:15', days: [0, 3, 4] },
  { id: 'kb140', flightNo: 'KB140', airline: 'Druk Air (KB)', from: 'PBH', to: 'BKK', via: 'GAU', departs: '16:20', arrives: '21:50', days: [0, 4] },
  { id: 'kb030', flightNo: 'KB030', airline: 'Druk Air (KB)', from: 'PBH', to: 'YON', departs: '07:15', arrives: '08:00', days: [0, 4] },
  { id: 'kb031', flightNo: 'KB031', airline: 'Druk Air (KB)', from: 'YON', to: 'PBH', departs: '08:40', arrives: '09:25', days: [0, 4] },
  { id: 'kb010', flightNo: 'KB010', airline: 'Druk Air (KB)', from: 'PBH', to: 'BUY', departs: '09:55', arrives: '10:30', days: [0, 4] },
  { id: 'kb011', flightNo: 'KB011', airline: 'Druk Air (KB)', from: 'BUY', to: 'PBH', departs: '11:10', arrives: '11:45', days: [0, 4] },
]

// ─── Bhutan Airlines (B3) — FLIGHT SCHEDULE (15 SEP 2026 – 14 NOV 2026) ────────

const BHUTAN_AIRLINES: ScheduledFlight[] = [
  { id: 'b3701', flightNo: 'B3701', airline: 'Bhutan Airlines (B3)', from: 'BKK', to: 'PBH', via: 'CCU', departs: '06:30', arrives: '09:55', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'b3700', flightNo: 'B3700', airline: 'Bhutan Airlines (B3)', from: 'PBH', to: 'BKK', via: 'CCU', departs: '10:35', arrives: '16:05', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'b3703', flightNo: 'B3703', airline: 'Bhutan Airlines (B3)', from: 'BKK', to: 'PBH', departs: '04:10', arrives: '06:10', days: [1, 4, 6] },
  { id: 'b3702', flightNo: 'B3702', airline: 'Bhutan Airlines (B3)', from: 'PBH', to: 'BKK', departs: '04:10', arrives: '06:10', days: [3, 5, 0] },
  { id: 'b3773', flightNo: 'B3773', airline: 'Bhutan Airlines (B3)', from: 'PBH', to: 'DEL', departs: '10:20', arrives: '12:00', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'b3774', flightNo: 'B3774', airline: 'Bhutan Airlines (B3)', from: 'DEL', to: 'PBH', departs: '13:00', arrives: '15:50', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'b3771', flightNo: 'B3771', airline: 'Bhutan Airlines (B3)', from: 'PBH', to: 'KTM', departs: '06:50', arrives: '07:45', days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'b3772', flightNo: 'B3772', airline: 'Bhutan Airlines (B3)', from: 'KTM', to: 'PBH', departs: '08:25', arrives: '09:40', days: [0, 1, 2, 3, 4, 5, 6] },
]

export const FLIGHT_SCHEDULE: ScheduledFlight[] = [...DRUKAIR, ...BHUTAN_AIRLINES]

export const SCHEDULE_EFFECTIVE = {
  'Druk Air (KB)': 'July 2026',
  'Bhutan Airlines (B3)': '15 Sep – 14 Nov 2026',
}

// ─── helpers ─────────────────────────────────────────────────────────────────

export const ALL_AIRLINES: Airline[] = ['Druk Air (KB)', 'Bhutan Airlines (B3)']

export function sectorLabel(from: string, to: string) {
  return `${airportLabel(from)} → ${airportLabel(to)}`
}

// Recovers { from, to } airport codes from a "City (CODE) → City (CODE)" label,
// e.g. one previously produced by sectorLabel() and stored on a saved itinerary.
export function parseSector(label?: string): { from: string; to: string } | null {
  if (!label) return null
  const m = label.match(/\(([A-Z]{3})\)\s*→\s*.*\(([A-Z]{3})\)/)
  return m ? { from: m[1], to: m[2] } : null
}

export function getSectors(): { from: string; to: string; label: string }[] {
  const seen = new Set<string>()
  const out: { from: string; to: string; label: string }[] = []
  for (const f of FLIGHT_SCHEDULE) {
    const key = `${f.from}-${f.to}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ from: f.from, to: f.to, label: sectorLabel(f.from, f.to) })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}

export function getAirlinesForSector(from: string, to: string): Airline[] {
  const set = new Set<Airline>()
  for (const f of FLIGHT_SCHEDULE) {
    if (f.from === from && f.to === to) set.add(f.airline)
  }
  return Array.from(set)
}

export function getFlightsForSector(from: string, to: string, airline?: Airline): ScheduledFlight[] {
  return FLIGHT_SCHEDULE.filter(f =>
    f.from === from && f.to === to && (!airline || f.airline === airline)
  )
}

// Best match for a given flight number + sector, preferring the variant that
// actually operates on the given date's weekday (falls back to first variant).
export function findFlight(flightNo: string, from: string, to: string, dateStr?: string): ScheduledFlight | undefined {
  const candidates = FLIGHT_SCHEDULE.filter(f => f.flightNo === flightNo && f.from === from && f.to === to)
  if (candidates.length === 0) return undefined
  const dow = dateStr ? dayOfWeek(dateStr) : null
  if (dow !== null) {
    const match = candidates.find(f => f.days.includes(dow))
    if (match) return match
  }
  return candidates[0]
}
