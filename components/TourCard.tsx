import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, MapPin, ChevronRight } from 'lucide-react'
import type { Tour } from '@/data/tours'

const difficultyColor: Record<string, string> = {
  Easy:        'bg-green-100 text-green-700',
  Moderate:    'bg-yellow-100 text-yellow-700',
  Challenging: 'bg-orange-100 text-orange-700',
  Strenuous:   'bg-red-100 text-red-700',
}

const categoryColor: Record<string, string> = {
  cultural:  'bg-blue-100 text-blue-700',
  adventure: 'bg-green-100 text-green-700',
  festival:  'bg-purple-100 text-purple-700',
  luxury:    'bg-amber-100 text-amber-700',
}

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-xl dark:hover:shadow-black/40 dark:hover:border-stone-700 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden flex-shrink-0">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${categoryColor[tour.category]}`}>
            {tour.categoryLabel}
          </span>
          {tour.badge && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-600 text-white shadow">
              {tour.badge}
            </span>
          )}
        </div>
        {/* Price */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
          From <span className="font-bold">${tour.startingFrom.toLocaleString()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 mb-2">
          <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
          <span className="truncate">{tour.locations.slice(0, 3).join(' · ')}{tour.locations.length > 3 ? ` +${tour.locations.length - 3}` : ''}</span>
        </div>

        <h3 className="font-serif font-bold text-stone-900 dark:text-stone-50 text-lg mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
          {tour.title}
        </h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm mb-4 line-clamp-2">{tour.subtitle}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-3">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            {tour.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-500" />
            {tour.groupSize}
          </span>
        </div>

        {/* Difficulty */}
        <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${difficultyColor[tour.difficulty]}`}>
          {tour.difficulty}
        </span>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            ~${Math.round(tour.startingFrom / tour.days).toLocaleString()}/day
          </p>
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-sm group-hover:gap-2 transition-all flex-shrink-0">
            View Tour
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
