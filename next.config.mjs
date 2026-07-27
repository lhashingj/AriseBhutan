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
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "arise-bhutan-tours-travels",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
