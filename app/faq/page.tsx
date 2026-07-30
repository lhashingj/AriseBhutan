import FaqSection from '@/components/FaqSection'
import SdfVisaTable from '@/components/SdfVisaTable'
import Link from 'next/link'
import type { Metadata } from 'next'
import { faqs } from '@/data/bhutanContent'

export const metadata: Metadata = {
  title: 'Travel FAQ | Arise Bhutan',
  description: 'Everything you need to know before visiting Bhutan — SDF fees, visa requirements, flights, connectivity, and more.',
}

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Hero */}
      <section
        className="relative pt-36 pb-20 sm:pt-44 sm:pb-24 text-white text-center overflow-hidden"
        style={{ backgroundImage: 'url(/images/prayer-flags-mountains.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-stone-900/65" />
        <div className="relative z-10 max-w-3xl mx-auto px-5">
          <span className="section-badge text-amber-400">Before You Go</span>
          <h1 className="font-serif text-[2rem] sm:text-4xl md:text-5xl font-bold mb-4 leading-tight text-white">
            Bhutan Travel FAQ
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto">
            Everything you need to know about visas, fees, flights, and what to expect in the Kingdom of Happiness.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-stone-800 dark:text-stone-200 font-medium">Travel FAQ</span>
        </div>
      </div>

      {/* SDF & Visa fee table */}
      <SdfVisaTable />

      {/* FAQ accordion */}
      <FaqSection />

      {/* Tours CTA strip */}
      <section className="py-14 sm:py-16 bg-amber-50 dark:bg-stone-900 border-t border-amber-100 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-3">
            Ready to Plan Your Bhutan Journey?
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-7 text-sm sm:text-base">
            Browse our hand-crafted tours or tell us your dream trip — we&apos;ll build the perfect itinerary.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tours" className="btn-primary">
              Browse All Tours
            </Link>
            <Link href="/contact" className="btn-outline">
              Plan a Custom Trip
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
