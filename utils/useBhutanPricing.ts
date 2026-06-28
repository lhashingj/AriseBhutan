import { useMemo } from 'react'

// ─── Regional rate nations ────────────────────────────────────────────────────
// Only India, Bangladesh, and Maldives qualify for the INR 1,200 regional SDF
// rate and are exempt from the advance $40 USD visa fee:
//   • India       — Entry Permit (no visa); adult/12+: Nu.1200/night, child 6-11: Nu.600/night
//   • Bangladesh  — Visa on Arrival; Nu.1200/night
//   • Maldives    — Visa on Arrival; Nu.1200/night
//
// All other SAARC nations (Nepal, Pakistan, Sri Lanka, Afghanistan) pay the
// standard international rate of $100 USD/night + $40 USD visa fee for leisure travel.
const SAARC_NATIONS = new Set([
  'India',
  'Bangladesh',
  'Maldives',
])

// ─── Rate constants ───────────────────────────────────────────────────────────
const SDF_SAARC          = 1_200   // INR / Nu. per person per night
const SDF_INTERNATIONAL  = 100     // USD per person per night
const VISA_FEE_SAARC     = 0       // INR / Nu.
const VISA_FEE_INTL      = 40      // USD

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BhutanPricing {
  /** True when the selected country is a SAARC member state. */
  isSaarc: boolean
  /** Human-readable currency label for display in the UI. */
  currency: string
  /** Sustainable Development Fee per person per night. */
  sdfPerNight: number
  /** One-time visa processing fee. */
  visaFee: number
  /**
   * Total mandatory government fees for the trip.
   * Formula: (sdfPerNight × numberOfNights) + visaFee
   * Uses Math.max(0, nights) so a 0 or negative nights value never returns a
   * negative total.
   */
  totalGovFees: number
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Computes Bhutan government fee breakdown based on the traveller's nationality
 * and trip length. Automatically switches between SAARC and international rates.
 *
 * @param selectedCountry - Country name string from <CountrySelect /> (e.g. "India")
 * @param numberOfNights  - Number of nights in Bhutan (e.g. 6)
 *
 * @example
 * // Inside the PackageBuilder modal (Step 2 – Travel Details):
 *
 * import CountrySelect          from '@/components/CountrySelect'
 * import { useBhutanPricing }   from '@/utils/useBhutanPricing'
 *
 * function TravelDetailsStep() {
 *   const [nationality, setNationality] = useState('')
 *   const [nights, setNights]           = useState(6)
 *
 *   const { isSaarc, currency, sdfPerNight, visaFee, totalGovFees } =
 *     useBhutanPricing(nationality, nights)
 *
 *   return (
 *     <>
 *       <CountrySelect
 *         id="nationality"
 *         value={nationality}
 *         onChange={setNationality}
 *         placeholder="e.g. Indian, British, American"
 *       />
 *
 *       {nationality && (
 *         <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm">
 *           <p className="font-semibold text-amber-900 mb-2">
 *             Government Fees ({currency})
 *           </p>
 *           <div className="space-y-1 text-amber-800">
 *             <div className="flex justify-between">
 *               <span>SDF × {nights} nights</span>
 *               <span>{currency === 'INR / Nu.' ? '₹' : '$'}{(sdfPerNight * nights).toLocaleString()}</span>
 *             </div>
 *             {visaFee > 0 && (
 *               <div className="flex justify-between">
 *                 <span>Visa fee</span>
 *                 <span>${visaFee}</span>
 *               </div>
 *             )}
 *             <div className="flex justify-between font-bold border-t border-amber-200 pt-1 mt-1">
 *               <span>Total gov. fees</span>
 *               <span>{currency === 'INR / Nu.' ? '₹' : '$'}{totalGovFees.toLocaleString()}</span>
 *             </div>
 *           </div>
 *           {isSaarc && (
 *             <p className="mt-2 text-xs text-blue-600">
 *               SAARC regional rate applies — fees are billed in INR / Nu.
 *             </p>
 *           )}
 *         </div>
 *       )}
 *     </>
 *   )
 * }
 */
export function useBhutanPricing(
  selectedCountry: string,
  numberOfNights: number,
): BhutanPricing {
  return useMemo(() => {
    const isSaarc    = SAARC_NATIONS.has(selectedCountry)
    const sdfPerNight = isSaarc ? SDF_SAARC         : SDF_INTERNATIONAL
    const visaFee     = isSaarc ? VISA_FEE_SAARC    : VISA_FEE_INTL
    const currency    = isSaarc ? 'INR / Nu.'        : 'USD ($)'
    const nights      = Math.max(0, Math.floor(numberOfNights))
    const totalGovFees = sdfPerNight * nights + visaFee

    return { isSaarc, currency, sdfPerNight, visaFee, totalGovFees }
  }, [selectedCountry, numberOfNights])
}
