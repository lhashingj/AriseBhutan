import { describe, it, expect } from 'vitest'
import { computePricingDetailed, computePricingV2, computeBalanceDue } from '@/utils/pricingCalculator'

const base = {
  nationality: 'United States',
  nights: 5,
  adultPax: 2,
  child611Pax: 0,
  infantPax: 0,
  serviceRate: 200,
  entranceFeePerPax: 50,
  specialsPerPax: 0,
  flightPerPax: 0,
  includeFlights: false,
  wireTransfer: 0,
}

const baseV2 = {
  nationality: 'United States',
  nights: 5,
  adultPax: 2,
  child611Pax: 0,
  infantPax: 0,
  guideRate: 50,          // per day
  vehicleRate: 40,        // per day
  serviceFeeAmount: 300,  // flat
  mealsAmount: 200,       // flat
  hotelRoomRate: 60,      // per room/night
  hotelRooms: 2,
  entranceFeePerPax: 50,
  specialsPerPax: 0,
  includeFlights: false,
  flightPerPax: 0,
}

describe('computePricingDetailed — international (non-SAARC)', () => {
  it('charges $100/pax/night SDF and $40/pax visa', () => {
    const r = computePricingDetailed(base)
    expect(r.isSaarc).toBe(false)
    expect(r.sdfTotal).toBe(100 * 2 * 5) // 1000
    expect(r.visaTotal).toBe(40 * 2)     // 80
  })

  it('applies 5% GST only to the service charge', () => {
    const r = computePricingDetailed(base)
    // service = 200/pax/night * 2 pax * 5 nights = 2000
    expect(r.svcTotal).toBe(2000)
    expect(r.gst).toBeCloseTo(100) // 5% of 2000
  })

  it('excludes SDF, visa, entrance and flights from GST', () => {
    const r = computePricingDetailed({ ...base, entranceFeePerPax: 999, wireTransfer: 500 })
    // GST must still equal 5% of service only, unaffected by entrance/wire
    expect(r.gst).toBeCloseTo(100)
  })

  it('includes flight cost only when includeFlights is true', () => {
    const withoutFlights = computePricingDetailed({ ...base, flightPerPax: 300 })
    const withFlights    = computePricingDetailed({ ...base, flightPerPax: 300, includeFlights: true })
    expect(withoutFlights.fltTotal).toBe(0)
    expect(withFlights.fltTotal).toBe(300 * 2) // 600
  })

  it('sums pkgCost from all line items plus wire transfer, then adds GST for grandTotal', () => {
    const r = computePricingDetailed({ ...base, wireTransfer: 25 })
    const expectedPkgCost = r.sdfTotal + r.visaTotal + r.svcTotal + r.entrTotal + r.specTotal + r.fltTotal + 25
    expect(r.pkgCost).toBeCloseTo(expectedPkgCost)
    expect(r.grandTotal).toBeCloseTo(r.pkgCost + r.gst)
  })
})

describe('computePricingDetailed — SAARC India', () => {
  it('charges ₹1200/adult/night and ₹600/child(6-11)/night, infants free', () => {
    const r = computePricingDetailed({
      ...base, nationality: 'India', adultPax: 2, child611Pax: 1, infantPax: 1, nights: 4,
    })
    expect(r.isSaarcIndia).toBe(true)
    expect(r.sdfAdult).toBe(1200 * 2 * 4) // 9600
    expect(r.sdfChild).toBe(600 * 1 * 4)  // 2400
    expect(r.sdfTotal).toBe(r.sdfAdult + r.sdfChild)
    expect(r.totalPax).toBe(4) // adults + child + infant
  })

  it('exempts SAARC nationals from the visa fee', () => {
    const r = computePricingDetailed({ ...base, nationality: 'India' })
    expect(r.visaPerPax).toBe(0)
    expect(r.visaTotal).toBe(0)
  })

  it('counts infants and children toward the service charge only via adults+child611', () => {
    const r = computePricingDetailed({
      ...base, nationality: 'India', adultPax: 2, child611Pax: 1, infantPax: 3, serviceRate: 100, nights: 2,
    })
    // svcTotal = rate * (adults + child611) * nights — infants excluded
    expect(r.svcTotal).toBe(100 * (2 + 1) * 2) // 600
  })
})

describe('computePricingDetailed — SAARC Bangladesh/Maldives', () => {
  it('charges a flat ₹1200/pax/night for adults + children combined, visa exempt', () => {
    const r = computePricingDetailed({
      ...base, nationality: 'Bangladesh', adultPax: 2, child611Pax: 2, nights: 3,
    })
    expect(r.isSaarcBdMv).toBe(true)
    expect(r.sdfTotal).toBe(1200 * (2 + 2) * 3) // 14400
    expect(r.visaTotal).toBe(0)
  })
})

describe('computePricingDetailed — edge cases', () => {
  it('treats negative or missing numeric inputs as zero rather than throwing', () => {
    const r = computePricingDetailed({
      nationality: 'United States',
      nights: -3,
      adultPax: -1,
      child611Pax: undefined,
      infantPax: null,
      serviceRate: '',
      entranceFeePerPax: undefined,
      specialsPerPax: undefined,
      flightPerPax: undefined,
      includeFlights: false,
      wireTransfer: undefined,
    })
    expect(r.totalPax).toBe(0)
    expect(r.sdfTotal).toBe(0)
    expect(r.grandTotal).toBe(0)
  })

  it('is a pure function — same input always produces the same output', () => {
    const a = computePricingDetailed(base)
    const b = computePricingDetailed(base)
    expect(a).toEqual(b)
  })
})

describe('computePricingDetailed — SDF/visa manual overrides', () => {
  it('uses the auto-calculated SDF/visa when no override is given', () => {
    const r = computePricingDetailed(base)
    expect(r.isSdfOverridden).toBe(false)
    expect(r.isVisaOverridden).toBe(false)
    expect(r.sdfTotal).toBe(r.sdfAuto)
    expect(r.visaTotal).toBe(r.visaAuto)
  })

  it('overrides SDF total while leaving the auto value visible for reference', () => {
    const r = computePricingDetailed({ ...base, sdfOverride: 0 })
    expect(r.isSdfOverridden).toBe(true)
    expect(r.sdfTotal).toBe(0)
    expect(r.sdfAuto).toBe(100 * 2 * 5) // unchanged auto calculation, 1000
  })

  it('overrides visa total independently of SDF', () => {
    const r = computePricingDetailed({ ...base, visaOverride: 0 })
    expect(r.isVisaOverridden).toBe(true)
    expect(r.visaTotal).toBe(0)
    expect(r.visaAuto).toBe(40 * 2) // unchanged auto calculation, 80
    expect(r.isSdfOverridden).toBe(false)
    expect(r.sdfTotal).toBe(r.sdfAuto)
  })

  it('folds overridden SDF/visa into pkgCost and grandTotal like the auto values would', () => {
    const r = computePricingDetailed({ ...base, sdfOverride: 500, visaOverride: 20 })
    expect(r.pkgCost).toBeCloseTo(500 + 20 + r.svcTotal + r.entrTotal + r.specTotal + r.fltTotal + r.wire)
    expect(r.grandTotal).toBeCloseTo(r.pkgCost + r.gst)
  })
})

describe('computePricingDetailed — ad-hoc extra cost lines', () => {
  it('defaults to an empty breakdown and zero total when no extras are given', () => {
    const r = computePricingDetailed(base)
    expect(r.extrasBreakdown).toEqual([])
    expect(r.extrasTotal).toBe(0)
  })

  it('multiplies per-pax extras by totalPax', () => {
    const r = computePricingDetailed({
      ...base, extraCosts: [{ label: 'Camera permit', amount: 15, perPax: true }],
    })
    expect(r.extrasBreakdown).toEqual([{ label: 'Camera permit', amount: 15, perPax: true, gstApplicable: false, total: 30 }]) // 15 * 2 pax
    expect(r.extrasTotal).toBe(30)
  })

  it('keeps flat extras unaffected by pax count', () => {
    const r = computePricingDetailed({
      ...base, extraCosts: [{ label: 'Generator rental', amount: 75, perPax: false }],
    })
    expect(r.extrasBreakdown[0].total).toBe(75)
    expect(r.extrasTotal).toBe(75)
  })

  it('sums multiple extra lines and folds the total into pkgCost/grandTotal without affecting GST', () => {
    const r = computePricingDetailed({
      ...base,
      extraCosts: [
        { label: 'Camera permit', amount: 15, perPax: true },  // 30
        { label: 'Generator rental', amount: 75, perPax: false }, // 75
      ],
    })
    expect(r.extrasTotal).toBe(105)
    expect(r.pkgCost).toBeCloseTo(r.sdfTotal + r.visaTotal + r.svcTotal + r.entrTotal + r.specTotal + r.fltTotal + r.wire + 105)
    expect(r.grandTotal).toBeCloseTo(r.pkgCost + r.gst)
    expect(r.gst).toBeCloseTo(100) // unchanged — extras are not GST-taxable
  })

  it('treats a missing/blank amount as zero rather than throwing', () => {
    const r = computePricingDetailed({
      ...base, extraCosts: [{ label: 'TBC fee', amount: '', perPax: true }],
    })
    expect(r.extrasBreakdown[0].total).toBe(0)
    expect(r.extrasTotal).toBe(0)
  })
})

describe('computePricingDetailed — per-category GST toggles', () => {
  it('defaults to taxing only the service line, matching historical behaviour', () => {
    const r = computePricingDetailed({ ...base, entranceFeePerPax: 50 })
    expect(r.gstFlags).toEqual({ service: true, entrance: false, specials: false, flights: false, wire: false })
    expect(r.gst).toBeCloseTo(r.svcTotal * 0.05)
  })

  it('taxes an additional fixed category when its flag is enabled', () => {
    const r = computePricingDetailed({
      ...base, entranceFeePerPax: 50,
      gstApplicable: { entrance: true },
    })
    // service (default true) + entrance (explicitly enabled) both taxed
    expect(r.gst).toBeCloseTo((r.svcTotal + r.entrTotal) * 0.05)
  })

  it('can turn GST off entirely by disabling every category', () => {
    const r = computePricingDetailed({
      ...base,
      gstApplicable: { service: false, entrance: false, specials: false, flights: false, wire: false },
    })
    expect(r.gst).toBe(0)
  })

  it('taxes an extra cost line only when that line opts in', () => {
    const untaxed = computePricingDetailed({
      ...base, extraCosts: [{ label: 'Permit', amount: 100, perPax: false, gstApplicable: false }],
    })
    const taxed = computePricingDetailed({
      ...base, extraCosts: [{ label: 'Permit', amount: 100, perPax: false, gstApplicable: true }],
    })
    expect(taxed.gst).toBeCloseTo(untaxed.gst + 100 * 0.05)
  })

  it('folds the configured gst into pkgCost/grandTotal consistently', () => {
    const r = computePricingDetailed({
      ...base, wireTransfer: 50,
      gstApplicable: { service: true, wire: true },
    })
    expect(r.pkgCost).toBeCloseTo(r.sdfTotal + r.visaTotal + r.svcTotal + r.entrTotal + r.specTotal + r.fltTotal + r.wire)
    expect(r.gst).toBeCloseTo((r.svcTotal + r.wire) * 0.05)
    expect(r.grandTotal).toBeCloseTo(r.pkgCost + r.gst)
  })
})

describe('computePricingV2 — new voucher schema', () => {
  it('computes SDF/visa identically to v1 for the same nationality/nights/pax', () => {
    const v1 = computePricingDetailed(base)
    const v2 = computePricingV2(baseV2)
    expect(v2.sdfTotal).toBe(v1.sdfTotal)
    expect(v2.visaTotal).toBe(v1.visaTotal)
    expect(v2.sdfAuto).toBe(v1.sdfAuto)
  })

  it('treats "days" as nights + 1 (standard X days / Y nights convention)', () => {
    const r = computePricingV2(baseV2) // 5 nights
    expect(r.days).toBe(6)
  })

  it('lets admin override guide/vehicle days independently of nights', () => {
    const r = computePricingV2({ ...baseV2, guideVehicleDays: 9 })
    expect(r.days).toBe(9)
    expect(r.isDaysOverridden).toBe(true)
    expect(r.daysAuto).toBe(6) // unchanged auto value, still visible for reference
    expect(r.guideTotal).toBe(50 * 9)
    expect(r.vehicleTotal).toBe(40 * 9)
    // Hotel/SDF/visa are untouched by a guide/vehicle-only override
    expect(r.hotelTotal).toBe(60 * 2 * 5)
  })

  it('lets admin override hotel nights independently of days', () => {
    const r = computePricingV2({ ...baseV2, hotelNights: 3 })
    expect(r.hotelNights).toBe(3)
    expect(r.isNightsOverridden).toBe(true)
    expect(r.nightsAuto).toBe(5)
    expect(r.hotelTotal).toBe(60 * 2 * 3)
    // Guide/vehicle days are untouched by a hotel-only override
    expect(r.days).toBe(6)
  })

  it('supports both overrides at once, independently', () => {
    const r = computePricingV2({ ...baseV2, guideVehicleDays: 9, hotelNights: 3 })
    expect(r.days).toBe(9)
    expect(r.hotelNights).toBe(3)
    expect(r.guideTotal).toBe(50 * 9)
    expect(r.hotelTotal).toBe(60 * 2 * 3)
  })

  it('treats a blank override string as "use auto", not zero', () => {
    const r = computePricingV2({ ...baseV2, guideVehicleDays: '', hotelNights: '' })
    expect(r.isDaysOverridden).toBe(false)
    expect(r.isNightsOverridden).toBe(false)
    expect(r.days).toBe(6)
    expect(r.hotelNights).toBe(5)
  })

  it('charges Guide and Vehicle per day (rate × days), not per pax', () => {
    const r = computePricingV2(baseV2) // days = 6
    expect(r.guideTotal).toBe(50 * 6)   // 300 — unaffected by pax count
    expect(r.vehicleTotal).toBe(40 * 6) // 240

    const morePax = computePricingV2({ ...baseV2, adultPax: 10 })
    expect(morePax.guideTotal).toBe(r.guideTotal)
    expect(morePax.vehicleTotal).toBe(r.vehicleTotal)
  })

  it('charges Service Charge and Meals as flat lump sums, unaffected by pax or nights', () => {
    const r = computePricingV2(baseV2)
    expect(r.serviceFeeTotal).toBe(300)
    expect(r.mealsTotal).toBe(200)

    const bigger = computePricingV2({ ...baseV2, adultPax: 10, nights: 20 })
    expect(bigger.serviceFeeTotal).toBe(300)
    expect(bigger.mealsTotal).toBe(200)
  })

  it('charges Hotel per room/night (rate × rooms × nights)', () => {
    const r = computePricingV2(baseV2) // 2 rooms, 5 nights, $60/room/night
    expect(r.hotelTotal).toBe(60 * 2 * 5) // 600
    expect(r.rooms).toBe(2)
  })

  it('defaults hotelRooms to 0 when not provided rather than throwing', () => {
    const { hotelRooms, ...rest } = baseV2
    const r = computePricingV2(rest)
    expect(r.hotelTotal).toBe(0)
    expect(r.rooms).toBe(0)
  })

  it('has no wire/bank-transfer concept at all', () => {
    const r = computePricingV2(baseV2)
    expect(r.wire).toBeUndefined()
    expect(r.gstFlags.wire).toBeUndefined()
  })

  it('defaults to taxing only the Service Charge/Agency Fee line', () => {
    const r = computePricingV2(baseV2)
    expect(r.gstFlags).toEqual({
      guide: false, vehicle: false, serviceFee: true, meals: false, hotel: false,
      entrance: false, specials: false, flights: false,
    })
    expect(r.gst).toBeCloseTo(r.serviceFeeTotal * 0.05)
  })

  it('taxes any combination of the five split lines when enabled', () => {
    const r = computePricingV2({
      ...baseV2,
      gstApplicable: { guide: true, hotel: true, serviceFee: false },
    })
    expect(r.gst).toBeCloseTo((r.guideTotal + r.hotelTotal) * 0.05)
  })

  it('includes flights only when includeFlights is true, same as v1', () => {
    const without = computePricingV2({ ...baseV2, flightPerPax: 300 })
    const withFlt = computePricingV2({ ...baseV2, flightPerPax: 300, includeFlights: true })
    expect(without.fltTotal).toBe(0)
    expect(withFlt.fltTotal).toBe(300 * 2)
  })

  it('supports the same SDF/visa manual overrides as v1', () => {
    const r = computePricingV2({ ...baseV2, sdfOverride: 0, visaOverride: 20 })
    expect(r.isSdfOverridden).toBe(true)
    expect(r.sdfTotal).toBe(0)
    expect(r.isVisaOverridden).toBe(true)
    expect(r.visaTotal).toBe(20)
    expect(r.sdfAuto).toBeGreaterThan(0) // auto value still visible for reference
  })

  it('supports ad-hoc extra cost lines with independent GST toggles, same as v1', () => {
    const r = computePricingV2({
      ...baseV2,
      extraCosts: [
        { label: 'Camera permit', amount: 15, perPax: true, gstApplicable: true },
        { label: 'Generator rental', amount: 75, perPax: false, gstApplicable: false },
      ],
    })
    expect(r.extrasTotal).toBe(15 * 2 + 75) // 105
    expect(r.gst).toBeCloseTo((r.serviceFeeTotal + 30) * 0.05) // serviceFee (default taxed) + taxed camera permit line (15*2=30)
  })

  it('sums every line into pkgCost and adds GST for grandTotal, with no wire term', () => {
    const r = computePricingV2(baseV2)
    const expectedPkgCost = r.sdfTotal + r.visaTotal
      + r.guideTotal + r.vehicleTotal + r.serviceFeeTotal + r.mealsTotal + r.hotelTotal
      + r.entrTotal + r.specTotal + r.fltTotal
    expect(r.pkgCost).toBeCloseTo(expectedPkgCost)
    expect(r.grandTotal).toBeCloseTo(r.pkgCost + r.gst)
  })
})

describe('computeBalanceDue', () => {
  it('subtracts amount paid from the grand total', () => {
    expect(computeBalanceDue(1000, 300)).toBe(700)
  })

  it('never goes negative when overpaid', () => {
    expect(computeBalanceDue(1000, 1500)).toBe(0)
  })

  it('treats missing/blank amountPaid as zero (nothing paid yet)', () => {
    expect(computeBalanceDue(1000, '')).toBe(1000)
    expect(computeBalanceDue(1000, undefined)).toBe(1000)
  })

  it('treats a missing/blank grandTotal as zero rather than throwing', () => {
    expect(computeBalanceDue(undefined, 100)).toBe(0)
  })
})
