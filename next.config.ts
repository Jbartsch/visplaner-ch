import type { NextConfig } from 'next'

const CANTONS = ['zh', 'be', 'lu', 'ur', 'sz', 'ow', 'nw', 'gl', 'zg', 'fr', 'so', 'bs', 'bl', 'sh', 'ar', 'ai', 'sg', 'gr', 'ag', 'tg', 'ti', 'vd', 'vs', 'ne', 'ge', 'ju']
// /fr is the French locale, so canton Fribourg gets only /karte/fr; every other canton also gets a short /<code> link.
const SHORT = CANTONS.filter((c) => c !== 'fr')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  async redirects() {
    return [
      ...SHORT.map((c) => ({ source: `/${c}`, destination: `/?canton=${c.toUpperCase()}`, permanent: false })),
      { source: '/karte/:c(zh|be|lu|ur|sz|ow|nw|gl|zg|fr|so|bs|bl|sh|ar|ai|sg|gr|ag|tg|ti|vd|vs|ne|ge|ju)', destination: '/?canton=:c', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },
}

export default nextConfig
