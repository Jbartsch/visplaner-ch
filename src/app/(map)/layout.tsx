import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../globals.css'
import { PetripassAnalytics } from '@/components/Analytics'
import { SITE } from '@/lib/water'

const plex = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Petripass – Find your water. Understand the rules. Get the right permit.',
  description:
    'Petripass: Finde dein Gewässer, verstehe die Regeln, hol dir das richtige Patent. Karte aller 26 Kantone – Patent, Pacht oder Freiangel, Kaufweg (eFJ, App, Pächter) und Datenqualität pro Gewässer. Unabhängig, nur Information.',
  openGraph: { title: 'Petripass – Find your water. Understand the rules. Get the right permit.', siteName: 'Petripass', type: 'website' },
  alternates: { canonical: '/', languages: { de: '/de', fr: '/fr', it: '/it', en: '/en', 'x-default': '/' } },
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f172a' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={plex.className}>
      <body>
        {children}
        <PetripassAnalytics />
      </body>
    </html>
  )
}
