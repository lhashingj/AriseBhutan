export interface TravelInterest {
  id: string
  name: string
  priceLabel: string
  free: boolean
  category: 'Cultural' | 'Spiritual' | 'Adventure' | 'Nature' | 'Wellness' | 'Leisure'
  emoji: string
}

export const TRAVEL_INTERESTS: TravelInterest[] = [
  { id: 'cultural-sights',      name: 'Cultural Sights And Activities',                    priceLabel: 'No Additional Cost',  free: true,  category: 'Cultural',  emoji: '🏛️' },
  { id: 'nature-hikes',         name: 'Nature Hikes And Trails',                           priceLabel: 'No Additional Cost',  free: true,  category: 'Nature',    emoji: '🥾' },
  { id: 'multi-day-trekking',   name: 'Multi Day Trekking With Camping',                   priceLabel: 'Charges Applicable',  free: false, category: 'Adventure', emoji: '⛺' },
  { id: 'archery',              name: 'Play Archery And Other Traditional Games',           priceLabel: 'No Additional Cost',  free: true,  category: 'Cultural',  emoji: '🏹' },
  { id: 'cycling',              name: 'Cycling In A Rural Setting',                        priceLabel: 'USD 40/Cycle',        free: false, category: 'Adventure', emoji: '🚴' },
  { id: 'monastery-stay',       name: 'Night Stay at a Monastery',                         priceLabel: 'Charges Applicable',  free: false, category: 'Spiritual', emoji: '🙏' },
  { id: 'nightlife',            name: 'Bar And Nightlife in Thimphu',                      priceLabel: 'No Additional Cost',  free: true,  category: 'Leisure',   emoji: '🌙' },
  { id: 'farm-stay',            name: 'Rural Farm Stay And Farm Activities',               priceLabel: 'Charges Applicable',  free: false, category: 'Cultural',  emoji: '🌾' },
  { id: 'pottery',              name: 'Pottery Class For Beginners',                       priceLabel: 'USD 40/Person',       free: false, category: 'Cultural',  emoji: '🏺' },
  { id: 'art-class',            name: 'Basic Art And Painting Class',                      priceLabel: 'USD 50/Person',       free: false, category: 'Cultural',  emoji: '🎨' },
  { id: 'meditation',           name: 'Meditation And Yoga Class',                         priceLabel: 'USD 40/Person',       free: false, category: 'Wellness',  emoji: '🧘' },
  { id: 'weaving',              name: 'Lesson On Traditional Weaving And Textile Dyeing',  priceLabel: 'USD 50/Person',       free: false, category: 'Cultural',  emoji: '🧵' },
  { id: 'astrologer',           name: 'Consult A Buddhist Astrologer',                     priceLabel: 'USD 10/Person',       free: false, category: 'Spiritual', emoji: '🔮' },
  { id: 'buddha-talk',          name: 'Talk On Buddha Dharma',                             priceLabel: 'USD 20/Person',       free: false, category: 'Spiritual', emoji: '☸️' },
  { id: 'medicine',             name: 'Consult A Traditional Medicine Doctor',              priceLabel: 'USD 20/Person',       free: false, category: 'Wellness',  emoji: '🌿' },
  { id: 'school-visit',         name: 'Rural School Visit',                                priceLabel: 'No Additional Cost',  free: true,  category: 'Cultural',  emoji: '🏫' },
  { id: 'cooking',              name: 'Cooking Class On Local Dishes',                     priceLabel: 'No Additional Cost',  free: true,  category: 'Cultural',  emoji: '🍲' },
  { id: 'horseback',            name: 'Horseback Riding',                                  priceLabel: 'USD 80/Horse',        free: false, category: 'Adventure', emoji: '🐎' },
  { id: 'head-shaved',          name: 'Get Head Shaved By A Monk',                        priceLabel: 'No Additional Cost',  free: true,  category: 'Spiritual', emoji: '✂️' },
  { id: 'village-visit',        name: 'Visit A Rural Village',                             priceLabel: 'No Additional Cost',  free: true,  category: 'Cultural',  emoji: '🏘️' },
  { id: 'wedding',              name: 'Traditional Wedding Ceremony',                      priceLabel: 'Charges Applicable',  free: false, category: 'Cultural',  emoji: '💐' },
  { id: 'prayer-flag',          name: 'Hoist A Prayer Flag',                               priceLabel: 'No Additional Cost',  free: true,  category: 'Spiritual', emoji: '🚩' },
  { id: 'rafting',              name: 'River Rafting In Punakha',                          priceLabel: 'USD 100/Raft',        free: false, category: 'Adventure', emoji: '🛶' },
  { id: 'bumdra-camping',       name: 'Camping At Bumdra Camp Site',                       priceLabel: 'USD 150/Person',      free: false, category: 'Adventure', emoji: '🏕️' },
  { id: 'plant-tree',           name: 'Plant A Tree',                                      priceLabel: 'No Additional Cost',  free: true,  category: 'Nature',    emoji: '🌱' },
  { id: 'cultural-performance', name: 'Private Cultural Performance',                       priceLabel: 'USD 80 for 1 Hour',  free: false, category: 'Cultural',  emoji: '💃' },
]

export const INTEREST_CATEGORIES = ['Cultural', 'Spiritual', 'Adventure', 'Nature', 'Wellness', 'Leisure'] as const

export type InterestCategory = typeof INTEREST_CATEGORIES[number]
