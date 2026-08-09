import { describe, it, expect } from 'vitest'
import { computePricingDetailed } from '@/utils/pricingCalculator'

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
