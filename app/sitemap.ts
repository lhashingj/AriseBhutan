import { MetadataRoute } from 'next'
import { tours } from '@/data/tours'

const BASE = 'https://www.arisebhutan.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                              priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${BASE}/tours`,                   priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${BASE}/about`,                   priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/contact`,                 priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/faq`,                     priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/gallery`,                 priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/festival-calendar`,       priority: 0.7, changeFrequency: 'yearly'  },
  ]

  const tourPages: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${BASE}/tours/${tour.slug}`,
    priority: 0.9,
    changeFrequency: 'monthly',
  }))

  return [...staticPages, ...tourPages]
}
