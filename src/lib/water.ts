import type { BorderInfo, CantonInfo, CantonLink, Lang, Localized, Rule, Water } from '@/types/water'
import { loc } from '@/types/water'

export const SITE = 'https://visplaner-ch.vercel.app'

export function waterName(w: Water, lang: Lang): string {
  return loc(w.n, lang)
}

export function waterRule(w: Water, c: CantonInfo): Rule {
  return c.rules[w.r] ?? c.rules[w.p] ?? c.rules.unknown
}

/** Summary for a water: rule text of its canton; if the per-water permit type deviates from the rule, use the generic text for that type. */
export function waterSummary(w: Water, c: CantonInfo): Localized {
  const r = waterRule(w, c)
  if (r.permitType === w.p) return r.summary
  return (c.rules[w.p] ?? c.rules.unknown).summary
}

/** Links relevant for the water's permit type (canton links filtered by `applies`) plus water-specific links. */
export function waterLinks(w: Water, c: CantonInfo): { primary: CantonLink[]; secondary: CantonLink[] } {
  const own = (w.x?.links ?? []).map((l) => ({ ...l, verified: true }) as CantonLink)
  const rel = c.links.filter((l) => !l.applies?.length || l.applies.includes(w.p))
  let primary: CantonLink[]
  if (w.p === 'closed') primary = []
  else if (w.p === 'pacht' || w.p === 'private' || w.p === 'unknown') {
    // A water-specific lessee sheet (e.g. BE "Pachtblatt mit Pächter") beats the canton-wide directory.
    const sheet = w.p === 'pacht' || w.p === 'private' ? own.filter((l) => /Pächter|Pachtblatt|Pachtvereinigung/i.test(l.label.de ?? '')).map((l) => ({ ...l, kind: 'pacht' as const })) : []
    primary = [...sheet, ...rel.filter((l) => l.kind === 'pacht' || l.kind === 'enquire')]
    if (!primary.length) primary = rel.filter((l) => l.kind === 'info').slice(0, 1)
  } else primary = rel.filter((l) => l.kind === 'buy' || l.kind === 'app')
  const secondary = [...own.filter((l) => !primary.some((p) => p.url === l.url)), ...rel.filter((l) => !primary.includes(l))]
  if (!primary.length && !secondary.length) secondary.push(...c.links.filter((l) => l.kind === 'info'))
  return { primary, secondary }
}

export function borderOf(w: Water, border: Record<string, BorderInfo>): BorderInfo | null {
  const k = w.x?.border ?? w.bd
  if (!k || k === 'multi') return null
  return border[k] ?? null
}

export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function searchText(w: Water, c: CantonInfo): string {
  return normalize([w.n.de, w.n.fr, w.n.it, w.n.en, c.code, c.name.de, c.name.fr, c.name.it, c.name.en].filter(Boolean).join(' '))
}

/** Analytics target bucket for an outbound buy/enquire link. */
export function linkTarget(a: { kind: string; url: string }): string {
  const u = a.url.toLowerCase()
  if (u.includes('hejfish')) return 'hejfish'
  if (a.kind === 'pacht' || a.kind === 'enquire' || u.startsWith('mailto:')) return 'paechter'
  if (u.includes('efj') || u.includes('jagdfischerei') || u.includes('fischerapp')) return 'efj'
  if (a.kind === 'app') return 'app'
  if (a.kind === 'buy') return 'shop'
  return a.kind || 'info'
}

/** Feedback address: NEXT_PUBLIC_FEEDBACK_EMAIL (set in Vercel) or the project owner's fallback, so the link never dead-ends. */
export const FEEDBACK_EMAIL = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL || 'jonas@innoveto.ch'

/** "Report an error" mailto link. */
export function reportUrl(subject: string, body: string): string {
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
