import type { Metadata } from 'next'
import FreeQuoteLanding from '@/components/FreeQuoteLanding'
import AdPixels from '@/components/AdPixels'

export const metadata: Metadata = {
  title: 'Free Bhutan Tour Quote — All-Inclusive From $200/Day (SDF Included) | Arise Bhutan',
  description:
    'Get a free personalised Bhutan tour quote within 24 hours. Transparent all-inclusive pricing from $200–$250/day — hotels, meals, private guide, permits and the $100 SDF included. No hidden fees.',
  alternates: { canonical: 'https://www.arisebhutan.com/free-quote' },
  openGraph: {
    title: 'Bhutan From $200/Day — Even the $100 SDF Is Included',
    description:
      'Fully private, all-inclusive Bhutan tours with radically transparent pricing. Free personalised quote in 24 hours from a DOT-licensed Bhutanese operator.',
    images: ['/images/prayer-flags-mountains.jpg'],
  },
}

export default function FreeQuotePage() {
  return (
    <>
      <AdPixels />
      <FreeQuoteLanding />
    </>
  )
}
