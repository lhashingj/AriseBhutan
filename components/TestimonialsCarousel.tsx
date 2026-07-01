'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

function GoogleBadge() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-label="Google">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" aria-label="Verified">
      <circle cx="10" cy="10" r="10" fill="#1A73E8" />
      <path d="M7.8 13.4L4.6 10.2L5.8 9L7.8 11L14.2 4.6L15.4 5.8L7.8 13.4Z" fill="white" />
    </svg>
  )
}

function GoogleWordmark() {
  return (
    <span className="text-2xl font-bold tracking-tight select-none">
      <span style={{ color: '#4285F4' }}>G</span>
      <span style={{ color: '#EA4335' }}>o</span>
      <span style={{ color: '#FBBC05' }}>o</span>
      <span style={{ color: '#4285F4' }}>g</span>
      <span style={{ color: '#34A853' }}>l</span>
      <span style={{ color: '#EA4335' }}>e</span>
    </span>
  )
}

export interface Review {
  author_name: string
  date: string
  rating: number
  text: string
  profile_photo_url: string | null
  reviewPhoto: string | null
}

const TRUNCATE_LEN = 140

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false)
  const { author_name, date, rating, text, profile_photo_url, reviewPhoto } = review
  const long = text.length > TRUNCATE_LEN

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col h-full">
      {reviewPhoto && (
        <div className="relative w-full h-44 flex-shrink-0">
          <Image
            src={reviewPhoto}
            alt={`${author_name}'s Bhutan tour`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Avatar + name/date + Google badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile_photo_url}
                alt={author_name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-base flex-shrink-0">
                {author_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-stone-900 text-sm leading-tight truncate">{author_name}</p>
              <p className="text-stone-400 text-xs mt-0.5">{date}</p>
            </div>
          </div>
          <GoogleBadge />
        </div>

        {/* Stars + verified */}
        <div className="flex items-center gap-1">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-1.5">
            <VerifiedBadge />
          </span>
        </div>

        {/* Review text */}
        <p className="text-stone-600 text-sm leading-relaxed flex-1">
          {long && !expanded ? text.slice(0, TRUNCATE_LEN) + '…' : text}
        </p>
        {long && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-stone-400 hover:text-stone-700 text-sm self-start transition-colors"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  )
}

interface Props {
  reviews: Review[]
  totalStr: string
  mapsUrl: string
}

export default function TestimonialsCarousel({ reviews, totalStr, mapsUrl }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1)
      else if (window.innerWidth < 1024) setVisibleCount(2)
      else setVisibleCount(3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Reset index when visibleCount changes (e.g. resize)
  useEffect(() => {
    setCurrentIndex(i => Math.min(i, Math.max(0, reviews.length - visibleCount)))
  }, [visibleCount, reviews.length])

  const maxIndex = Math.max(0, reviews.length - visibleCount)
  const visible = reviews.slice(currentIndex, currentIndex + visibleCount)

  return (
    <section className="py-16 sm:py-20 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-center lg:items-start">

          {/* LEFT: Rating summary */}
          <div className="text-center lg:text-left flex-shrink-0 lg:w-52">
            <p className="text-2xl font-black tracking-widest text-stone-900 uppercase">Excellent</p>
            <div className="flex justify-center lg:justify-start gap-1 my-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-stone-600 text-sm">
              Based on <strong className="text-stone-900">{totalStr} reviews</strong>
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 hover:opacity-75 transition-opacity"
              aria-label="View on Google"
            >
              <GoogleWordmark />
            </a>
          </div>

          {/* RIGHT: Carousel */}
          <div className="flex-1 w-full min-w-0">
            <div className="relative px-6 sm:px-8">
              {/* Prev arrow */}
              <button
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center hover:bg-stone-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-5 h-5 text-stone-600" />
              </button>

              {/* Cards */}
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))` }}
              >
                {visible.map((review) => (
                  <ReviewCard key={review.author_name} review={review} />
                ))}
              </div>

              {/* Next arrow */}
              <button
                onClick={() => setCurrentIndex(i => Math.min(maxIndex, i + 1))}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center hover:bg-stone-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {/* Dot indicators */}
            {reviews.length > visibleCount && (
              <div className="flex justify-center gap-1.5 mt-5">
                {[...Array(maxIndex + 1)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`rounded-full transition-all duration-200 ${
                      i === currentIndex
                        ? 'w-5 h-2 bg-amber-500'
                        : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* See all link */}
        <div className="text-center mt-10">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 border border-stone-200 rounded-full px-5 py-2.5 hover:border-stone-300 bg-white transition-all shadow-sm"
          >
            <GoogleBadge />
            See all reviews on Google
          </a>
        </div>
      </div>
    </section>
  )
}
