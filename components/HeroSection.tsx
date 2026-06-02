'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

const slides = [
  {
    image: '/images/img-33.jpeg',
    headline: 'Arise to New Adventures',
    sub: 'Discover the Last Shangri-La — Ancient Monasteries, Sacred Mountains & Vibrant Festival Culture',
  },
  {
    image: '/images/img-02.jpeg',
    headline: 'Experience Sacred Festivals',
    sub: "Witness the living color of Bhutan's Tshechu — sacred Cham dances performed for centuries",
  },
  {
    image: '/images/img-38.jpeg',
    headline: 'Awaken at the Summit',
    sub: 'Trek pristine Himalayan trails and greet the sunrise from the roof of the world',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative h-screen min-h-[580px] overflow-hidden">
      {/* Background slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      ))}

      {/* Layered gradient: dark at top (for nav) and bottom (for text) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5 sm:px-8">
        {/* Badge */}
        <div className="mb-5 sm:mb-6 inline-flex items-center gap-2 bg-amber-600/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-semibold px-4 py-2 rounded-full tracking-widest uppercase">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Licensed by ATCB · Kingdom of Bhutan
        </div>

        {/* Headline */}
        <h1 className="font-serif text-white text-[2.2rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] mb-4 sm:mb-6 max-w-xs sm:max-w-2xl md:max-w-4xl">
          {slides[current].headline}
        </h1>

        {/* Sub */}
        <p className="text-white/85 text-base sm:text-lg md:text-xl max-w-sm sm:max-w-xl md:max-w-2xl mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
          {slides[current].sub}
        </p>

        {/* CTAs — stacked full-width on mobile, inline on sm+ */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
          <Link
            href="/tours"
            className="bg-amber-600 hover:bg-amber-700 active:scale-[0.97] text-white font-semibold px-8 py-3.5 sm:py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-amber-500/30 hover:shadow-xl text-sm sm:text-base text-center"
          >
            Explore All Tours
          </Link>
          <Link
            href="/contact"
            className="border-2 border-white text-white hover:bg-white hover:text-stone-900 active:scale-[0.97] font-semibold px-8 py-3.5 sm:py-4 rounded-full transition-all duration-200 text-sm sm:text-base text-center"
          >
            Plan My Trip
          </Link>
        </div>

        {/* Slide dots */}
        <div className="flex gap-2 mt-10 sm:mt-12">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-amber-500' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator — hidden on small screens to save space */}
      <div className="hidden sm:flex absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1.5 text-white/50">
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  )
}
