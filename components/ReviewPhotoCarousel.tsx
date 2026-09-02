'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Swipeable photo strip for a review card with more than one trip photo. */
export default function ReviewPhotoCarousel({ photos, alt }: { photos: string[]; alt: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  function goTo(i: number) {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(photos.length - 1, i))
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
    setIndex(clamped)
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    setIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <div className="relative w-full h-44 flex-shrink-0 overflow-hidden">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
      >
        {photos.map((photo, i) => (
          <div key={photo} className="relative w-full h-full flex-none snap-start">
            <Image
              src={photo}
              alt={`${alt} — photo ${i + 1} of ${photos.length}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 82vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous photo"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 disabled:opacity-0 text-white flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === photos.length - 1}
            aria-label="Next photo"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 disabled:opacity-0 text-white flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>

          <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-black/40 rounded-full px-2 py-0.5">
            {index + 1}/{photos.length}
          </span>
        </>
      )}
    </div>
  )
}
