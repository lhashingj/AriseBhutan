import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/client/', '/api/', '/auth/', '/adventure-builder/'],
    },
    sitemap: 'https://www.arisebhutan.com/sitemap.xml',
  }
}
