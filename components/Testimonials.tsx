import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

// ── Fallback reviews shown when Google API is not yet configured ──────────────
const STATIC_REVIEWS = [
  {
    author_name: 'Sarah & Mark Thompson',
    countryFlag: '🇺🇸 United States',
    tour: 'Classic Bhutan Cultural Tour',
    rating: 5,
    text: "Arise Bhutan exceeded every expectation. Our guide was knowledgeable, warm, and genuinely passionate about sharing his country. Tiger's Nest was transcendent — no photo prepares you for the real thing. We'll be back.",
    relative_time_description: '',
    profile_photo_url: null as string | null,
  },
  {
    author_name: 'Mei Lin Chen',
    countryFlag: '🇸🇬 Singapore',
    tour: 'Paro Tshechu Festival Tour',
    rating: 5,
    text: "Witnessing the Thongdrel unveiling at dawn was the most powerful thing I've ever experienced. The Arise team arranged perfect front-row positions. Every detail was flawlessly organized. Bhutan changed my soul.",
    relative_time_description: '',
    profile_photo_url: null as string | null,
  },
  {
    author_name: 'Dr. Raj & Priya Sharma',
    countryFlag: '🇮🇳 India',
    tour: 'Bhutan Wellness Retreat',
    rating: 5,
    text: 'The wellness retreat was everything we needed after a hectic year. The hot stone bath, the monastery meditation, the organic food — all perfect. Our guide felt like a friend by the end. Highly recommend Arise Bhutan.',
    relative_time_description: '',
    profile_photo_url: null as string | null,
  },
]

interface GoogleReview {
  author_name: string
  rating: number
  text: string
  relative_time_description: string
  profile_photo_url?: string
}

interface PlaceResult {
  rating?: number
  user_ratings_total?: number
  reviews?: GoogleReview[]
  url?: string
}

async function fetchGooglePlaceDetails(): Promise<PlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  if (!apiKey || !placeId) return null

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}` +
      `&fields=rating,reviews,user_ratings_total,url` +
      `&reviews_sort=newest` +
      `&language=en` +
      `&key=${apiKey}`

    const res = await fetch(url, { next: { revalidate: 86400 } })
    const data = await res.json()
    if (data.status !== 'OK') {
      console.error('[Google Reviews]', data.status, data.error_message ?? '')
      return null
    }
    return data.result as PlaceResult
  } catch (err) {
    console.error('[Google Reviews] fetch failed:', err)
    return null
  }
}

// Tiny Google "G" badge SVG (inline so no extra network request)
function GoogleBadge() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-label="Google review">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default async function Testimonials() {
  const place = await fetchGooglePlaceDetails()
  const usingGoogle = !!(place?.reviews?.length)

  // Pick the 3 best Google reviews (prefer 5-star, fall back to any)
  let displayReviews: GoogleReview[] = []
  if (usingGoogle && place!.reviews) {
    const fiveStars = place!.reviews.filter(r => r.rating === 5)
    displayReviews = (fiveStars.length >= 2 ? fiveStars : place!.reviews).slice(0, 3)
  }

  const mapsUrl = place?.url ?? `https://www.google.com/maps/place/?q=place_id:${process.env.GOOGLE_PLACE_ID ?? ''}`
  const totalStr = place?.user_ratings_total ? `${place.user_ratings_total.toLocaleString()}+` : '500+'
  const avgStr   = place?.rating ? place.rating.toFixed(1) : '4.9'

  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <span className="section-badge">Traveler Reviews</span>
          <h2 className="section-title">Stories from Our Guests</h2>
          <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-stone-600 ml-2 font-semibold text-sm sm:text-base">
              {avgStr} / 5 — Based on {totalStr} reviews
            </span>
            {usingGoogle && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                <GoogleBadge /> Google
              </a>
            )}
          </div>
        </div>

        {/* Mobile: horizontal snap scroll | md+: 3-column grid */}
        <div className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
          {usingGoogle
            ? displayReviews.map((r, i) => (
                <div
                  key={i}
                  className="flex-none w-[82vw] sm:w-[60vw] md:w-auto snap-start bg-stone-50 rounded-2xl p-6 sm:p-7 border border-stone-100 hover:shadow-lg transition-all duration-300 relative"
                >
                  <Quote className="w-7 h-7 text-amber-200 absolute top-5 right-5" />
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(r.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-700 text-sm leading-relaxed mb-5 italic line-clamp-6">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <div className="border-t border-stone-200 pt-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {r.profile_photo_url ? (
                        <Image
                          src={r.profile_photo_url}
                          alt={r.author_name}
                          width={32}
                          height={32}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                          {r.author_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">{r.author_name}</p>
                        {r.relative_time_description && (
                          <p className="text-stone-400 text-xs mt-0.5">{r.relative_time_description}</p>
                        )}
                      </div>
                    </div>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 mt-1 opacity-60 hover:opacity-100 transition-opacity"
                      title="View on Google"
                    >
                      <GoogleBadge />
                    </a>
                  </div>
                </div>
              ))
            : STATIC_REVIEWS.map(({ author_name, countryFlag, tour, rating, text }) => (
                <div
                  key={author_name}
                  className="flex-none w-[82vw] sm:w-[60vw] md:w-auto snap-start bg-stone-50 rounded-2xl p-6 sm:p-7 border border-stone-100 hover:shadow-lg transition-all duration-300 relative"
                >
                  <Quote className="w-7 h-7 text-amber-200 absolute top-5 right-5" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-700 text-sm leading-relaxed mb-5 italic">&ldquo;{text}&rdquo;</p>
                  <div className="border-t border-stone-200 pt-4">
                    <p className="font-semibold text-stone-900 text-sm">{author_name}</p>
                    <p className="text-stone-500 text-xs mt-0.5">{countryFlag}</p>
                    <p className="text-amber-600 text-xs font-medium mt-1">{tour}</p>
                  </div>
                </div>
              ))}
        </div>

        {/* Scroll hint — only visible on mobile */}
        <p className="text-center text-stone-400 text-xs mt-4 md:hidden">Swipe to read more →</p>

        {usingGoogle && (
          <div className="text-center mt-8">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 border border-stone-200 rounded-full px-5 py-2.5 hover:border-stone-300 transition-all"
            >
              <GoogleBadge />
              See all reviews on Google
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
