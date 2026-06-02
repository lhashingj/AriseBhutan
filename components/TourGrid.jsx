'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, CheckCircle, ArrowRight, Mountain } from 'lucide-react'
import { premiumTours } from '@/data/bhutanContent'

const difficultyStyle = {
  Easy:        'bg-green-100 text-green-700',
  Moderate:    'bg-yellow-100 text-yellow-700',
  Challenging: 'bg-orange-100 text-orange-700',
  Strenuous:   'bg-red-100 text-red-700',
}

export default function TourGrid() {
  return (
    <section className="py-16 sm:py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <span className="section-badge">Curated Journeys</span>
          <h2 className="section-title">Featured Bhutan Itineraries</h2>
          <p className="section-subtitle">
            Hand-crafted tours for every travel style — each fully customizable around your
            dates, pace, and interests.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {premiumTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12 sm:mt-14">
          <p className="text-stone-500 text-sm mb-5">
            Looking for something different? Every Arise Bhutan tour is fully customizable.
          </p>
          <Link href="/tours" className="btn-primary">
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
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">

      {/* Hero image with overlay badges */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-stone-700">
            {tour.difficulty}
          </span>
          {tour.badge && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-600 text-white shadow">
              {tour.badge}
            </span>
          )}
        </div>

        {/* Duration overlay — bottom left */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
            <Clock className="w-3 h-3" />
            {tour.days} Days / {tour.nights} Nights
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title & subtitle */}
        <h3 className="font-serif font-bold text-stone-900 text-xl mb-1 leading-tight group-hover:text-amber-700 transition-colors">
          {tour.title}
        </h3>
        <p className="text-stone-500 text-sm mb-4">{tour.subtitle}</p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-500" />
            {tour.groupSize}
          </span>
          <span className="flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-amber-500" />
            {tour.bestSeason}
          </span>
        </div>

        {/* Top 3 highlights */}
        <ul className="space-y-2 mb-4">
          {tour.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-stone-700 leading-snug">{h}</span>
            </li>
          ))}
        </ul>

        {/* Tags */}
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

        {/* Accommodation */}
        <div className="bg-stone-50 rounded-xl px-4 py-2.5 mb-5 text-sm">
          <span className="text-stone-400 text-[10px] font-semibold uppercase tracking-wider">Accommodation · </span>
          <span className="text-stone-700 font-medium">{tour.accommodationTier}</span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-stone-400">From</p>
            <p className="font-bold text-stone-900 text-xl">
              ${tour.startingFrom.toLocaleString()}
              <span className="text-xs font-normal text-stone-400"> /pax</span>
            </p>
          </div>
          <Link
            href={`/tours/${tour.slug}`}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.97] text-white font-semibold text-sm px-4 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-amber-600/25 whitespace-nowrap"
          >
            View Tour
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
