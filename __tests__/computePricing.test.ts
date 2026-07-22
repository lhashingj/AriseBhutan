import { describe, it, expect } from 'vitest'
import { computePricing } from '@/utils/pdfGenerator'

describe('computePricing', () => {
  it('sums package, SDF and service totals into a subtotal, then applies GST', () => {
    const r = computePricing({
      pricePerPerson: 500,
      pax: 2,
      sdfPerPersonPerNight: 100,
      nights: 5,
      serviceFeePerPax: 150,
      gstRate: 0.05,
      inrRate: 83.5,
    })
    expect(r.packageTotal).toBe(1000)   // 500 * 2
    expect(r.sdfTotal).toBe(1000)       // 100 * 5 * 2
    expect(r.serviceTotal).toBe(300)    // 150 * 2
    expect(r.subtotal).toBe(2300)
    expect(r.gst).toBeCloseTo(115)      // 5% of 2300
    expect(r.totalUSD).toBeCloseTo(2415)
    expect(r.totalINR).toBe(Math.round(2415 * 83.5))
  })

  it('defaults serviceFeePerPax to 150 and gstRate to 5% when omitted', () => {
    const r = computePricing({ pricePerPerson: 100, pax: 1, sdfPerPersonPerNight: 100, nights: 1 })
    expect(r.serviceTotal).toBe(150)
    expect(r.gst).toBeCloseTo((100 + 100 + 150) * 0.05)
  })

  it('is a pure function with no side effects', () => {
    const input = { pricePerPerson: 200, pax: 3, sdfPerPersonPerNight: 100, nights: 4 }
    const a = computePricing(input)
    const b = computePricing(input)
    expect(a).toEqual(b)
  })
})
