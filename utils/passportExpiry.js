/**
 * Passport-expiry warning helpers, shared between the client dashboard
 * and the itineraries list. Bhutan requires passports valid 6+ months
 * beyond travel dates (falls back to 6 months from today when no
 * departure date is known yet).
 */

export function isPassportExpiringSoon(passportExpiry, departureDate) {
  if (!passportExpiry) return false
  const expiry = new Date(passportExpiry)
  if (Number.isNaN(expiry.getTime())) return false
  const reference = departureDate ? new Date(departureDate) : new Date()
  const cutoff = new Date(reference)
  cutoff.setMonth(cutoff.getMonth() + 6)
  return expiry < cutoff
}

export function collectPassportWarnings(itineraries) {
  const warnings = []
  for (const itin of itineraries) {
    const departure = itin.tour_summary?.departure_date
    const people = [
      { name: itin.client_info?.guest_name, expiry: itin.client_info?.passport_expiry },
      ...(itin.tour_summary?.guests || []).map(g => ({ name: g.name, expiry: g.passport_expiry })),
    ]
    for (const p of people) {
      if (p.name && isPassportExpiringSoon(p.expiry, departure)) {
        warnings.push({ ref: itin.booking_reference, name: p.name, expiry: p.expiry })
      }
    }
  }
  return warnings
}
