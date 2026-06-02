'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ZoomIn, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

type Photo = { src: string; alt: string; span: string }

const mosaicPhotos: Photo[] = [
  { src: '/images/tigers-nest-1.jpg',           alt: "Tiger's Nest — Paro Taktsang",           span: 'col-span-2 row-span-2' },
  { src: '/images/cham-dance-blue.jpg',          alt: 'Cham Dance — Blue Deity',               span: '' },
  { src: '/images/sunrise-silhouette.jpg',       alt: 'Himalayan Sunrise',                     span: '' },
  { src: '/images/tigers-nest-pilgrim.jpg',      alt: 'Pilgrim at Tiger\'s Nest',              span: '' },
  { src: '/images/cham-dance-red.jpg',           alt: 'Tshechu Festival Performers',           span: '' },
  { src: '/images/yellow-billed-magpie.jpg',     alt: 'Yellow-billed Blue Magpie',             span: '' },
  { src: '/images/old-man-chorten.jpg',          alt: 'Bhutanese Elder with Prayer Beads',     span: '' },
  { src: '/images/prayer-flags-mountains.jpg',   alt: 'Prayer Flags at Sunrise',               span: '' },
  { src: '/images/pilgrimage-group.jpg',         alt: 'Pilgrimage at Buddha Dordenma',         span: '' },
]

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function GalleryItem({
  photo,
  index,
  onOpen,
}: {
  photo: Photo
  index: number
  onOpen: (idx: number) => void
}) {
  const { ref, visible } = useReveal(0.05)

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-xl group cursor-pointer ${photo.span}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
        transition: `opacity 0.65s ease-out ${index * 0.07}s, transform 0.65s ease-out ${index * 0.07}s`,
      }}
      onClick={() => onOpen(index)}
      role="button"
      aria-label={`View photo: ${photo.alt}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 350px"
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        quality={85}
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <ZoomIn className="w-6 h-6 text-white drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-white text-xs sm:text-sm font-medium leading-snug drop-shadow-lg">
          {photo.alt}
        </p>
      </div>
    </div>
  )
}

export default function GallerySection() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const { ref: titleRef, visible: titleVisible } = useReveal(0.2)

  const closeLightbox = useCallback(() => setLightboxIdx(null), [])
  const prevPhoto = useCallback(() =>
    setLightboxIdx((i) => (i !== null ? (i - 1 + mosaicPhotos.length) % mosaicPhotos.length : null)),
    []
  )
  const nextPhoto = useCallback(() =>
    setLightboxIdx((i) => (i !== null ? (i + 1) % mosaicPhotos.length : null)),
    []
  )

  useEffect(() => {
    if (lightboxIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIdx, closeLightbox, prevPhoto, nextPhoto])

  const currentPhoto = lightboxIdx !== null ? mosaicPhotos[lightboxIdx] : null

  return (
    <section className="py-16 sm:py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={titleRef}
          className="text-center mb-10 sm:mb-12"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
          }}
        >
          <span className="section-badge">Photo Gallery</span>
          <h2 className="section-title">A Glimpse of Bhutan</h2>
          <p className="section-subtitle mx-auto mt-4">
            From sacred monasteries to vibrant festivals — every frame tells a story of a kingdom unlike any other.
          </p>
        </div>

        {/* Mosaic grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] sm:auto-rows-[185px] md:auto-rows-[170px] gap-2.5 sm:gap-3">
          {mosaicPhotos.map((photo, i) => (
            <GalleryItem key={photo.src} photo={photo} index={i} onOpen={setLightboxIdx} />
          ))}
        </div>

        {/* Footer links */}
        <div
          className="text-center mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease-out 0.5s, transform 0.7s ease-out 0.5s',
          }}
        >
          <Link href="/gallery" className="btn-primary gap-2">
            View Full Gallery <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/tours" className="btn-outline">
            Explore All Tours
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X className="w-7 h-7" />
          </button>

          {/* Prev */}
          <button
            className="absolute left-3 sm:left-6 z-10 p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); prevPhoto() }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Image */}
          <div
            className="relative w-full max-w-5xl max-h-[85vh] mx-14 sm:mx-20 h-[75vw] sm:h-[60vw] md:h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentPhoto.src}
              alt={currentPhoto.alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 95vw, 80vw"
              quality={90}
            />
          </div>

          {/* Next */}
          <button
            className="absolute right-3 sm:right-6 z-10 p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); nextPhoto() }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Caption + counter */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-white/80 text-sm px-6">{currentPhoto.alt}</p>
            <p className="text-white/40 text-xs mt-1">
              {(lightboxIdx ?? 0) + 1} / {mosaicPhotos.length}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
