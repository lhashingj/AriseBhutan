'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera } from 'lucide-react'

type Photo = {
  src: string
  alt: string
  category: string
  orientation?: 'landscape' | 'portrait' | 'square'
}

const allPhotos: Photo[] = [
  // Monasteries & Temples
  { src: '/images/tigers-nest-1.jpg',         alt: "Tiger's Nest Monastery — Paro Taktsang",       category: 'Monasteries' },
  { src: '/images/tigers-nest-2.jpg',          alt: "Tiger's Nest with Prayer Flags",               category: 'Monasteries' },
  { src: '/images/tigers-nest-3.jpg',          alt: "Tiger's Nest — Cliffside Detail",              category: 'Monasteries' },
  { src: '/images/monastery-architecture.jpg', alt: 'Traditional Bhutanese Temple Architecture',    category: 'Monasteries' },
  { src: '/images/punakha-dzong.jpg',           alt: 'Punakha Dzong — the Palace of Great Happiness', category: 'Monasteries' },

  // Festivals & Culture
  { src: '/images/cham-dance-blue.jpg',        alt: 'Cham Mask Dance — Blue Deity',                category: 'Festivals' },
  { src: '/images/cham-dance-red.jpg',          alt: 'Cham Festival — Red Silk Costume',            category: 'Festivals' },
  { src: '/images/cham-dance-orange.jpg',       alt: 'Tshechu Cham Dance — Orange Robes',           category: 'Festivals' },
  { src: '/images/cham-dance-masks.jpg',        alt: 'Sacred Cham Mask Dancers',                    category: 'Festivals' },
  { src: '/images/cham-dance-crowd.jpg',        alt: 'Festival Devotees at Tshechu',                category: 'Festivals' },
  { src: '/images/festival-scene.jpg',          alt: 'Bhutan Festival Performance',                  category: 'Festivals' },

  // Landscapes & Nature
  { src: '/images/sunrise-summit.jpg',          alt: 'Sunrise Over the Himalayas',                  category: 'Landscapes' },
  { src: '/images/sunrise-silhouette.jpg',      alt: 'Pilgrim at Himalayan Sunrise',                category: 'Landscapes' },
  { src: '/images/prayer-flags-mountains.jpg', alt: 'Prayer Flags and Mountain Peaks',              category: 'Landscapes' },
  { src: '/images/prayer-flags-valley.jpg',    alt: 'Colorful Prayer Flags in the Valley',          category: 'Landscapes' },
  { src: '/images/mountain-valley.jpg',         alt: 'Pristine Bhutanese Mountain Valley',          category: 'Landscapes' },

  // Food & Culture
  { src: '/images/ema-datshi.jpg',              alt: 'Ema Datshi — National Dish of Bhutan',        category: 'Food & Culture' },
  { src: '/images/red-rice-dish.jpg',           alt: 'Traditional Red Rice Meal',                   category: 'Food & Culture' },
  { src: '/images/chilli-fritters.jpg',         alt: 'Bhutanese Chilli Fritters',                   category: 'Food & Culture' },
  { src: '/images/bhutanese-food-spread.jpg',  alt: 'Authentic Bhutanese Food Spread',              category: 'Food & Culture' },

  // Wildlife
  { src: '/images/yellow-billed-magpie.jpg',   alt: 'Yellow-billed Blue Magpie',                   category: 'Wildlife' },

  // People & Guides
  { src: '/images/pilgrimage-group.jpg',        alt: 'Pilgrimage Group Journey',                    category: 'People & Guides' },
  { src: '/images/guide-tourist.jpg',           alt: 'Arise Bhutan Guide with Guests',              category: 'People & Guides' },
]

const categories = ['All', 'Monasteries', 'Festivals', 'Landscapes', 'Food & Culture', 'Wildlife', 'People & Guides']

function useReveal(threshold = 0.08) {
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

function PhotoCard({ photo, index, onOpen }: { photo: Photo; index: number; onOpen: () => void }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl group cursor-pointer aspect-[4/3] bg-stone-100"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
        transition: `opacity 0.6s ease-out ${(index % 6) * 0.08}s, transform 0.6s ease-out ${(index % 6) * 0.08}s`,
      }}
      onClick={onOpen}
      role="button"
      aria-label={`View: ${photo.alt}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 scale-75 group-hover:scale-100 transition-transform duration-300">
          <ZoomIn className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-white text-sm font-medium leading-snug">{photo.alt}</p>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const filtered = activeCategory === 'All'
    ? allPhotos
    : allPhotos.filter((p) => p.category === activeCategory)

  const closeLightbox = useCallback(() => setLightboxIdx(null), [])
  const prevPhoto = useCallback(() =>
    setLightboxIdx((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : null)),
    [filtered.length]
  )
  const nextPhoto = useCallback(() =>
    setLightboxIdx((i) => (i !== null ? (i + 1) % filtered.length : null)),
    [filtered.length]
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

  const currentPhoto = lightboxIdx !== null ? filtered[lightboxIdx] : null

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-12 sm:pt-36 sm:pb-16 bg-stone-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-amber-600/90 text-white text-[10px] font-semibold px-4 py-2 rounded-full tracking-widest uppercase mb-6">
            <Camera className="w-3.5 h-3.5" />
            Visual Stories
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Bhutan Through the Lens
          </h1>
          <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto">
            Every photograph is a window into a kingdom that time has left untouched — explore monasteries, festivals, landscapes, and daily life.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8 sm:mb-10 -mx-4 sm:mx-0 px-4 sm:px-0 sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Photo count */}
          <p className="text-stone-400 text-sm mb-6">
            {filtered.length} photo{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((photo, i) => (
              <PhotoCard
                key={`${activeCategory}-${photo.src}`}
                photo={photo}
                index={i}
                onOpen={() => setLightboxIdx(i)}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 sm:mt-16">
            <p className="text-stone-500 text-sm mb-6">Ready to create your own Bhutan story?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/tours" className="btn-primary">
                Explore Our Tours
              </Link>
              <Link href="/contact" className="btn-outline">
                Plan My Trip
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="w-7 h-7" />
          </button>

          <button
            className="absolute left-3 sm:left-5 z-10 p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); prevPhoto() }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-9 h-9" />
          </button>

          <div
            className="relative w-full max-w-5xl h-[70vw] sm:h-[65vw] md:h-[70vh] mx-14 sm:mx-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentPhoto.src}
              alt={currentPhoto.alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 90vw, 80vw"
              quality={90}
            />
          </div>

          <button
            className="absolute right-3 sm:right-5 z-10 p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); nextPhoto() }}
            aria-label="Next"
          >
            <ChevronRight className="w-9 h-9" />
          </button>

          <div className="absolute bottom-5 left-0 right-0 text-center px-4">
            <p className="text-white/85 text-sm mb-1">{currentPhoto.alt}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {filtered.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(i) }}
                  className={`rounded-full transition-all duration-200 ${
                    i === lightboxIdx ? 'w-5 h-1.5 bg-amber-500' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
