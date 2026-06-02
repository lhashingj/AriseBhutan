'use client'
import Link from 'next/link'
import { Clock, Users, Mountain, Star, CheckCircle, ArrowRight } from 'lucide-react'
import { premiumTours } from '@/data/bhutanContent'

const difficultyStyles = {
  Easy: 'bg-green-100 text-green-700',
  Moderate: 'bg-yellow-100 text-yellow-700',
  Challenging: 'bg-orange-100 text-orange-700',
  Strenuous: 'bg-red-100 text-red-700',
}

const badgeStyles = {
  'Best Seller': 'bg-amber-600 text-white',
  "Editor's Pick": 'bg-stone-800 text-white',
  Premium: 'bg-amber-50 text-amber-700 border border-amber-300',
}

export default function TourGrid() {
  return (
    <section className="py-16 sm:py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-amber-600 font-semibold text-xs tracking-widest uppercase mb-3 block">
            Curated Journeys
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Featured Bhutan Itineraries
          </h2>
          <p className="text-stone-500 text-base sm:text-lg leading-relaxed">
            Hand-crafted tours for every travel style — each fully customizable around your dates,
            pace, and interests.
          </p>
        </div>

        {/* Tour cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {premiumTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <p className="text-stone-500 text-sm mb-4">
            Looking for something different? Every Arise Bhutan tour is fully customizable.
          </p>
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-[0.97] text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-amber-600/25"
          >
            View All Tours
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function TourCard({ tour }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Card header with duration badge */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-700 px-5 pt-5 pb-4 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-2 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          {/* Duration badge */}
          <div>
            <p className="text-amber-200 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
              Duration
            </p>
            <p className="text-white font-bold text-xl font-serif leading-tight">
              {tour.days} Days
            </p>
            <p className="text-amber-200 text-xs">{tour.nights} Nights</p>
          </div>

          {/* Badge */}
          {tour.badge && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                badgeStyles[tour.badge] ?? 'bg-white text-amber-700'
              }`}
            >
              {tour.badge}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="relative z-10 mt-3 pt-3 border-t border-amber-500/40">
          <span className="text-amber-200 text-[10px] uppercase tracking-widest">From</span>
          <p className="text-white font-bold text-2xl leading-none">
            ${tour.startingFrom.toLocaleString()}
            <span className="text-amber-200 text-sm font-normal"> /person</span>
          </p>
          <p className="text-amber-300 text-[10px] mt-0.5">SDF &amp; visa processing included</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title & subtitle */}
        <h3 className="font-serif font-bold text-stone-900 text-xl mb-1 leading-tight">
          {tour.title}
        </h3>
        <p className="text-stone-500 text-sm mb-4">{tour.subtitle}</p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            {tour.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            {tour.groupSize}
          </span>
          <span className="flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${difficultyStyles[tour.difficulty]}`}>
              {tour.difficulty}
            </span>
          </span>
        </div>

        {/* Overview */}
        <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-4">
          {tour.overview}
        </p>

        {/* Top 3 highlights */}
        <ul className="space-y-2 mb-5">
          {tour.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-stone-700">{h}</span>
            </li>
          ))}
        </ul>

        {/* Accommodation tier */}
        <div className="bg-stone-50 rounded-xl px-3.5 py-2.5 mb-4">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">
            Accommodation
          </p>
          <p className="text-sm text-stone-700 font-medium">{tour.accommodationTier}</p>
        </div>

        {/* Customizability tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tour.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Link
            href={`/tours/${tour.slug}`}
            className="flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-amber-600 text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 group"
          >
            View Full Itinerary
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          {tour.customizable && (
            <p className="text-center text-[10px] text-stone-400 mt-2">
              ✦ Fully customizable to your dates & interests
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
