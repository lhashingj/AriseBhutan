// Premium tour itineraries and FAQs — sourced from Arise Bhutan & Druk Asia research

export const premiumTours = [
  {
    id: 'essential-bhutan-7',
    slug: 'bhutan-heritage-trail',          // matches the slug in tours.ts
    title: '7-Day Essential Bhutan',
    subtitle: 'Paro · Thimphu · Punakha · Wangdue',
    duration: '7 Days / 6 Nights',
    days: 7,
    nights: 6,
    startingFrom: 2400,
    currency: 'USD',
    groupSize: '2–12 pax',
    difficulty: 'Easy',
    bestSeason: 'March–May · September–November',
    badge: 'Best Seller',
    customizable: true,
    tags: ['Cultural', 'Customizable', 'Guided', 'SDF Included'],
    accommodationTier: '3-star heritage hotels',
    image: '/images/river-temple.jpg',
    overview:
      "Journey beyond the 'happiest nation' headlines to experience Bhutan's authentic heritage — sacred monasteries, traditional crafts, local markets, and family homestays guided by passionate local experts. Seven days is the sweet spot — enough time to slow down, breathe Himalayan air, and truly let the Kingdom sink in.",
    highlights: [
      "Tiger's Nest Monastery hike (Paro Taktsang) — 900m above the valley floor",
      'Punakha Dzong at the confluence of two sacred rivers — site of the 2011 Royal Wedding',
      'Dochu La pass with 108 chortens and full 360° Himalayan panorama',
      'Traditional farmhouse lunch with a Bhutanese family in Punakha',
      'Phobjikha glacial valley — winter sanctuary of endangered Black-Necked Cranes',
      'Chimi Lhakhang — the whimsical 15th-century Temple of the Divine Madman',
      'Live archery demonstration — Bhutan\'s national sport',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Paro',
        description:
          'Land at Paro International Airport — one of the world\'s most dramatic approaches, ringed by Himalayan peaks at 7,300 ft. Your guide meets you with a traditional kata welcome scarf. Afternoon visit to the National Museum of Bhutan (Ta Dzong) — a cylindrical watchtower housing thangka paintings, armour, and natural history exhibits. Evening stroll through Paro Bazaar.',
        meals: 'Dinner',
        accommodation: 'Heritage Hotel, Paro (3★)',
      },
      {
        day: 2,
        title: "Tiger's Nest Monastery",
        description:
          "Full day centred on Bhutan's most iconic sight. The monastery clings to a sheer cliff at 3,120m — 900 metres above the valley floor. A 4-hour round-trip hike through prayer-flag-draped pine forest. Stop at the viewpoint café for butter tea. Tour the sacred inner shrines and the cave where Guru Rinpoche meditated for three years. Afternoon: Drukgyel Dzong ruins (1647, once repelled Tibetan invasions).",
        meals: 'Breakfast · Lunch · Dinner',
        accommodation: 'Heritage Hotel, Paro (3★)',
      },
      {
        day: 3,
        title: 'Paro to Thimphu',
        description:
          'Drive to Bhutan\'s vibrant capital via Simtokha Dzong — the oldest intact fortress in the Kingdom, covered in intricate Buddhist paintings. In Thimphu: Tashichho Dzong (seat of the King\'s office), the 169-ft Buddha Dordenma statue, Folk Heritage Museum, National Textile Museum, and the Craft Bazaar.',
        meals: 'Breakfast · Dinner',
        accommodation: 'Boutique Hotel, Thimphu (3★)',
      },
      {
        day: 4,
        title: 'Thimphu to Punakha via Dochu La',
        description:
          'Cross Dochu La pass (3,100m) — 108 memorial chortens built by the Queen Mother ring the hilltop, with Himalayan peak views on clear days. Descend to Punakha Valley. Punakha Dzong — 6-storey fortress at the confluence of the Pho Chhu and Mo Chhu rivers, winter residence of Bhutan\'s monastic body and site of the 2011 Royal Wedding. Khamsum Yulley Namgyal Chorten hike for panoramic valley views.',
        meals: 'Breakfast · Dinner',
        accommodation: 'Resort, Punakha (3★)',
      },
      {
        day: 5,
        title: 'Punakha Valley Deep Dive',
        description:
          'Chimi Lhakhang — fertility temple of the "Divine Madman" Drukpa Kunley (built 1499), reached via a scenic walk across rice fields. Traditional farmhouse lunch with a local Bhutanese family — a genuine glimpse into village life. Afternoon: live archery demonstration. Evening: traditional dotsho hot stone bath with heated river stones and herbal infusions.',
        meals: 'Breakfast · Lunch · Dinner',
        accommodation: 'Resort, Punakha (3★)',
      },
      {
        day: 6,
        title: 'Phobjikha Valley',
        description:
          "Drive to the pristine Phobjikha glacial valley — one of Bhutan's most serene landscapes and the winter home of endangered Black-Necked Cranes (November–March). Gangtey Monastery (17th century) perched above the valley. Gangtey Nature Trail through meadows and forest. Black-Necked Crane Information Centre.",
        meals: 'Breakfast · Dinner',
        accommodation: 'Guesthouse, Gangtey',
      },
      {
        day: 7,
        title: 'Return to Paro & Departure',
        description:
          'Scenic mountain drive back to Paro. Last-minute souvenir shopping at Paro market. Airport transfer and departure.',
        meals: 'Breakfast',
        accommodation: 'N/A',
      },
    ],
    inclusions: [
      '6 nights 3-star heritage hotel accommodation',
      'Licensed English-speaking Arise Bhutan guide throughout',
      'All ground transportation in private vehicle',
      'Bhutan Sustainable Development Fee (SDF) — $100/day',
      'Visa processing assistance',
      'All monastery and site entrance fees',
      'Meals as listed in itinerary',
      'Airport pickup and drop-off',
      'Traditional hot stone bath (dotsho)',
      'Farmhouse lunch experience',
      'Traditional Bhutanese costume set (returnable)',
    ],
    exclusions: [
      'International airfare',
      'Travel insurance (strongly recommended)',
      'Personal expenses and souvenirs',
      'Alcoholic beverages',
      'Tips for guide and driver',
    ],
  },

  {
    id: 'druk-path-trek-9',
    slug: 'druk-path-trek',                 // matches slug in tours.ts
    title: '9-Day Druk Path Trek',
    subtitle: 'Paro · Alpine Lakes · Phajoding · Thimphu',
    duration: '9 Days / 8 Nights',
    days: 9,
    nights: 8,
    startingFrom: 3175,
    currency: 'USD',
    groupSize: '2–8 pax',
    difficulty: 'Moderate',
    bestSeason: 'March–May · September–November',
    badge: "Editor's Pick",
    customizable: true,
    tags: ['Trekking', 'High Altitude', 'Camping', 'Customizable'],
    accommodationTier: 'Tented camps + 2 nights hotel',
    image: '/images/trekkers-valley.jpg',
    overview:
      "One of Bhutan's most popular and accessible trekking routes — approximately 49 km linking Paro to Thimphu through quiet forests, high ridgelines, and crystal-clear alpine lakes with views of the Eastern Himalayas. Traditional yak herder camps, ancient dzongs, and monasteries line the route. This program opens with two cultural days in Paro (including Tiger's Nest as an acclimatizer) then transitions to five days of high-altitude mountain trekking before a rewarding cultural day in Thimphu.",
    highlights: [
      'Classic ~49 km high-altitude traverse reaching Simkotra Tsho at 4,050m',
      'Sacred alpine lakes: Jimilang Tsho (3,880m) and Simkotra Tsho (4,050m)',
      'Ancient Phajoding Monastery — listed by World Monuments Fund',
      'Panoramic views including Mount Gangkar Puensum on clear days',
      "Pre-trek Tiger's Nest acclimatization hike",
      'Yak herder camp encounters in high-altitude pastures',
      'Jele Dzong — ancient fortress atop a ridge above Paro Valley',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Paro',
        description: 'Airport arrival, guide greeting, hotel check-in, rest and altitude acclimatization. Evening trek briefing and gear check.',
        meals: 'Dinner',
        accommodation: 'Heritage Hotel, Paro (3★)',
      },
      {
        day: 2,
        title: "Tiger's Nest Acclimatization Hike",
        description:
          "The perfect altitude primer at 3,120m. Guided hike to Taktsang Monastery — the 4-hour round trip doubles as ideal acclimatization for the trek. Also visit Kyichu Lhakhang (7th century, one of Bhutan's oldest temples) and Drukgyal Dzong ruins (built 1647, partially destroyed by fire in 1957).",
        meals: 'Breakfast · Lunch · Dinner',
        accommodation: 'Heritage Hotel, Paro (3★)',
      },
      {
        day: 3,
        title: 'Trek Day 1: Paro to Jele Dzong (3,450m)',
        description:
          'Meet trekking crew at National Museum (Ta Dzong). Steady climb through blue pine forests and apple orchards, passing Kuenga Lhakhang monastery. Reach Jele Dzong — an ancient fortress atop a ridge, once a watchtower over the Paro Valley. Camp below the pass.',
        meals: 'Breakfast · Lunch · Dinner',
        accommodation: 'Tented Camp, Jele Dzong (3,450m)',
      },
      {
        day: 4,
        title: 'Trek Day 2: Jele Dzong to Tsokam (3,780m)',
        description:
          'Walk north along the ridge through rhododendron and conifer forests. Gentle ascent around a small peak with sweeping Paro Valley views and distant Dagala range. Approximately 4 hours.',
        meals: 'Breakfast · Lunch · Dinner',
        accommodation: 'Tented Camp, Tsokam (3,780m)',
      },
      {
        day: 5,
        title: 'Trek Day 3: Tsokam to Jimilang Tsho (3,880m)',
        description:
          'Stunning ridge walk with panoramic snow-capped peak views. Pass Labana campsite. Climb to Jimilang Tsho — a sacred lake where legend says a giant mystical trout lives as guardian of the valley. Camp beside the lake under starlit skies.',
        meals: 'Breakfast · Lunch · Dinner',
        accommodation: 'Tented Camp, Jimilang Tsho (3,880m)',
      },
      {
        day: 6,
        title: 'Trek Day 4: Jimilang to Simkotra Tsho (4,050m)',
        description:
          'Walk around the lake\'s western edge, ascending through rhododendron to higher ridges. Cross smaller alpine lakes in pristine wilderness. Reach Simkotra Tsho at 4,050m — prayer flags on rocky slopes, views of Mount Gangkar Puensum on clear days.',
        meals: 'Breakfast · Lunch · Dinner',
        accommodation: 'Tented Camp, Simkotra Tsho (4,050m)',
      },
      {
        day: 7,
        title: 'Trek Day 5: Simkotra to Phajoding to Thimphu',
        description:
          'Rolling ridges with Thimphu Valley views. Descend through juniper and dwarf rhododendron to Phajoding Monastery — founded in 1224, listed by the World Monuments Fund as among the most endangered cultural monuments on earth. Wind through pine forest to the roadhead. Drive into Thimphu. Celebration dinner.',
        meals: 'Breakfast · Lunch · Dinner',
        accommodation: 'Boutique Hotel, Thimphu (3★)',
      },
      {
        day: 8,
        title: 'Thimphu Cultural Day',
        description:
          "A well-earned rest day with Thimphu's highlights. Tashichho Dzong (seat of government), National Memorial Chorten, Institute of Zorig Chusum (artisans at work), Craft Bazaar. Optional traditional hot stone bath.",
        meals: 'Breakfast · Dinner',
        accommodation: 'Boutique Hotel, Thimphu (3★)',
      },
      {
        day: 9,
        title: 'Transfer to Paro & Departure',
        description: 'Morning scenic drive to Paro (1.5 hrs). Optional last souvenir stop. Airport transfer and departure.',
        meals: 'Breakfast',
        accommodation: 'N/A',
      },
    ],
    inclusions: [
      '2 nights 3-star hotel in Paro',
      '4 nights tented camping (sleeping bags, mats, tents provided)',
      '1 night at Phajoding (guesthouse or camp)',
      '2 nights 3-star hotel in Thimphu',
      'Experienced licensed trekking guide',
      'Dedicated support crew and pack horses',
      'Camp chef with all trek meals',
      'All trekking and national park permits',
      'Emergency first aid plan',
      'Bhutan SDF ($100/day) and visa processing',
      'Airport transfers',
    ],
    exclusions: [
      'International airfare',
      'Personal trekking gear (boots, poles, rain gear)',
      'Travel and helicopter evacuation insurance',
      'Personal spending',
      'Tips for crew',
    ],
  },

  {
    id: 'luxury-bhutan-5',
    slug: 'bhutan-luxury-escape',           // matches slug in tours.ts
    title: '5-Day Luxury Retreat',
    subtitle: 'Paro · Thimphu · Punakha — Private & Exclusive',
    duration: '5 Days / 4 Nights',
    days: 5,
    nights: 4,
    startingFrom: 4200,
    currency: 'USD',
    groupSize: '2–4 pax',
    difficulty: 'Easy',
    bestSeason: 'Year-round',
    badge: 'Premium',
    customizable: true,
    tags: ['Luxury', 'Private', 'Wellness', 'Exclusive Access'],
    accommodationTier: '5-star boutique lodges',
    image: '/images/couple-dzong.jpg',
    overview:
      "Bhutan, distilled to its essence — and elevated to the extraordinary. This five-day private luxury retreat pairs the Kingdom's most iconic experiences with Bhutan's finest boutique lodge accommodation, a personal senior guide, private chef-curated dining, and exclusive access that standard tours simply cannot offer. Inspired by the acclaimed Uma Paro and Amankora models, designed for the discerning traveller who wants Bhutan without compromise.",
    highlights: [
      '5-star boutique lodge accommodation with panoramic valley and mountain views',
      'Private early-morning Tiger\'s Nest hike before crowds arrive — near-complete solitude',
      'Exclusive private ceremony with senior lama in restricted inner sanctums',
      'Sunrise helicopter scenic flight over Jomolhari (7,314m) and the Great Himalayan Range',
      'Gourmet six-course Bhutanese tasting menus by a private chef',
      'Traditional dotsho hot stone spa and Himalayan sound healing session',
      'Chele La Pass (3,988m) — Bhutan\'s highest motorable road with views into Haa Valley',
    ],
    itinerary: [
      {
        day: 1,
        title: 'VIP Arrival & Welcome',
        description:
          'VIP airport reception with your dedicated senior guide and luxury private vehicle. Private transfer to your clifftop boutique lodge overlooking the Paro Valley. Relaxed afternoon: Paro town walk and Kyichu Lhakhang (7th-century, one of Bhutan\'s oldest temples). Welcome champagne. Private chef six-course welcome dinner.',
        meals: 'Dinner',
        accommodation: 'Luxury Boutique Lodge, Paro (5★)',
      },
      {
        day: 2,
        title: "Exclusive Tiger's Nest + Chele La Pass",
        description:
          "Private 6 AM hike to Tiger's Nest before the trail opens — near-complete solitude in the morning forest. Exclusive lama ceremony inside the sacred inner sanctums (closed to regular visitors). Champagne viewpoint picnic. Afternoon: drive to Chele La Pass (3,988m) — Bhutan's highest motorable road — with views of sacred Jomolhari and remote Haa Valley.",
        meals: 'Breakfast · Lunch · Dinner',
        accommodation: 'Luxury Boutique Lodge, Paro (5★)',
      },
      {
        day: 3,
        title: 'Sunrise Helicopter Flight → Thimphu',
        description:
          'Sunrise helicopter scenic flight above Jomolhari (7,314m) and the Great Himalayan Range — perspectives no ground traveller sees. Private transfer to 5-star Thimphu residence. Private restricted-access Tashichho Dzong tour and master weaver artisan workshop.',
        meals: 'Breakfast · Dinner',
        accommodation: 'Boutique Residence, Thimphu (5★)',
      },
      {
        day: 4,
        title: 'Punakha Valley & Wellness',
        description:
          'Private scenic transfer over Dochu La pass (108 chortens, Himalayan panorama). Golden-hour exclusive Punakha Dzong tour — restricted after-hours private access. Evening: two-hour traditional dotsho hot stone bath with herbal infusions, followed by Himalayan singing bowl sound healing.',
        meals: 'Breakfast · Dinner',
        accommodation: 'River Lodge, Punakha (5★)',
      },
      {
        day: 5,
        title: 'VIP Departure',
        description:
          'Morning meditation walk along the Mo Chhu riverbank. Private transfer to Paro with optional artisan gallery stop. VIP airport lounge service. Departure.',
        meals: 'Breakfast',
        accommodation: 'N/A',
      },
    ],
    inclusions: [
      '4 nights 5-star boutique lodge accommodation',
      'Senior private guide (15+ years experience)',
      'Luxury private vehicle throughout',
      'Sunrise helicopter mountain scenic flight',
      'Private monastery ceremony',
      'All gourmet chef-prepared meals',
      'Traditional dotsho hot stone spa',
      'Sound healing session',
      'Bhutan SDF ($100/day) and visa processing',
      'All private and restricted site access fees',
      'VIP airport reception and departure service',
    ],
    exclusions: [
      'International airfare',
      'Additional helicopter flights',
      'Personal shopping',
      'Gratuities (minimum $50/day suggested)',
    ],
  },
]

export const faqs = [
  {
    id: 'faq-sdf',
    category: 'Fees & Costs',
    question: 'What is the Sustainable Development Fee (SDF) and how much is it?',
    answer:
      "The Sustainable Development Fee is Bhutan's mandatory daily visitor levy. It is currently USD 100 per person per night for international tourists (excluding citizens of India, Bangladesh, and Maldives, who pay BTN 1,200 per night — approximately USD 14). The SDF directly funds Bhutan's free universal education, free healthcare, and environmental conservation programmes — the pillars of Gross National Happiness. Arise Bhutan calculates and includes the full SDF in all package prices, so there are no surprise costs on arrival.",
  },
  {
    id: 'faq-sdf-regional',
    category: 'Fees & Costs',
    question: 'Does the SDF rate differ for Indian, Bangladeshi, or Maldivian citizens?',
    answer:
      'Yes. Citizens of India, Bangladesh, and Maldives pay a reduced SDF of BTN 1,200 (approximately USD 14) per person per night — significantly less than the USD 100/night international rate. Regional visitors also do not require a pre-arranged visa but must carry a valid passport or Indian government-issued voter ID. They still require a licensed Bhutanese tour operator to arrange permits and SDF payment. Arise Bhutan handles all SDF processing for both regional and international visitors.',
  },
  {
    id: 'faq-visa',
    category: 'Visa & Entry',
    question: 'How do I get a Bhutan tourist visa and how long does it take?',
    answer:
      'Bhutan visa applications must be submitted by a licensed Bhutanese tour operator — individual applications are not accepted. The process: (1) Book your tour and provide passport details to Arise Bhutan. (2) We submit your visa clearance application to the Tourism Council of Bhutan (TCB). (3) TCB typically approves clearance within 3–7 working days. (4) Visa clearance is emailed to you to present at Paro Airport for the official visa stamp on arrival. We recommend finalising bookings at least 3 weeks before travel to allow ample processing time, especially during peak season (March–May and September–November).',
  },
  {
    id: 'faq-visa-on-arrival',
    category: 'Visa & Entry',
    question: 'Can I get a visa on arrival or apply directly at a Bhutan embassy?',
    answer:
      "No — Bhutan does not offer visas on arrival for most nationalities, and there is no direct public visa application portal. All international tourist visas must be arranged exclusively through a licensed Bhutanese tour operator. The visa stamp is placed in your passport upon landing at Paro International Airport once your clearance letter is verified. Arise Bhutan manages the entire visa process as part of every package — you will have your clearance confirmation well before boarding your flight.",
  },
  {
    id: 'faq-flights',
    category: 'Flights & Getting Here',
    question: 'Which airlines fly to Bhutan and what are the main gateway cities?',
    answer:
      "Paro International Airport (PBH) is Bhutan's only international airport. Flights are operated by: (1) Druk Air (Royal Bhutan Airlines) — the national carrier, flying from Bangkok (BKK), Delhi (DEL), Kolkata (CCU), Kathmandu (KTM), Mumbai (BOM), Singapore (SIN), and Dhaka (DAC). (2) Bhutan Airlines — flying from Bangkok, Kolkata, Delhi, and Kathmandu. Most international travellers connect through Bangkok, Delhi, or Kolkata. The Paro approach is one of aviation's most dramatic — pilots require special certification to land at this mountain-ringed airport. Arise Bhutan can assist with flight booking on request.",
  },
  {
    id: 'faq-best-time',
    category: 'Flights & Getting Here',
    question: 'When is the best time of year to visit Bhutan?',
    answer:
      "Bhutan has two main peak seasons: Spring (March–May) — mild temperatures, rhododendrons in full bloom across mountain passes, and the famous Paro Tshechu festival. Autumn (September–November) — the clearest mountain views of the year as monsoon dust settles, golden rice harvests, and the Thimphu Tshechu festival. Summer (June–August) is monsoon season — lush green valleys but some road closures. Winter (December–February) is cold but uncrowded, with stunning clear skies and the unique Punakha Drubchen festival. Arise Bhutan guides operate year-round and can advise on the best timing for your interests.",
  },
  {
    id: 'faq-internet',
    category: 'Connectivity & Practical',
    question: 'Is there reliable internet and mobile connectivity in Bhutan?',
    answer:
      "Connectivity varies significantly. In Paro, Thimphu, and Punakha, 4G LTE coverage from Bhutan Telecom and TashiCell is generally reliable. Most 3-star and above hotels offer decent WiFi. In trekking areas like the Druk Path and Phobjikha Valley, connectivity drops to 2G or is absent. We recommend purchasing a local SIM card at Paro Airport on arrival (approximately BTN 300–500 including data). WhatsApp, Instagram, and most social platforms function normally. Some VPN services may experience throttling.",
  },
  {
    id: 'faq-cash',
    category: 'Connectivity & Practical',
    question: 'Should I carry cash? Are ATMs and card payments available?',
    answer:
      "Bhutan's currency is the Bhutanese Ngultrum (BTN), pegged 1:1 to the Indian Rupee (INR is also widely accepted). ATMs are available in Paro and Thimphu and generally accept Visa and Mastercard, though per-transaction limits of BTN 10,000–20,000 apply. Credit card acceptance is improving in major towns but many local restaurants and all trekking areas are cash-only. We recommend arriving with USD 200–400 in cash as backup. Your Arise Bhutan guide can assist with currency exchange at official rate bureaus.",
  },
  {
    id: 'faq-altitude',
    category: 'Health & Safety',
    question: 'Will I experience altitude sickness in Bhutan?',
    answer:
      "Most cultural tours stay between 2,200m and 3,200m — an elevation most visitors adapt to without medication. Tiger's Nest reaches 3,120m; Dochu La pass is 3,100m. For trekking itineraries, elevations of 3,800m–4,200m are common and acclimatization days are built into all Arise Bhutan trekking programmes. Mild symptoms (headache, mild fatigue) at altitude are normal — stay hydrated and ascend slowly. We recommend consulting your doctor about Diamox (acetazolamide) for trekking tours. All Arise Bhutan guides are trained in altitude first aid.",
  },
]
