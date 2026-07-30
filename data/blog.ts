export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  publishedDate: string; // YYYY-MM-DD
  readingTime: string;
  sections: BlogSection[];
  relatedLinks?: { label: string; href: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'bhutan-visa-sdf-guide',
    title: 'Bhutan Visa & SDF Guide: What You\'ll Actually Pay in 2026',
    excerpt: 'A plain-English breakdown of Bhutan\'s Sustainable Development Fee and visa process — current rates, who\'s exempt, and how the paperwork actually works.',
    coverImage: '/images/monastery-architecture.jpg',
    category: 'Planning',
    publishedDate: '2026-07-30',
    readingTime: '7 min read',
    sections: [
      {
        paragraphs: [
          'If you\'ve started researching a Bhutan trip, you\'ve almost certainly run into two unfamiliar terms: the Sustainable Development Fee (SDF) and the Bhutan tourist visa. Unlike most destinations, Bhutan doesn\'t let you book flights and hotels independently — every foreign visitor\'s trip is arranged through a licensed local tour operator, and that operator handles your SDF and visa on your behalf. Here\'s exactly what that costs and how it works.',
        ],
      },
      {
        heading: 'What Is the Sustainable Development Fee?',
        paragraphs: [
          'The SDF is a nightly levy every visitor pays for each night they spend in Bhutan. It isn\'t a hotel tax or a hidden markup — it goes directly to the Royal Government of Bhutan and funds the country\'s free healthcare and education systems, along with conservation programmes that keep Bhutan the world\'s only carbon-negative country.',
          'The rate was reduced from $200 to $100 per person per night in 2023, and the Bhutanese government reconfirmed in January 2026 that this discounted $100/night rate holds through August 31, 2027. After that, it\'s scheduled to revert upward unless extended again — so travel booked before the change locks in today\'s lower rate.',
        ],
      },
      {
        heading: 'Current SDF & Visa Rates',
        paragraphs: [
          'Rates differ depending on your nationality:',
        ],
        list: [
          'International visitors (age 13+): $100 per person, per night',
          'International visitors (age 6–12): $50 per person, per night — a 50% discount',
          'International visitors (under 6): free',
          'India: ₹1,200 per person, per night (roughly $15), with a matching 50% child discount',
          'Bangladesh & Maldives: ₹1,200 per person, per night',
          'Visa fee (international visitors only): $40, one-time — India, Bangladesh, and Maldives citizens need only an Entry Permit, with no separate visa fee',
        ],
      },
      {
        heading: 'How the Visa Process Actually Works',
        paragraphs: [
          'You cannot apply for a Bhutan tourist visa yourself, and there is no visa-on-arrival or embassy application for most nationalities. The process runs entirely through your licensed operator:',
        ],
        list: [
          'Book your tour and send your passport details to your operator',
          'Your operator submits a visa clearance application to the Tourism Council of Bhutan (TCB)',
          'TCB typically approves clearance within 3–7 working days',
          'Your clearance letter is emailed to you — bring it to Paro Airport, where the physical visa stamp is placed in your passport on arrival',
        ],
      },
      {
        paragraphs: [
          'We recommend finalizing your booking at least 3 weeks before travel, and earlier if you\'re visiting during peak season (March–May or September–November) when processing queues run longer. At Arise Bhutan, both the SDF and visa clearance are handled as a standard part of every booking — you\'ll see the exact SDF total itemized in your quote, with nothing added later.',
        ],
      },
      {
        heading: 'A Quick Example',
        paragraphs: [
          'Two adults traveling internationally for 5 nights would pay $100 × 2 × 5 = $1,000 in SDF, plus $40 × 2 = $80 in visa fees — $1,080 total, already built into your package price rather than collected separately on arrival.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'See full SDF & Visa fee table', href: '/faq' },
      { label: 'Browse Bhutan tour packages', href: '/tours' },
    ],
  },

  {
    slug: 'best-time-to-visit-bhutan',
    title: 'Best Time to Visit Bhutan: A Season-by-Season Guide',
    excerpt: 'Spring festivals, crystal-clear autumn skies, quiet monsoon valleys, or crisp winter light — here\'s how to pick the right season for your Bhutan trip.',
    coverImage: '/images/tigers-nest-rhododendron.jpg',
    category: 'Planning',
    publishedDate: '2026-07-30',
    readingTime: '6 min read',
    sections: [
      {
        paragraphs: [
          'Bhutan is a year-round destination, but which season suits you best depends on what you want out of the trip — festivals and clear mountain views, budget-friendly quiet valleys, or something in between. Here\'s how the four seasons actually compare.',
        ],
      },
      {
        heading: 'Spring (March–May) — Festivals & Blooming Valleys',
        paragraphs: [
          'Spring is Bhutan\'s most popular season, and for good reason. Rhododendron forests bloom across the hillsides, temperatures are mild (10–20°C in the valleys), and the country\'s biggest festival — Paro Tshechu — falls in late March or April, drawing crowds for its dramatic mask dances and the pre-dawn unfurling of a giant Guru Thongdrel.',
          'Expect higher hotel rates and busier trails at popular sites like Tiger\'s Nest during this window. Book 3–6 months ahead if a specific festival is on your list.',
        ],
      },
      {
        heading: 'Autumn (September–November) — The Clearest Skies',
        paragraphs: [
          'Autumn is spring\'s rival for the top spot, and arguably wins on visibility — post-monsoon skies are at their clearest, giving the best odds of unobstructed Himalayan views from passes like Dochu La and Chele La. This is also when Thimphu Tshechu, Bhutan\'s largest festival, takes place, along with the Black-Necked Crane Festival in the Phobjikha valley in November.',
          'Like spring, this is peak season — book early for festival dates and popular hotels.',
        ],
      },
      {
        heading: 'Summer / Monsoon (June–August) — Green, Quiet, and Budget-Friendly',
        paragraphs: [
          'Bhutan\'s monsoon brings afternoon showers rather than all-day rain, and the valleys turn a lush, deep green that photographs beautifully between showers. This is the quietest tourist season, which means thinner crowds at major sites and more room to negotiate on accommodation. It\'s also a good window for waterfall-heavy treks and visiting Bumthang\'s ancient temples, which sit in a drier microclimate than the western valleys.',
          'Pack a light rain shell and expect some road delays in remote districts after heavy rain.',
        ],
      },
      {
        heading: 'Winter (December–February) — Cold, Clear, and Uncrowded',
        paragraphs: [
          'Winter is Bhutan\'s coldest season (expect near-freezing nights in Paro and Thimphu, colder at altitude), but days are often bright and dry, with excellent mountain visibility. Losar, the Bhutanese New Year, usually falls in this window, along with the Punakha Tshechu and Punakha Drubchen in Punakha\'s milder subtropical valley — a good winter alternative if you want a festival without western-valley cold.',
          'Winter is also the best time to spot the endangered black-necked cranes that winter in Phobjikha valley through this season and into November.',
        ],
      },
      {
        heading: 'Our Take',
        paragraphs: [
          'If a specific festival matters to you, check our Festival Calendar and build your dates around it — festival dates shift each year on the Bhutanese lunar calendar. If you\'d rather avoid crowds and don\'t mind an umbrella, June–August is an underrated window. For first-time visitors chasing the classic postcard views, spring and autumn remain the safest bet.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'View the full Festival Calendar', href: '/festival-calendar' },
      { label: 'Browse Bhutan tour packages', href: '/tours' },
    ],
  },

  {
    slug: 'bhutan-festival-calendar-guide',
    title: 'A First-Timer\'s Guide to Bhutan\'s Tshechu Festivals',
    excerpt: 'What a Tshechu actually is, which ones are worth building a trip around, and how to plan around dates that shift every year.',
    coverImage: '/images/festival-scene.jpg',
    category: 'Culture',
    publishedDate: '2026-07-30',
    readingTime: '6 min read',
    sections: [
      {
        paragraphs: [
          'If you\'ve seen photos of Bhutan with dancers in elaborate silk costumes and painted wooden masks, you\'ve seen a Tshechu. These aren\'t staged tourist shows — they\'re genuine religious festivals held at dzongs (fortress-monasteries) across the country, and timing a trip around one is one of the best ways to experience Bhutanese culture up close.',
        ],
      },
      {
        heading: 'What Is a Tshechu?',
        paragraphs: [
          '"Tshechu" means "tenth day" in Dzongkha, referring to the 10th day of a month in the Bhutanese lunar calendar — traditionally associated with Guru Rinpoche, who introduced Buddhism to Bhutan in the 8th century. At a Tshechu, monks and lay dancers perform Cham — sacred masked dances retelling stories of good triumphing over evil — accompanied by traditional music, while locals gather in their finest kira and gho to watch, pray, and socialize.',
          'Because festival dates follow the Bhutanese lunar calendar rather than the Gregorian calendar, the same festival falls on a different Western date each year — which is exactly why we built a two-year Festival Calendar showing both.',
        ],
      },
      {
        heading: 'The Festivals Worth Planning a Trip Around',
        paragraphs: [],
        list: [
          'Paro Tshechu — Bhutan\'s most famous festival, held over five days at Rinpung Dzong. The final morning brings the pre-dawn unfurling of a giant Thongdrel (appliquéd religious scroll) said to cleanse the sins of anyone who sees it.',
          'Thimphu Tshechu — the country\'s largest and most attended Tshechu, held in the capital\'s Tashichho Dzong since 1670, drawing thousands of spectators over three days.',
          'Punakha Drubchen & Tshechu — a dramatic re-enactment of a 17th-century battle against Tibetan invaders, followed by a Tshechu in the mild winter climate of Punakha valley — a good alternative if you\'re visiting in the colder months.',
          'Jambay Lhakhang Drup — centred on one of Bhutan\'s oldest temples in Bumthang, famous for its midnight fire ritual and the Tercham "naked dance," believed to bless women seeking children.',
          'Black-Necked Crane Festival — smaller and more recent, held in the Phobjikha valley in November to celebrate the endangered cranes that winter there, with dances performed by local schoolchildren.',
        ],
      },
      {
        heading: 'Planning Tips',
        paragraphs: [
          'Festival-season hotels in Paro and Thimphu fill up 3–6 months ahead, especially around Paro and Thimphu Tshechu — book early. Dress modestly if you\'re attending (covered shoulders and knees), arrive early for a good vantage point, and ask your guide before photographing monks up close. Most Tshechus are free and open to visitors, though some smaller village festivals are more intimate and appreciate a lower-key presence.',
          'If your travel dates are flexible, check our Festival Calendar for exact 2026 and 2027 dates before locking in flights — we can build an itinerary around almost any festival on the list.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'View the full Festival Calendar', href: '/festival-calendar' },
      { label: 'See our Festival Tour packages', href: '/tours?cat=festival' },
    ],
  },
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
