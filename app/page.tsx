import HeroSection from '@/components/HeroSection'
import TrustBadges from '@/components/TrustBadges'
import BrandPhilosophy from '@/components/BrandPhilosophy'
import WhyChooseUs from '@/components/WhyChooseUs'
import TourCard from '@/components/TourCard'
import GallerySection from '@/components/GallerySection'
import Testimonials from '@/components/Testimonials'
import { getFeaturedTours } from '@/data/tours'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Mountain, Utensils, Bird, Paintbrush } from 'lucide-react'

const experiences = [
  { icon: Mountain,   title: 'Ancient Monasteries',  desc: 'Cliffside sanctuaries perched impossibly above sacred valleys', img: '/images/tigers-nest-2.jpg' },
  { icon: Paintbrush, title: 'Living Festivals',      desc: 'Cham mask dances performed before crowds of devotees', img: '/images/cham-dance-red.jpg' },
  { icon: Utensils,   title: 'Authentic Cuisine',     desc: 'Fiery ema datshi, yak meat, and organic red rice', img: '/images/ema-datshi.jpg' },
  { icon: Bird,       title: 'Pristine Nature',       desc: 'Snow leopards, black-necked cranes, and Himalayan valleys', img: '/images/trekkers-prayer-flags.jpg' },
]

export default function HomePage() {
  const featured = getFeaturedTours()

  return (
    <>
      <HeroSection />
      <TrustBadges />
      <BrandPhilosophy />
      <WhyChooseUs />

      {/* Featured Tours */}
      <section className="py-16 sm:py-20 bg-white dark:bg-stone-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 sm:mb-12 flex-wrap gap-4">
            <div>
              <span className="section-badge">Handpicked Experiences</span>
              <h2 className="section-title mb-0">Featured Tours</h2>
            </div>
            <Link href="/tours" className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold hover:gap-3 transition-all text-sm sm:text-base">
              View All Tours <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {featured.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Bhutan — 4-experience grid */}
      <section className="py-16 sm:py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase mb-3 block">Why Bhutan?</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              A Kingdom Like No Other
            </h2>
            <p className="text-stone-400 text-base sm:text-lg max-w-2xl mx-auto">
              Bhutan is the world&apos;s only carbon-negative country — a kingdom that measures success by Gross National Happiness, not GDP.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {experiences.map(({ icon: Icon, title, desc, img }) => (
              <div key={title} className="group relative rounded-2xl overflow-hidden h-64 sm:h-72">
                <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="w-9 h-9 bg-amber-600 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-serif font-bold text-white text-lg leading-tight mb-1">{title}</h3>
                  <p className="text-stone-300 text-sm leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GallerySection />
      <Testimonials />

      {/* CTA Banner */}
      <section
        className="relative py-24 sm:py-28 text-center overflow-hidden"
        style={{ backgroundImage: 'url(/images/sunrise-silhouette.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top' }}
      >
        <div className="absolute inset-0 bg-stone-900/70" />
        <div className="relative z-10 max-w-3xl mx-auto px-5">
          <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase mb-4 block">Ready to Arise?</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-5 leading-tight">
            Your Bhutan Journey Begins Here
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-8 sm:mb-10">
            Every itinerary is custom-crafted for you. Tell us your dream trip and we&apos;ll make it happen — down to every monastery, festival, and sunrise.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/contact" className="bg-amber-600 hover:bg-amber-700 active:scale-[0.97] text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg text-sm sm:text-base text-center">
              Start Planning My Trip
            </Link>
            <Link href="/tours" className="border-2 border-white text-white hover:bg-white hover:text-stone-900 active:scale-[0.97] font-semibold px-8 py-4 rounded-full transition-all text-sm sm:text-base text-center">
              Browse All Tours
            </Link>
          </div>
        </div>
      </section>

    </>
  )
}
