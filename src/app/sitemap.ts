import type { MetadataRoute } from 'next'
import { CF, WATERS } from '@/data/server'
import { LANGS } from '@/types/water'
import { SITE } from '@/lib/water'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = CF.meta.generated
  const alt = (path: string) => ({ languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE}/${l}${path}`])) })
  const entry = (path: string, priority: number) => LANGS.map((l) => ({ url: `${SITE}/${l}${path}`, lastModified, priority, alternates: alt(path) }))
  return [
    { url: `${SITE}/`, lastModified, priority: 1 },
    ...entry('', 0.9),
    ...Object.values(CF.cantons).flatMap((c) => entry(`/kanton/${c.slug}`, 0.8)),
    ...WATERS.flatMap((w) => entry(`/gewaesser/${w.slug}`, w.k === 'lake' ? 0.6 : 0.4)),
  ]
}
