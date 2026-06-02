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
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-amber-600/90 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full tracking-widest uppercase">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Licensed by ATCB · Kingdom of Bhutan
        </div>

        {/* Headline */}
        <h1 className="font-serif text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl">
          {slides[current].headline}
        </h1>

        {/* Sub */}
        <p className="text-white/85 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
          {slides[current].sub}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/tours"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-amber-500/30 hover:shadow-xl text-base"
          >
            Explore All Tours
          </Link>
          <Link
            href="/contact"
            className="border-2 border-white text-white hover:bg-white hover:text-stone-900 font-semibold px-8 py-4 rounded-full transition-all duration-200 text-base"
          >
            Plan My Trip
          </Link>
        </div>

        {/* Slide dots */}
        <div className="flex gap-2 mt-12">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-amber-500' : 'w-1.5 bg-white/50'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  )
}
