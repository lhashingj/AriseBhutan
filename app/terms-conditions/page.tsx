import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Arise Bhutan',
  description: 'Booking terms, payment schedule, and cancellation & refund policy for tours with Arise Bhutan Tours & Travels.',
}

const LAST_UPDATED = 'July 30, 2026'

const CANCELLATION = [
  { period: 'Tour Package — 60+ days before departure',   policy: 'USD $250/person flat fee + bank transfer charges' },
  { period: 'Tour Package — 60–10 days before departure', policy: '45% of package cost retained' },
  { period: 'Tour Package — Under 10 days / No-show',     policy: '100% of package cost retained (non-refundable)' },
  { period: 'Air Ticket — 30+ days before travel',        policy: '75% refund' },
  { period: 'Air Ticket — 10–30 days before travel',      policy: '50% refund' },
  { period: 'Air Ticket — Under 4 days before travel',    policy: '25% refund' },
  { period: 'Air Ticket — Within 4 days / No-show',       policy: 'Non-refundable' },
]

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 mt-10 mb-4">{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">{children}</p>
}
function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 text-stone-600 dark:text-stone-400 leading-relaxed mb-4">{children}</ul>
}

export default function TermsConditionsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-36 pb-16 sm:pt-44 sm:pb-20 text-white text-center overflow-hidden bg-stone-900">
        <div className="relative z-10 max-w-3xl mx-auto px-5">
          <span className="section-badge text-amber-400">Legal</span>
          <h1 className="font-serif text-[2rem] sm:text-4xl md:text-5xl font-bold mb-4 leading-tight text-white">
            Terms &amp; Conditions
          </h1>
          <p className="text-white/70 text-sm">Last updated {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-stone-800 dark:text-stone-200 font-medium">Terms &amp; Conditions</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <P>
          These Terms &amp; Conditions govern every booking made with Arise Bhutan Tours &amp; Travels, a DOT-licensed
          tour operator (Lic. No. 50001567) based in Paro, Kingdom of Bhutan. By paying a deposit or confirming a
          booking with us, you accept these terms.
        </P>

        <H2>1. Booking &amp; Visa Process</H2>
        <P>
          All Bhutan tourist visas must be arranged by a licensed Bhutanese tour operator — Arise Bhutan submits your
          visa clearance application to the Tourism Council of Bhutan (TCB) on your behalf once your booking is
          confirmed and passport details are provided. We recommend finalizing bookings at least 3 weeks before travel.
        </P>

        <H2>2. Payment Schedule</H2>
        <Ul>
          <li>50% deposit to confirm your booking — this secures your flights and hotel rooms</li>
          <li>Remaining 50% due within 60 days of arrival — this covers your Sustainable Development Fee (SDF) and starts visa processing</li>
          <li>Payment by bank transfer, or credit/debit card (a processing fee applies to card payments); SAARC nationals may pay by bank transfer in INR/Nu.</li>
        </Ul>

        <H2>3. Cancellation &amp; Refund Policy</H2>
        <P>Tour packages and air tickets are refunded separately, according to how close to departure you cancel:</P>
        <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-950/60 text-left text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  <th className="py-3 px-5">Cancellation Period</th>
                  <th className="py-3 px-5">Policy</th>
                </tr>
              </thead>
              <tbody>
                {CANCELLATION.map((r, i) => (
                  <tr key={r.period} className={i < CANCELLATION.length - 1 ? 'border-b border-stone-200 dark:border-stone-800' : ''}>
                    <td className="py-3.5 px-5 font-semibold text-stone-800 dark:text-stone-200">{r.period}</td>
                    <td className="py-3.5 px-5 text-stone-600 dark:text-stone-400">{r.policy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <P>
          Flight reschedules requested less than 72 hours before departure incur a USD $50 fee per change (waived for
          Business Class tickets). All cancellations must be submitted in writing to{' '}
          <a href="mailto:arisebhutan@gmail.com" className="text-amber-600 dark:text-amber-400 hover:underline">arisebhutan@gmail.com</a>.
        </P>

        <H2>4. What&apos;s Included / Not Included</H2>
        <P>
          Standard inclusions and exclusions are itemized on every tour page and quote — they typically include
          accommodation, a licensed English-speaking guide, private vehicle and driver, the SDF, monument/dzong entry
          fees, meals as per itinerary, and international flights (economy class). Personal expenses, gratuities, and
          travel/medical insurance are not included. Exact inclusions for your trip are confirmed in your itinerary and voucher.
        </P>

        <H2>5. Travel Insurance</H2>
        <P>
          We strongly recommend comprehensive travel and medical insurance covering trip cancellation, medical
          evacuation, and high-altitude activity for the duration of your trip. Arise Bhutan is not responsible for
          costs arising from a traveler&apos;s failure to obtain adequate insurance.
        </P>

        <H2>6. Traveler Responsibilities</H2>
        <Ul>
          <li>A passport valid for at least 6 months beyond your travel dates</li>
          <li>Accurate passport and personal details submitted in time for visa processing</li>
          <li>Reasonable fitness for the itinerary&apos;s activities (e.g. altitude, trekking) — please tell us about any medical conditions before booking</li>
          <li>Compliance with Bhutanese law and your guide&apos;s safety instructions while in-country</li>
        </Ul>

        <H2>7. Force Majeure</H2>
        <P>
          Arise Bhutan is not liable for delays, changes, or cancellations caused by events beyond our reasonable
          control — including but not limited to severe weather, flight cancellations, natural disasters, government
          travel restrictions, or civil unrest. Where possible we will help rearrange your itinerary; refunds for
          third-party costs (e.g. flights) follow that provider&apos;s own policy.
        </P>

        <H2>8. Liability</H2>
        <P>
          Arise Bhutan arranges accommodation, transport, guiding, and activities through licensed and vetted local
          partners, but is not liable for injury, loss, or damage arising from the independent acts of these
          third-party providers, or from circumstances outside our control. Nothing in these terms excludes liability
          that cannot be excluded under Bhutanese law.
        </P>

        <H2>9. Website Content &amp; Intellectual Property</H2>
        <P>
          All text, photography, and itineraries on arisebhutan.com are the property of Arise Bhutan Tours &amp;
          Travels unless otherwise credited, and may not be reproduced without permission.
        </P>

        <H2>10. Governing Law</H2>
        <P>
          These terms are governed by the laws of the Kingdom of Bhutan. Any dispute arising from a booking with Arise
          Bhutan Tours &amp; Travels is subject to the jurisdiction of the courts of Bhutan.
        </P>

        <H2>11. Changes to These Terms</H2>
        <P>
          We may update these terms from time to time; the version in force at the time you confirm a booking applies
          to that booking. Material changes will be reflected by updating the &ldquo;Last updated&rdquo; date above.
        </P>

        <H2>12. Contact Us</H2>
        <P>
          Questions about these terms? Email{' '}
          <a href="mailto:arisebhutan@gmail.com" className="text-amber-600 dark:text-amber-400 hover:underline">arisebhutan@gmail.com</a>{' '}
          or call/WhatsApp{' '}
          <a href="tel:+97577319405" className="text-amber-600 dark:text-amber-400 hover:underline">+975 77 319 405</a>. See also our{' '}
          <Link href="/privacy-policy" className="text-amber-600 dark:text-amber-400 hover:underline">Privacy Policy</Link>.
        </P>
      </div>
    </div>
  )
}
