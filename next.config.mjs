import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    // Supabase Storage — user-uploaded avatars (see app/*/profile pages)
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      // Travel-document uploads (flight tickets / visa PDFs) exceed
      // the 1 MB default; keep in sync with the storage bucket limit.
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      // Redirect bare domain to www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'arisebhutan.com' }],
        destination: 'https://www.arisebhutan.com/:path*',
        permanent: true,
      },
    ]
  },
}

// Sentry error monitoring — safe no-op until SENTRY_DSN /
// NEXT_PUBLIC_SENTRY_DSN are set (see instrumentation.ts,
// instrumentation-client.ts, sentry.server.config.js and
// sentry.edge.config.js). Source-map upload additionally needs
// SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT; it's skipped silently
// when those are absent, so this never breaks local or CI builds
// before Sentry is configured.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  webpack: { treeshake: { removeDebugLogging: true } },
})
