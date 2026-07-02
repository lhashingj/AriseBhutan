import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, Heart, Leaf, Award, Users, Globe, Download, FileCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us — Licensed Bhutan Tour Agency | Arise Bhutan',
  description: 'Arise Bhutan Tours & Travels is a DOT-licensed tour operator based in Paro, Bhutan. Learn about our team, our values, and our commitment to authentic, sustainable Bhutan travel experiences.',
  alternates: { canonical: 'https://www.arisebhutan.com/about' },
  openGraph: {
    title: 'About Arise Bhutan — DOT-Licensed Tour Agency in Paro',
    description: 'Meet the team behind Arise Bhutan. Licensed by the Royal Government of Bhutan (DOT Lic. 50001567). Expert local guides. Fully private tours.',
    url: 'https://www.arisebhutan.com/about',
  },
}

const values = [
  { icon: Heart,  title: 'Authentic Experiences',   desc: 'We go beyond the tourist trail, connecting you with real Bhutanese people, culture, and daily life.' },
  { icon: Leaf,   title: 'Sustainable Tourism',     desc: "Bhutan's unique 'High Value, Low Impact' philosophy guides every tour we design." },
  { icon: Shield, title: 'Licensed & Trustworthy',  desc: 'Fully certified by the Department of Tourism (DOT), Royal Government of Bhutan. License No. 50001567.' },
  { icon: Award,  title: 'Expert Local Guides',     desc: 'All guides are certified, local Bhutanese experts with deep knowledge of culture, history, and terrain.' },
  { icon: Users,  title: 'Personalized Service',    desc: 'No two trips are the same. We custom-craft every itinerary around your interests and travel style.' },
  { icon: Globe,  title: 'End-to-End Planning',     desc: 'From visa processing to airport pickup — we handle every detail so you can simply enjoy Bhutan.' },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative pt-36 pb-20 sm:pt-44 sm:pb-24 text-white text-center overflow-hidden"
        style={{ backgroundImage: 'url(/images/monastery-architecture.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
      >
        <div className="absolute inset-0 bg-stone-900/65" />
        <div className="relative z-10 max-w-3xl mx-auto px-5">
          <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase mb-4 block">About Us</span>
          <h1 className="font-serif text-[2rem] sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-5 leading-tight">
            More Than a Tour Company — We&apos;re Your Gateway to Bhutan
          </h1>
          <p className="text-white/80 text-base sm:text-lg">
            Founded by Bhutanese guides with a passion for sharing their extraordinary kingdom, Arise Bhutan Tours & Travel has been crafting life-changing journeys since 2026.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-20 bg-white dark:bg-stone-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div>
              <span className="section-badge">Our Story</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-6 leading-tight">
                Born from a Love of Bhutan
              </h2>
              <div className="space-y-4 text-stone-600 dark:text-stone-400 leading-relaxed text-sm sm:text-base">
                <p>
                  Arise Bhutan was founded with a single conviction: that Bhutan deserves to be experienced deeply, not just seen briefly. Too many travelers arrive, tick the Tiger&apos;s Nest off their list, and leave — missing the ancient soul of this remarkable kingdom.
                </p>
                <p>
                  Our founder created Arise Bhutan to build the bridge between curious travelers and authentic Bhutanese culture. The name &ldquo;Arise&rdquo; captures our core belief: that the best journeys don&apos;t just take you somewhere new — they awaken something within you.
                </p>
                <p>
                  Every itinerary we craft is designed to create that awakening: a morning hike where prayer flags flutter in mountain mist, a festival moment where centuries-old dance dissolves time, a quiet afternoon in a farmhouse where a family shares their ema datshi and stories of the land.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden">
                <Image src="/images/tigers-nest-2.jpg" alt="Tiger's Nest" fill className="object-cover" />
              </div>
              <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden sm:mt-8">
                <Image src="/images/cham-dance-blue.jpg" alt="Cham Dance festival" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-amber-50 to-white dark:from-stone-900 dark:to-stone-950 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="section-badge">Our Philosophy</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-4 leading-tight">What Does It Mean to &ldquo;Arise&rdquo;?</h2>
          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 text-left mt-10">
            {[
              { num: '01', title: 'To Awaken', body: "Bhutan doesn't just change your itinerary — it changes your perspective. Leave with a clearer sense of what makes a life well-lived." },
              { num: '02', title: 'To Explore', body: 'Go beyond the famous sights. We take you to hidden valleys, family homes, and sacred places most visitors never find.' },
              { num: '03', title: 'To Grow', body: 'The best travel is transformative. We design every journey to stretch your horizons, deepen your understanding, and nourish your spirit.' },
            ].map(({ num, title, body }) => (
              <div key={num} className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-7 shadow-sm border border-amber-100 dark:border-stone-800 hover:shadow-md dark:hover:shadow-black/40 transition-all duration-300">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-200 dark:text-amber-500/40 block mb-3">{num}</span>
                <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-50 mb-2">{title}</h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 bg-white dark:bg-stone-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-14">
            <span className="section-badge">What We Stand For</span>
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 sm:p-6 rounded-2xl border border-stone-100 dark:border-stone-800 dark:bg-stone-900 hover:shadow-md dark:hover:shadow-black/40 hover:border-amber-200 dark:hover:border-stone-700 transition-all">
                <div className="w-11 h-11 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1 text-sm sm:text-base">{title}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* License & Credentials */}
      <section className="py-16 sm:py-20 bg-amber-50 dark:bg-stone-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-badge">Official Credentials</span>
            <h2 className="section-title">Officially Licensed by the Royal Government of Bhutan</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base mt-2">Arise Bhutan Tours &amp; Travel holds a valid business license issued by the Department of Industry, Ministry of Industry, Commerce and Employment.</p>
          </div>
          <div className="bg-white dark:bg-stone-950 rounded-3xl border border-amber-100 dark:border-stone-800 shadow-sm overflow-hidden transition-colors duration-300">
            {/* Header bar */}
            <div className="bg-stone-900 px-6 sm:px-8 py-5 flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-white font-bold text-sm sm:text-base">Business License — Arise Tours and Travels</p>
                <p className="text-stone-400 text-xs mt-0.5">Department of Industry · Ministry of Industry, Commerce and Employment · Royal Government of Bhutan</p>
              </div>
            </div>
            {/* License details grid */}
            <div className="px-6 sm:px-8 py-6 grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
              {[
                { label: 'License No.',       value: '50001567' },
                { label: 'Issued',            value: '22 June 2026' },
                { label: 'Valid Until',        value: '23 June 2027' },
                { label: 'Activity',          value: 'Tour Operator Activities (Tourism Services)' },
                { label: 'Location',          value: 'Paro, Bhutan' },
                { label: 'Owner',             value: 'Kuenzang Wangchuk' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-stone-400 dark:text-stone-500 text-xs uppercase tracking-wider font-medium mb-1">{label}</p>
                  <p className="text-stone-900 dark:text-stone-100 font-semibold text-sm sm:text-base leading-snug">{value}</p>
                </div>
              ))}
            </div>
            {/* Download button */}
            <div className="px-6 sm:px-8 pb-6 pt-2 border-t border-stone-100 dark:border-stone-800">
              <a
                href="/arise-bhutan-license.pdf"
                download="Arise-Bhutan-Business-License.pdf"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Official License (PDF)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Info */}
      <section id="travel-info" className="py-16 sm:py-20 bg-white dark:bg-stone-950 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="section-badge">Essential Information</span>
            <h2 className="section-title">Planning Your Bhutan Visit</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {[
              { q: 'Do I need a visa?', a: 'Yes. All visitors (except Indian, Bangladeshi, and Maldivian nationals) require a Bhutan visa. Arise Bhutan handles all visa processing on your behalf. Visas are issued only through licensed tour operators.' },
              { q: 'What is the Sustainable Development Fee (SDF)?', a: 'Bhutan charges a mandatory daily SDF of USD 100/day (as of 2024). This fee supports free education, healthcare, and environmental conservation. It is included in all our packages.' },
              { q: 'When is the best time to visit?', a: 'March–May (spring, rhododendrons in bloom) and September–November (autumn, clear mountain views) are peak seasons. Winter (Dec–Feb) is cold but offers uncrowded festivals like Punakha Drubchen.' },
              { q: 'How do I get to Bhutan?', a: 'Bhutan is served by Druk Air and Bhutan Airlines, with connections from Bangkok, Singapore, Delhi, Kathmandu, Mumbai, and Kolkata. The approach to Paro Airport is one of the world\'s most dramatic.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-5 sm:p-6 border border-stone-100 dark:border-stone-800 hover:border-amber-200 dark:hover:border-stone-700 transition-colors">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 text-sm sm:text-base">{q}</h3>
                <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16 bg-amber-600 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Plan Your Bhutan Adventure?</h2>
          <p className="text-amber-100 mb-7 sm:mb-8 text-sm sm:text-base">Our specialists are standing by to craft your perfect itinerary.</p>
          <Link href="/contact" className="bg-white text-amber-700 font-bold px-8 py-4 rounded-full hover:bg-amber-50 transition-colors inline-block shadow-lg">
            Get in Touch Today
          </Link>
        </div>
      </section>
    </div>
  )
}
