import type { Metadata } from 'next'
import type { Lang } from '@/types/water'
import { LANGS } from '@/types/water'
import { SITE } from './water'

const OG_LOCALE: Record<Lang, string> = { de: 'de_CH', fr: 'fr_CH', it: 'it_CH', en: 'en' }

export function pageMeta(lang: Lang, path: string, title: string, description: string): Metadata {
  const languages: Record<string, string> = Object.fromEntries(LANGS.map((l) => [l, `/${l}${path}`]))
  languages['x-default'] = `/de${path}`
  return {
    metadataBase: new URL(SITE),
    title,
    description: description.length > 160 ? description.slice(0, 157).replace(/\s+\S*$/, '') + '…' : description,
    alternates: { canonical: `/${lang}${path}`, languages },
    openGraph: { title, description, url: `${SITE}/${lang}${path}`, siteName: 'Petripass', locale: OG_LOCALE[lang], type: 'website' },
    robots: { index: true, follow: true },
    icons: { icon: '/favicon.svg' },
  }
}

export function isLang(l: string): l is Lang {
  return (LANGS as string[]).includes(l)
}

export function crumbs(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE}${it.url}` })),
  }
}

export function faqLd(qa: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
}
