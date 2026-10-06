import type { Lang, Localized, Water } from '@/types/water'
import { loc } from '@/types/water'

/** Sourced prices + rules (scripts/lib/rules_cfg.py → public/data/rules.json). Missing = not in our data. */
export type Val = number | string | Localized
export type PriceSide = Partial<Record<'day' | 'd2' | 'week' | 'd15' | 'month' | 'year', number | Localized>>
export type PriceRow = { label: Localized; res: PriceSide; non?: PriceSide | null; note?: Localized }
export type Src = { label: string; url: string }
export type Profile = {
  label?: Localized
  prices?: { rows: PriceRow[]; note?: Localized; src: Src; asOf?: string }
  catch?: { sp: string; day?: Val; year?: Val; note?: Localized }[]
  sizes?: { sp: string; cm: Val; where?: Localized }[]
  closed?: { sp: string; period: Val; where?: Localized }[]
  methods?: Localized[]
  night?: Localized
  zones?: Localized
  guest?: Localized
  src?: Src[]
}
export type Match = { ids?: string[]; re?: string; p?: string[]; k?: string[] }
export type CantonRules = { checked: string; rulesUrl?: string; base: Profile; profiles: (Profile & { match: Match })[] }
export type RulesFile = { checked: string; federal: { items: Localized[]; src: Src[] }; cantons: Record<string, CantonRules> }

export type Parking = { lon: number; lat: number; m: number; id: string; loc?: string; name?: string; fee?: string; cap?: string; kind?: string }
export type Zone = { k: 'fish' | 'wzvv'; n: string; nf?: string; u?: string; s: string; d?: string; df?: string }
export type WaterGeoExtra = { pk?: Parking[]; z?: Zone[] }

export const OSM_AS_OF = '2026-10-04'

const hit = (m: Match, w: Water) =>
  (!m.ids || m.ids.includes(w.id)) && (!m.re || new RegExp(m.re).test(w.id)) && (!m.p || m.p.includes(w.p)) && (!m.k || m.k.includes(w.k))

/** Canton base merged with the first matching water profile; null when the canton has no curated rules. */
export function rulesFor(w: Water, file: RulesFile | null | undefined): (Profile & { checked: string; rulesUrl?: string; scoped: boolean }) | null {
  const c = file?.cantons[w.c]
  if (!c) return null
  const pr = c.profiles.find((x) => hit(x.match, w))
  const { match: _m, ...rest } = pr ?? { match: {} }
  void _m
  return { ...c.base, ...rest, checked: c.checked, rulesUrl: c.rulesUrl, scoped: !!pr }
}

export const SPECIES: Record<string, Localized> = {
  trout: { de: 'Forelle', en: 'Trout', fr: 'Truite', it: 'Trota' },
  whitefish: { de: 'Felchen', en: 'Whitefish', fr: 'Corégone', it: 'Coregone' },
  char: { de: 'Saibling', en: 'Char', fr: 'Omble', it: 'Salmerino' },
  trout_char: { de: 'Forelle/Saibling', en: 'Trout/char', fr: 'Truite/omble', it: 'Trota/salmerino' },
  pike: { de: 'Hecht', en: 'Pike', fr: 'Brochet', it: 'Luccio' },
  perch: { de: 'Egli', en: 'Perch', fr: 'Perche', it: 'Pesce persico' },
  zander: { de: 'Zander', en: 'Zander', fr: 'Sandre', it: 'Lucioperca' },
  grayling: { de: 'Äsche', en: 'Grayling', fr: 'Ombre', it: 'Temolo' },
  crayfish: { de: 'Krebse', en: 'Crayfish', fr: 'Écrevisses', it: 'Gamberi' },
  barbel: { de: 'Barbe', en: 'Barbel', fr: 'Barbeau', it: 'Barbo' },
  all: { de: 'Alle Arten', en: 'All species', fr: 'Toutes espèces', it: 'Tutte le specie' },
}
export const PERIODS: Record<keyof PriceSide, Localized> = {
  day: { de: 'Tag', en: 'Day', fr: 'Jour', it: 'Giorno' },
  d2: { de: '2 Tage', en: '2 days', fr: '2 jours', it: '2 giorni' },
  week: { de: 'Woche', en: 'Week', fr: 'Semaine', it: 'Settimana' },
  d15: { de: '15 Tage', en: '15 days', fr: '15 jours', it: '15 giorni' },
  month: { de: 'Monat', en: 'Month', fr: 'Mois', it: 'Mese' },
  year: { de: 'Jahr', en: 'Year', fr: 'Année', it: 'Anno' },
}
export const PERIOD_ORDER: (keyof PriceSide)[] = ['day', 'd2', 'week', 'd15', 'month', 'year']

export const sp = (k: string, lang: Lang) => loc(SPECIES[k] ?? { de: k }, lang)
export const val = (v: Val | undefined, lang: Lang) => (v === undefined || v === null ? '' : typeof v === 'object' ? loc(v, lang) : String(v))
export const chf = (n: number | Localized, lang: Lang = 'de') => (typeof n === 'number' ? `CHF ${Number.isInteger(n) ? n : n.toFixed(2)}` : `CHF ${loc(n, lang)}`)
export const sideText = (s: PriceSide | null | undefined, lang: Lang) => {
  if (!s) return ''
  const ks = PERIOD_ORDER.filter((k) => s[k] !== undefined)
  return ks.length === 1 ? chf(s[ks[0]]!, lang) : ks.map((k) => `${loc(PERIODS[k], lang)} ${chf(s[k]!, lang)}`).join(' · ')
}

/** Short price line: cheapest day-ish and year price for residents, e.g. "Tag ab CHF 30 · Jahr ab CHF 100". */
export function priceShort(pr: Profile['prices'], lang: Lang): string {
  if (!pr?.rows.length) return ''
  const min = (k: keyof PriceSide) => {
    const v = pr.rows.filter((r) => !/^(Zusatz|Gastpatent)|nur mit|\(Zone/i.test(r.label.de)).map((r) => r.res[k]).filter((x): x is number => typeof x === 'number')
    return v.length ? Math.min(...v) : undefined
  }
  const from = { de: 'ab', en: 'from', fr: 'dès', it: 'da' }[lang]
  const parts: string[] = []
  const short = (['day', 'd2', 'week'] as const).find((k) => min(k) !== undefined)
  if (short) parts.push(`${loc(PERIODS[short], lang)} ${from} ${chf(min(short)!)}`)
  const long = (['year', 'month', 'd15'] as const).find((k) => min(k) !== undefined)
  if (long) parts.push(`${loc(PERIODS[long], lang)} ${from} ${chf(min(long)!)}`)
  return parts.join(' · ')
}

export const zoneName = (z: Zone, lang: Lang) => (lang === 'fr' || lang === 'it' ? z.nf ?? z.n : z.n)
export const zoneDesc = (z: Zone, lang: Lang) => (lang === 'fr' || lang === 'it' ? z.df ?? z.d : z.d)
export const osmUrl = (p: Parking) => `https://www.openstreetmap.org/${p.id[0] === 'n' ? 'node' : 'way'}/${p.id.slice(1)}`
export const navUrl = (p: Parking) => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`

export const ZONE_SRC: Record<string, Src> = {
  be: { label: 'Kanton Bern · ANGFISCH Schongebiete (OGD)', url: 'https://www.geo.apps.be.ch/de/geodaten/suche-nach-geodaten.html?view=sheet&preview=search_list&geoproduct=ANGFISCH' },
  tg: { label: 'Kanton Thurgau · Fischereiverbote (WFS)', url: 'https://ows.geo.tg.ch/geofy_access_proxy/fischereiverbote' },
  wzvv: { label: 'BAFU · Wasser- und Zugvogelreservate (WZVV)', url: 'https://map.geo.admin.ch/?layers=ch.bafu.bundesinventare-vogelreservate' },
}
