export interface TourDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  accommodation: string;
  meals: string;
}

export interface Tour {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'cultural' | 'adventure' | 'festival' | 'luxury';
  categoryLabel: string;
  duration: string;
  nights: number;
  days: number;
  groupSize: string;
  startingFrom: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Strenuous';
  highlights: string[];
  overview: string;
  itinerary: TourDay[];
  inclusions: string[];
  exclusions: string[];
  image: string;
  heroImage: string;
  gallery: string[];
  bestSeason: string;
  rating: number;
  reviews: number;
  featured: boolean;
  locations: string[];
  badge?: string;
}

export const tours: Tour[] = [
  // ─── CULTURAL TOURS ───────────────────────────────────────────────
  {
    id: 'classic-bhutan-cultural',
    slug: 'classic-bhutan-cultural-tour',
    title: 'Classic Bhutan Cultural Tour',
    subtitle: 'Paro · Thimphu · Punakha',
    category: 'cultural',
    categoryLabel: 'Cultural Tour',
    duration: '5 Days / 4 Nights',
    nights: 4, days: 5,
    groupSize: '2–15 pax',
    startingFrom: 1850,
    difficulty: 'Easy',
    locations: ['Paro', 'Thimphu', 'Punakha'],
    badge: 'Most Popular',
    featured: true,
    bestSeason: 'March–May, September–November',
    rating: 4.9, reviews: 127,
    image: '/images/monastery-architecture.jpg',
    heroImage: '/images/couple-dzong.jpg',
    gallery: ['/images/couple-dzong.jpg', '/images/monastery-architecture.jpg', '/images/buddha-dordenma.jpg', '/images/river-bridge.jpg'],
    highlights: [
      "Hike to Tiger's Nest Monastery (Paro Taktsang) — 900m above the valley floor",
      'Punakha Dzong at the confluence of the Pho Chhu and Mo Chhu rivers',
      'Buddha Dordenma — 169-foot gilded bronze statue with panoramic city views',
      'Dochu La pass with 108 chortens and 360° Himalayan panorama',
      'Chimi Lhakhang — the whimsical Temple of the Divine Madman',
      'Traditional hot stone bath (dotsho) with herbal infusions',
      'Thimphu National Memorial Chorten and weekend craft bazaar',
    ],
    overview: `Journey beyond the "happiest nation" headlines to experience Bhutan's authentic heritage — sacred monasteries, traditional crafts, local markets, and family homestays guided by passionate local experts.\n\nOver five transformative days, you'll travel through Bhutan's three most celebrated valleys: Paro, Thimphu, and Punakha. Witness ancient fortresses perched above rushing rivers, hike to a monastery clinging impossibly to a cliffside, and immerse yourself in daily Bhutanese life. Your licensed Arise Bhutan guide brings centuries of history and culture to life, ensuring you leave not just having seen Bhutan, but having truly understood it.`,
    itinerary: [
      {
        day: 1, title: 'Arrival in Paro → Thimphu',
        description: 'Land at Paro International Airport — one of the world\'s most dramatic approaches, ringed by Himalayan peaks at 7,300 ft elevation. Your guide meets you with a traditional Khadar welcome scarf. Drive to Thimphu (1.5 hrs) for a traditional Bhutanese lunch. Visit Motithang Takin Preserve (the national animal — a cross between a cow and a goat in Bhutanese legend) and the 169-ft Buddha Dordenma statue with sweeping panoramic views across the capital.',
        activities: ['Airport pickup & Khadar welcome', 'Motithang Takin Preserve', 'Buddha Dordenma', 'Thimphu orientation walk', 'Welcome dinner'],
        accommodation: 'Hotel, Thimphu (3★)', meals: 'Lunch · Dinner'
      },
      {
        day: 2, title: 'Thimphu Culture & Crafts',
        description: 'A full day exploring Bhutan\'s living cultural heritage. Morning at the Centenary Farmers\' Market (weekends), National Folk Heritage Museum, and National Textile Museum — where master weavers demonstrate the symbolic designs that encode Bhutanese identity. Visit Jungshi Handmade Paper Factory, where tree bark is transformed into sacred Deh-sho paper. Afternoon at Simtokha Dzong (oldest fortress in Bhutan) and the massive Tashichho Dzong — seat of the King — reputedly built without a single written plan.',
        activities: ['Centenary Farmers\' Market', 'Folk Heritage Museum', 'Textile Museum', 'Paper Factory', 'Simtokha Dzong', 'Tashichho Dzong'],
        accommodation: 'Hotel, Thimphu (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 3, title: 'Thimphu to Punakha via Dochu La',
        description: 'Cross the dramatic 3,100m Dochu La mountain pass, rimmed by 108 whitewashed Druk Wangyal chortens built by the Queen Mother. On clear days, a full arc of snow-capped Himalayan peaks fills the horizon. Descend into warm subtropical Punakha Valley. Afternoon visit to the magnificent Punakha Dzong — a 6-storey fortress at the confluence of two sacred rivers, winter residence of Bhutan\'s monastic body, and site of the 2011 Royal Wedding. Walk across the 160m Pho Chhu suspension bridge to Chimi Lhakhang, the fertility temple of the Divine Madman.',
        activities: ['Dochu La pass & 108 chortens', 'Punakha Dzong', 'Pho Chhu suspension bridge', 'Chimi Lhakhang'],
        accommodation: 'Resort, Punakha (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 4, title: 'Punakha Valley & Paro',
        description: 'Morning hike to Khamsum Yulley Namgyal Chorten — commissioned by the Queen Mother, with intricate murals of protective deities and panoramic rooftop views over the Mo Chhu valley. Traditional riverside picnic with local flavors. Afternoon drive to Paro through the Wang Chhu river valley. Visit Kyichu Lhakhang — one of Bhutan\'s oldest and most sacred temples, built in the 7th century by Tibetan King Songtsen Gampo.',
        activities: ['Khamsum Yulley Namgyal Chorten hike', 'Riverside picnic', 'Drive to Paro', 'Kyichu Lhakhang', 'Paro town evening'],
        accommodation: 'Hotel, Paro (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 5, title: "Tiger's Nest Monastery & Departure",
        description: 'The centrepiece of any Bhutan journey. The monastery clings miraculously to a sheer granite cliff at 3,120m — 900 metres above the Paro Valley floor. A 4-hour round-trip hike through fragrant pine and cypress forest draped in thousands of prayer flags. Stop at the famous viewpoint café for Bhutanese butter tea. Tour the sacred cave temples inside, where Guru Rinpoche is said to have meditated for three years in the 8th century. Return for a farewell lunch before airport transfer.',
        activities: ["Tiger's Nest hike (4 hrs)", 'Viewpoint café & butter tea', 'Monastery interior tour', 'Sacred cave visit', 'Farewell lunch', 'Airport transfer'],
        accommodation: 'N/A', meals: 'Breakfast · Lunch'
      },
    ],
    inclusions: ['4 nights 3-star hotels', 'All ground transportation in private vehicle', 'Licensed English-speaking guide', 'Bhutan SDF (Sustainable Development Fee) — $100/day', 'Visa processing assistance', 'All monastery & site entrance fees', 'Meals per itinerary', 'Airport transfers', 'Traditional hot stone bath (dotsho)', 'Traditional Bhutanese costume set (returnable)'],
    exclusions: ['Travel insurance (strongly recommended)', 'Personal expenses & souvenirs', 'Alcoholic beverages', 'Tips for guide & driver'],
  },

  {
    id: 'bhutan-heritage-trail',
    slug: 'bhutan-heritage-trail',
    title: 'Bhutan Heritage Trail',
    subtitle: 'Paro · Thimphu · Punakha · Wangdue',
    category: 'cultural',
    categoryLabel: 'Cultural Tour',
    duration: '7 Days / 6 Nights',
    nights: 6, days: 7,
    groupSize: '2–12 pax',
    startingFrom: 2400,
    difficulty: 'Easy',
    locations: ['Paro', 'Thimphu', 'Punakha', 'Wangdue Phodrang'],
    featured: true,
    bestSeason: 'March–May, September–November',
    rating: 4.8, reviews: 89,
    image: '/images/guide-valley-wide.jpg',
    heroImage: '/images/river-temple.jpg',
    gallery: ['/images/river-temple.jpg', '/images/guide-valley-wide.jpg', '/images/pilgrimage-group.jpg', '/images/group-temple.jpg'],
    highlights: [
      "Tiger's Nest Monastery hike — cliffside pilgrimage site at 3,120m",
      'Traditional farmhouse lunch with a Bhutanese family',
      'Chimi Lhakhang — Temple of the Divine Madman at Lobesa village',
      'Phobjikha glacial valley — winter sanctuary of rare Black-Necked Cranes',
      'Wangdue Phodrang Dzong — one of Bhutan\'s oldest districts',
      'Live archery demonstration — experience Bhutan\'s national sport',
      'Simtokha Dzong — oldest intact fortress in the Kingdom',
    ],
    overview: `Delve deeper into Bhutan's extraordinary heritage on this 7-day journey that extends beyond the classic western circuit into Wangdue Phodrang, one of Bhutan's oldest and most storied districts.\n\nStay in a traditional farmhouse for an authentic taste of village life, witness Bhutan's national sport — archery — in the open fields of Punakha, and discover the pristine Phobjikha glacial valley, where hundreds of endangered Black-Necked Cranes overwinter each year. Your licensed Arise Bhutan guide weaves Bhutan's living culture into every step.`,
    itinerary: [
      {
        day: 1, title: 'Arrival in Paro',
        description: 'Arrive at Paro Airport. Meet your guide with a traditional Khadar welcome. Check in and rest. Late afternoon visit to the National Museum of Bhutan (Ta Dzong) — a cylindrical watchtower converted into a museum of thangka paintings, armour, and natural history. Evening stroll through Paro Bazaar.',
        activities: ['Airport pickup', 'National Museum of Bhutan', 'Paro Bazaar stroll', 'Welcome dinner'],
        accommodation: 'Heritage Hotel, Paro (3★)', meals: 'Dinner'
      },
      {
        day: 2, title: "Tiger's Nest & Drukgyel Dzong",
        description: "Full day centred on Bhutan's most iconic sight. The 4-hour round-trip hike ascends through pine forests draped in prayer flags to the Taktsang Monastery at 3,120m — 900 metres of sheer cliff below. Tour the sacred inner shrines and meditation caves. Afternoon: ruins of Drukgyel Dzong, the 17th-century fortress built to repel Tibetan invasions, partially destroyed by fire in 1957.",
        activities: ["Tiger's Nest hike (4 hrs)", 'Monastery interior & caves', 'Viewpoint picnic lunch', 'Drukgyel Dzong ruins'],
        accommodation: 'Heritage Hotel, Paro (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 3, title: 'Paro to Thimphu',
        description: 'Drive to Bhutan\'s vibrant capital via Simtokha Dzong — the oldest intact fortress in the kingdom, covered in intricate Buddhist paintings. In Thimphu: Tashichho Dzong (seat of the King\'s office), the 169-ft Buddha Dordenma statue, Folk Heritage Museum, and the National Textile Museum. Evening at the Craft Bazaar.',
        activities: ['Simtokha Dzong', 'Tashichho Dzong', 'Buddha Dordenma', 'Folk Heritage Museum', 'Textile Museum', 'Craft Bazaar'],
        accommodation: 'Boutique Hotel, Thimphu (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 4, title: 'Thimphu to Punakha via Dochu La',
        description: 'Cross Dochu La pass (3,100m) — 108 memorial chortens built by the Queen Mother ring the hilltop, with Himalayan peak views on clear days. Descend to Punakha Valley. Visit the spectacular Punakha Dzong and hike to Khamsum Yulley Namgyal Chorten for panoramic valley views.',
        activities: ['Dochu La pass & 108 chortens', 'Punakha Dzong', 'Khamsum Chorten hike', 'Suspension bridge walk'],
        accommodation: 'Resort, Punakha (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 5, title: 'Punakha Valley — Deep Cultural Immersion',
        description: 'Morning visit to Chimi Lhakhang across scenic rice fields — the fertility temple of Lama Drukpa Kunley, the "Divine Madman," built in 1499. Traditional home-cooked farmhouse lunch with a local family — a genuine glimpse into Bhutanese village life. Afternoon live archery demonstration: watch local archers compete at 145 metres, accompanied by traditional songs and dances. Evening traditional hot stone bath.',
        activities: ['Chimi Lhakhang', 'Farmhouse lunch with local family', 'Live archery demonstration', 'Traditional hot stone bath (dotsho)'],
        accommodation: 'Resort, Punakha (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 6, title: 'Phobjikha Valley & Wangdue Phodrang',
        description: 'Drive to the breathtaking Phobjikha glacial valley — one of Bhutan\'s most pristine landscapes and the winter home of endangered Black-Necked Cranes (November–March). Visit Gangtey Monastery (17th century) perched above the valley. Walk the Gangtey Nature Trail through meadows and forest. Visit the Black-Necked Crane Information Centre.',
        activities: ['Phobjikha Valley drive', 'Gangtey Monastery', 'Crane Centre', 'Gangtey Nature Trail', 'Wangdue Dzong viewpoint'],
        accommodation: 'Guesthouse, Gangtey', meals: 'Breakfast · Dinner'
      },
      {
        day: 7, title: 'Return to Paro & Departure',
        description: 'Scenic mountain drive back to Paro. Last-minute souvenir shopping at Paro market. Airport transfer and departure.',
        activities: ['Scenic mountain drive', 'Souvenir shopping', 'Airport transfer'],
        accommodation: 'N/A', meals: 'Breakfast'
      },
    ],
    inclusions: ['6 nights accommodation', 'All transportation in private vehicle', 'Licensed English-speaking guide', 'Bhutan SDF & visa processing', 'All entrance fees', 'Meals per itinerary', 'Farmhouse lunch experience', 'Traditional hot stone bath', 'Airport transfers'],
    exclusions: ['Travel insurance', 'Personal expenses', 'Alcoholic beverages', 'Tips'],
  },

  {
    id: 'kingdom-of-happiness',
    slug: 'kingdom-of-happiness-tour',
    title: 'Kingdom of Happiness',
    subtitle: 'Complete Western & Central Bhutan',
    category: 'cultural',
    categoryLabel: 'Cultural Tour',
    duration: '10 Days / 9 Nights',
    nights: 9, days: 10,
    groupSize: '2–10 pax',
    startingFrom: 3200,
    difficulty: 'Easy',
    locations: ['Paro', 'Thimphu', 'Punakha', 'Wangdue', 'Gangtey', 'Trongsa'],
    badge: 'Best Value',
    featured: false,
    bestSeason: 'March–May, September–November',
    rating: 4.9, reviews: 63,
    image: '/images/mountain-valley.jpg',
    heroImage: '/images/guide-valley-village.jpg',
    gallery: ['/images/mountain-valley.jpg', '/images/guide-valley-village.jpg', '/images/group-temple.jpg', '/images/monastery-architecture.jpg'],
    highlights: [
      'Complete western & central Bhutan circuit across 10 days',
      'Trongsa Dzong — ancestral home of Bhutan\'s royal Wangchuck dynasty',
      'Phobjikha glacial valley and Black-Necked Crane sanctuary',
      'Gangtey Monastery perched above a pristine glacial valley',
      'Traditional Bhutanese farmhouse homestay',
      'Taa Dzong Royal Heritage Museum in Trongsa',
      "Bumthang — Bhutan's spiritual heartland",
    ],
    overview: `The most comprehensive Bhutan journey available — spanning both western and central Bhutan over 10 immersive days. Traverse dramatic mountain passes, descend into lush subtropical valleys, and discover the rarely visited Trongsa Dzong, the ancestral fortress-home of Bhutan's royal Wangchuck dynasty.\n\nThis is the tour for travellers who want to understand Bhutan in all its dimensions — from the iconic Tiger's Nest to the remote highland valleys of central Bhutan that few visitors ever reach. Every day reveals a deeper layer of this extraordinary kingdom.`,
    itinerary: [
      {
        day: 1, title: 'Arrival in Paro → Thimphu',
        description: 'Arrive at Paro Airport. Drive to Thimphu (1.5 hrs). Afternoon at leisure for acclimatization. Evening orientation walk through the capital.',
        activities: ['Airport pickup', 'Thimphu transfer', 'Evening orientation walk'],
        accommodation: 'Hotel, Thimphu (3★)', meals: 'Dinner'
      },
      {
        day: 2, title: 'Thimphu — Capital Immersion',
        description: 'Full day in Bhutan\'s capital. Buddha Dordenma (169-ft statue), Tashichho Dzong, National Memorial Chorten, Folk Heritage Museum, National Textile Museum, and the colourful weekend Craft Bazaar. Optional visit to the Institute of Zorig Chusum — School of Thirteen Traditional Arts.',
        activities: ['Buddha Dordenma', 'Tashichho Dzong', 'Memorial Chorten', 'Folk Heritage Museum', 'Textile Museum', 'Craft Bazaar'],
        accommodation: 'Hotel, Thimphu (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 3, title: 'Thimphu to Punakha via Dochu La',
        description: 'Cross Dochu La pass (3,100m) — 108 chortens ring the summit, built by the Queen Mother to honour fallen Bhutanese soldiers. Sweeping Himalayan panorama on clear days. Punakha Dzong — second oldest and most magnificent, at the confluence of two sacred rivers, site of the 2011 Royal Wedding.',
        activities: ['Dochu La pass', 'Punakha Dzong', 'Khamsum Chorten hike', 'Suspension bridge'],
        accommodation: 'Resort, Punakha (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 4, title: 'Punakha Valley',
        description: 'Deep cultural immersion in the valley. Chimi Lhakhang fertility temple across scenic rice fields. Traditional farmhouse lunch with a local family. Live archery demonstration. Traditional hot stone bath evening.',
        activities: ['Chimi Lhakhang', 'Farmhouse lunch', 'Archery demonstration', 'Hot stone bath'],
        accommodation: 'Resort, Punakha (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 5, title: 'Punakha to Gangtey (Phobjikha Valley)',
        description: 'Drive through Pelela Pass to the stunning Phobjikha glacial valley. Visit Gangtey Monastery (17th century) and walk the valley nature trail. This is one of Bhutan\'s most serene and breathtaking landscapes — winter home to hundreds of endangered Black-Necked Cranes.',
        activities: ['Pelela Pass', 'Gangtey Monastery', 'Phobjikha Valley walk', 'Crane Centre'],
        accommodation: 'Guesthouse, Gangtey', meals: 'Breakfast · Dinner'
      },
      {
        day: 6, title: 'Gangtey to Trongsa',
        description: 'Drive east to central Bhutan through dramatic mountain passes. Arrive at Trongsa Dzong — the ancestral fortress-home of Bhutan\'s royal dynasty and traditionally the posting of every crown prince. The Taa Dzong watchtower (built 1652, now the Royal Heritage Museum) holds 500-year-old royal artefacts and a handwritten biography of Guru Rinpoche.',
        activities: ['Scenic mountain drive', 'Trongsa Dzong', 'Taa Dzong Royal Heritage Museum', 'Chendebji Chorten'],
        accommodation: 'Hotel, Trongsa (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 7, title: 'Trongsa to Bumthang',
        description: "Bhutan's spiritual heartland. Guru Rinpoche arrived here in 746 AD and transformed the valley. Visit Kurjey Lhakhang (a rock imprinted with Guru Rinpoche's body impression), Jambay Lhakhang (built in a single day by King Songtsen Gampo), and Tamshing Goemba (founded 1501 by Pema Lingpa). Optional Swiss Farm visit — Fritz Maurer's legacy of Swiss cheese and Red Panda beer.",
        activities: ['Kurjey Lhakhang', 'Jambay Lhakhang', 'Tamshing Goemba', 'Jakar Dzong', 'Swiss Farm (opt.)'],
        accommodation: 'Hotel, Bumthang (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 8, title: 'Bumthang Valley & Return West',
        description: 'Morning at Bumthang\'s Thangbi Valley — hike via suspension bridge to the 14th-century Thangbi Lhakhang. Begin the return journey west through Trongsa. Scenic mountain driving through Bhutan\'s forested heartland.',
        activities: ['Thangbi Lhakhang hike', 'Scenic return drive', 'Mountain pass views'],
        accommodation: 'Hotel, Trongsa (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 9, title: 'Return to Paro via Thimphu',
        description: 'Continue west to Paro through Thimphu. Optional last-minute stops at Thimphu\'s craft shops and galleries. Check in to Paro hotel. Optional traditional hot stone bath.',
        activities: ['Thimphu craft stop', 'Scenic drive to Paro', 'Paro check-in', 'Hot stone bath (opt.)'],
        accommodation: 'Hotel, Paro (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 10, title: "Tiger's Nest & Departure",
        description: "Morning hike to Tiger's Nest — the perfect final memory of Bhutan. The monastery at 3,120m rewards the 4-hour round trip with views that seal the journey into the Kingdom of Happiness. Return for farewell lunch before airport transfer.",
        activities: ["Tiger's Nest hike", 'Farewell lunch', 'Airport transfer'],
        accommodation: 'N/A', meals: 'Breakfast · Lunch'
      },
    ],
    inclusions: ['9 nights hotels and guesthouses', 'All transportation in private vehicle', 'Licensed English-speaking guide', 'Bhutan SDF & visa processing', 'All entrance fees', 'Most meals per itinerary', 'Farmhouse lunch experience', 'Hot stone bath', 'Airport transfers'],
    exclusions: ['Travel insurance', 'Personal expenses', 'Tips'],
  },

  // ─── ADVENTURE & TREKKING ──────────────────────────────────────────
  {
    id: 'tigers-nest-day-hike',
    slug: 'tigers-nest-day-hike',
    title: "Tiger's Nest Day Hike",
    subtitle: 'Paro Taktsang Pilgrimage Trail',
    category: 'adventure',
    categoryLabel: 'Adventure & Trekking',
    duration: '1 Day',
    nights: 0, days: 1,
    groupSize: '1–20 pax',
    startingFrom: 150,
    difficulty: 'Moderate',
    locations: ['Paro'],
    badge: 'Day Trip',
    featured: true,
    bestSeason: 'Year-round (best March–Nov)',
    rating: 5.0, reviews: 215,
    image: '/images/tigers-nest-1.jpg',
    heroImage: '/images/tigers-nest-2.jpg',
    gallery: ['/images/tigers-nest-2.jpg', '/images/tigers-nest-trail.jpg', '/images/tigers-nest-flags-day.jpg', '/images/tigers-nest-pilgrim.jpg'],
    highlights: [
      "Paro Taktsang — Bhutan's most iconic and sacred site",
      'Monastery built around the cave where Guru Rinpoche meditated for 3 years',
      'Breathtaking panoramic views 900 metres above the Paro Valley floor',
      'Ancient Buddhist shrines and centuries-old frescoes inside the monastery',
      'Pine and cypress forest draped in thousands of prayer flags',
      'Viewpoint café stop for traditional Bhutanese butter tea',
    ],
    overview: `No visit to Bhutan is complete without Tiger's Nest. The monastery clings miraculously to a sheer granite cliff at 3,120m — 900 metres above the Paro Valley floor. Built around the sacred cave where Guru Padmasambhava is said to have arrived on the back of a flying tigress and meditated for three years, Taktsang is the spiritual heart of Bhutan.\n\nThis guided full-day hike through fragrant pine and cypress forest, adorned with thousands of colourful prayer flags, takes approximately 4 hours round-trip and rewards with views and spiritual atmosphere that few places on earth can match.`,
    itinerary: [
      {
        day: 1, title: "Tiger's Nest Full Day Hike",
        description: 'Early pickup from your Paro hotel at 7:30 AM. Reach the trailhead at 8:00 AM. The steady ascent through ancient forest of blue pine, cypress, and oak takes 2 hours to the famous viewpoint café — stop for Bhutanese butter tea with stunning monastery views across the gorge. Continue to the monastery itself: descend into the gorge, cross a waterfall, and climb the final stone steps to the 17th-century complex built into the cliffside. Tour the sacred inner shrines and the cave where Guru Rinpoche meditated. Picnic lunch at the viewpoint on descent. Return to trailhead by 2:30 PM and back to your hotel by 3:30 PM.',
        activities: ['Hotel pickup 7:30 AM', 'Trailhead 8:00 AM', 'Forest ascent (2 hrs)', 'Viewpoint café & butter tea', 'Gorge descent & waterfall', 'Monastery interior & sacred cave', 'Picnic lunch at viewpoint', 'Return descent', 'Hotel drop by 3:30 PM'],
        accommodation: 'N/A (day tour)', meals: 'Lunch'
      },
    ],
    inclusions: ['Certified licensed guide', 'Monastery entrance fee', 'Picnic lunch at viewpoint', 'Hotel pickup and drop-off in Paro', 'Bottled water & trail snacks'],
    exclusions: ['Hotel accommodation', 'Mule hire for first section (opt. ~$20)', 'Personal expenses', 'Tips'],
  },

  {
    id: 'druk-path-trek',
    slug: 'druk-path-trek',
    title: 'Druk Path Trek',
    subtitle: 'Paro to Thimphu High-Altitude Trail',
    category: 'adventure',
    categoryLabel: 'Adventure & Trekking',
    duration: '9 Days / 8 Nights',
    nights: 8, days: 9,
    groupSize: '2–10 pax',
    startingFrom: 3175,
    difficulty: 'Moderate',
    locations: ['Paro', 'Thimphu'],
    featured: true,
    bestSeason: 'March–May, September–November',
    rating: 4.8, reviews: 74,
    image: '/images/trekkers-valley.jpg',
    heroImage: '/images/trekkers-prayer-flags.jpg',
    gallery: ['/images/trekkers-valley.jpg', '/images/trekkers-prayer-flags.jpg', '/images/group-trekkers.jpg', '/images/sunrise-summit.jpg'],
    highlights: [
      'Classic ~49 km high-altitude trek linking Paro to Thimphu',
      'Sacred alpine lakes: Jimilang Tsho (3,880m) and Simkotra Tsho (4,050m)',
      'Panoramic views of the Eastern Himalayan Range including Gangkar Puensum',
      'Ancient Phajoding Monastery — one of Bhutan\'s most sacred meditation sites',
      "Pre-trek acclimatization hike to Tiger's Nest",
      'Yak herder camp encounters in high-altitude pastures',
      'Full tented camping experience with dedicated camp chef and crew',
    ],
    overview: `One of Bhutan's most beloved and accessible trekking routes, the Druk Path links Paro to Thimphu through quiet forests, high ridgelines, and crystal-clear alpine lakes with sweeping views of the Eastern Himalayas.\n\nThis 9-day program opens with two cultural days in Paro — including the Tiger's Nest acclimatization hike — then transitions to five days of mountain trekking through pristine wilderness before landing in Thimphu for a cultural reward day. Traditional yak herder camps, ancient monasteries, and some of the finest mountain scenery in all of Bhutan make this the quintessential Bhutan trekking experience. Distance: approximately 49 km.`,
    itinerary: [
      {
        day: 1, title: 'Arrival in Paro',
        description: 'Arrive at Paro Airport. Guide meeting, hotel check-in, and rest for altitude acclimatization. Evening trek briefing with your guide — gear check and route overview.',
        activities: ['Airport arrival', 'Hotel check-in', 'Trek briefing & gear check'],
        accommodation: 'Heritage Hotel, Paro (3★)', meals: 'Dinner'
      },
      {
        day: 2, title: "Tiger's Nest Acclimatization Hike",
        description: "The perfect altitude primer at 3,120m. Guided hike to Taktsang Monastery — the 4-hour round trip doubles as the ideal acclimatization for the trek. Visit Kyichu Lhakhang (7th century, one of Bhutan's oldest temples) in the afternoon. Drukgyal Dzong ruins (built 1647, repelled Tibetan invasions, partially destroyed by fire in 1957).",
        activities: ["Tiger's Nest hike (3,120m)", 'Viewpoint café', 'Monastery interior tour', 'Kyichu Lhakhang', 'Drukgyal Dzong ruins'],
        accommodation: 'Heritage Hotel, Paro (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 3, title: 'Trek Day 1: Paro to Jele Dzong (3,450m)',
        description: 'Meet your trekking crew at the National Museum (Ta Dzong). Pack horses loaded. Steady climb through blue pine forests and apple orchards past Kuenga Lhakhang monastery. Reach Jele Dzong — an ancient fortress atop a ridge, once a watchtower over the Paro Valley. Camp below the pass.',
        activities: ['Crew & horses briefing', 'Forest ascent through pines', 'Apple orchard walk', 'Kuenga Lhakhang visit', 'Jele Dzong', 'Camp setup'],
        accommodation: 'Tented Camp, Jele Dzong (3,450m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 4, title: 'Trek Day 2: Jele Dzong to Tsokam (3,780m)',
        description: 'Walk north along the ridge through rhododendron and conifer forests. Gentle ascent around a small peak with sweeping Paro Valley views and distant Dagala range on the horizon. Approximately 4 hours of trekking. Camp at Tsokam meadow.',
        activities: ['Ridge walk with Himalayan views', 'Rhododendron forest', 'Paro Valley panorama', 'Tsokam meadow camp'],
        accommodation: 'Tented Camp, Tsokam (3,780m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 5, title: 'Trek Day 3: Tsokam to Jimilang Tsho (3,880m)',
        description: 'Stunning ridge walk with panoramic snow-capped peak views. Pass Labana campsite. Gently climb to the sacred Jimilang Tsho — a lake where legend says a giant mystical trout lives, guardian of the valley. Camp beside the shimmering lake under starlit Himalayan skies.',
        activities: ['Snow-peak panorama walk', 'Labana campsite pass', 'Arrival at Jimilang Tsho', 'Lakeside camp'],
        accommodation: 'Tented Camp, Jimilang Tsho (3,880m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 6, title: 'Trek Day 4: Jimilang to Simkotra Tsho (4,050m)',
        description: 'Walk around the western edge of Jimilang lake, ascending through rhododendron to higher ridges. Cross smaller alpine lakes in pristine wilderness. Reach Simkotra Tsho — a high-altitude lake at 4,050m ringed with prayer flags and rocky slopes. Views of Mount Gangkar Puensum on clear days.',
        activities: ['Lake circuit walk', 'High-ridge traverse', 'Alpine meadows', 'Simkotra Tsho arrival'],
        accommodation: 'Tented Camp, Simkotra Tsho (4,050m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 7, title: 'Trek Day 5: Simkotra to Phajoding to Thimphu',
        description: 'Rolling ridges with Thimphu Valley views opening below. Descend through juniper and dwarf rhododendron to Phajoding Monastery — one of Bhutan\'s most sacred meditation sites, founded in 1224 and listed by the World Monuments Fund as among the world\'s most endangered cultural monuments. Wind down through pine forest to the roadhead above Motithang Takin Preserve. Drive into Thimphu. Celebration dinner.',
        activities: ['Ridge walk to Thimphu views', 'Phajoding Monastery visit', 'Forest descent', 'Thimphu arrival', 'Celebration dinner'],
        accommodation: 'Boutique Hotel, Thimphu (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 8, title: 'Thimphu Cultural Day',
        description: 'A well-earned rest day with Thimphu\'s cultural highlights. Tashichho Dzong (seat of government and monastic authority), National Memorial Chorten (daily prayers gathering of elderly devotees), Institute of Zorig Chusum (artisans demonstrating the 13 traditional arts), and the lively Craft Bazaar for souvenirs. Optional traditional hot stone bath.',
        activities: ['Tashichho Dzong', 'Memorial Chorten', 'Institute of Zorig Chusum', 'Craft Bazaar', 'Hot stone bath (opt.)'],
        accommodation: 'Boutique Hotel, Thimphu (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 9, title: 'Transfer to Paro & Departure',
        description: 'Morning scenic drive to Paro (1.5 hrs). Optional last souvenir stop. Airport transfer and departure.',
        activities: ['Thimphu to Paro transfer', 'Last souvenir shopping', 'Airport transfer'],
        accommodation: 'N/A', meals: 'Breakfast'
      },
    ],
    inclusions: ['2 nights 3-star hotel in Paro', '4 nights tented camping (sleeping bags, mats, tents)', '1 night monastery guesthouse or camp at Phajoding', '2 nights 3-star hotel in Thimphu', 'Experienced licensed trekking guide', 'Dedicated support crew (cook, camp assistants)', 'Pack horses for gear transport', 'All trek and camp meals (camp chef)', 'All national park and trekking permits', 'Emergency first aid plan', 'Bhutan SDF & visa processing', 'Airport transfers'],
    exclusions: ['Personal trekking gear (boots, poles, rain gear)', 'Travel and helicopter evacuation insurance', 'Personal spending', 'Tips for trek crew'],
  },

  {
    id: 'jomolhari-trek',
    slug: 'jomolhari-base-camp-trek',
    title: 'Jomolhari Base Camp Trek',
    subtitle: "Trek to Bhutan's Sacred Mountain",
    category: 'adventure',
    categoryLabel: 'Adventure & Trekking',
    duration: '9 Days / 8 Nights',
    nights: 8, days: 9,
    groupSize: '2–8 pax',
    startingFrom: 3400,
    difficulty: 'Challenging',
    locations: ['Paro', 'Jangothang'],
    featured: false,
    bestSeason: 'April–June, September–October',
    rating: 4.9, reviews: 41,
    image: '/images/guide-mountain.jpg',
    heroImage: '/images/sunrise-summit.jpg',
    gallery: ['/images/guide-mountain.jpg', '/images/sunrise-summit.jpg', '/images/tour-group-mountains.jpg', '/images/forest-trail.jpg'],
    highlights: [
      'Jangothang Base Camp at 4,080m beneath sacred Mt. Jomolhari (7,314m)',
      'Towering views of the sacred Himalayan peak from camp',
      'Remote Bhutanese highland villages virtually untouched by tourism',
      'Ancient Jangothang Dzong ruins in the high wilderness',
      'Yak herding camps and nomadic herder encounters',
      'Paro Chhu river valley approach through pristine wilderness',
    ],
    overview: `For the serious trekker, Jomolhari Base Camp is the crown jewel of Bhutanese trekking. The route follows the Paro Chhu river deep into the Himalayan wilderness, passing remote villages and ancient ruins.\n\nAt Jangothang camp (4,080m), wake to the overwhelming sight of Jomolhari's 7,314m pyramid rising from glacier fields — one of the most dramatic mountain vistas in all of Asia. This is an experience for physically prepared adventurers seeking a genuine Himalayan wilderness journey. Helicopter evacuation insurance is strongly recommended.`,
    itinerary: [
      {
        day: 1, title: 'Paro — Preparation & Briefing',
        description: 'Gear check with your guide, trekking briefing, and acclimatization walk through Paro town and Rinpung Dzong. Briefing on altitude protocols and emergency procedures.',
        activities: ['Equipment & gear check', 'Guide briefing & emergency protocol', 'Rinpung Dzong acclimatization walk', 'Pre-trek dinner'],
        accommodation: 'Hotel, Paro (3★)', meals: 'Dinner'
      },
      {
        day: 2, title: 'Drugyel to Shana (2,870m)',
        description: 'Trek begins at Drugyel Dzong ruins. The trail follows the Paro Chhu river through farmland, forest, and the first river crossings. Camp at Shana army checkpost.',
        activities: ['Drugyel Dzong start', 'Paro Chhu river valley walk', 'Farmland and forest trail', 'Shana camp'],
        accommodation: 'Tented Camp, Shana (2,870m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 3, title: 'Shana to Thangthangkha (3,580m)',
        description: 'Ascend through a dramatic gorge alongside the Paro Chhu. River crossings on traditional log bridges. Views grow more dramatic as the valley narrows.',
        activities: ['Gorge ascent', 'River crossings', 'Remote village pass'],
        accommodation: 'Tented Camp, Thangthangkha (3,580m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 4, title: 'Thangthangkha to Jangothang Base Camp (4,080m)',
        description: 'The day you\'ve been building towards. Climb to base camp at 4,080m. As you crest the final ridge, the overwhelming pyramid of Jomolhari fills the entire horizon. Camp at Jangothang beside the ancient dzong ruins. First views of the sacred mountain.',
        activities: ['Final ascent to base camp', 'Jomolhari first views', 'Jangothang dzong ruins exploration', 'Base camp setup'],
        accommodation: 'Tented Camp, Jangothang (4,080m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 5, title: 'Jangothang Rest & Acclimatization Day',
        description: 'Rest day at altitude. Optional higher hike (4,500m+) for enhanced Jomolhari views. Explore the ancient Jangothang Dzong ruins. Photography sessions in the extraordinary mountain light. Encounter with yak herder families.',
        activities: ['Optional high hike to 4,500m', 'Dzong ruins exploration', 'Yak herder encounters', 'Photography'],
        accommodation: 'Tented Camp, Jangothang (4,080m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 6, title: 'Jangothang to Thangthangkha — Return',
        description: 'Begin the return descent. Retrace through dramatic gorge scenery, now familiar but no less impressive.',
        activities: ['Return trek — 5 hrs', 'River valley descent'],
        accommodation: 'Tented Camp, Thangthangkha (3,580m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 7, title: 'Thangthangkha to Shana',
        description: 'Continue descent through the gorge and river valley. Views of Paro Valley opening ahead.',
        activities: ['Continued descent — 5–6 hrs'],
        accommodation: 'Tented Camp, Shana (2,870m)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 8, title: 'Shana to Drugyel — Trek End',
        description: 'Final trekking day. The last 3–4 hours back to Drugyel. Hot shower and celebration dinner in Paro.',
        activities: ['Final trek day (3–4 hrs)', 'Drugyel finish', 'Hot shower', 'Celebration dinner in Paro'],
        accommodation: 'Hotel, Paro (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 9, title: "Paro Sightseeing & Departure",
        description: "Optional morning Tiger's Nest hike or Rinpung Dzong visit. Airport transfer and departure.",
        activities: ["Tiger's Nest (opt.)", 'Rinpung Dzong', 'Souvenir shopping', 'Airport transfer'],
        accommodation: 'N/A', meals: 'Breakfast'
      },
    ],
    inclusions: ['Full tented camping setup & equipment', 'Expert licensed mountain guide', 'Pack animals for gear', 'Chef-prepared trek meals throughout', 'Emergency first aid plan', 'All trekking permits', '2 nights hotel in Paro'],
    exclusions: ['Bhutan visa & SDF', 'Personal hiking gear', 'Travel insurance', 'Helicopter evacuation insurance (strongly recommended)'],
  },

  // ─── FESTIVAL TOURS ────────────────────────────────────────────────
  {
    id: 'paro-tshechu-festival',
    slug: 'paro-tshechu-festival-tour',
    title: 'Paro Tshechu Festival Tour',
    subtitle: "Bhutan's Most Iconic Sacred Festival",
    category: 'festival',
    categoryLabel: 'Festival Tour',
    duration: '5 Days / 4 Nights',
    nights: 4, days: 5,
    groupSize: '2–15 pax',
    startingFrom: 2100,
    difficulty: 'Easy',
    locations: ['Paro', 'Thimphu'],
    badge: 'Limited Dates',
    featured: true,
    bestSeason: 'March / April (lunar calendar)',
    rating: 4.9, reviews: 98,
    image: '/images/cham-dance-orange.jpg',
    heroImage: '/images/cham-dance-crowd.jpg',
    gallery: ['/images/cham-dance-crowd.jpg', '/images/cham-dance-orange.jpg', '/images/cham-dance-blue.jpg', '/images/cham-dance-red.jpg', '/images/festival-scene.jpg'],
    highlights: [
      'Full 3-day Paro Tshechu festival at Rinpung Dzong',
      'Sacred Cham mask dance performances by monks in elaborate costumes',
      'Pre-dawn Thongdrel unveiling — a 7-storey silk scroll depicting Guru Rinpoche',
      'Atsara clown performances and comic sacred rituals',
      'Bhutanese in traditional Gho and Kira at their finest',
      "Tiger's Nest Monastery hike on final day",
    ],
    overview: `Experience Bhutan's most spectacular annual festival — the Paro Tshechu. Held at Rinpung Dzong, this multi-day religious celebration is a kaleidoscope of colour, devotion, and sacred performance that has barely changed in centuries.\n\nThe crown jewel: a pre-dawn gathering for the unveiling of the massive Thongdrel — a 7-storey silk scroll depicting Guru Rinpoche — believed to grant liberation upon sight. This is Bhutan at its most vibrant and alive, exactly as locals experience it.`,
    itinerary: [
      {
        day: 1, title: 'Arrival in Paro & Festival Briefing',
        description: 'Arrive and prepare for the festival. Your guide delivers a deep cultural briefing on the meaning and history of Tshechu — sacred masked dances honouring Guru Padmasambhava (Guru Rinpoche). Traditional welcome dinner.',
        activities: ['Arrival & transfer', 'Festival cultural briefing', 'Welcome dinner'],
        accommodation: 'Hotel, Paro (3★)', meals: 'Dinner'
      },
      {
        day: 2, title: 'Paro Tshechu — Day 1 & Thongdrel Dawn',
        description: '5 AM wake-up for the most sacred moment of the festival: the unfurling of the giant Thongdrel silk scroll at dawn. The 7-storey textile depicting Guru Rinpoche flanked by his protective deities is believed to grant liberation upon sight. Full day at the festival grounds watching sacred Cham mask dances — each dance enacting episodes from Buddhist scripture. Atsara sacred clowns perform comic rituals throughout. Buddha Dordenma visit in the evening.',
        activities: ['5 AM Thongdrel silk unveiling', 'Sacred Cham mask dances', 'Atsara clown performances', 'Deity dance performances', 'Buddha Dordenma (evening)'],
        accommodation: 'Hotel, Paro (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 3, title: 'Paro Tshechu — Day 2',
        description: 'Second full day at the festival. Different protective deities portrayed in the Cham dances today. Bhutanese families in their finest traditional dress — the men in Gho robes and women in Kira dresses woven with symbolic patterns. Photography opportunities unlike anywhere else on earth.',
        activities: ['Morning Cham dances', 'Deity-specific performances', 'Photography time', 'Festival continuation', 'Evening cultural dinner'],
        accommodation: 'Hotel, Paro (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 4, title: "Tshechu Day 3 & Tiger's Nest",
        description: "Morning at the festival for final performances and closing rituals. Afternoon hike to Tiger's Nest — the most iconic site in Bhutan. A 4-hour round trip to the monastery clinging to a cliff at 3,120m. Visit Rinpung Dzong for its interior architecture after the festival ground clears.",
        activities: ['Final festival morning & closing', "Tiger's Nest afternoon hike", 'Rinpung Dzong interior'],
        accommodation: 'Hotel, Paro (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 5, title: 'Departure',
        description: 'Morning souvenir shopping — hand-woven textiles, thangka paintings, and traditional crafts unique to Paro. Airport transfer.',
        activities: ['Souvenir shopping', 'Airport transfer'],
        accommodation: 'N/A', meals: 'Breakfast'
      },
    ],
    inclusions: ['4 nights accommodation', 'Licensed guide with deep festival knowledge', 'Bhutan SDF & visa processing', 'All festival venue access', 'All transportation in private vehicle', 'Meals per itinerary', 'Airport transfers'],
    exclusions: ['Travel insurance', 'Personal expenses', 'Alcoholic beverages', 'Tips'],
  },

  {
    id: 'thimphu-tshechu-festival',
    slug: 'thimphu-tshechu-festival-tour',
    title: 'Thimphu Tshechu Festival Tour',
    subtitle: "Bhutan's Grand Capital Festival",
    category: 'festival',
    categoryLabel: 'Festival Tour',
    duration: '7 Days / 6 Nights',
    nights: 6, days: 7,
    groupSize: '2–15 pax',
    startingFrom: 2050,
    difficulty: 'Easy',
    locations: ['Thimphu', 'Paro', 'Punakha'],
    featured: false,
    bestSeason: 'September / October',
    rating: 4.8, reviews: 71,
    image: '/images/cham-dance-blue.jpg',
    heroImage: '/images/festival-scene.jpg',
    gallery: ['/images/cham-dance-blue.jpg', '/images/festival-scene.jpg', '/images/cham-dance-green.jpg', '/images/cham-dance-red-pair.jpg'],
    highlights: [
      'Thimphu Tshechu at the grand Tashichho Dzong courtyard — Bhutan\'s largest festival',
      '3 days of sacred Cham mask dance performances',
      'Unfurling of the giant Thongdrel silk thangka depicting Guru Rinpoche',
      'Buddha Dordenma at sunrise — 169-ft gilded statue',
      'Punakha Dzong and valley exploration',
      "Tiger's Nest hike in Paro",
    ],
    overview: `The Thimphu Tshechu, held at Tashichho Dzong — seat of Bhutan's government and the King's office — is the Kingdom's grandest festival. As the capital's premier religious celebration, it draws the largest crowds and the most elaborate ceremonies of any tshechu in Bhutan.\n\nThe majestic dzong backdrop, the capital city energy, and the scale of the event make this festival uniquely spectacular. This 7-day tour also takes you to Punakha and Paro, ensuring you experience the complete arc of western Bhutan.`,
    itinerary: [
      {
        day: 1, title: 'Arrival Paro → Thimphu',
        description: 'Arrive at Paro Airport. Scenic 1.5-hour drive to Thimphu. Festival cultural briefing by your guide. Evening orientation walk through the capital.',
        activities: ['Airport arrival', 'Thimphu transfer', 'Festival briefing', 'Evening capital walk'],
        accommodation: 'Hotel, Thimphu (3★)', meals: 'Dinner'
      },
      {
        day: 2, title: 'Thimphu Cultural Highlights',
        description: 'Explore Thimphu before the festival begins. National Memorial Chorten (elderly devotees circumambulating in quiet daily devotion), Folk Heritage Museum, National Textile Museum, and the Institute of Zorig Chusum — School of Thirteen Traditional Arts, where you can watch painters, sculptors, and woodcarvers at work.',
        activities: ['National Memorial Chorten', 'Folk Heritage Museum', 'Textile Museum', 'Institute of Zorig Chusum'],
        accommodation: 'Hotel, Thimphu (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 3, title: 'Thimphu Tshechu — Day 1',
        description: 'Full day at the festival in the grand courtyard of Tashichho Dzong. Witness the unfurling of the giant Thongdrel silk thangka depicting Guru Rinpoche flanked by protective deities. Sacred Cham mask dances throughout the day. Buddha Dordenma at sunrise before heading to the dzong.',
        activities: ['Sunrise Buddha Dordenma', 'Thongdrel silk unveiling', 'Sacred Cham dances', 'Full festival day'],
        accommodation: 'Hotel, Thimphu (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 4, title: 'Thimphu Tshechu — Day 2',
        description: 'Second full festival day. Different deity-specific Cham dances. Afternoon visit to the National Museum at Ta Dzong with thangka paintings, armour, and ancient artefacts.',
        activities: ['Festival day 2 — deity Cham dances', 'Photography time', 'National Museum visit'],
        accommodation: 'Hotel, Thimphu (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 5, title: 'Festival Day 3 → Punakha',
        description: 'Final festival morning at Tashichho Dzong. Afternoon drive to Punakha via Dochu La pass — 108 chortens built by the Queen Mother on a ridge with panoramic Himalayan views. Check in to Punakha resort.',
        activities: ['Final festival morning', 'Dochu La pass', 'Punakha transfer & check-in'],
        accommodation: 'Resort, Punakha (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 6, title: 'Punakha Valley & Paro',
        description: 'Morning at Punakha Dzong (6-storey fortress at river confluence). Chimi Lhakhang fertility temple. Afternoon transfer to Paro through the river valleys.',
        activities: ['Punakha Dzong', 'Chimi Lhakhang', 'Paro transfer', 'Paro town evening'],
        accommodation: 'Hotel, Paro (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 7, title: "Tiger's Nest & Departure",
        description: "Morning hike to Paro Taktsang — Tiger's Nest Monastery at 3,120m. The perfect closing chapter to the festival journey. Return for farewell lunch before airport transfer.",
        activities: ["Tiger's Nest hike (4 hrs)", 'Farewell lunch', 'Airport transfer'],
        accommodation: 'N/A', meals: 'Breakfast · Lunch'
      },
    ],
    inclusions: ['6 nights accommodation', 'Licensed guide with festival expertise', 'Bhutan SDF & visa processing', 'All transportation', 'Festival access', 'Meals per itinerary', 'Airport transfers'],
    exclusions: ['Travel insurance', 'Personal spending', 'Tips'],
  },

  {
    id: 'punakha-drubchen',
    slug: 'punakha-drubchen-festival-tour',
    title: 'Punakha Drubchen & Tshechu',
    subtitle: "Bhutan's Most Dramatic Winter Festival",
    category: 'festival',
    categoryLabel: 'Festival Tour',
    duration: '5 Days / 4 Nights',
    nights: 4, days: 5,
    groupSize: '2–12 pax',
    startingFrom: 2000,
    difficulty: 'Easy',
    locations: ['Paro', 'Thimphu', 'Punakha'],
    featured: false,
    bestSeason: 'February / March',
    rating: 4.9, reviews: 55,
    image: '/images/cham-dance-red.jpg',
    heroImage: '/images/red-group-dzong.jpg',
    gallery: ['/images/cham-dance-red.jpg', '/images/red-group-dzong.jpg', '/images/cham-dance-orange-2.jpg', '/images/monks-ceremony.jpg'],
    highlights: [
      'Punakha Drubchen — unique dramatic battle re-enactment festival',
      'Warriors in ancient armour and helmets charging through the dzong courtyard',
      'Punakha Tshechu sacred Cham mask dances',
      'Punakha Dzong at its most photogenic — purple jacaranda trees in bloom',
      'Dochu La pass on clear winter days — full Himalayan panorama',
      'Warm subtropical Punakha Valley in February/March',
    ],
    overview: `The Punakha Drubchen is unique among all of Bhutan's festivals — a dramatic re-enactment of a 17th-century military victory over Tibetan invaders. Warriors dressed in ancient armour, helmets, and wielding traditional weapons charge across Punakha Dzong's courtyard in a spectacle unlike anything else in Asia.\n\nHeld in February/March, it coincides with the stunning bloom of purple jacaranda trees around the dzong — making this one of the most photographed festivals in all of Bhutan. Immediately following the Drubchen, the sacred Tshechu festival begins.`,
    itinerary: [
      {
        day: 1, title: 'Arrival in Paro → Punakha',
        description: 'Arrive at Paro Airport. Drive through Thimphu (stop at Buddha Dordenma) and over Dochu La pass (108 chortens, Himalayan views) to warm Punakha Valley.',
        activities: ['Airport arrival', 'Buddha Dordenma stop', 'Dochu La pass', 'Punakha check-in'],
        accommodation: 'Hotel, Punakha (3★)', meals: 'Dinner'
      },
      {
        day: 2, title: 'Punakha Drubchen — Battle Festival',
        description: 'Full day at the extraordinary Drubchen. Watch warriors in 17th-century battle armour, helmets, and traditional weapons perform the dramatic re-enactment of Bhutan\'s victory over Tibetan invaders in the Punakha Dzong courtyard. One of the most dramatic spectacles in all of Bhutan — and virtually unknown to the outside world.',
        activities: ['Drubchen battle ceremony & re-enactment', 'Ancient armour & weapons display', 'Punakha Dzong courtyard', 'Cultural immersion'],
        accommodation: 'Hotel, Punakha (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 3, title: 'Punakha Tshechu — Sacred Dances',
        description: 'Sacred Cham mask dances begin in the dzong courtyard as the Tshechu follows directly after the Drubchen. The purple jacaranda trees in full bloom around the dzong create an extraordinary backdrop. Afternoon: Chimi Lhakhang fertility temple walk across the rice fields.',
        activities: ['Tshechu sacred Cham dances', 'Monastery courtyard performances', 'Chimi Lhakhang walk', 'Valley walk'],
        accommodation: 'Hotel, Punakha (3★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 4, title: 'Tshechu Day 2 → Thimphu',
        description: 'Second morning of Tshechu festival performances. Afternoon drive back to Thimphu via Dochu La pass. Evening at Buddha Dordenma statue.',
        activities: ['Festival day 2 morning', 'Thimphu transfer via Dochu La', 'Buddha Dordenma evening'],
        accommodation: 'Hotel, Thimphu (3★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 5, title: 'Thimphu → Paro & Departure',
        description: "Transfer to Paro. Optional morning Tiger's Nest hike if time allows. Airport transfer and departure.",
        activities: ["Tiger's Nest (opt., early departure)", 'Paro transfer', 'Souvenir shopping', 'Airport transfer'],
        accommodation: 'N/A', meals: 'Breakfast'
      },
    ],
    inclusions: ['4 nights hotels', 'Licensed guide with festival expertise', 'Bhutan SDF & visa processing', 'All transportation', 'Festival access', 'Meals per itinerary', 'Airport transfers'],
    exclusions: ['Travel insurance', 'Personal expenses', 'Tips'],
  },

  // ─── LUXURY & WELLNESS ─────────────────────────────────────────────
  {
    id: 'bhutan-luxury-escape',
    slug: 'bhutan-luxury-escape',
    title: 'Bhutan Luxury Escape',
    subtitle: 'The Ultimate High-End Bhutan Experience',
    category: 'luxury',
    categoryLabel: 'Luxury & Wellness',
    duration: '7 Days / 6 Nights',
    nights: 6, days: 7,
    groupSize: '2–6 pax',
    startingFrom: 4500,
    difficulty: 'Easy',
    locations: ['Paro', 'Thimphu', 'Punakha'],
    badge: 'Premium',
    featured: true,
    bestSeason: 'March–May, September–November',
    rating: 5.0, reviews: 34,
    image: '/images/tigers-nest-rhododendron.jpg',
    heroImage: '/images/sunrise-silhouette.jpg',
    gallery: ['/images/couple-dzong.jpg', '/images/sunrise-silhouette.jpg', '/images/river-temple.jpg', '/images/butter-lamps.jpg'],
    highlights: [
      '5-star boutique lodge accommodation with valley and mountain views throughout',
      'Private early-morning Tiger\'s Nest hike before the trail opens to other visitors',
      'Exclusive private monastery ceremony conducted by a senior lama',
      'Sunrise helicopter scenic flight over the Great Himalayan Range',
      'Gourmet Bhutanese tasting menus prepared by a private chef',
      'Traditional dotsho hot stone spa and Himalayan sound healing session',
      'Senior private guide with 15+ years of Bhutan expertise',
    ],
    overview: `For discerning travellers who demand the finest, the Bhutan Luxury Escape delivers an uncompromising high-end journey through the Kingdom's most iconic landscapes and sacred sites.\n\nStay in Bhutan's finest boutique lodges — each perched with uninterrupted valley and mountain views. Experienced exclusively as your private group with a senior guide, this tour offers private monastery ceremonies, sunrise helicopter mountain flights, and dining experiences crafted by Bhutan's finest culinary talent. Bhutan, without compromise.`,
    itinerary: [
      {
        day: 1, title: 'VIP Arrival & Welcome',
        description: 'VIP airport reception with your dedicated senior guide and luxury private vehicle. Transfer to your clifftop boutique lodge overlooking the Paro Valley. Welcome champagne and afternoon spa. Private chef welcome dinner featuring a curated six-course Bhutanese tasting menu.',
        activities: ['VIP airport reception', 'Luxury lodge check-in', 'Welcome champagne & spa', 'Private chef welcome dinner'],
        accommodation: 'Luxury Boutique Lodge, Paro (5★)', meals: 'Dinner'
      },
      {
        day: 2, title: "Exclusive Tiger's Nest Experience",
        description: 'Private 6 AM hike before the trail opens — the monastery in near-complete solitude with only the dawn light and birdsong. Exclusive private ceremony conducted by the head lama inside the sacred inner sanctums, closed to regular visitors. Champagne picnic at the panoramic viewpoint. Afternoon private photography workshop in the Paro Valley.',
        activities: ['Private 6 AM trail access', "Tiger's Nest in solitude", 'Exclusive lama ceremony (inner sanctums)', 'Champagne viewpoint picnic', 'Private photography workshop'],
        accommodation: 'Luxury Boutique Lodge, Paro (5★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 3, title: 'Sunrise Helicopter Flight → Thimphu',
        description: 'Sunrise helicopter scenic flight above Jomolhari (7,314m) and the Great Himalayan Range — perspectives virtually no ground traveller ever sees. Land and transfer to a 5-star Thimphu residence. Restricted-access Tashichho Dzong private tour and private craft artisan workshop with Bhutan\'s master weavers.',
        activities: ['Sunrise helicopter flight (Jomolhari views)', 'Himalayan photography from air', 'Private Tashichho Dzong tour', 'Master weaver artisan workshop'],
        accommodation: 'Boutique Residence, Thimphu (5★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 4, title: 'Thimphu Exclusive Cultural Day',
        description: 'Private artisan workshop at the Institute of Zorig Chusum. Restricted-access government areas of Tashichho Dzong. Private evening show at the Royal Academy of Performing Arts — traditional music and dance performed exclusively for your group.',
        activities: ['Private artisan workshop', 'Restricted Dzong access', 'Buddha Dordenma at dusk', 'Private performing arts show'],
        accommodation: 'Boutique Residence, Thimphu (5★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 5, title: 'Thimphu → Punakha Luxury Valley',
        description: 'Private scenic transfer to river-view Punakha lodge over Dochu La pass. Golden-hour exclusive Punakha Dzong tour (restricted after-hours access). Riverside gourmet dinner under the stars.',
        activities: ['Dochu La pass transfer', 'Golden-hour Punakha Dzong (private access)', 'River-side gourmet dinner', 'Star-gazing session'],
        accommodation: 'River Lodge, Punakha (5★)', meals: 'Breakfast · Dinner'
      },
      {
        day: 6, title: 'Punakha Wellness Day',
        description: 'A full day dedicated to deep rest and restoration. Morning: traditional two-hour dotsho hot stone bath using heated river stones and herbal infusions. Afternoon: Himalayan singing bowl sound healing session. Private organic farm-to-table cooking class. Farewell gala dinner.',
        activities: ['Traditional dotsho hot stone bath (2 hrs)', 'Himalayan sound healing', 'Private cooking class', 'Farewell gala dinner'],
        accommodation: 'River Lodge, Punakha (5★)', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 7, title: 'VIP Departure',
        description: 'Morning meditation walk along the Mo Chhu riverbank. Private transfer to Paro with optional artisan gallery stop. VIP airport lounge service. Departure.',
        activities: ['Mo Chhu morning walk', 'Paro transfer', 'VIP airport lounge', 'Departure'],
        accommodation: 'N/A', meals: 'Breakfast'
      },
    ],
    inclusions: ['6 nights 5-star boutique lodge accommodation', 'Senior private guide (15+ years experience)', 'Luxury private vehicle throughout', 'Sunrise helicopter mountain scenic flight', 'Private monastery ceremony', 'All gourmet chef-prepared meals', 'Traditional dotsho hot stone spa', 'Sound healing session', 'Bhutan SDF ($100/day) & visa processing', 'All private and restricted site access fees', 'VIP airport reception and departure service'],
    exclusions: ['Additional helicopter flights', 'Personal shopping', 'Gratuities (minimum $50/day suggested for private guides)'],
  },

  {
    id: 'bhutan-wellness-retreat',
    slug: 'bhutan-wellness-retreat',
    title: 'Bhutan Wellness Retreat',
    subtitle: 'Mind, Body & Soul in the Himalayas',
    category: 'luxury',
    categoryLabel: 'Luxury & Wellness',
    duration: '8 Days / 7 Nights',
    nights: 7, days: 8,
    groupSize: '2–8 pax',
    startingFrom: 3800,
    difficulty: 'Easy',
    locations: ['Paro', 'Thimphu', 'Punakha'],
    featured: false,
    bestSeason: 'March–May, September–November',
    rating: 4.9, reviews: 47,
    image: '/images/butter-lamps.jpg',
    heroImage: '/images/prayer-flags-mountains.jpg',
    gallery: ['/images/butter-lamps.jpg', '/images/prayer-flags-mountains.jpg', '/images/monks-ceremony.jpg', '/images/group-blessing.jpg'],
    highlights: [
      'Daily guided yoga and meditation in Himalayan settings',
      'Traditional Bhutanese dotsho hot stone bath with herbal infusions',
      'Medicinal herb forest walk with traditional medicine practitioner',
      'Sowa Rigpa (Traditional Bhutanese Medicine) consultation and treatment',
      'Buddhist monastery mindfulness retreat with monk guidance',
      'Organic farm-to-table Bhutanese cuisine throughout',
    ],
    overview: `Bhutan is the original wellness destination — a nation that enshrined Gross National Happiness into its constitution and built its entire economy around the wellbeing of its people and its land.\n\nThis 8-day immersive retreat combines the restorative power of the Himalayan environment with ancient Bhutanese wellness traditions. Daily meditation, traditional Sowa Rigpa medicine treatments, and the legendary dotsho hot stone bath — using heated river stones and mountain herb infusions — will leave you profoundly renewed.`,
    itinerary: [
      {
        day: 1, title: 'Arrival & Wellness Orientation',
        description: 'Gentle arrival. Wellness consultation with a traditional Bhutanese medicine practitioner who assesses your constitution and designs personalised treatments for the week. Light evening meditation and organic welcome dinner.',
        activities: ['Arrival & transfer', 'Traditional medicine wellness consult', 'Intro breathwork & meditation', 'Organic welcome dinner'],
        accommodation: 'Wellness Resort, Paro', meals: 'Dinner'
      },
      {
        day: 2, title: "Sunrise Yoga & Tiger's Nest as Moving Meditation",
        description: "Sunrise yoga session in the lodge gardens overlooking the Paro Valley. Guided mindful hike to Tiger's Nest — treating the pilgrimage trail as moving meditation. Guided breathing at the monastery viewpoint. Return for restorative afternoon session.",
        activities: ['Sunrise yoga', "Mindful Tiger's Nest hike", 'Monastery breathing practice', 'Restorative afternoon'],
        accommodation: 'Wellness Resort, Paro', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 3, title: 'Medicinal Herb Walk & Sowa Rigpa',
        description: 'Guided forest walk with a traditional medicine expert, identifying the medicinal plants and herbs that form the basis of Bhutanese Sowa Rigpa medicine. Afternoon: personalised Sowa Rigpa treatment session. Traditional cooking class focusing on health-promoting Bhutanese ingredients.',
        activities: ['Medicinal herb forest walk', 'Sowa Rigpa treatment', 'Traditional health-food cooking class'],
        accommodation: 'Wellness Resort, Paro', meals: 'Breakfast · Lunch · Dinner'
      },
      {
        day: 4, title: 'Dotsho Hot Stone Bath Day',
        description: 'Morning yoga and journaling. Afternoon: the signature dotsho hot stone bath experience — two hours in a wooden tub filled with water heated by fire-scorched river stones and infused with medicinal herbs and artemesia leaves. Himalayan singing bowl sound healing to follow.',
        activities: ['Morning yoga & journaling', 'Dotsho hot stone bath (2 hrs)', 'Singing bowl sound healing', 'Reflection & rest'],
        accommodation: 'Wellness Resort, Paro', meals: 'Breakfast · Dinner'
      },
      {
        day: 5, title: 'Transfer to Punakha — River Meditation',
        description: 'Drive to warm subtropical Punakha valley through Dochu La pass. River-side walking meditation along the Mo Chhu. Organic farm visit and farm-to-table dinner.',
        activities: ['Scenic Dochu La drive', 'Mo Chhu river meditation walk', 'Organic farm tour', 'Farm-to-table dinner'],
        accommodation: 'Eco-Lodge, Punakha', meals: 'Breakfast · Dinner'
      },
      {
        day: 6, title: 'Monastery Mindfulness Retreat Day',
        description: 'Full immersive day at a Punakha monastery. Monk-guided meditation practice in an ancient hall. Buddhist philosophy talk adapted for practitioners of any background. Evening puja (prayer ceremony) by firelight.',
        activities: ['Monastery meditation (monk-guided)', 'Buddhist philosophy talk', 'Afternoon contemplative walk', 'Evening puja by firelight'],
        accommodation: 'Eco-Lodge, Punakha', meals: 'Breakfast · Dinner'
      },
      {
        day: 7, title: 'Silent Practice & Farewell Ceremony',
        description: 'Optional morning silence practice — a guided silent walk through the Punakha Valley rice fields. Final personalised wellness treatment. Afternoon integration journaling. Heartfelt farewell ceremony with your guide.',
        activities: ['Optional silent morning walk', 'Final wellness treatment', 'Integration journaling', 'Farewell ceremony'],
        accommodation: 'Eco-Lodge, Punakha', meals: 'Breakfast · Dinner'
      },
      {
        day: 8, title: 'Return to Paro & Departure',
        description: 'Morning meditation and light yoga. Transfer to Paro for departure. Depart renewed.',
        activities: ['Morning meditation & yoga', 'Paro transfer', 'Airport departure'],
        accommodation: 'N/A', meals: 'Breakfast'
      },
    ],
    inclusions: ['7 nights wellness accommodation', 'Licensed wellness guide', 'Daily yoga & meditation sessions', 'Traditional medicine consultation & Sowa Rigpa treatment', 'Dotsho hot stone bath', 'Sound healing session', 'All organic meals', 'Bhutan SDF & visa processing', 'All transportation', 'Airport transfers'],
    exclusions: ['Additional spa treatments', 'Personal shopping', 'Tips'],
  },
];

export const categoryConfig = {
  cultural:  { label: 'Cultural Tours',       color: 'bg-blue-100 text-blue-800',   icon: '🏯' },
  adventure: { label: 'Adventure & Trekking', color: 'bg-green-100 text-green-800', icon: '🥾' },
  festival:  { label: 'Festival Tours',       color: 'bg-purple-100 text-purple-800', icon: '🎭' },
  luxury:    { label: 'Luxury & Wellness',    color: 'bg-amber-100 text-amber-800', icon: '✨' },
};

export const categories = [
  { id: 'all' as const,       label: 'All Tours',            count: tours.length },
  { id: 'cultural' as const,  label: 'Cultural Tours',       count: tours.filter(t => t.category === 'cultural').length },
  { id: 'adventure' as const, label: 'Adventure & Trekking', count: tours.filter(t => t.category === 'adventure').length },
  { id: 'festival' as const,  label: 'Festival Tours',       count: tours.filter(t => t.category === 'festival').length },
  { id: 'luxury' as const,    label: 'Luxury & Wellness',    count: tours.filter(t => t.category === 'luxury').length },
];

export function getTourBySlug(slug: string): Tour | undefined {
  return tours.find(t => t.slug === slug);
}

export function getFeaturedTours(): Tour[] {
  return tours.filter(t => t.featured);
}
