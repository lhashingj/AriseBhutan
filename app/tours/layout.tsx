import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bhutan Tours & Travel Packages 2026 — Arise Bhutan',
  description: 'Explore Bhutan with a licensed DOT tour operator. Cultural tours, Tiger\'s Nest trekking, Tshechu festival packages, luxury wellness retreats in Paro, Thimphu & Punakha. Fully private, all-inclusive.',
  keywords: 'Bhutan tours, Bhutan travel packages, tour operator Bhutan, Bhutan trekking, Paro tour, Thimphu tour, Punakha Dzong, Tiger\'s Nest hike, Bhutan festival tour, Tshechu festival',
  openGraph: {
    title: 'Bhutan Tours & Travel Packages — Arise Bhutan',
    description: 'Fully private Bhutan tours from a licensed DOT operator. Cultural tours, trekking, festival packages & luxury retreats. Paro · Thimphu · Punakha.',
    url: 'https://www.arisebhutan.com/tours',
    siteName: 'Arise Bhutan Tours & Travels',
    type: 'website',
  },
}

export default function ToursLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
