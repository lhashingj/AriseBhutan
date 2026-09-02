/**
 * Curated real Google reviews, shared between the homepage
 * Testimonials section (Server Component, adds live rating count via
 * Google Places API) and the tour detail page's client-safe mini
 * testimonial strip (which can't use the async Google fetch since the
 * page is a Client Component).
 */

export interface Review {
  author_name: string
  countryFlag: string
  rating: number
  text: string
  relative_time_description: string
  profile_photo_url: string | null
  reviewPhoto: string | null
  /** Optional — when a review has more than one photo, shown as a thumbnail strip instead of a single hero photo. */
  reviewPhotos?: string[]
}

export const STATIC_REVIEWS: Review[] = [
  {
    author_name: 'Budi Nasron',
    countryFlag: '',
    rating: 5,
    text: 'Highly recommended. I book 2 nights & 3 days tour with Arise Bhutan. I had Kuenzang Wangchuk as my guide & Ugyen Wangdi as my driver. I had an enjoyable & fun tour with both gentlemen. Highlights of the tour; flexibility...Wangchuk & Ogyen are very well versed on the attractions in Paro and even suggested better ones along the way. 10 km total hike to Taktsang or the famous Tiger’s Nest...memorable & very picturesque all the way up. Restaurants selection were all neat & delicious with a restaurant that has my own local dish being recommended. I told them that i want to experience how local lives and their culture, so they took me to have high tea in one of his friend’s house coinciding with first rice harvest in the village..plus the archery & town.',
    relative_time_description: 'an hour ago',
    profile_photo_url: null,
    reviewPhoto: '/reviews/budi-review-3.jpg',
    reviewPhotos: [
      '/reviews/budi-review-3.jpg',
      '/reviews/budi-review-1.jpg',
      '/reviews/budi-review-2.jpg',
      '/reviews/budi-review-4.jpg',
      '/reviews/budi-review-5.jpg',
      '/reviews/budi-review-6.jpg',
    ],
  },
  {
    author_name: 'Being Indian',
    countryFlag: '🇮🇳 India',
    rating: 5,
    text: 'Best tour guide in whole bhutan and he will arrange for your all needs taxis hotels and guide all will be taken care of',
    relative_time_description: 'a year ago',
    profile_photo_url: null,
    reviewPhoto: '/reviews/being-indian.jpg',
  },
  {
    author_name: 'Divyesh Patel',
    countryFlag: '🇮🇳 India',
    rating: 5,
    text: 'Just want to say missing Bhutan and missing our guide Kuenzang wangchuk. Must must visit bhutan',
    relative_time_description: 'a year ago',
    profile_photo_url: null,
    reviewPhoto: '/reviews/divyesh-patel.jpg',
  },
  {
    author_name: 'sujit kumar',
    countryFlag: '🇮🇳 India',
    rating: 5,
    text: 'We have had an excellent trip to Bhutan. It was one of our best trip. All thanks to our tour guide Kunzang (DJ) who was very punctual, friendly and caring. He gave us lots of historical and cultural information about Bhutan. We really had an amazing time together. Hope to see you again!',
    relative_time_description: 'a year ago',
    profile_photo_url: null,
    reviewPhoto: null,
  },
  {
    author_name: 'K in Motion',
    countryFlag: '',
    rating: 5,
    text: 'Wangchuk is a lively young man who will show you the best of his country and make sure you are taken care of. He\'s a wonderful human who goes above and beyond what is expected to ensure that your time in Bhutan is full of good times.',
    relative_time_description: 'a year ago',
    profile_photo_url: null,
    reviewPhoto: null,
  },
]
