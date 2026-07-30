export interface GoogleReview {
  author_name: string
  rating: number
  text: string
  relative_time_description: string
  profile_photo_url?: string
}

export interface PlaceResult {
  rating?: number
  user_ratings_total?: number
  reviews?: GoogleReview[]
  url?: string
}

export async function fetchGooglePlaceDetails(): Promise<PlaceResult | null> {
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
