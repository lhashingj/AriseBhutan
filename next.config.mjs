/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
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

export default nextConfig
