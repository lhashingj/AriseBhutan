import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Arise Bhutan',
  description: 'How Arise Bhutan Tours & Travels collects, uses, and protects your personal information, including passport, payment, and booking data.',
}

const LAST_UPDATED = 'July 30, 2026'

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 mt-10 mb-4">{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">{children}</p>
}
function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2 text-stone-600 dark:text-stone-400 leading-relaxed mb-4">{children}</ul>
}

export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-36 pb-16 sm:pt-44 sm:pb-20 text-white text-center overflow-hidden bg-stone-900">
        <div className="relative z-10 max-w-3xl mx-auto px-5">
          <span className="section-badge text-amber-400">Legal</span>
          <h1 className="font-serif text-[2rem] sm:text-4xl md:text-5xl font-bold mb-4 leading-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-sm">Last updated {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-stone-800 dark:text-stone-200 font-medium">Privacy Policy</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <P>
          Arise Bhutan Tours &amp; Travels (&ldquo;Arise Bhutan,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is a DOT-licensed
          tour operator (Lic. No. 50001567) based in Paro, Kingdom of Bhutan. This policy explains what personal
          information we collect through arisebhutan.com and our booking process, why we collect it, and how we
          protect it — including the passport and payment details a Bhutan tour legally requires us to handle.
        </P>

        <H2>1. Information We Collect</H2>
        <P>We collect information you give us directly, and a small amount collected automatically:</P>
        <Ul>
          <li><strong>Enquiry &amp; quote requests:</strong> name, email, phone/WhatsApp number, travel dates, and trip preferences submitted through our contact, free-quote, or package-builder forms.</li>
          <li><strong>Booking &amp; visa processing:</strong> passport number, nationality, date of birth, and passport scan/photo, which we are required to submit to the Tourism Council of Bhutan (TCB) to obtain your visa clearance and Sustainable Development Fee (SDF) record.</li>
          <li><strong>Payment information:</strong> processed directly by our payment partner, Bhutan Payments (built on Stripe/BNB banking rails). We do not receive or store your full card number, bank login, or wallet credentials — we see only the payment status and amount.</li>
          <li><strong>Client portal account data:</strong> if you create an account to manage a booking, we store your login email, booking history, and any documents you upload (e.g. passport copy, itinerary preferences).</li>
          <li><strong>Newsletter signups:</strong> your email address, if you subscribe to travel tips via the footer form.</li>
          <li><strong>Automatically collected data:</strong> basic, non-identifying analytics (pages visited, general device/browser type, approximate region) via Vercel Analytics and Speed Insights, used to understand site performance — we do not use third-party advertising trackers.</li>
        </Ul>

        <H2>2. How We Use Your Information</H2>
        <Ul>
          <li>To prepare quotes, itineraries, and respond to enquiries</li>
          <li>To submit visa clearance and SDF applications to the Tourism Council of Bhutan on your behalf</li>
          <li>To book hotels, guides, drivers, domestic flights, and helicopter charters included in your package</li>
          <li>To process payments through our licensed payment partner and issue receipts/vouchers</li>
          <li>To send booking confirmations, pre-trip information, and (only if you opt in) travel tips by email</li>
          <li>To improve this website and our services</li>
        </Ul>

        <H2>3. Who We Share Information With</H2>
        <P>We share the minimum information necessary, only with parties directly involved in delivering your trip:</P>
        <Ul>
          <li><strong>Tourism Council of Bhutan (TCB):</strong> passport and trip details, as legally required for every foreign visitor&apos;s visa clearance and SDF record.</li>
          <li><strong>Bhutan Payments / Stripe / partner banks (BNB):</strong> payment processing only — we do not sell or share this data for any other purpose.</li>
          <li><strong>Hotels, licensed guides, drivers, Drukair/Bhutan Airlines, and Royal Bhutan Helicopter Services:</strong> the name and travel-date details needed to hold your reservation.</li>
          <li>We do <strong>not</strong> sell, rent, or trade your personal information to third parties for marketing purposes.</li>
        </Ul>

        <H2>4. Data Retention</H2>
        <P>
          We retain booking and passport records for as long as required by Bhutanese tourism and tax regulations, and for
          the duration of any active client-portal account. Enquiry and newsletter data is kept until you ask us to
          delete it or unsubscribe. You can request deletion at any time — see &ldquo;Your Rights&rdquo; below.
        </P>

        <H2>5. Data Security</H2>
        <P>
          Passport and booking data is stored in an access-controlled database, and all payment handling is delegated to
          our PCI-compliant payment partner rather than processed or stored on our own servers. Access to client records
          is limited to Arise Bhutan staff who need it to plan or support your trip.
        </P>

        <H2>6. Cookies</H2>
        <P>
          We use essential cookies to keep you signed in to the client portal, and privacy-respecting analytics (Vercel
          Analytics, Speed Insights) to see aggregate site usage. These do not build advertising profiles and are not
          shared with ad networks.
        </P>

        <H2>7. Your Rights</H2>
        <P>
          You can ask us to access, correct, or delete the personal information we hold about you, or to unsubscribe
          from marketing emails at any time, by emailing{' '}
          <a href="mailto:arisebhutan@gmail.com" className="text-amber-600 dark:text-amber-400 hover:underline">arisebhutan@gmail.com</a>.
          Note that some records (e.g. visa/SDF submissions) must be retained for the duration required by Bhutanese
          government regulation regardless of a deletion request.
        </P>

        <H2>8. Children&apos;s Privacy</H2>
        <P>
          Our services are intended for adults booking travel, including on behalf of children traveling with them. We
          do not knowingly collect personal information directly from children under 13 outside of the passport details
          a parent or guardian submits as part of a family booking.
        </P>

        <H2>9. International Data Transfer</H2>
        <P>
          As a Bhutan-based operator using international service providers (hosting, payments, analytics), your data
          may be processed in Bhutan, the country where you booked, and the jurisdictions where our providers operate
          (including the United States, via Vercel and Stripe infrastructure).
        </P>

        <H2>10. Changes to This Policy</H2>
        <P>
          We may update this policy as our services or legal obligations change. Material changes will be reflected by
          updating the &ldquo;Last updated&rdquo; date above.
        </P>

        <H2>11. Contact Us</H2>
        <P>
          Questions about this policy or your data? Email{' '}
          <a href="mailto:arisebhutan@gmail.com" className="text-amber-600 dark:text-amber-400 hover:underline">arisebhutan@gmail.com</a>{' '}
          or call/WhatsApp{' '}
          <a href="tel:+97577319405" className="text-amber-600 dark:text-amber-400 hover:underline">+975 77 319 405</a>.
        </P>
      </div>
    </div>
  )
}
