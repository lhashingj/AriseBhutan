import { Clock } from 'lucide-react'

const SDF_ROWS = [
  { who: 'International visitors — age 13+',  rate: '$100 / person / night' },
  { who: 'International visitors — age 6–12', rate: '$50 / person / night (50% off)' },
  { who: 'International visitors — under 6',  rate: 'Free' },
  { who: 'India',                             rate: '₹1,200 / person / night (age 6–12: ₹600)' },
  { who: 'Bangladesh & Maldives',             rate: '₹1,200 / person / night' },
]

const VISA_ROWS = [
  { who: 'International visitors',            fee: '$40 (one-time)', note: 'Visa clearance arranged by Arise Bhutan through the Tourism Council of Bhutan; stamped on arrival at Paro.' },
  { who: 'India, Bangladesh & Maldives',       fee: 'None',           note: 'Entry Permit only — valid passport or Indian govt.-issued voter ID, no advance visa fee.' },
]

export default function SdfVisaTable() {
  return (
    <section className="py-16 sm:py-20 surface-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-badge">Fees & Costs</span>
          <h2 className="section-title">SDF & Visa Fees — Current Rates</h2>
          <p className="section-subtitle">The Sustainable Development Fee (SDF) and visa costs you&apos;ll actually pay — included and itemized in every Arise Bhutan quote.</p>
        </div>

        <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg mb-4">Sustainable Development Fee (SDF)</h3>
        <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-950/60 text-left text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  <th className="py-3 px-5">Traveler</th>
                  <th className="py-3 px-5">Rate</th>
                </tr>
              </thead>
              <tbody>
                {SDF_ROWS.map((r, i) => (
                  <tr key={r.who} className={i < SDF_ROWS.length - 1 ? 'border-b border-stone-200 dark:border-stone-800' : ''}>
                    <td className="py-3.5 px-5 font-semibold text-stone-800 dark:text-stone-200">{r.who}</td>
                    <td className="py-3.5 px-5 text-amber-700 dark:text-amber-400 font-semibold">{r.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-stone-500 dark:text-stone-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-xl px-4 py-3 mb-10">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p>The discounted $100/night international rate is confirmed by the Royal Government of Bhutan through <strong>August 31, 2027</strong>. After that it is scheduled to revert toward the earlier $200/night rate unless extended — booking before the change locks in today&apos;s lower SDF for your trip.</p>
        </div>

        <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg mb-4">Visa & Entry Fees</h3>
        <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-950/60 text-left text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  <th className="py-3 px-5">Traveler</th>
                  <th className="py-3 px-5">Visa Fee</th>
                  <th className="py-3 px-5">Process</th>
                </tr>
              </thead>
              <tbody>
                {VISA_ROWS.map((r, i) => (
                  <tr key={r.who} className={i < VISA_ROWS.length - 1 ? 'border-b border-stone-200 dark:border-stone-800' : ''}>
                    <td className="py-3.5 px-5 font-semibold text-stone-800 dark:text-stone-200 align-top">{r.who}</td>
                    <td className="py-3.5 px-5 text-amber-700 dark:text-amber-400 font-semibold align-top whitespace-nowrap">{r.fee}</td>
                    <td className="py-3.5 px-5 text-stone-500 dark:text-stone-400 text-xs leading-relaxed">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-3">
          Both fees are itemized in full on every Arise Bhutan quote — no surprise costs on arrival.
        </p>
      </div>
    </section>
  )
}
