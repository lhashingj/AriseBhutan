import TestimonialsCarousel, { type Review } from './TestimonialsCarousel'

// ── Real Google reviews ───────────────────────────────────────────────────────
const STATIC_REVIEWS: Review[] = [
  {
    author_name: 'Being Indian',
    date: 'March 2025',
    rating: 5,
    text: 'Best tour guide in whole bhutan and he will arrange for your all needs taxis hotels and guide all will be taken care of',
    profile_photo_url: null,
    reviewPhoto: '/reviews/being-indian.jpg',
  },
  {
    author_name: 'Divyesh Patel',
    date: 'February 2025',
    rating: 5,
    text: 'Just want to say missing Bhutan and missing our guide Kuenzang wangchuk. Must must visit bhutan',
    profile_photo_url: null,
    reviewPhoto: '/reviews/divyesh-patel.jpg',
  },
  {
    author_name: 'sujit kumar',
    date: 'January 2025',
    rating: 5,
    text: 'We have had an excellent trip to Bhutan. It was one of our best trip. All thanks to our tour guide Kunzang (DJ) who was very punctual, friendly and caring. He gave us lots of historical and cultural information about Bhutan. We really had an amazing time together. Hope to see you again!',
    profile_photo_url: null,
    reviewPhoto: null,
  },
  {
    author_name: 'K in Motion',
    date: 'December 2024',
    rating: 5,
    text: "Wangchuk is a lively young man who will show you the best of his country and make sure you are taken care of. He's a wonderful human who goes above and beyond what is expected to ensure that your time in Bhutan is full of good times.",
    profile_photo_url: null,
    reviewPhoto: null,
  },
]

interface PlaceResult {
  rating?: number
  user_ratings_total?: number
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
      `&fields=rating,user_ratings_total,url` +
      `&language=en` +
      `&key=${apiKey}`

    const res = await fetch(url, { next: { revalidate: 86400 } })
    const data = await res.json()
    if (data.status !== 'OK') return null
    return data.result as PlaceResult
  } catch {
    return null
  }
}

export default async function Testimonials() {
  const place = await fetchGooglePlaceDetails()

  const mapsUrl =
    place?.url ??
    'https://www.google.com/maps/place/Arise+Bhutan+Tours+%26+Travels/@27.4211577,89.4225462,17z'
  const totalStr = place?.user_ratings_total
    ? `${place.user_ratings_total.toLocaleString()}+`
    : '11+'

  return (
    <TestimonialsCarousel
      reviews={STATIC_REVIEWS}
      totalStr={totalStr}
      mapsUrl={mapsUrl}
    />
  )
}
