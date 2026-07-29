'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Check, X, Clock, MapPin, HeartPulse, ArrowRight, Shield, Calendar, Users, Gauge } from 'lucide-react'

const FACTS = [
  { icon: Shield,   value: 'H130 Fleet',        label: 'Airbus twin-engine helicopters' },
  { icon: Calendar, value: 'Since 2015',         label: 'Operating out of Paro Airport' },
  { icon: Gauge,    value: '1,500+ Hours',       label: 'Safely flown with travellers' },
  { icon: Users,    value: 'Up to 5 Pax',        label: 'Per charter, private group' },
]

const SCENIC_FLIGHTS = [
  { name: 'Paro Valley Loop', desc: 'A short scenic circuit over the Paro valley and Rinpung Dzong.', img: '/images/mountain-valley.jpg' },
  { name: 'Tiger’s Nest & Drugyel Dzong', desc: 'Aerial views of Taktsang Monastery clinging to its cliff, and the ruined Drugyel Dzong below.', img: '/images/tigers-nest-3.jpg' },
  { name: 'Mount Jomolhari & Jangothang', desc: 'Close-up views of Jomolhari (7,314m) and its base camp — terrain most travellers only see on a multi-day trek.', img: '/images/prayer-flags-mountains.jpg' },
]

const PRICING_TIERS = [
  {
    duration: '30 Minutes',
    price: '$2,500',
    popular: false,
    included: ['Paro Dzong', 'Paro Valley', 'Tiger’s Nest Monastery', 'Drugyel Dzong', 'Mount Jomolhari'],
    excluded: ['Stop at Jangothang', 'Lingzhi Dzong', 'Mount Jichu Drakey'],
  },
  {
    duration: '60 Minutes',
    price: '$5,000',
    popular: true,
    included: ['Paro Dzong', 'Paro Valley', 'Tiger’s Nest Monastery', 'Drugyel Dzong', 'Mount Jomolhari', 'Stop at Jangothang', 'Lingzhi Dzong'],
    excluded: ['Mount Jichu Drakey'],
  },
  {
    duration: '90 Minutes',
    price: '$7,500',
    popular: false,
    included: ['Paro Dzong', 'Paro Valley', 'Tiger’s Nest Monastery', 'Drugyel Dzong', 'Mount Jomolhari', 'Stop at Jangothang', 'Lingzhi Dzong', 'Mount Jichu Drakey'],
    excluded: [],
  },
]

const PARO_CHARTERS = [
  { to: 'Haa',        landing: 'Imtrat Helipad',              time: '12 min',  price: '$875' },
  { to: 'Thimphu',    landing: 'Lungtenphu RBA Ground',        time: '20 min',  price: '$1,458' },
  { to: 'Punakha',    landing: 'Zomling Thang',                time: '50 min',  price: '$3,646' },
  { to: 'Gasa',       landing: 'Gasa Public Ground',           time: '52 min',  price: '$3,792' },
  { to: 'Laya',       landing: 'Langothang Village',           time: '80 min',  price: '$5,833' },
  { to: 'Trongsa',    landing: 'Sherubling HSS Ground',        time: '80 min',  price: '$5,833' },
  { to: 'Bumthang',   landing: 'Batpalathang Airport',         time: '110 min', price: '$8,021' },
  { to: 'Manas',      landing: 'Manas Park Football Ground',   time: '150 min', price: '$10,938' },
  { to: 'Trashigang', landing: 'Kanglung',                     time: '168 min', price: '$12,250' },
]

const BUMTHANG_TOURS = [
  { name: 'Hidden Lake Tour',         route: 'Bumthang → Gomthang → Bumthang',           time: '35 min',  price: '$2,552' },
  { name: 'Traditional Textile Tour', route: 'Bumthang → Khoma → Bumthang',              time: '50 min',  price: '$3,646' },
  { name: 'Royal Manas Wildlife Tour', route: 'Bumthang → Manas → Bumthang',             time: '80 min',  price: '$5,833' },
  { name: 'Merak-Sakteng Tour',       route: 'Bumthang → Sakteng → Merak → Bumthang',    time: '107 min', price: '$7,802' },
]

export default function HelicopterServices() {
  return (
    <div className="bg-white dark:bg-stone-950 font-sans transition-colors duration-300">

      {/* ── Hero ── */}
      <section
        className="relative pt-[120px] pb-20 sm:pt-[140px] sm:pb-28 overflow-hidden"
        style={{ backgroundImage: 'url(/images/helicopter-hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-stone-950/85" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase mb-4 block">
            Royal Bhutan Helicopter Services
          </span>
          <h1 className="font-serif text-white text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-5 max-w-3xl">
            Bhutan Helicopter Services
          </h1>
          <p className="text-white/85 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
            Soar over monasteries, valleys and virgin peaks — Arise Bhutan arranges scenic flights and point-to-point
            charters with RBHS as part of your itinerary.
          </p>
          <Link href="/contact" className="btn-primary">
            Enquire About a Charter <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Fleet & Facts strip ── */}
      <section className="bg-stone-900 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-5 overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible pb-1 sm:pb-0">
            {FACTS.map(({ icon: Icon, value, label }) => (
              <div key={value} className="flex items-center gap-3 min-w-[190px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
                <div className="w-11 h-11 bg-amber-600/15 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm sm:text-base leading-tight">{value}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About the operator ── */}
      <section className="py-16 sm:py-20 surface-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 sm:gap-14">
          <div>
            <span className="section-badge">About the Operator</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4 leading-tight">
              Rooted at Paro, Reaching All of Bhutan
            </h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Royal Bhutan Helicopter Services (RBHS) took its first flight on 11 November 2015, timed to mark
              His Majesty the Fourth King&apos;s 60th birthday. Flying two Airbus H130 helicopters out of Paro
              Airport&apos;s original hangar, the fleet has since carried thousands of passengers over more than
              1,500 flight hours — from first-time visitors chasing a view of Tiger&apos;s Nest to villagers who&apos;d
              otherwise face a multi-day walk to the nearest road.
            </p>
          </div>
          <div>
            <span className="section-badge">Why It Matters</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4 leading-tight">
              Why Bhutan Depends on Rotor Wings
            </h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Bhutan&apos;s dzongkhags are separated by some of the steepest terrain on earth — Paro to eastern
              Trashigang can take two full days by road, and several valleys have no all-weather road at all.
              RBHS closes that gap: in its first six months of operation alone, the service airlifted more than
              40 medical patients to hospitals in Thimphu, and it continues to support search and rescue,
              disaster relief, cargo runs and government transport alongside its scenic flights and charters.
              As the Department of Air Transport builds helipads across all 18 dzongkhags, that reach keeps growing.
            </p>
          </div>
        </div>
      </section>

      {/* ── Scenic Flights ── */}
      <section className="py-16 sm:py-20 surface-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="section-badge">Scenic Flights</span>
            <h2 className="section-title">Views No Ground Traveller Sees</h2>
            <p className="section-subtitle">
              Short scenic circuits over Paro that pair beautifully with any tour — perfect for a first or last morning in Bhutan.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {SCENIC_FLIGHTS.map((f) => (
              <div key={f.name} className="group relative rounded-2xl overflow-hidden h-64 sm:h-72">
                <Image src={f.img} alt={f.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="font-serif font-bold text-white text-lg leading-tight mb-1">{f.name}</h3>
                  <p className="text-stone-300 text-sm leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing tiers ── */}
      <section className="py-16 sm:py-20 surface-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="section-badge">Paro Helicopter Excursion</span>
            <h2 className="section-title">Add a Scenic Flight to Any Package</h2>
            <p className="section-subtitle">Charge is per trip, maximum 5 passengers — choose how much of the Jomolhari range you want to see.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-start">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.duration}
                className={`rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border transition-colors duration-300 ${
                  tier.popular
                    ? 'border-amber-500 shadow-xl shadow-amber-900/10 md:-translate-y-2'
                    : 'border-stone-200 dark:border-stone-800 shadow-sm'
                }`}
              >
                <div className={`px-6 py-6 text-center ${tier.popular ? 'bg-amber-600' : 'bg-stone-900'}`}>
                  <p className={`text-xs font-semibold tracking-widest uppercase mb-2 ${tier.popular ? 'text-amber-100' : 'text-amber-400'}`}>
                    {tier.duration}{tier.popular ? ' — Most Popular' : ''}
                  </p>
                  <p className="text-3xl sm:text-4xl font-serif font-bold text-white">{tier.price}</p>
                  <p className="text-white/70 text-xs mt-1">per trip · up to 5 pax</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {tier.included.map((s) => (
                      <li key={s} className="flex items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                        <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                    {tier.excluded.map((s) => (
                      <li key={s} className="flex items-center gap-2.5 text-sm text-stone-300 dark:text-stone-600 italic">
                        <X className="w-4 h-4 text-stone-300 dark:text-stone-700 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`block text-center font-semibold text-sm py-3 rounded-full transition-all duration-200 ${
                      tier.popular ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md' : 'btn-outline w-full'
                    }`}
                  >
                    Enquire Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-8 max-w-xl mx-auto">
            Indicative pricing — Royal Bhutan Helicopter Services confirms the final rate, based on fuel and weather conditions, when Arise Bhutan books your charter.
          </p>
        </div>
      </section>

      {/* ── Charter Pricing ── */}
      <section className="py-16 sm:py-20 surface-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="section-badge">Charter Pricing</span>
            <h2 className="section-title">Skip the Mountain Roads</h2>
            <p className="section-subtitle">One-way fares per helicopter, up to 5 passengers — contact us in advance so we can confirm your booking with RBHS.</p>
          </div>

          <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg mb-4">From Paro</h3>
          <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-950/60 text-left text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    <th className="py-3 px-5">Destination</th>
                    <th className="py-3 px-5">Landing Spot</th>
                    <th className="py-3 px-5">Flight Time</th>
                    <th className="py-3 px-5">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {PARO_CHARTERS.map((r, i) => (
                    <tr key={r.to} className={i < PARO_CHARTERS.length - 1 ? 'border-b border-stone-200 dark:border-stone-800' : ''}>
                      <td className="py-3.5 px-5 font-semibold text-stone-800 dark:text-stone-200">{r.to}</td>
                      <td className="py-3.5 px-5 text-stone-500 dark:text-stone-400">{r.landing}</td>
                      <td className="py-3.5 px-5 text-stone-600 dark:text-stone-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />{r.time}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-amber-700 dark:text-amber-400">{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg mb-4">Regional Tours from Bumthang</h3>
          <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-950/60 text-left text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    <th className="py-3 px-5">Tour</th>
                    <th className="py-3 px-5">Route</th>
                    <th className="py-3 px-5">Flight Time</th>
                    <th className="py-3 px-5">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {BUMTHANG_TOURS.map((r, i) => (
                    <tr key={r.name} className={i < BUMTHANG_TOURS.length - 1 ? 'border-b border-stone-200 dark:border-stone-800' : ''}>
                      <td className="py-3.5 px-5 font-semibold text-stone-800 dark:text-stone-200">{r.name}</td>
                      <td className="py-3.5 px-5 text-stone-500 dark:text-stone-400">{r.route}</td>
                      <td className="py-3.5 px-5 text-stone-600 dark:text-stone-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />{r.time}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-amber-700 dark:text-amber-400">{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-5 py-3 text-xs text-stone-400 dark:text-stone-500 border-t border-stone-200 dark:border-stone-800 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" /> All fares are one-way, per helicopter — pair a flight in with a road journey out, or book the return leg the same way.
            </p>
          </div>
        </div>
      </section>

      {/* ── Medical evacuation ── */}
      <section className="pb-16 sm:pb-20 surface-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 flex gap-4">
            <HeartPulse className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-serif font-bold text-stone-900 dark:text-stone-100 mb-1.5">Medical Evacuation</h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                RBHS provides emergency medical evacuation from remote trekking routes and dzongkhags. We strongly
                recommend travel insurance that explicitly covers helicopter evacuation for any trekking itinerary —
                see the inclusions and exclusions on each of our trek packages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="relative py-20 sm:py-24 text-center overflow-hidden"
        style={{ backgroundImage: 'url(/images/prayer-flags-mountains.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-stone-900/75" />
        <div className="relative z-10 max-w-3xl mx-auto px-5">
          <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase mb-4 block">Ready to Fly?</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-5 leading-tight">
            Add a Helicopter Flight to Your Bhutan Trip
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
            Tell us which route or scenic flight you&apos;re interested in and we&apos;ll check availability and pricing with RBHS.
          </p>
          <Link href="/contact" className="btn-primary">
            Contact Arise Bhutan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
