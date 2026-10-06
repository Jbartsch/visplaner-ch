import type { Viewport } from 'next'
import { notFound } from 'next/navigation'
import { IBM_Plex_Sans } from 'next/font/google'
import '../globals.css'
import { LANGS, type Lang } from '@/types/water'

const plex = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' })

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f172a' }

export function generateStaticParams() {
  return LANGS.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!(LANGS as string[]).includes(locale)) notFound()
  return (
    <html lang={locale as Lang} className={plex.className}>
      <body>{children}</body>
    </html>
  )
}
