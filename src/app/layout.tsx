import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import 'maplibre-gl/dist/maplibre-gl.css'
import './globals.css'

const plex = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Visplaner CH — Welches Fischereipatent brauche ich? (ZH + BE)',
  description:
    'Visplaner CH: Which Swiss fishing permit do you need for this water — and where do you buy it? Zurich + Bern prototype. Informational only.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f172a' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={plex.className}>
      <body>{children}</body>
    </html>
  )
}
