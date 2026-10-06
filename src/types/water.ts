export type Lang = 'de' | 'en' | 'fr' | 'it'
export const LANGS: Lang[] = ['de', 'fr', 'it', 'en']

export const CANTON_CODES = [
  'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL',
  'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU',
] as const
export type Canton = (typeof CANTON_CODES)[number]

export type WaterKind = 'lake' | 'river' | 'pond' | 'reach' | 'canal'
export type PermitType = 'patent' | 'pacht' | 'freiangel' | 'mixed' | 'private' | 'closed' | 'unknown'
/** official = regime from official cantonal geodata · derived = cantonal rule applied to geometry · stub = regime not determined */
export type Quality = 'official' | 'derived' | 'stub'

export type Localized = { de: string; en?: string; fr?: string; it?: string }

export type LinkKind = 'buy' | 'app' | 'prices' | 'pacht' | 'info' | 'enquire' | 'map'
export type CantonLink = { kind: LinkKind; label: Localized; url: string; verified?: boolean; applies?: PermitType[] }
export type Rule = { permitType: PermitType; summary: Localized; priceHint?: Localized }

export type CantonInfo = {
  code: Canton
  slug: string
  name: Localized
  lang: 'de' | 'fr' | 'it'
  system: Localized
  links: CantonLink[]
  rules: Record<string, Rule>
  notes: Localized | null
  overlay: 'be' | 'ag' | null
  sources: { label: string; url: string; kind: string; official: boolean }[]
  quality: Quality
  count: number
  byQuality: Partial<Record<Quality, number>>
  byPermit: Partial<Record<PermitType, number>>
  bbox: Bbox
  geomBytes: number
  coverage: { geometry: string; rules: string; buy: string }
}

export type BorderInfo = {
  key: string
  name: Localized
  cantons: Canton[]
  countries: string[]
  authority: Localized
  hint: Localized
}

export type WaterExtra = {
  border?: string
  revier?: string
  dayTicket?: 'yes' | 'no'
  conditions?: Localized
  notes?: Localized
  links?: { kind: LinkKind; label: Localized; url: string }[]
}

/** Compact water entry (public/data/waters-index.json, src/data/generated/waters.json) */
export type Water = {
  id: string
  slug: string
  n: Localized
  c: Canton
  k: WaterKind
  p: PermitType
  q: Quality
  r: string
  s: string
  b: Bbox
  x?: WaterExtra
}

export type CantonsFile = {
  meta: { generated: string; sources: Record<string, { label: string; url: string }> }
  order: Canton[]
  cantons: Record<Canton, CantonInfo>
}

export type Bbox = [number, number, number, number]

export const PERMIT_ORDER: PermitType[] = ['patent', 'pacht', 'freiangel', 'mixed', 'private', 'closed', 'unknown']

export const PERMIT_COLORS: Record<PermitType, string> = {
  patent: '#2563eb',
  pacht: '#d97706',
  freiangel: '#0d9488',
  mixed: '#7c3aed',
  private: '#be185d',
  closed: '#dc2626',
  unknown: '#6b7280',
}

export const PERMIT_LABELS: Record<PermitType, Localized> = {
  patent: { de: 'Kantonspatent', en: 'Cantonal permit', fr: 'Permis cantonal', it: 'Patente cantonale' },
  pacht: { de: 'Pachtgewässer', en: 'Leased water (Pacht)', fr: 'Eaux affermées', it: 'Acque affittate' },
  freiangel: { de: 'Freiangel', en: 'Free angling', fr: 'Pêche libre', it: 'Pesca libera' },
  mixed: { de: 'Gemischt / je nach Abschnitt', en: 'Mixed / depends on section', fr: 'Mixte / selon le secteur', it: 'Misto / secondo il tratto' },
  private: { de: 'Privates Fischereirecht', en: 'Private fishing right', fr: 'Droit de pêche privé', it: 'Diritto di pesca privato' },
  closed: { de: 'Schongebiet (kein Fischen)', en: 'Protected (no fishing)', fr: 'Réserve (pêche interdite)', it: 'Riserva (pesca vietata)' },
  unknown: { de: 'Unklar / nachfragen', en: 'Unclear / enquire', fr: 'Incertain / se renseigner', it: 'Incerto / informarsi' },
}

export const PERMIT_WHERE: Record<PermitType, Localized> = {
  patent: { de: 'Kaufen beim Kanton (Webshop / App)', en: 'Buy from the canton (web shop / app)', fr: 'Acheter auprès du canton', it: 'Acquistare dal Cantone' },
  pacht: { de: 'Karte beim Pächter / Verein', en: 'Card from the lessee / club', fr: 'Carte auprès du fermier / club', it: 'Tessera dall\'affittuario / società' },
  freiangel: { de: 'Kein Patent nötig (Regeln gelten)', en: 'No permit needed (rules apply)', fr: 'Pas de permis (règles applicables)', it: 'Nessuna patente (regole applicabili)' },
  mixed: { de: 'Je nach Abschnitt / Kanton', en: 'Depends on section / canton', fr: 'Selon le secteur / canton', it: 'Secondo il tratto / Cantone' },
  private: { de: 'Erlaubnis der Berechtigten', en: 'Permission from right holders', fr: 'Autorisation des ayants droit', it: 'Permesso dei titolari' },
  closed: { de: 'Nichts zu kaufen', en: 'Nothing to buy', fr: 'Rien à acheter', it: 'Niente da acquistare' },
  unknown: { de: 'Beim Kanton nachfragen', en: 'Ask the canton', fr: 'Demander au canton', it: 'Chiedere al Cantone' },
}

export const QUALITY_LABELS: Record<Quality, Localized> = {
  official: { de: 'Amtlich', en: 'Official', fr: 'Officiel', it: 'Ufficiale' },
  derived: { de: 'Abgeleitet', en: 'Derived', fr: 'Déduit', it: 'Dedotto' },
  stub: { de: 'Unvollständig', en: 'Stub', fr: 'Incomplet', it: 'Incompleto' },
}

export const QUALITY_HELP: Record<Quality, Localized> = {
  official: {
    de: 'Bewilligungstyp stammt pro Gewässer aus einem amtlichen kantonalen Geodatensatz.',
    en: 'Permit type comes per water from an official cantonal geodataset.',
    fr: 'Type de permis issu, par plan d\'eau, d\'un jeu de géodonnées cantonal officiel.',
    it: 'Tipo di patente tratto, per ogni acqua, da un geodato cantonale ufficiale.',
  },
  derived: {
    de: 'Bewilligungstyp aus den publizierten Kantonsregeln abgeleitet – Abschnitte können abweichen.',
    en: 'Permit type derived from the canton\'s published rules – individual sections may differ.',
    fr: 'Type de permis déduit des règles cantonales publiées – des secteurs peuvent différer.',
    it: 'Tipo di patente dedotto dalle regole cantonali pubblicate – singoli tratti possono differire.',
  },
  stub: {
    de: 'Bewilligungstyp nicht bestimmt oder kaum Gewässer erfasst – unbedingt beim Kanton nachfragen.',
    en: 'Permit type not determined or very few waters mapped – check with the canton.',
    fr: 'Type de permis non déterminé ou peu de plans d\'eau saisis – se renseigner auprès du canton.',
    it: 'Tipo di patente non determinato o poche acque censite – informarsi presso il Cantone.',
  },
}

export const KIND_LABEL: Record<WaterKind, Localized> = {
  lake: { de: 'See', en: 'Lake', fr: 'Lac', it: 'Lago' },
  river: { de: 'Fliessgewässer', en: 'River / stream', fr: 'Cours d\'eau', it: 'Corso d\'acqua' },
  pond: { de: 'Weiher / Kleinsee', en: 'Pond / small lake', fr: 'Étang', it: 'Stagno' },
  reach: { de: 'Abschnitt / Gebiet', en: 'Reach / area', fr: 'Secteur', it: 'Tratto / zona' },
  canal: { de: 'Kanal', en: 'Canal', fr: 'Canal', it: 'Canale' },
}

export function loc(v: Localized | undefined | null, lang: Lang): string {
  if (!v) return ''
  return v[lang] ?? (lang === 'it' ? v.fr ?? v.de : undefined) ?? (lang === 'fr' || lang === 'en' ? v.en ?? v.de : v.de)
}
