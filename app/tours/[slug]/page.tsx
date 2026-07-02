'use client'
import { useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Users, Star, MapPin, Mountain, CheckCircle, XCircle, Calendar, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import { getTourBySlug } from '@/data/tours'
import BookTourButton from '@/components/BookTourButton'

const DESTINATIONS: Record<string, { description: string; icon: string }> = {
  'Paro': {
    icon: '🏔️',
    description: "Gateway to Bhutan at 2,200m. Home to Tiger's Nest Monastery, Rinpung Dzong, and picturesque rice-paddy valleys lined with traditional farmhouses. Paro International Airport is one of the world's most dramatic landings.",
  },
  'Thimphu': {
    icon: '🏛️',
    description: "Bhutan's vibrant capital — a city without a single traffic light. Home to the 169-ft gilded Buddha Dordenma statue, Tashichho Dzong (the Royal seat of government), and the country's finest cultural museums.",
  },
  'Punakha': {
    icon: '🌸',
    description: "Bhutan's warm subtropical former capital. The spectacular 6-storey Punakha Dzong stands at the confluence of two sacred rivers and was the site of the 2011 Royal Wedding. Purple jacaranda trees bloom here in February.",
  },
  'Wangdue Phodrang': {
    icon: '🏯',
    description: "One of Bhutan's oldest and most historically significant districts. Dramatic mountain scenery surrounds the ancient Wangdue Dzong, perched on a ridge above the Pho Chhu river.",
  },
  'Wangdue': {
    icon: '🏯',
    description: "One of Bhutan's oldest and most historically significant districts. Dramatic mountain scenery surrounds the ancient Wangdue Dzong, perched on a ridge above the Pho Chhu river.",
  },
  'Gangtey': {
    icon: '🦢',
    description: "The pristine Phobjikha glacial valley — one of Bhutan's most breathtaking landscapes and the winter sanctuary of the endangered Black-Necked Crane. The 17th-century Gangtey Monastery crowns the valley rim.",
  },
  'Trongsa': {
    icon: '👑',
    description: "Ancestral home of Bhutan's royal Wangchuck dynasty. Trongsa Dzong (built 1644) commands the only route between eastern and western Bhutan from a sheer gorge cliff. The Taa Dzong Royal Heritage Museum holds 500-year-old royal artefacts.",
  },
  'Bumthang': {
    icon: '⛩️',
    description: "Bhutan's spiritual heartland, where Guru Rinpoche arrived in 746 AD. Home to some of the kingdom's oldest and most sacred temples — Kurjey Lhakhang, Jambay Lhakhang (built in a single day), and Tamshing Goemba.",
  },
  'Jangothang': {
    icon: '⛺',
    description: "Remote high-altitude base camp at 4,080m beneath the sacred pyramid of Jomolhari (7,314m). Waking to this Himalayan giant filling the entire horizon is one of the great mountain moments in all of Asia.",
  },
}

const TABS = ['Overview', 'Itinerary', 'Inclusions', 'Book Now'] as const
type Tab = typeof TABS[number]

const difficultyColor: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Moderate: 'bg-yellow-100 text-yellow-700',
  Challenging: 'bg-orange-100 text-orange-700',
  Strenuous: 'bg-red-100 text-red-700',
}

export default function TourDetailPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  const tour = getTourBySlug(params.slug)
  if (!tour) notFound()

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[480px] overflow-hidden">
        <Image src={tour.heroImage} alt={tour.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-10 max-w-7xl mx-auto">
          <Link href="/tours" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to All Tours
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-600 text-white">
              {tour.categoryLabel}
            </span>
            {tour.badge && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-amber-700">
                {tour.badge}
              </span>
            )}
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyColor[tour.difficulty]}`}>
              {tour.difficulty}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{tour.title}</h1>
          <p className="text-white/80 text-lg">{tour.subtitle}</p>
        </div>
      </div>

      {/* Sticky meta bar */}
      <div className="bg-white dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-6 text-sm text-stone-600 dark:text-stone-300">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> {tour.duration}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-500" /> {tour.groupSize}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500" /> {tour.locations.join(' · ')}</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {tour.rating} ({tour.reviews} reviews)</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-amber-500" /> {tour.bestSeason}</span>
            </div>
            <BookTourButton
              tour={tour}
              className="btn-primary whitespace-nowrap"
            >
              Book This Tour
            </BookTourButton>
          </div>
        </div>
      </div>

      {/* Tabs nav */}
      <div className="sticky top-18 z-20 bg-white dark:bg-stone-950 border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-transparent transition-colors duration-300">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">

            {/* OVERVIEW */}
            {activeTab === 'Overview' && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50 mb-5">Tour Overview</h2>
                {tour.overview.split('\n\n').map((para, i) => (
                  <p key={i} className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">{para}</p>
                ))}

                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mt-10 mb-5">Highlights</h3>
                <ul className="space-y-3">
                  {tour.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-stone-700 dark:text-stone-300">{h}</span>
                    </li>
                  ))}
                </ul>

                {/* Places You'll Visit */}
                {tour.locations.some((loc) => DESTINATIONS[loc]) && (
                  <div className="mt-10">
                    <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-5">Places You&apos;ll Visit</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {tour.locations.map((loc) => {
                        const info = DESTINATIONS[loc]
                        if (!info) return null
                        return (
                          <div key={loc} className="flex gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 hover:border-amber-200 dark:hover:border-stone-700 transition-colors">
                            <span className="text-2xl flex-shrink-0 mt-0.5">{info.icon}</span>
                            <div>
                              <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-1">{loc}</p>
                              <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed">{info.description}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Gallery strip */}
                {tour.gallery.length > 1 && (
                  <div className="mt-10">
                    <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-4">Photo Gallery</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {tour.gallery.map((img) => (
                        <div key={img} className="relative h-28 rounded-xl overflow-hidden">
                          <Image src={img} alt="" fill className="object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ITINERARY */}
            {activeTab === 'Itinerary' && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50 mb-7">Day-by-Day Itinerary</h2>
                <div className="space-y-3">
                  {tour.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="border border-stone-200 dark:border-stone-800 dark:bg-stone-900 rounded-2xl overflow-hidden hover:border-amber-300 dark:hover:border-stone-700 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                            D{day.day}
                          </span>
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-stone-100">{day.title}</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400">{day.meals}</p>
                          </div>
                        </div>
                        {expandedDay === day.day
                          ? <ChevronUp className="w-5 h-5 text-stone-400 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-stone-400 flex-shrink-0" />
                        }
                      </button>
                      {expandedDay === day.day && (
                        <div className="px-5 pb-5 border-t border-stone-100 dark:border-stone-800 pt-4">
                          <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4">{day.description}</p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Activities</p>
                              <ul className="space-y-1">
                                {day.activities.map((a) => (
                                  <li key={a} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />{a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Accommodation</p>
                                <p className="text-sm text-stone-700 dark:text-stone-300">{day.accommodation}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Meals</p>
                                <p className="text-sm text-stone-700 dark:text-stone-300">{day.meals}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INCLUSIONS */}
            {activeTab === 'Inclusions' && (
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-5 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> What&apos;s Included
                  </h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-stone-700 dark:text-stone-300 font-medium">International flight search &amp; booking assistance</span>
                    </li>
                    {tour.inclusions.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700 dark:text-stone-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50 mb-5 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" /> Not Included
                  </h2>
                  <ul className="space-y-3">
                    {tour.exclusions.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-stone-600 dark:text-stone-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-2xl p-6 mt-4">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">About Bhutan Visa & SDF</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    All visitors to Bhutan require a visa and pay the mandatory Sustainable Development Fee (SDF) of USD 100/day. Both are fully managed by Arise Bhutan as part of your package. Bhutan SDF fees directly fund free education, healthcare, and environmental conservation across the Kingdom.
                  </p>
                </div>
              </div>
            )}

            {/* BOOK NOW */}
            {activeTab === 'Book Now' && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">Book This Tour</h2>
                <p className="text-stone-500 dark:text-stone-400 mb-8">
                  Sign in or create a free account to build your personalised itinerary, get an instant cost breakdown, and receive your official booking voucher.
                </p>

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-2xl p-6 mb-8">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">How it works</h3>
                  <ol className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                    <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span> Create a free account or sign in</li>
                    <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span> Review and personalise the pre-filled day-by-day itinerary</li>
                    <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span> Get an instant cost breakdown including SDF &amp; GST</li>
                    <li className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span> Download your official booking voucher</li>
                  </ol>
                </div>

                <BookTourButton
                  tour={tour}
                  className="btn-primary text-base px-8 py-3.5"
                >
                  Book This Tour — Get Started
                </BookTourButton>
                <p className="text-xs text-stone-400 mt-3">No payment required at this stage. You&apos;ll receive a voucher and payment instructions after submitting.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
              <p className="font-serif font-bold text-stone-900 dark:text-stone-50 text-lg mb-1">Ready to Book?</p>
              <p className="text-stone-500 dark:text-stone-400 text-sm mb-5">Build your itinerary and we&apos;ll send you a personalised quote — no commitment needed.</p>
              <BookTourButton tour={tour} className="btn-primary w-full text-center">
                Book This Tour
              </BookTourButton>
              <p className="text-xs text-stone-400 text-center mt-3">No payment required at this stage</p>
            </div>

            {/* Quick facts */}
            <div className="bg-stone-50 dark:bg-stone-900 dark:border dark:border-stone-800 rounded-2xl p-6 transition-colors duration-300">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Quick Facts</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Duration', value: tour.duration },
                  { label: 'Group Size', value: tour.groupSize },
                  { label: 'Difficulty', value: tour.difficulty },
                  { label: 'Best Season', value: tour.bestSeason },
                  { label: 'Locations', value: tour.locations.join(', ') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span className="text-stone-500 dark:text-stone-400">{label}</span>
                    <span className="text-stone-900 dark:text-stone-100 font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Need help */}
            <div className="bg-amber-600 rounded-2xl p-6 text-white">
              <h3 className="font-serif font-bold text-lg mb-2">Need Help Choosing?</h3>
              <p className="text-amber-100 text-sm mb-4">Our Bhutan specialists can help you pick the perfect tour or create a custom itinerary.</p>
              <Link href="/contact" className="bg-white text-amber-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-amber-50 transition-colors inline-block">
                Talk to a Specialist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
