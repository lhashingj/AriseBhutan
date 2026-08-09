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
 */
export function computePricingDetailed({
  nationality, nights, adultPax, child611Pax, infantPax,
  serviceRate, entranceFeePerPax, specialsPerPax,
  flightPerPax, includeFlights, wireTransfer,
  sdfOverride = null, visaOverride = null,
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

  // Service (Guide / Vehicle / Meals) — GST applies ONLY to this
  const svcRate  = Number(serviceRate)       || 0
  const svcTotal = svcRate * (adults + c611) * n

  // Other items (no GST)
  const entrTotal = (Number(entranceFeePerPax) || 0) * totalPax
  const specTotal = (Number(specialsPerPax)    || 0) * totalPax
  const fltTotal  = includeFlights ? (Number(flightPerPax) || 0) * totalPax : 0
  const wire      = Number(wireTransfer) || 0

  // GST 5% — on service charge only (not SDF, not visa, not entrance, not flights)
  const gst       = svcTotal * 0.05
  const pkgCost   = sdfTotal + visaTotal + svcTotal + entrTotal + specTotal + fltTotal + wire
  const grandTotal = pkgCost + gst

  return {
    isSaarc, isSaarcIndia, isSaarcBdMv, currency, sym,
    sdfAdult, sdfChild, sdfTotal, sdfAuto, isSdfOverridden,
    visaPerPax, visaTotal, visaAuto, isVisaOverridden,
    svcRate, svcTotal,
    entrTotal, specTotal, fltTotal, wire,
    gst, pkgCost, grandTotal,
    totalPax, adultsNum: adults, c611Num: c611, infantsNum: infants,
  }
}
