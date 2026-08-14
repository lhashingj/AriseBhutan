/**
 * Itemized itinerary pricing calculator — extracted from the admin
 * itinerary editor so it can be unit tested independently of the
 * React component. Behaviour must stay identical to the inline
 * version previously defined in app/admin/itineraries/page.jsx.
 */

// ── SAARC rate sets ───────────────────────────────────────────
export const SAARC_INDIA_SET = new Set(['India'])
export const SAARC_BD_MV_SET = new Set(['Bangladesh', 'Maldives'])
export const SAARC_ALL_SET   = new Set(['India', 'Bangladesh', 'Maldives'])

// Default GST-applicability per fixed cost category — matches historical
// behaviour (GST charged on the service line only). Admin can flip any of
// these per itinerary.
export const DEFAULT_GST_APPLICABLE = {
  service: true, entrance: false, specials: false, flights: false, wire: false,
}

/**
 * @param {object} params
 * @param {string} params.nationality
 * @param {number} params.nights
 * @param {number} params.adultPax
 * @param {number} params.child611Pax
 * @param {number} params.infantPax
 * @param {number} params.serviceRate
 * @param {number} params.entranceFeePerPax
 * @param {number} params.specialsPerPax
 * @param {number} params.flightPerPax
 * @param {boolean} params.includeFlights
 * @param {number} params.wireTransfer
 * @param {number|null} [params.sdfOverride] - manual SDF total; null/undefined = auto-calculated
 * @param {number|null} [params.visaOverride] - manual visa total; null/undefined = auto-calculated
 * @param {Array<{label: string, amount: number, perPax: boolean, gstApplicable?: boolean}>} [params.extraCosts] - ad-hoc admin-added cost lines
 * @param {{service?: boolean, entrance?: boolean, specials?: boolean, flights?: boolean, wire?: boolean}} [params.gstApplicable] - which fixed categories are GST-taxable
 */
export function computePricingDetailed({
  nationality, nights, adultPax, child611Pax, infantPax,
  serviceRate, entranceFeePerPax, specialsPerPax,
  flightPerPax, includeFlights, wireTransfer,
  sdfOverride = null, visaOverride = null,
  extraCosts = [],
  gstApplicable = DEFAULT_GST_APPLICABLE,
}) {
  const n       = Math.max(0, Math.floor(Number(nights)      || 0))
  const adults  = Math.max(0, Number(adultPax)   || 0)
  const c611    = Math.max(0, Number(child611Pax) || 0)
  const infants = Math.max(0, Number(infantPax)   || 0)
  const totalPax = adults + c611 + infants

  const isSaarcIndia = SAARC_INDIA_SET.has(nationality)
  const isSaarcBdMv  = SAARC_BD_MV_SET.has(nationality)
  const isSaarc      = isSaarcIndia || isSaarcBdMv
  const currency     = isSaarc ? 'INR / Nu.' : 'USD ($)'
  const sym          = isSaarc ? '₹' : '$'

  // SDF — India: adults 1200/night, children 6-11 600/night, infants free
  //        BD/MV: all paying pax 1200/night
  //        International: all pax $100/night
  let sdfAdult = 0, sdfChild = 0, sdfAuto = 0
  if (isSaarcIndia) {
    sdfAdult = 1200 * adults * n
    sdfChild = 600  * c611   * n
    sdfAuto  = sdfAdult + sdfChild
  } else if (isSaarcBdMv) {
    sdfAuto = 1200 * (adults + c611) * n
  } else {
    sdfAuto = 100 * totalPax * n
  }

  // Visa — SAARC exempt (Entry Permit / Visa on Arrival, no advance fee)
  const visaPerPax = isSaarc ? 0 : 40
  const visaAuto   = visaPerPax * totalPax

  // Manual overrides — e.g. a client who already paid SDF/visa themselves,
  // outside this package. null/undefined means "use the auto-calculated value".
  const isSdfOverridden  = sdfOverride  !== null && sdfOverride  !== undefined
  const isVisaOverridden = visaOverride !== null && visaOverride !== undefined
  const sdfTotal  = isSdfOverridden  ? Number(sdfOverride)  || 0 : sdfAuto
  const visaTotal = isVisaOverridden ? Number(visaOverride) || 0 : visaAuto

  // Service (Guide / Vehicle / Meals)
  const svcRate  = Number(serviceRate)       || 0
  const svcTotal = svcRate * (adults + c611) * n

  // Other fixed-category items
  const entrTotal = (Number(entranceFeePerPax) || 0) * totalPax
  const specTotal = (Number(specialsPerPax)    || 0) * totalPax
  const fltTotal  = includeFlights ? (Number(flightPerPax) || 0) * totalPax : 0
  const wire      = Number(wireTransfer) || 0

  // Ad-hoc extra cost lines — each can independently opt into GST
  const extrasBreakdown = (extraCosts || []).map((c) => {
    const rate  = Number(c.amount) || 0
    const total = c.perPax ? rate * totalPax : rate
    return { label: c.label || '', amount: rate, perPax: !!c.perPax, gstApplicable: !!c.gstApplicable, total }
  })
  const extrasTotal = extrasBreakdown.reduce((sum, c) => sum + c.total, 0)

  // GST 5% — only on whichever categories/lines are flagged taxable
  const gstFlags = { ...DEFAULT_GST_APPLICABLE, ...gstApplicable }
  const gstBase =
    (gstFlags.service  ? svcTotal  : 0) +
    (gstFlags.entrance ? entrTotal : 0) +
    (gstFlags.specials ? specTotal : 0) +
    (gstFlags.flights  ? fltTotal  : 0) +
    (gstFlags.wire     ? wire      : 0) +
    extrasBreakdown.filter((c) => c.gstApplicable).reduce((sum, c) => sum + c.total, 0)
  const gst       = gstBase * 0.05
  const pkgCost   = sdfTotal + visaTotal + svcTotal + entrTotal + specTotal + fltTotal + wire + extrasTotal
  const grandTotal = pkgCost + gst

  return {
    isSaarc, isSaarcIndia, isSaarcBdMv, currency, sym,
    sdfAdult, sdfChild, sdfTotal, sdfAuto, isSdfOverridden,
    visaPerPax, visaTotal, visaAuto, isVisaOverridden,
    svcRate, svcTotal,
    entrTotal, specTotal, fltTotal, wire,
    extrasBreakdown, extrasTotal,
    gstFlags, gstBase, gst, pkgCost, grandTotal,
    totalPax, adultsNum: adults, c611Num: c611, infantsNum: infants,
  }
}

// ═══════════════════════════════════════════════════════════════
// v2 pricing schema — new vouchers only (see app/admin/itineraries
// EditDrawer's `isV2Pricing` branch). Kept fully separate from
// computePricingDetailed() above so existing/confirmed vouchers keep
// computing exactly as before, byte-for-byte, forever.
//
// Differences from v1:
//  - No Wire/Bank Transfer line (removed entirely).
//  - The single "Service" rate is split into five independent lines,
//    each with its own calculation basis (not all "per pax/night"):
//      Guide Charge              — per day   (rate × days)
//      Vehicle & Transportation  — per day   (rate × days)
//      Service Charge/Agency Fee — flat lump sum
//      Meals                     — flat lump sum
//      Hotel/Accommodation       — per room/night (rate × rooms × nights)
//    "Days" follows the standard tour convention of nights + 1 (a
//    5-night tour is a 6-day tour — guide/vehicle are engaged every day
//    including arrival/departure, while hotel is billed per night).
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_GST_APPLICABLE_V2 = {
  guide: false, vehicle: false, serviceFee: true, meals: false, hotel: false,
  entrance: false, specials: false, flights: false,
}

// SDF/visa regulatory math is identical to v1 — isolated here so v2 doesn't
// duplicate the raw rate numbers a second time.
function computeSdfVisa({ nationality, nights, adultPax, child611Pax, infantPax, sdfOverride, visaOverride }) {
  const n       = Math.max(0, Math.floor(Number(nights)      || 0))
  const adults  = Math.max(0, Number(adultPax)   || 0)
  const c611    = Math.max(0, Number(child611Pax) || 0)
  const infants = Math.max(0, Number(infantPax)   || 0)
  const totalPax = adults + c611 + infants

  const isSaarcIndia = SAARC_INDIA_SET.has(nationality)
  const isSaarcBdMv  = SAARC_BD_MV_SET.has(nationality)
  const isSaarc      = isSaarcIndia || isSaarcBdMv
  const currency     = isSaarc ? 'INR / Nu.' : 'USD ($)'
  const sym          = isSaarc ? '₹' : '$'

  let sdfAdult = 0, sdfChild = 0, sdfAuto = 0
  if (isSaarcIndia) {
    sdfAdult = 1200 * adults * n
    sdfChild = 600  * c611   * n
    sdfAuto  = sdfAdult + sdfChild
  } else if (isSaarcBdMv) {
    sdfAuto = 1200 * (adults + c611) * n
  } else {
    sdfAuto = 100 * totalPax * n
  }

  const visaPerPax = isSaarc ? 0 : 40
  const visaAuto   = visaPerPax * totalPax

  const isSdfOverridden  = sdfOverride  !== null && sdfOverride  !== undefined
  const isVisaOverridden = visaOverride !== null && visaOverride !== undefined
  const sdfTotal  = isSdfOverridden  ? Number(sdfOverride)  || 0 : sdfAuto
  const visaTotal = isVisaOverridden ? Number(visaOverride) || 0 : visaAuto

  return {
    n, adults, c611, infants, totalPax,
    isSaarc, isSaarcIndia, isSaarcBdMv, currency, sym,
    sdfAdult, sdfChild, sdfTotal, sdfAuto, isSdfOverridden,
    visaPerPax, visaTotal, visaAuto, isVisaOverridden,
  }
}

/**
 * @param {object} params
 * @param {string} params.nationality
 * @param {number} params.nights
 * @param {number} params.adultPax
 * @param {number} params.child611Pax
 * @param {number} params.infantPax
 * @param {number} params.guideRate - per day
 * @param {number} params.vehicleRate - per day
 * @param {number} params.serviceFeeAmount - flat lump sum
 * @param {number} params.mealsAmount - flat lump sum
 * @param {number} params.hotelRoomRate - per room/night
 * @param {number} params.hotelRooms - number of rooms
 * @param {number} params.entranceFeePerPax
 * @param {number} params.specialsPerPax
 * @param {boolean} params.includeFlights
 * @param {number} params.flightPerPax
 * @param {number|null} [params.sdfOverride]
 * @param {number|null} [params.visaOverride]
 * @param {Array<{label: string, amount: number, perPax: boolean, gstApplicable?: boolean}>} [params.extraCosts]
 * @param {{guide?: boolean, vehicle?: boolean, serviceFee?: boolean, meals?: boolean, hotel?: boolean, entrance?: boolean, specials?: boolean, flights?: boolean}} [params.gstApplicable]
 */
export function computePricingV2({
  nationality, nights, adultPax, child611Pax, infantPax,
  guideRate, vehicleRate, serviceFeeAmount, mealsAmount, hotelRoomRate, hotelRooms,
  entranceFeePerPax, specialsPerPax,
  includeFlights, flightPerPax,
  sdfOverride = null, visaOverride = null,
  extraCosts = [],
  gstApplicable = DEFAULT_GST_APPLICABLE_V2,
}) {
  const base = computeSdfVisa({ nationality, nights, adultPax, child611Pax, infantPax, sdfOverride, visaOverride })
  const { n, totalPax, sdfTotal, visaTotal } = base

  // "X days / Y nights" — guide & vehicle are engaged every day of the tour.
  const days  = n + 1
  const rooms = Math.max(0, Number(hotelRooms) || 0)

  const guideTotal      = (Number(guideRate)        || 0) * days
  const vehicleTotal    = (Number(vehicleRate)      || 0) * days
  const serviceFeeTotal =  Number(serviceFeeAmount) || 0
  const mealsTotal      =  Number(mealsAmount)      || 0
  const hotelTotal      = (Number(hotelRoomRate)    || 0) * rooms * n

  const entrTotal = (Number(entranceFeePerPax) || 0) * totalPax
  const specTotal = (Number(specialsPerPax)    || 0) * totalPax
  const fltTotal  = includeFlights ? (Number(flightPerPax) || 0) * totalPax : 0

  const extrasBreakdown = (extraCosts || []).map((c) => {
    const rate  = Number(c.amount) || 0
    const total = c.perPax ? rate * totalPax : rate
    return { label: c.label || '', amount: rate, perPax: !!c.perPax, gstApplicable: !!c.gstApplicable, total }
  })
  const extrasTotal = extrasBreakdown.reduce((sum, c) => sum + c.total, 0)

  const gstFlags = { ...DEFAULT_GST_APPLICABLE_V2, ...gstApplicable }
  const gstBase =
    (gstFlags.guide      ? guideTotal      : 0) +
    (gstFlags.vehicle    ? vehicleTotal    : 0) +
    (gstFlags.serviceFee ? serviceFeeTotal : 0) +
    (gstFlags.meals      ? mealsTotal      : 0) +
    (gstFlags.hotel      ? hotelTotal      : 0) +
    (gstFlags.entrance   ? entrTotal       : 0) +
    (gstFlags.specials   ? specTotal       : 0) +
    (gstFlags.flights    ? fltTotal        : 0) +
    extrasBreakdown.filter((c) => c.gstApplicable).reduce((sum, c) => sum + c.total, 0)
  const gst = gstBase * 0.05

  const pkgCost = sdfTotal + visaTotal
    + guideTotal + vehicleTotal + serviceFeeTotal + mealsTotal + hotelTotal
    + entrTotal + specTotal + fltTotal + extrasTotal
  const grandTotal = pkgCost + gst

  return {
    isSaarc: base.isSaarc, isSaarcIndia: base.isSaarcIndia, isSaarcBdMv: base.isSaarcBdMv,
    currency: base.currency, sym: base.sym,
    sdfAdult: base.sdfAdult, sdfChild: base.sdfChild, sdfTotal, sdfAuto: base.sdfAuto, isSdfOverridden: base.isSdfOverridden,
    visaPerPax: base.visaPerPax, visaTotal, visaAuto: base.visaAuto, isVisaOverridden: base.isVisaOverridden,
    days, rooms,
    guideTotal, vehicleTotal, serviceFeeTotal, mealsTotal, hotelTotal,
    entrTotal, specTotal, fltTotal,
    extrasBreakdown, extrasTotal,
    gstFlags, gstBase, gst, pkgCost, grandTotal,
    totalPax, adultsNum: base.adults, c611Num: base.c611, infantsNum: base.infants,
  }
}
