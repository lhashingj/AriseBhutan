import { Star, Quote } from 'lucide-react'

const reviews = [
  {
    name: 'Sarah & Mark Thompson',
    country: '🇺🇸 United States',
    tour: 'Classic Bhutan Cultural Tour',
    rating: 5,
    text: "Arise Bhutan exceeded every expectation. Our guide was knowledgeable, warm, and genuinely passionate about sharing his country. Tiger's Nest was transcendent — no photo prepares you for the real thing. We'll be back.",
  },
  {
    name: 'Mei Lin Chen',
    country: '🇸🇬 Singapore',
    tour: 'Paro Tshechu Festival Tour',
    rating: 5,
    text: "Witnessing the Thongdrel unveiling at dawn was the most powerful thing I've ever experienced. The Arise team arranged perfect front-row positions. Every detail was flawlessly organized. Bhutan changed my soul.",
  },
  {
    name: 'Dr. Raj & Priya Sharma',
    country: '🇮🇳 India',
    tour: 'Bhutan Wellness Retreat',
    rating: 5,
    text: 'The wellness retreat was everything we needed after a hectic year. The hot stone bath, the monastery meditation, the organic food — all perfect. Our guide felt like a friend by the end. Highly recommend Arise Bhutan.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <span className="section-badge">Traveler Reviews</span>
          <h2 className="section-title">Stories from Our Guests</h2>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-stone-600 ml-2 font-semibold text-sm sm:text-base">4.9 / 5 — Based on 500+ reviews</span>
          </div>
        </div>

        {/* Mobile: horizontal snap scroll | md+: 3-column grid */}
        <div className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
          {reviews.map(({ name, country, tour, rating, text }) => (
            <div
              key={name}
              className="flex-none w-[82vw] sm:w-[60vw] md:w-auto snap-start bg-stone-50 rounded-2xl p-6 sm:p-7 border border-stone-100 hover:shadow-lg transition-all duration-300 relative"
            >
              <Quote className="w-7 h-7 text-amber-200 absolute top-5 right-5" />
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed mb-5 italic">&ldquo;{text}&rdquo;</p>
              <div className="border-t border-stone-200 pt-4">
                <p className="font-semibold text-stone-900 text-sm">{name}</p>
                <p className="text-stone-500 text-xs mt-0.5">{country}</p>
                <p className="text-amber-600 text-xs font-medium mt-1">{tour}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint — only visible on mobile */}
        <p className="text-center text-stone-400 text-xs mt-4 md:hidden">Swipe to read more →</p>
      </div>
    </section>
  )
}
