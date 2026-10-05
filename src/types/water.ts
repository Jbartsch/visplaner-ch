export type Lang = 'de' | 'en'
export type Canton = 'ZH' | 'BE'
export type WaterKind = 'lake' | 'river' | 'canal' | 'reach'
export type PermitType = 'patent' | 'pacht' | 'freiangel' | 'mixed' | 'unknown'

export type Localized = { de: string; en: string }

export type WaterProps = {
  id: string
  name: Localized
  canton: Canton
  waterKind: WaterKind
  permitType: PermitType
  permitSummary: Localized
  buyUrl: string
  buyLabel: Localized
  notes?: Localized
  speciesHint?: Localized
  mock: boolean
}

export const PERMIT_COLORS: Record<PermitType, string> = {
  patent: '#2563eb',
  pacht: '#d97706',
  freiangel: '#0d9488',
  mixed: '#7c3aed',
  unknown: '#6b7280',
}

export const PERMIT_LABELS: Record<PermitType, Localized> = {
  patent: { de: 'Kantonalpatent', en: 'Cantonal patent' },
  pacht: { de: 'Pachtgewässer', en: 'Leased water (Pacht)' },
  freiangel: { de: 'Freiangel', en: 'Free angling' },
  mixed: { de: 'Gemischt', en: 'Mixed regime' },
  unknown: { de: 'Unklar / prüfen', en: 'Unknown / check' },
}
