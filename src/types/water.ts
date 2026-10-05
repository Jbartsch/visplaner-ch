export type Lang = 'de' | 'en' | 'fr'
export type Canton = 'ZH' | 'BE'
export type WaterKind = 'lake' | 'river' | 'pond' | 'reach' | 'canal'
export type PermitType = 'patent' | 'pacht' | 'freiangel' | 'mixed' | 'private' | 'closed' | 'unknown'
export type Confidence = 'official' | 'derived' | 'demo'

export type Localized = { de: string; en: string; fr?: string }

export type WaterAction = {
  kind: 'buy' | 'enquire' | 'info'
  label: Localized
  url: string
}

export type WaterProps = {
  id: string
  name: Localized
  canton: Canton
  waterKind: WaterKind
  permitType: PermitType
  summary: Localized
  actions: WaterAction[]
  /** annual = SaNa needed for annual/month permits (day tickets without) · ask = depends on lessee · none */
  sana?: 'annual' | 'ask' | 'none'
  dayTicket?: 'yes' | 'no' | 'unknown'
  priceHint?: Localized
  conditions?: Localized
  notes?: Localized
  species?: Localized
  season?: Localized
  revier?: string
  source: { label: string; url: string; asOf?: string }
  confidence: Confidence
  search?: string
}

export type Bbox = [number, number, number, number]

export type WaterEntry = { props: WaterProps; bbox: Bbox }

export const PERMIT_ORDER: PermitType[] = ['patent', 'pacht', 'private', 'mixed', 'freiangel', 'closed', 'unknown']

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
  patent: { de: 'Kantonspatent', en: 'Cantonal permit', fr: 'Permis cantonal' },
  pacht: { de: 'Pachtgewässer', en: 'Leased water (Pacht)', fr: 'Eaux affermées' },
  freiangel: { de: 'Freiangel', en: 'Free angling', fr: 'Pêche libre' },
  mixed: { de: 'Gemischt / Grenzgewässer', en: 'Mixed / border water', fr: 'Mixte / frontière' },
  private: { de: 'Privates Fischereirecht', en: 'Private fishing right', fr: 'Droit de pêche privé' },
  closed: { de: 'Schonrevier (kein Fischen)', en: 'Protected (no fishing)', fr: 'Réserve (pêche interdite)' },
  unknown: { de: 'Unklar / nachfragen', en: 'Unclear / enquire', fr: 'Incertain / se renseigner' },
}

export const PERMIT_WHERE: Record<PermitType, Localized> = {
  patent: { de: 'Kaufen beim Kanton (Webshop / App)', en: 'Buy from the canton (web shop / app)', fr: 'Acheter auprès du canton' },
  pacht: { de: 'Karte beim Pächter / Verein', en: 'Card from the lessee / club', fr: 'Carte auprès du fermier / club' },
  freiangel: { de: 'Kein Patent nötig (Regeln gelten)', en: 'No permit needed (rules apply)', fr: 'Pas de permis (règles applicables)' },
  mixed: { de: 'Je nach Abschnitt / Kanton', en: 'Depends on section / canton', fr: 'Selon le secteur / canton' },
  private: { de: 'Erlaubnis der Berechtigten', en: 'Permission from right holders', fr: 'Autorisation des ayants droit' },
  closed: { de: 'Nichts zu kaufen', en: 'Nothing to buy', fr: 'Rien à acheter' },
  unknown: { de: 'Beim Kanton nachfragen', en: 'Ask the canton', fr: 'Demander au canton' },
}

export function loc(v: Localized | undefined, lang: Lang): string {
  if (!v) return ''
  return (lang === 'fr' ? v.fr : v[lang]) ?? v.de
}
