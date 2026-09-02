'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'

/**
 * Review card photo(s) — a swipeable strip when there's more than one, and
 * click-to-expand into a full-screen lightbox either way.
 */
export default function ReviewPhotoCarousel({ photos, alt }: { photos: string[]; alt: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const multi = photos.length > 1

  function goTo(i: number) {
    const clamped = Math.max(0, Math.min(photos.length - 1, i))
    trackRef.current?.scrollTo({ left: clamped * trackRef.current.clientWidth, behavior: 'smooth' })
    setIndex(clamped)
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    setIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  // Lock page scroll and wire up keyboard nav while the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return
    document.body.style.overflow = 'hidden'
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxOpen(false)
      else if (e.key === 'ArrowLeft') goTo(index - 1)
      else if (e.key === 'ArrowRight') goTo(index + 1)
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, index, photos.length])

  if (photos.length === 0) return null

  return (
    <>
      <div className="relative w-full h-44 flex-shrink-0 overflow-hidden">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
        >
          {photos.map((photo, i) => (
            <button
              key={photo}
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative w-full h-full flex-none snap-start cursor-zoom-in"
              aria-label={`Expand photo ${i + 1} of ${photos.length}`}
            >
              <Image
                src={photo}
                alt={`${alt} — photo ${i + 1} of ${photos.length}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 82vw, (max-width: 1024px) 50vw, 25vw"
              />
            </button>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center pointer-events-none">
          <Expand className="w-3.5 h-3.5" />
        </div>

        {multi && (
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

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-10"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-full h-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <Image
              src={photos[index]}
              alt={`${alt} — photo ${index + 1} of ${photos.length}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {multi && (
            <>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); goTo(index - 1) }}
                disabled={index === 0}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); goTo(index + 1) }}
                disabled={index === photos.length - 1}
                aria-label="Next photo"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm font-medium">
                {index + 1} / {photos.length}
              </span>
            </>
          )}
        </div>
      )}
    </>
  )
}
