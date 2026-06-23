import type { Metadata } from 'next'
import AdventureBuilder from '@/components/AdventureBuilder'

export const metadata: Metadata = {
  title: 'Plan Your Trip — Arise Bhutan Tours & Travels',
  description: 'Build your custom Bhutan itinerary. Choose your hotel tier, nights, and experiences — our specialists will craft a personalised quote just for you.',
}

export default function AdventureBuilderPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative bg-stone-900 py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Personalised Journeys
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Build Your Dream<br />Bhutan Itinerary
          </h1>
          <p className="text-stone-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Tell us your ideal trip — nights, accommodations, and experiences. Our specialists
            will review your selections and send you a personalised quote within 24 hours.
          </p>
        </div>
      </section>

      {/* Builder */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <AdventureBuilder />
      </section>
    </main>
  )
}
