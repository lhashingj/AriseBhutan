import type { Metadata } from 'next'
import AdventureBuilder from '@/components/AdventureBuilder'

export const metadata: Metadata = {
  title: 'Adventure Builder — Arise Bhutan Tours & Travels',
  description:
    'Design your perfect Bhutan itinerary. Choose your nights, accommodation tier, and curate experiences from trekking to cultural festivals. Submit for a free personalised proposal within 24 hours.',
}

export default function AdventureBuilderPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative pt-36 pb-16 sm:pt-44 sm:pb-20 text-white text-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/trekkers-prayer-flags.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      >
        <div className="absolute inset-0 bg-stone-900/65" />
        <div className="relative z-10 max-w-2xl mx-auto px-5">
          <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase mb-4 block">
            Custom Itinerary Planner
          </span>
          <h1 className="font-serif text-[2rem] sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-5 leading-tight">
            Build Your Bhutan Adventure
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed">
            Choose your nights, accommodation tier, and handpick experiences from our curated activity library.
            Submit in minutes — your specialist responds within 24 hours with a personalised quote.
          </p>
        </div>
      </section>

      {/* Builder */}
      <section className="py-14 sm:py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
              Three Simple Steps
            </h2>
            <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
              No cookie-cutter packages. No payment upfront. Just tell us what excites you
              and we&apos;ll craft an itinerary around it.
            </p>
          </div>

          <AdventureBuilder />
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-10 border-t border-stone-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-600 font-serif mb-1">24h</p>
              <p className="text-sm text-stone-500 leading-snug">Personal response from a Bhutan specialist</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 font-serif mb-1">$0</p>
              <p className="text-sm text-stone-500 leading-snug">No payment or commitment required to enquire</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 font-serif mb-1">100%</p>
              <p className="text-sm text-stone-500 leading-snug">Custom itineraries — no two trips are the same</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
