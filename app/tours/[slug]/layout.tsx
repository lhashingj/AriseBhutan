import type { Metadata } from 'next'
import { getTourBySlug } from '@/data/tours'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const tour = getTourBySlug(params.slug)
  if (!tour) return { title: 'Tour Not Found — Arise Bhutan' }

  const description = tour.overview.replace(/\n/g, ' ').slice(0, 155).trim() + '…'
  const url = `https://www.arisebhutan.com/tours/${tour.slug}`

  return {
    title: `${tour.title} — Bhutan ${tour.categoryLabel} | Arise Bhutan`,
    description,
    keywords: [
      tour.title,
      ...tour.locations.map((l) => `${l} Bhutan`),
      tour.categoryLabel,
      'Bhutan tour',
      'Bhutan travel',
      'DOT licensed tour operator',
      'Arise Bhutan',
    ].join(', '),
    openGraph: {
      title: `${tour.title} | Arise Bhutan Tours`,
      description,
      url,
      siteName: 'Arise Bhutan Tours & Travels',
      images: [{ url: `https://www.arisebhutan.com${tour.heroImage}`, width: 1200, height: 630, alt: tour.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tour.title} | Arise Bhutan`,
      description,
      images: [`https://www.arisebhutan.com${tour.heroImage}`],
    },
    alternates: { canonical: url },
  }
}

export default function TourDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
