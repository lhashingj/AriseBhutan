import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

// ── Real Google reviews (shown when API is not configured) ────────────────────
const STATIC_REVIEWS = [
  {
    author_name: 'Being Indian',
    countryFlag: '🇮🇳 India',
    rating: 5,
    text: 'Best tour guide in whole bhutan and he will arrange for your all needs taxis hotels and guide all will be taken care of',
    relative_time_description: 'a year ago',
    profile_photo_url: null as string | null,
    reviewPhoto: '/reviews/being-indian.jpg',
  },
  {
    author_name: 'Divyesh Patel',
    countryFlag: '🇮🇳 India',
    rating: 5,
    text: 'Just want to say missing Bhutan and missing our guide Kuenzang wangchuk. Must must visit bhutan',
    relative_time_description: 'a year ago',
    profile_photo_url: null as string | null,
    reviewPhoto: '/reviews/divyesh-patel.jpg',
  },
  {
    author_name: 'sujit kumar',
    countryFlag: '🇮🇳 India',
    rating: 5,
    text: 'We have had an excellent trip to Bhutan. It was one of our best trip. All thanks to our tour guide Kunzang (DJ) who was very punctual, friendly and caring. He gave us lots of historical and cultural information about Bhutan. We really had an amazing time together. Hope to see you again!',
    relative_time_description: 'a year ago',
    profile_photo_url: null as string | null,
    reviewPhoto: null as string | null,
  },
  {
    author_name: 'K in Motion',
    countryFlag: '',
    rating: 5,
    text: 'Wangchuk is a lively young man who will show you the best of his country and make sure you are taken care of. He\'s a wonderful human who goes above and beyond what is expected to ensure that your time in Bhutan is full of good times.',
    relative_time_description: 'a year ago',
    profile_photo_url: null as string | null,
    reviewPhoto: null as string | null,
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
  // Use Google API only for the live rating count — always show our curated reviews with photos
  const place = await fetchGooglePlaceDetails()

  const mapsUrl = place?.url ?? `https://www.google.com/maps/place/Arise+Bhutan+Tours+%26+Travels/@27.4211577,89.4225462,17z`
  const totalStr = place?.user_ratings_total ? `${place.user_ratings_total.toLocaleString()}+` : '11+'
  const avgStr   = place?.rating ? place.rating.toFixed(1) : '5.0'

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
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <GoogleBadge /> Google
            </a>
          </div>
        </div>

        {/* Mobile: horizontal snap scroll | md+: 2-column grid | lg+: 4-column grid */}
        <div className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
          {STATIC_REVIEWS.map(({ author_name, countryFlag, rating, text, relative_time_description, reviewPhoto }) => (
                <div
                  key={author_name}
                  className="flex-none w-[82vw] sm:w-[60vw] md:w-auto snap-start bg-stone-50 rounded-2xl border border-stone-100 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Tour photo */}
                  {reviewPhoto && (
                    <div className="relative w-full h-44 flex-shrink-0">
                      <Image
                        src={reviewPhoto}
                        alt={`${author_name}'s Bhutan tour`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 82vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  )}
                  <div className="p-6 sm:p-7 flex flex-col flex-1 relative">
                    <Quote className="w-7 h-7 text-amber-200 absolute top-4 right-4" />
                    <div className="flex gap-1 mb-3">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-stone-700 text-sm leading-relaxed mb-5 italic flex-1">&ldquo;{text}&rdquo;</p>
                    <div className="border-t border-stone-200 pt-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                          {author_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900 text-sm leading-tight">{author_name}</p>
                          <p className="text-stone-400 text-xs mt-0.5">
                            {countryFlag}{countryFlag && relative_time_description ? ' · ' : ''}{relative_time_description}
                          </p>
                        </div>
                      </div>
                      <a
                        href="https://www.google.com/maps/place/Arise+Bhutan+Tours+%26+Travels/@27.4211577,89.4225462,17z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                        title="View on Google"
                      >
                        <GoogleBadge />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Scroll hint — only visible on mobile */}
        <p className="text-center text-stone-400 text-xs mt-4 md:hidden">Swipe to read more →</p>

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
      </div>
    </section>
  )
}
