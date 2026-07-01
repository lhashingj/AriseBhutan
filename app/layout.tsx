import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import ConditionalShell from '@/components/ConditionalShell'
import ChatWidget from '@/components/ChatWidget'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.arisebhutan.com'),
  title: {
    default: 'Arise Bhutan Tours & Travels — Tour Agency in Bhutan',
    template: '%s | Arise Bhutan Tours & Travels',
  },
  description: 'Licensed Bhutan tour operator based in Paro. Fully private cultural tours, Tiger\'s Nest hike, trekking, Tshechu festival packages & luxury wellness retreats. DOT Lic. No. 50001567.',
  keywords: [
    'tour agency in Bhutan',
    'tour operator Bhutan',
    'Bhutan tours',
    'Bhutan travel packages',
    'Bhutan trekking',
    "Tiger's Nest hike",
    'Paro Tshechu festival',
    'Thimphu Tshechu',
    'Punakha Dzong tour',
    'Bhutan cultural tour',
    'Bhutan luxury tour',
    'Bhutan festival tour',
    'DOT licensed Bhutan operator',
    'Arise Bhutan',
    'Kingdom of Happiness tour',
    'Bhutan visa assistance',
  ],
  authors: [{ name: 'Arise Bhutan Tours & Travels' }],
  creator: 'Arise Bhutan Tours & Travels',
  publisher: 'Arise Bhutan Tours & Travels',
  alternates: { canonical: 'https://www.arisebhutan.com' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.arisebhutan.com',
    siteName: 'Arise Bhutan Tours & Travels',
    title: 'Arise Bhutan Tours & Travels — Tour Agency in Bhutan',
    description: 'Licensed Bhutan tour operator in Paro. Cultural tours, trekking, Tshechu festivals & luxury retreats. Fully private. DOT Licensed.',
    images: [
      {
        url: '/images/tigers-nest-2.jpg',
        width: 1200,
        height: 630,
        alt: "Tiger's Nest Monastery — Arise Bhutan Tours",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arise Bhutan Tours & Travels',
    description: 'Licensed tour agency in Bhutan. Cultural tours, trekking, festivals & luxury retreats in the Kingdom of Happiness.',
    images: ['/images/tigers-nest-2.jpg'],
  },
  icons: {
    icon: '/images/logo.jpeg',
    apple: '/images/logo.jpeg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TravelAgency',
      '@id': 'https://www.arisebhutan.com/#organization',
      name: 'Arise Bhutan Tours & Travels',
      url: 'https://www.arisebhutan.com',
      logo: 'https://www.arisebhutan.com/images/logo.jpeg',
      description: 'Licensed Bhutan tour operator based in Paro, Bhutan. Specialising in fully private cultural tours, trekking, festival experiences, and luxury wellness retreats.',
      email: 'arisebhutan@gmail.com',
      telephone: '+97577319405',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nyamaizampa',
        addressLocality: 'Paro',
        postalCode: '12001',
        addressCountry: 'BT',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 27.4211577,
        longitude: 89.4225462,
      },
      areaServed: {
        '@type': 'Country',
        name: 'Bhutan',
      },
      priceRange: '$$$',
      openingHours: 'Mo-Su 08:00-18:00',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.arisebhutan.com/#website',
      url: 'https://www.arisebhutan.com',
      name: 'Arise Bhutan Tours & Travels',
      publisher: { '@id': 'https://www.arisebhutan.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.arisebhutan.com/tours?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-stone-800">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ConditionalShell>{children}</ConditionalShell>
        <ChatWidget />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
