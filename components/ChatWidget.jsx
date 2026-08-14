'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, ArrowRight, ExternalLink, Menu } from 'lucide-react'

// ── FAQ Knowledge Base ───────────────────────────────────────────────────────

const FAQS = [
  // Greetings
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'kuzuzangpo', 'namaste', 'greetings', 'hiya'],
    answer: "Kuzuzangpo la! 🙏 Welcome to Arise Bhutan Tours & Travels. I can help you with:\n• **Tours & packages** — cultural, trekking, festival tours\n• **Visa & permits** — entry requirements\n• **SDF fee** — Bhutan's sustainable development fee\n• **Pricing** — package rates and inclusions\n• **Best time to visit** — seasons and festivals\n• **Booking** — how to reserve your trip\n\nWhat would you like to know?",
  },
  {
    patterns: ['how are you', 'how r u', "how're you", "what's up", 'whats up', 'how is it going'],
    answer: "I'm doing great, thank you! 😊 Ready to help you plan an unforgettable Bhutan journey. What would you like to know about visiting the Kingdom of Happiness?",
  },
  {
    patterns: ['bye', 'goodbye', 'see you', 'take care', 'talk later', 'ciao', 'ttyl'],
    answer: "Goodbye! 🙏 Safe travels, and we hope to welcome you to the Kingdom of Happiness soon. Feel free to come back anytime with questions!",
  },
  {
    patterns: ['thank you', 'thanks', 'thank u', 'cheers', 'appreciate', 'thx', 'thnks'],
    answer: "You're most welcome! 🙏 Is there anything else I can help you with about your Bhutan journey?",
  },
  {
    patterns: ['ok', 'okay', 'alright', 'got it', 'i see', 'understood', 'noted', 'cool', 'great', 'awesome', 'perfect', 'sounds good'],
    answer: "Great! 😊 Is there anything else you'd like to know about your Bhutan journey?",
  },
  {
    patterns: ['yes', 'yep', 'yup', 'yeah', 'absolutely', 'definitely', 'of course', 'certainly', 'for sure'],
    answer: "Wonderful! Please go ahead and tell me what you'd like to know — I'm here to help. 😊",
  },
  {
    patterns: ['no', 'nope', 'nah', 'not really', 'nothing else', "that's all", 'all good', 'i am good'],
    answer: "No problem at all! 🙏 Feel free to come back anytime. We'd love to help you plan your Bhutan adventure whenever you're ready!",
  },
  {
    patterns: ['are you a bot', 'are you ai', 'are you robot', 'are you human', 'who built you', 'who created you', 'what are you'],
    answer: "I'm the virtual travel assistant for Arise Bhutan Tours & Travels! 🤖 I can answer questions about our tours, visa, SDF, trekking, pricing, and more. For personalised advice, reach our human team on WhatsApp at +975 77 319 405 or +61 435 341 033 (Australia).",
  },
  {
    patterns: ['what can you do', 'help me', 'what do you know', 'what can i ask', 'how can you help'],
    answer: "I can help you with:\n• **Tours & Packages** — destinations, itineraries, activities\n• **Visa & Permits** — what you need to enter Bhutan\n• **SDF Fee** — Bhutan's sustainable development fee explained\n• **Pricing** — package rates and what's included\n• **Best Time to Visit** — seasons, weather, festivals\n• **Trekking** — routes, difficulty, what to expect\n• **Festivals** — Tshechu dates and highlights\n• **Booking** — how to reserve your trip\n• **Booking Reference** — paste your ARB-XXXX code to check your trip\n\nJust ask away!",
  },

  // About Arise Bhutan
  {
    patterns: ['arise bhutan', 'about you', 'who are you', 'your company', 'travel agency', 'tour operator', 'about arise', 'who is arise', 'dot licensed', 'licensed'],
    answer: "**Arise Bhutan Tours & Travels** is a DOT-licensed Bhutanese tour operator based in Paro, Bhutan. We specialise in crafting fully private, personalised Bhutan journeys — from cultural immersions and monastery visits to high-altitude trekking adventures.\n\n📍 Nyamaizampa, Paro 12001, Bhutan\n📞 +975 77 319 405\n💬 WhatsApp AU: +61 435 341 033\n✉ arisebhutan@gmail.com",
  },

  // Visa & Entry
  {
    patterns: ['visa', 'permit', 'entry requirement', 'travel document', 'tourist visa', 'entry permit', 'need visa', 'require visa', 'indian visa', 'india visa', 'bangladesh visa', 'maldives visa', 'saarc'],
    answer: "**Visa Requirements for Bhutan:**\n\n🇮🇳 **Indian, Bangladeshi & Maldivian citizens** — No visa required! You only need an entry permit, which we arrange as part of your package.\n\n🌍 **All other nationalities** — A Tourist Visa is required. We handle the entire visa application process for you — no need to visit an embassy.\n\n✅ Both the visa and all permits (restricted area permits etc.) are included in your tour package with us.",
  },

  // SDF Fee
  {
    patterns: ['sdf', 'sustainable development fee', 'daily fee', 'royalty fee', 'tourism fee', '$100', 'usd 100', '1200', 'inr 1200', 'daily charge', 'per day fee', 'government fee', 'mandatory fee'],
    answer: "**Sustainable Development Fee (SDF):**\n\n🌍 **International tourists** — USD $100 per person per night\n🇮🇳 **SAARC nationals** (India, Bangladesh, Maldives) — INR ₹1,200 per person per night\n👶 **Children under 5** — Free\n\nThis mandatory levy is set by Bhutan's government and funds free healthcare, education, and Bhutan's carbon-neutral environmental policies. It is **included in your quoted tour price** — no hidden charges.",
  },

  // Pricing
  {
    patterns: ['cost', 'price', 'pricing', 'how much', 'expensive', 'budget', 'rate', 'package cost', 'quote', 'per night', 'per person', 'total cost', 'package price', 'cheapest', 'affordable'],
    answer: "**Package Pricing (per person/night, all-inclusive):**\n\n🏨 **Standard** (3-star lodges) — USD 200–300\n🏨 **Deluxe** (4-star boutique hotels) — USD 350–500\n🏨 **Luxury** (heritage resorts) — USD 500–700+\n\n✅ **All prices include:** SDF government fee, accommodation, all meals (B+L+D), licensed guide, private transport, all entry permits.\n\n[Get a Personalised Quote →](/contact) based on your group size, dates, and hotel preference.",
  },

  // Hotels & Accommodation
  {
    patterns: ['hotel', 'accommodation', 'stay', 'lodge', 'resort', 'standard', 'deluxe', 'luxury', 'room', 'where to stay', 'sleep'],
    answer: "We offer three accommodation tiers:\n\n🏨 **Standard** — Comfortable 3-star lodges with local character\n🏨 **Deluxe** — 4-star boutique heritage hotels with mountain views\n🏨 **Luxury** — Bhutan's finest resorts & heritage properties (Uma by COMO, Amankora, Six Senses etc.)\n\nAll tiers include breakfast and dinner. Accommodation is in well-located properties close to key attractions.",
  },

  // Best Time to Visit
  {
    patterns: ['best time', 'when to visit', 'season', 'weather', 'climate', 'monsoon', 'spring', 'autumn', 'winter', 'summer', 'good time', 'ideal time', 'which month', 'what month'],
    answer: "**Best Times to Visit Bhutan:**\n\n🌸 **Spring (March–May)** — Blooming rhododendrons, clear skies, ideal for trekking. Paro Tshechu festival in March/April. Most popular season!\n\n🍂 **Autumn (September–November)** — Crystal-clear Himalayan views, vibrant festivals, perfect weather. Thimphu Tshechu in Sep/Oct.\n\n❄️ **Winter (Dec–Feb)** — Fewer crowds, snow-dusted dzongs, budget-friendly. Black-necked crane sightings in Phobjikha Valley.\n\n🌧️ **Monsoon (June–August)** — Lush green landscapes but frequent rain. Still possible to visit!",
  },

  // Tours & Packages
  {
    patterns: ['tour', 'tours', 'package', 'packages', 'what tours', 'available tours', 'tour options', 'bhutan tour', 'offer', 'itinerary', 'itineraries', 'cultural tour', 'festival tour', 'honeymoon', 'family tour', 'luxury tour', 'adventure tour'],
    answer: "We offer **fully private, customised** Bhutan packages:\n\n🏛️ **Cultural Tours** — Dzongs, monasteries, local villages (5–8 nights)\n🎭 **Festival Tours** — Timed around Paro or Thimphu Tshechu\n🥾 **Trekking Packages** — Druk Path, Jomolhari, Snowman Trek\n💎 **Luxury Retreats** — Heritage hotels, wellness, fine dining\n💑 **Honeymoon Packages** — Romantic private experiences\n👨‍👩‍👧 **Family Tours** — Kid-friendly with gentle hiking\n\n**No fixed group tours** — every itinerary is private and built around you.\n\n👉 [Use our Adventure Builder →](/contact) to design your package, or [Sign Up](/register) to access sample itineraries in your client portal.",
  },

  // Booking Process
  {
    patterns: ['book', 'booking', 'reserve', 'how to book', 'how do i book', 'start', 'plan my trip', 'get started', 'adventure builder', 'package builder', 'sign up', 'register'],
    answer: "**How to Book with Arise Bhutan:**\n\n1️⃣ [Use our Adventure Builder →](/contact) to design your custom package\n2️⃣ Submit your preferences — we'll send a detailed quote within 24 hours\n3️⃣ Confirm with a **30% deposit** to lock in your dates\n4️⃣ We handle visa, permits, hotels, guide & all ground arrangements\n5️⃣ Pay remaining 70% at least 30 days before arrival\n\n💬 WhatsApp us at **+975 77 319 405** or **+61 435 341 033** (Australia) and we'll plan everything for you!",
  },

  // Trekking
  {
    patterns: ['trek', 'hike', 'trekking', 'hiking', 'snowman', 'druk path', 'jomolhari', 'trail', 'walking tour', 'walk', 'mountain', 'altitude', 'difficult trek', 'easy trek'],
    answer: "**Bhutan Trekking Options:**\n\n🥾 **Druk Path Trek** (5 days) — Lakes & ridge views, moderate difficulty. Connects Paro to Thimphu.\n\n⛰️ **Jomolhari Trek** (8 days) — Base camp at 4,080m, stunning Himalayan scenery. Moderate-challenging.\n\n🏔️ **Snowman Trek** (25 days) — One of the world's most challenging treks. High altitude, remote wilderness.\n\n✅ All treks include: certified guides, pack animals, camping equipment, and all restricted area permits.",
  },

  // Festivals & Calendar
  {
    patterns: ['festival', 'tshechu', 'paro tshechu', 'thimphu tshechu', 'event', 'celebration', 'mask dance', 'losar', 'punakha', 'drubchen', 'festival dates', 'when is festival', 'calendar', 'holiday', 'bhutan calendar', 'festival calendar', 'when is', 'what date', 'date of festival', 'nimalung', 'kurjey', 'gangtey', 'wangdue', 'ura yakchoe', 'jambay', 'trashigang', 'trongsa', 'black necked crane', 'rhododendron', 'chhorten kora'],
    answer: "**Bhutan 2026 Festival Dates:**\n\n🎭 **Punakha Drubchen** — Feb 22–24 *(Punakha Dzong)*\n🎭 **Punakha Tshechu** — Feb 26–28 *(Punakha Dzong)*\n🎭 **Paro Tshechu** — Mar 29 – Apr 2 *(Rinpung Dzong, Paro)*\n🎭 **Ura Yakchoe** — Apr 28 – May 2 *(Bumthang)*\n🎭 **Nimalung Tshechu** — Jun 22–24 *(Bumthang)*\n🎭 **Thimphu Tshechu** — Sep 21–23 *(Tashichho Dzong)*\n🦢 **Black-Necked Crane Festival** — Nov 11 *(Phobjikha)*\n🎭 **Trongsa Tshechu** — Dec 17–21 *(Trongsa Dzong)*\n\n📅 [View Full Festival Calendar →](/festival-calendar)\n\n**Book early — festival tours fill up months in advance!**",
  },

  // Tiger's Nest & Landmarks
  {
    patterns: ["tiger's nest", 'tiger nest', 'paro taktsang', 'taktsang', 'monastery', 'dzong', 'landmark', 'must see', 'top attraction', 'buddha point', 'punakha dzong', 'rinpung dzong'],
    answer: "**Top Bhutan Landmarks:**\n\n🏔️ **Paro Taktsang (Tiger's Nest)** — Bhutan's most iconic site, perched at 3,120m. A 2–3 hour hike each way. Included in most itineraries.\n\n🏯 **Punakha Dzong** — Stunning fortress at the confluence of two rivers. Best visited Feb–March.\n\n🙏 **Buddha Dordenma** — 169-ft golden Buddha overlooking Thimphu valley.\n\n🏰 **Rinpung Dzong** — The iconic fortress in Paro, host of the famous Paro Tshechu festival.",
  },

  // Destinations
  {
    patterns: ['paro', 'thimphu', 'punakha', 'bumthang', 'haa', 'wangdue', 'destination', 'place to visit', 'where to go', 'city', 'town', 'valley', 'phobjikha'],
    answer: "**Top Bhutan Destinations:**\n\n🌄 **Paro** — Tiger's Nest, Paro Dzong, National Museum, local craft market\n🏙️ **Thimphu** — Capital city, Buddha Point, Memorial Chorten, weekend market\n🌊 **Punakha** — Stunning dzong at river confluence, suspension bridge\n🙏 **Bumthang** — Spiritual heartland with ancient monasteries & temples\n❄️ **Haa Valley** — Remote, pristine, off-the-beaten-path\n🦢 **Phobjikha Valley** — Winter home of black-necked cranes\n\nOur itineraries range from 5-night highlights to 14-night deep explorations.",
  },

  // Flights
  {
    patterns: ['flight', 'airport', 'arrive', 'drukair', 'bhutan airlines', 'fly', 'flying to bhutan', 'paro airport', 'how to reach', 'how to get to bhutan', 'connecting flight', 'bangkok', 'delhi', 'kolkata', 'singapore', 'flight schedule', 'flight time', 'departure time', 'arrival time'],
    answer: "**Getting to Bhutan:**\n\n✈️ Flights land at **Paro International Airport (PBH)** — one of the world's most scenic landings!\n\n**Airlines:**\n• **Druk Air** (Royal Bhutan Airlines)\n• **Bhutan Airlines**\n\n**Connecting hubs:**\nBangkok • Singapore • Delhi • Kolkata • Kathmandu\n\n🔎 [Check Flight Schedule & Times →](/flight-schedule) — real Druk Air and Bhutan Airlines departure/arrival times by route and date.\n\nWe can recommend the best flight options once your dates are confirmed. Paro Airport can be weather-dependent — we always build buffer days into itineraries.",
  },

  // Payment
  {
    patterns: ['payment', 'pay', 'bank transfer', 'deposit', 'advance', 'how to pay', 'inr', 'usd', 'currency', 'wire transfer', 'installment', 'payment method', 'payment options'],
    answer: "**Payment Options:**\n\n🏦 **Bank Transfer (SWIFT)** — our primary method; full banking details sent with your quote\n💳 **Credit/Debit Card** — Visa, Mastercard, JCB, Discover & Diners Club accepted via our secure checkout link (Bhutan Payments / BNB)\n\n📋 Payment schedule:\n• **30% deposit** — to confirm your booking and lock in dates\n• **Remaining 70%** — due at least 30 days before arrival\n\nYour payment link and full banking details are sent as soon as your itinerary is quoted.",
  },

  // Cancellation Policy
  {
    patterns: ['cancel', 'refund', 'cancellation policy', 'change date', 'postpone', 'reschedule', 'cancellation fee', 'cancellation terms'],
    answer: "**Cancellation Policy:**\n\n✅ **30+ days before arrival** — Full refund minus processing fees\n⚠️ **15–30 days** — 50% refund\n❌ **Under 15 days** — Non-refundable\n\n📋 We strongly recommend purchasing **travel insurance** to cover unexpected cancellations, medical emergencies, or trip interruptions. Ask us for recommended providers!",
  },

  // Contact Info
  {
    patterns: ['contact', 'reach you', 'phone', 'email', 'whatsapp', 'call us', 'get in touch', 'office', 'address', 'location', 'number'],
    answer: "**Contact Arise Bhutan:**\n\n📞 **+975 77 319 405** (Bhutan)\n💬 **+61 435 341 033** (WhatsApp Australia)\n✉️ **arisebhutan@gmail.com**\n📍 Nyamaizampa, Paro 12001, Bhutan\n\nWe respond within 24 hours — usually much faster! For urgent queries, WhatsApp is the fastest way to reach us.",
  },

  // Group / Private Tours
  {
    patterns: ['group', 'family', 'solo', 'couple', 'honeymoon', 'private tour', 'custom tour', 'personalised', 'individual', 'group size', 'minimum', 'single traveller'],
    answer: "We cater to **all travel styles:**\n\n👤 Solo adventurers\n💑 Couples & honeymooners\n👨‍👩‍👧 Families with children\n🏢 Corporate & incentive groups\n\n**All our tours are 100% private** — you will never share transport or accommodation with strangers. Every itinerary is customised to your group's pace, interests, and budget.",
  },

  // Carbon Negative / Environment
  {
    patterns: ['carbon', 'environment', 'sustainable', 'eco', 'green', 'nature', 'biodiversity', 'carbon neutral', 'carbon negative', 'happiness', 'gross national happiness', 'gnh'],
    answer: "Bhutan is the **world's only carbon-negative country** — it absorbs more carbon than it produces. Over 70% of the country is forested by constitutional mandate.\n\nBhutan's philosophy of **Gross National Happiness (GNH)** prioritises wellbeing over GDP — balancing economic development with environmental conservation and cultural preservation.\n\nThe SDF levy you pay directly funds environmental protection, reforestation, free healthcare, and free education for all Bhutanese citizens.",
  },

  // What's included
  {
    patterns: ['included', 'inclusive', 'include', 'what is included', 'meals', 'food', 'breakfast', 'lunch', 'dinner', 'guide', 'transport', 'car', 'driver'],
    answer: "**All Arise Bhutan packages include:**\n\n✅ All accommodation (as per chosen tier)\n✅ All meals — Breakfast, Lunch & Dinner\n✅ Licensed English-speaking guide\n✅ Private vehicle & driver\n✅ SDF government fee\n✅ Visa & entry permit processing\n✅ All monument & attraction entry fees\n✅ Airport transfers\n✅ International flights (economy class)\n\n**Not included:** Personal expenses, travel insurance, and alcoholic beverages.",
  },

  // Internet / Connectivity
  {
    patterns: ['internet', 'wifi', 'sim card', 'connectivity', 'mobile data', 'phone signal', 'roaming'],
    answer: "**Connectivity in Bhutan:**\n\n📶 Most hotels in Paro, Thimphu, and Punakha have WiFi\n📱 Local SIM cards (Bhutan Telecom / TashiCell) available at Paro Airport — very affordable\n⚠️ Signal can be weak in remote valleys and high-altitude trekking areas\n\nWe recommend downloading offline maps and travel apps before arriving in remote areas.",
  },

  // Currency
  {
    patterns: ['currency', 'money', 'exchange', 'ngultrum', 'rupee', 'atm', 'cash', 'credit card', 'dollar', 'btc', 'exchange rate'],
    answer: "**Currency in Bhutan:**\n\n💵 Bhutan's currency is the **Ngultrum (BTN)**, pegged 1:1 to the Indian Rupee (INR)\n🇮🇳 Indian Rupees are accepted everywhere\n💳 USD and major currencies can be exchanged at banks and hotels\n🏧 ATMs available in Thimphu and Paro (limited in other towns)\n💳 Credit cards accepted at major hotels but not everywhere — carry cash for small shops and rural areas",
  },

  // Packing / What to bring
  {
    patterns: ['pack', 'packing', 'what to bring', 'what to wear', 'clothes', 'clothing', 'dress code', 'temple dress', 'monastery dress', 'luggage'],
    answer: "**Packing Tips for Bhutan:**\n\n👕 **Layering is key** — temperatures vary greatly between valleys and altitudes\n🙏 **Modest clothing** — cover shoulders and knees when visiting dzongs & monasteries\n👟 **Comfortable walking shoes** — you'll do a lot of walking!\n☀️ **Sunscreen & sunglasses** — UV is strong at altitude\n💊 **Basic medications** — pharmacies exist but limited in remote areas\n📸 **Camera** — Bhutan is incredibly photogenic!\n\nFor trekking: good hiking boots, warm layers, rain gear, and a walking pole are essential.",
  },

  // Helicopter Services
  {
    patterns: ['helicopter', 'heli', 'chopper', 'helicopter service', 'helicopter charter', 'helicopter tour', 'scenic flight', 'heli tour', 'rbhs', 'helicopter price', 'helicopter cost', 'helicopter excursion'],
    answer: "**Helicopter Services:**\n\n🚁 Royal Bhutan Helicopter Services (RBHS) offers scenic flights over Paro Valley, Tiger's Nest and Mount Jomolhari — 30/60/90-minute excursions from **$2,500 per trip** (up to 5 passengers) — plus point-to-point charters to Thimphu, Punakha, Bumthang, Trashigang and beyond.\n\n🚁 [View Helicopter Services & Pricing →](/helicopter-services)\n\nWe arrange your charter with RBHS as part of your itinerary — just tell us which route or scenic flight you're interested in.",
  },
]

// ── Fuzzy Matching ───────────────────────────────────────────────────────────

const KEYWORDS = {
  greeting:    ['hello', 'kuzuzangpo', 'namaste', 'greetings'],
  visa:        ['visa', 'permit', 'entry', 'saarc', 'indian', 'nationality', 'passport', 'allowed', 'requirement'],
  sdf:         ['sdf', 'sustainable', 'development', 'daily', 'royalty', 'government', 'levy', 'mandatory'],
  price:       ['price', 'cost', 'pricing', 'budget', 'expensive', 'affordable', 'rate', 'quote', 'package', 'amount'],
  hotel:       ['hotel', 'accommodation', 'lodge', 'resort', 'stay', 'room', 'sleep', 'deluxe', 'luxury', 'standard'],
  season:      ['season', 'weather', 'climate', 'spring', 'autumn', 'winter', 'monsoon', 'temperature', 'month', 'visit'],
  tours:       ['tour', 'package', 'cultural', 'trekking', 'festival', 'honeymoon', 'family', 'itinerary', 'itinarary', 'iteniary', 'itnry', 'program', 'schedule'],
  booking:     ['book', 'booking', 'reserve', 'reservation', 'plan', 'arrange', 'confirm', 'deposit', 'adventure', 'builder'],
  trekking:    ['trek', 'trekking', 'hiking', 'hike', 'snowman', 'jomolhari', 'drukpath', 'trail', 'altitude', 'mountain', 'walking'],
  festival:    ['festival', 'tshechu', 'ceremony', 'celebration', 'mask', 'dance', 'losar', 'cultural', 'tradition', 'calendar', 'holiday', 'date', 'when', 'schedule', 'paro', 'thimphu', 'punakha', 'bumthang', 'nimalung', 'kurjey', 'gangtey', 'wangdue', 'trongsa', 'trashigang'],
  landmark:    ['tigersnest', 'taktsang', 'monastery', 'dzong', 'temple', 'landmark', 'attraction', 'sight', 'buddha'],
  destination: ['paro', 'thimphu', 'punakha', 'bumthang', 'destination', 'valley', 'city', 'place', 'visit'],
  flight:      ['flight', 'airport', 'airline', 'drukair', 'fly', 'arrive', 'reach', 'travel', 'connect'],
  payment:     ['payment', 'pay', 'transfer', 'deposit', 'bank', 'currency', 'dollar', 'rupee', 'inr', 'usd'],
  cancel:      ['cancel', 'cancellation', 'refund', 'reschedule', 'postpone', 'change', 'return'],
  contact:     ['contact', 'phone', 'email', 'whatsapp', 'reach', 'address', 'office', 'call', 'message'],
  included:    ['included', 'inclusive', 'include', 'meals', 'food', 'guide', 'transport', 'driver', 'breakfast', 'lunch', 'dinner'],
  internet:    ['internet', 'wifi', 'sim', 'connectivity', 'mobile', 'signal', 'roaming', 'data'],
  currency:    ['currency', 'money', 'exchange', 'ngultrum', 'cash', 'atm', 'credit', 'card'],
  packing:     ['pack', 'packing', 'clothes', 'clothing', 'dress', 'bring', 'luggage', 'wear', 'temple'],
  environment: ['carbon', 'environment', 'sustainable', 'happiness', 'gnh', 'nature', 'forest', 'conservation'],
  group:       ['group', 'solo', 'couple', 'family', 'private', 'personal', 'individual', 'honeymoon'],
  helicopter:  ['helicopter', 'heli', 'chopper', 'rbhs', 'scenic', 'charter'],
}

const KEYWORD_TO_FAQ = {
  greeting: 0, visa: 10, sdf: 11, price: 12, hotel: 13, season: 14,
  tours: 15, booking: 16, trekking: 17, festival: 18, landmark: 19,
  destination: 20, flight: 21, payment: 22, cancel: 23, contact: 24,
  group: 25, environment: 26, included: 27, internet: 28, currency: 29, packing: 30,
  helicopter: 31,
}

function charOverlap(a, b) {
  const sa = new Set(a), sb = new Set(b)
  let common = 0
  for (const c of sa) if (sb.has(c)) common++
  return (2 * common) / (sa.size + sb.size)
}

function fuzzyWordMatch(word, keyword) {
  if (word.length < 4 || keyword.length < 4) return false
  if (Math.abs(word.length - keyword.length) > Math.max(word.length, keyword.length) * 0.55) return false
  return charOverlap(word, keyword) >= 0.72
}

// ── Autocomplete Suggestions ─────────────────────────────────────────────────

const SUGGESTION_LIST = [
  'What tours do you offer?',
  'How can I get the itinerary?',
  'What is the SDF fee?',
  'What is the visa requirement for Bhutan?',
  'Best time to visit Bhutan?',
  'How do I book a tour?',
  'How much does a Bhutan tour cost?',
  'What is included in the package?',
  'What trekking options are available?',
  'When are the festivals in Bhutan?',
  'When is Paro Tshechu 2026?',
  'Show me the festival calendar',
  'How do I get to Bhutan by flight?',
  'What is the Drukair flight schedule?',
  'Tell me about helicopter services',
  'How do I contact Arise Bhutan?',
  'What is the cancellation policy?',
  'What hotels do you offer?',
  'What should I pack for Bhutan?',
  'What currency is used in Bhutan?',
  'What payment options do you accept?',
]

function getSuggestions(input) {
  const raw = input.trim()
  if (raw.length < 2) return []
  const words = raw.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length >= 2)
  if (words.length === 0) return []
  return SUGGESTION_LIST.filter(s => {
    const sWords = s.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length >= 3)
    return words.some(w =>
      sWords.some(sw => sw.startsWith(w) || (w.length >= 4 && fuzzyWordMatch(w, sw)))
    )
  }).slice(0, 4)
}

// ── Quick Actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'View My Itineraries',   emoji: '🗺️', action: 'link',     value: '/register' },
  { label: 'Adventure Builder',     emoji: '🏗️', action: 'link',     value: '/contact' },
  { label: 'Flight Schedule',       emoji: '✈️', action: 'link',     value: '/flight-schedule' },
  { label: 'Helicopter Services',   emoji: '🚁', action: 'link',     value: '/helicopter-services' },
  { label: 'Talk to Live Agent',    emoji: '💬', action: 'whatsapp' },
]

const ARB_REGEX = /\bARB-\d{4}-[A-Z0-9]{4,}\b/i

const QUICK_CHIPS = [
  'What tours do you offer?',
  'What is the SDF fee?',
  'Best time to visit Bhutan',
  'How do I book a tour?',
]

const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  text: "Kuzuzangpo la! 🙏 I'm the **Arise Bhutan Assistant**. Ask me anything about our tours, Bhutan visa, trekking, festivals, or paste your **booking reference** (e.g. ARB-2026-XXXX) to check your trip status.",
  created_at: new Date().toISOString(),
}

const SHORT_PATTERN = /^[a-z]{1,4}$/

function matchesPattern(low, pattern) {
  if (SHORT_PATTERN.test(pattern.trim())) {
    return new RegExp('(^|\\s)' + pattern.trim() + '(\\s|$|[!?.,])').test(low)
  }
  return low.includes(pattern)
}

function findAnswer(text) {
  const low = text.toLowerCase().trim()

  // 1. Exact / substring pattern matching — the most specific (longest) matching
  // pattern wins, so e.g. "helicopter cost" prefers the helicopter FAQ's own
  // pattern over a shorter, more generic pattern like "cost" from another FAQ.
  let best = null
  let bestLen = 0
  for (const faq of FAQS) {
    for (const p of faq.patterns) {
      if (p.length > bestLen && matchesPattern(low, p)) {
        best = faq
        bestLen = p.length
      }
    }
  }
  if (best) return best.answer

  // 2. Fuzzy keyword matching — handles typos like "itratcy" → "itinerary"
  const words = low.replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length >= 4)
  if (words.length === 0) return null

  for (const [topic, kwList] of Object.entries(KEYWORDS)) {
    for (const kw of kwList) {
      for (const word of words) {
        if (word === kw || fuzzyWordMatch(word, kw)) {
          const idx = KEYWORD_TO_FAQ[topic]
          if (idx != null && FAQS[idx]) return FAQS[idx].answer
        }
      }
    }
  }

  return null
}

// ── Sub-components ───────────────────────────────────────────────────────────

function MsgText({ text }) {
  const linkCls = 'text-amber-600 underline underline-offset-2 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300'

  return (
    <div className="leading-relaxed">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />
        const parts = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
        return (
          <div key={i}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>
              }
              const lm = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
              if (lm) return <a key={j} href={lm[2]} className={linkCls}>{lm[1]}</a>
              return part
            })}
          </div>
        )
      })}
    </div>
  )
}

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-amber-100 dark:bg-amber-500/20 dark:border dark:border-amber-500/40">
      <MessageCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
    </div>
  )
}

function MessageRow({ msg, t, onConcierge }) {
  const isUser      = msg.role === 'user'
  const isStreaming = !!msg.isStreaming
  const time        = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className={`max-w-[80%] rounded-2xl rounded-br-none px-3.5 py-2.5 text-sm ${t.userBubble}`}>
          <p className="leading-relaxed">{msg.text}</p>
          <p className="text-[10px] mt-1.5 text-right text-white/60">{time}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="max-w-[82%] space-y-1.5">
        <p className={`text-[10px] font-medium ml-0.5 ${t.botLabel}`}>Arise Bhutan Assistant</p>
        <div className={`rounded-2xl rounded-bl-none px-3.5 py-2.5 text-sm ${t.botBubble}`}>
          <MsgText text={msg.text || ''} />
          {isStreaming && (
            <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-amber-500 animate-pulse rounded-sm align-middle" />
          )}
          {!isStreaming && (
            <p className={`text-[10px] mt-1.5 ${t.time}`}>{time}</p>
          )}
        </div>
        {msg.itineraryRef && !isStreaming && (
          <a
            href={`/itinerary/${msg.itineraryRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-semibold transition-colors ${t.conciergeBtn}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Itinerary & Voucher
          </a>
        )}
        {msg.showConcierge && !isStreaming && (
          <button
            onClick={onConcierge}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-semibold transition-colors ${t.conciergeBtn}`}
          >
            Send Enquiry to Concierge Desk
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Widget ──────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [open,        setOpen]        = useState(false)
  const [messages,    setMessages]    = useState([WELCOME_MSG])
  const [input,       setInput]       = useState('')
  const [typing,      setTyping]      = useState(false)
  const [stream,      setStream]      = useState(null)
  const [missCount,   setMissCount]   = useState(0)
  const [chipsGone,   setChipsGone]   = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [suggestions, setSuggestions] = useState([])

  const scrollRef    = useRef(null)
  const textareaRef  = useRef(null)
  const menuRef      = useRef(null)

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }, [messages, typing, stream?.text])

  // Focus on open
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 180)
  }, [open])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function onDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  // Character-by-character streaming reveal
  useEffect(() => {
    if (!stream?.fullText) return
    let cancelled = false
    let timer
    let idx = 0
    const full          = stream.fullText
    const streamId      = stream.id
    const showConcierge = stream.showConcierge
    const itineraryRef  = stream.itineraryRef

    const tick = () => {
      if (cancelled) return
      idx = Math.min(full.length, idx + (idx < 120 ? 4 : idx < 300 ? 7 : 12))
      setStream(prev => prev ? { ...prev, text: full.slice(0, idx) } : prev)
      if (idx >= full.length) {
        setMessages(prev => [
          ...prev,
          { id: streamId, role: 'bot', text: full, showConcierge, itineraryRef, created_at: new Date().toISOString() },
        ])
        setStream(null)
        return
      }
      timer = setTimeout(tick, idx < 140 ? 16 : 10)
    }
    timer = setTimeout(tick, 60)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [stream?.fullText, stream?.id, stream?.showConcierge, stream?.itineraryRef])

  async function sendMessage(text) {
    const trimmed = text?.trim()
    if (!trimmed || typing || stream) return

    setChipsGone(true)
    setInput('')
    setSuggestions([])
    setMenuOpen(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const userMsg = { id: 'u-' + Date.now(), role: 'user', text: trimmed, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 500 + Math.random() * 400))

    // ── Booking reference lookup ──────────────────────────────────────────
    // Goes through the /api/voucher route (service-role, no direct table read)
    // since anonymous visitors have no session and itineraries RLS no longer
    // grants anon SELECT. The route already strips pricing for unauthenticated
    // requests, which is fine here — this lookup only ever displays name/tour/status.
    const refMatch = trimmed.match(ARB_REGEX)
    if (refMatch) {
      const ref = refMatch[0].toUpperCase()
      const itin = await fetch(`/api/voucher/${ref}`, { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(body => body?.itinerary || null)
        .catch(() => null)

      setTyping(false)

      if (itin) {
        const name   = itin.client_info?.name || itin.client_info?.full_name || ''
        const tour   = itin.tour_summary?.tour_package || itin.tour_summary?.tour_name || 'Your Bhutan Tour'
        const status = itin.status ? itin.status.replace(/_/g, ' ') : 'Pending'
        const nameLine = name ? '\nClient: **' + name + '**' : ''
        const fullText = 'Found it! Here are the details for **' + ref + '**:\n\nTour: **' + tour + '**' + nameLine + '\nStatus: **' + status + '**\n\nView your full itinerary and voucher below:'
        setStream({ id: 'bot-' + Date.now(), text: '', fullText, showConcierge: false, itineraryRef: ref })
      } else {
        const fullText = 'No booking found for **' + ref + '**.\n\nPlease double-check your reference (format: ARB-YYYY-XXXXXX). If you think this is an error, our team is happy to help.'
        setStream({ id: 'bot-' + Date.now(), text: '', fullText, showConcierge: true, itineraryRef: null })
      }
      return
    }

    setTyping(false)

    // ── FAQ lookup ────────────────────────────────────────────────────────
    const answer = findAnswer(trimmed)
    if (answer) {
      setMissCount(0)
      setStream({ id: 'bot-' + Date.now(), text: '', fullText: answer, showConcierge: false, itineraryRef: null })
    } else {
      const next = missCount + 1
      setMissCount(next)
      const fallback = next >= 2
        ? "I'm not able to find a specific answer to that. Our travel specialists can give you a detailed, personalised response — tap below to reach them directly on WhatsApp."
        : "I'm not quite sure about that one! I can help with tours, visa requirements, SDF fee, best time to visit, trekking, festivals, pricing, and booking. Or connect with our concierge team below for a personalised answer!"
      setStream({ id: 'bot-' + Date.now(), text: '', fullText: fallback, showConcierge: true, itineraryRef: null })
    }
  }

  function handleSubmit(e) {
    e?.preventDefault()
    sendMessage(input)
  }

  function handleQuickAction(action) {
    setMenuOpen(false)
    if (action.action === 'whatsapp') {
      window.open('https://wa.me/97577319405?text=Hello%2C%20I%20have%20an%20enquiry%20about%20a%20Bhutan%20tour.', '_blank')
    } else if (action.action === 'link') {
      window.location.href = action.value
    } else if (action.action === 'message') {
      sendMessage(action.value)
    }
  }

  // ── Theme tokens ─────────────────────────────────────────────────────────
  // A single theme-aware token set: light by default, dark via `dark:`
  // variants, so the widget follows the global site theme everywhere
  // (public pages, client portal, and admin panel alike).
  const t = {
        widget:         'bg-[#f8f6f2] border border-stone-200/80 shadow-2xl shadow-stone-900/12 dark:bg-stone-900 dark:border-white/10 dark:shadow-black/60',
        header:         'bg-gradient-to-r from-amber-700 to-amber-600',
        headerTitle:    'text-white',
        headerSub:      'text-amber-100/80',
        body:           'bg-[#f8f6f2] dark:bg-stone-950/50',
        inputWrap:      'bg-white border-t border-stone-100 dark:bg-stone-900 dark:border-white/10',
        inputField:     'bg-white border border-stone-200 text-[#1c1917] placeholder-stone-400 focus:border-amber-500 focus:ring-0 dark:bg-stone-800 dark:border-white/10 dark:text-stone-100 dark:placeholder-stone-500',
        sendBtn:        'bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed',
        userBubble:     'bg-amber-600 text-white',
        botBubble:      'bg-white border border-stone-100 text-[#1c1917] dark:bg-stone-800 dark:border-white/5 dark:text-stone-200',
        typingDot:      'bg-amber-500',
        chip:           'bg-white border border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50 dark:bg-stone-800 dark:border-white/10 dark:text-stone-300 dark:hover:border-amber-500/40 dark:hover:text-amber-400 dark:hover:bg-stone-800',
        conciergeBtn:   'bg-amber-600 text-white hover:bg-amber-700 border-transparent',
        fab:            'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-900/25',
        closeBtn:       'text-white/70 hover:text-white hover:bg-white/15',
        footer:         'text-stone-400 dark:text-stone-600',
        footerLink:     'text-amber-600 hover:text-amber-700 dark:text-amber-500/70 dark:hover:text-amber-400',
        time:           'text-stone-400 dark:text-stone-600',
        botLabel:       'text-amber-700/50 dark:text-amber-500/60',
        menuBtn:        'border-stone-200 text-stone-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-300 dark:border-white/10 dark:hover:text-amber-400 dark:hover:bg-stone-700/60 dark:hover:border-amber-500/40',
        menuBtnActive:  'border-amber-400 text-amber-600 bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:bg-stone-700/60',
        menuDrop:       'bg-white border border-stone-200 shadow-lg shadow-stone-900/8 dark:bg-stone-800 dark:border-white/10 dark:shadow-black/40',
        menuItem:       'text-stone-700 hover:bg-amber-50 hover:text-amber-700 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-amber-300',
        menuDivider:    'border-stone-100 dark:border-white/10',
        suggestionDrop: 'bg-white border border-stone-200 shadow-lg shadow-stone-900/8 dark:bg-stone-800 dark:border-white/10 dark:shadow-black/40',
        suggestionItem: 'text-stone-700 hover:bg-amber-50 hover:text-amber-700 border-b border-stone-100 last:border-0 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-amber-300 dark:border-white/5',
        suggestionHint: 'text-stone-400 dark:text-stone-500',
      }

  const canSend = input.trim().length > 0 && !typing && !stream

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${t.fab}`}
      >
        <div className={`transition-all duration-200 ${open ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </div>
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-white text-amber-700 border border-amber-200">
            {Math.min(messages.length - 1, 9)}
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] sm:w-[390px] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${t.widget} ${
          open ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-95 pointer-events-none translate-y-2'
        }`}
        style={{ height: '520px', maxHeight: 'calc(100vh - 128px)' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 flex-shrink-0 ${t.header}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20">
              <MessageCircle className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-semibold leading-tight ${t.headerTitle}`}>Arise Bhutan Assistant</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className={`text-[10px] ${t.headerSub}`}>Online — usually replies instantly</p>
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className={`p-1.5 rounded-lg transition-colors ${t.closeBtn}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 ${t.body}`}
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#a8a29e transparent' }}
        >
          {!chipsGone && messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {QUICK_CHIPS.map(chip => (
                <button key={chip} onClick={() => sendMessage(chip)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${t.chip}`}>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {messages.map(msg => (
            <MessageRow key={msg.id} msg={msg} t={t}
              onConcierge={() => window.open('https://wa.me/97577319405?text=Hello%2C%20I%20have%20an%20enquiry%20about%20a%20Bhutan%20tour.', '_blank')} />
          ))}

          {/* Typing dots */}
          {typing && !stream && (
            <div className="flex items-end gap-2">
              <BotAvatar />
              <div className={`rounded-2xl rounded-bl-none px-4 py-3 ${t.botBubble}`}>
                <div className="flex items-center gap-1.5 h-4">
                  {[0, 1, 2].map(i => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full animate-bounce ${t.typingDot}`}
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Streaming message */}
          {stream && (
            <MessageRow
              msg={{ ...stream, role: 'bot', isStreaming: true, created_at: new Date().toISOString() }}
              t={t}
              onConcierge={() => window.open('https://wa.me/97577319405?text=Hello%2C%20I%20have%20an%20enquiry%20about%20a%20Bhutan%20tour.', '_blank')} />
          )}
        </div>

        {/* Input area */}
        <div className={`flex-shrink-0 px-3 py-3 ${t.inputWrap} relative`} ref={menuRef}>

          {/* Autocomplete suggestions — shown above the input */}
          {suggestions.length > 0 && !menuOpen && (
            <div className={`absolute bottom-full left-3 right-3 mb-1.5 rounded-xl overflow-hidden z-20 ${t.suggestionDrop}`}>
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); sendMessage(s) }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center gap-2 ${t.suggestionItem}`}
                >
                  <span className={`text-[10px] font-medium shrink-0 ${t.suggestionHint}`}>Did you mean:</span>
                  <span className="font-medium truncate">{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick-action flyup menu — shown above the input */}
          {menuOpen && (
            <div className={`absolute bottom-full left-3 mb-1.5 rounded-xl overflow-hidden z-20 w-52 ${t.menuDrop}`}>
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors flex items-center gap-2.5 ${t.menuItem} ${
                    i < QUICK_ACTIONS.length - 1 ? `border-b ${t.menuDivider}` : ''
                  }`}
                >
                  <span className="text-sm leading-none">{action.emoji}</span>
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            {/* Hamburger quick-action toggle */}
            <button
              type="button"
              onClick={() => { setMenuOpen(v => !v); setSuggestions([]) }}
              aria-label="Quick actions"
              title="Quick actions"
              className={`w-9 h-[42px] rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors ${
                menuOpen ? t.menuBtnActive : t.menuBtn
              }`}
            >
              <Menu className="w-4 h-4" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => {
                const val = e.target.value
                setInput(val)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
                setSuggestions(getSuggestions(val))
                if (menuOpen) setMenuOpen(false)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (canSend) sendMessage(input) }
                if (e.key === 'Escape') { setSuggestions([]); setMenuOpen(false) }
              }}
              onFocus={() => {
                setMenuOpen(false)
                if (input.trim().length >= 2) setSuggestions(getSuggestions(input))
              }}
              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              placeholder="Ask about Bhutan..."
              className={`flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${t.inputField}`}
              style={{ minHeight: '42px', maxHeight: '96px' }}
            />

            <button type="submit" disabled={!canSend}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${t.sendBtn}`}>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className={`text-center text-[10px] mt-2 ${t.footer}`}>
            Powered by Arise Bhutan &middot;{' '}
            <a href="/contact" className={`transition-colors ${t.footerLink}`}>Contact us</a>
          </p>
        </div>
      </div>
    </>
  )
}
