import type { Lang } from '../types/water'

const dict = {
  title: { de: 'Visplaner CH', en: 'Visplaner CH' },
  tagline: {
    de: 'Welches Patent brauche ich — und wo kaufe ich es?',
    en: 'Which permit do I need — and where do I buy it?',
  },
  mockBanner: {
    de: 'MOCK-DATEN · Prototyp ZH + BE · Keine Rechtsauskunft · Kein digitales Patent',
    en: 'MOCK DATA · ZH + BE prototype · Not legal advice · Not a digital permit',
  },
  legendTitle: { de: 'Permit-Typ', en: 'Permit type' },
  selectHint: {
    de: 'Gewässer auf der Karte antippen',
    en: 'Tap a water on the map',
  },
  canton: { de: 'Kanton', en: 'Canton' },
  permitNeeded: { de: 'Benötigte Bewilligung', en: 'Permit needed' },
  buyCta: { de: 'Wo kaufen / nachfragen', en: 'Where to buy / enquire' },
  species: { de: 'Arten (Hinweis)', en: 'Species (hint)' },
  notes: { de: 'Hinweise', en: 'Notes' },
  close: { de: 'Schliessen', en: 'Close' },
  disclaimer: {
    de: 'Nur Information. Keine Erlaubnis zum Fischen. Immer kantonale Behörden / Pächter prüfen.',
    en: 'Informational only. Not permission to fish. Always verify with cantonal authorities / lessees.',
  },
  scope: { de: 'Scope: Zürich & Bern (Mock)', en: 'Scope: Zurich & Bern (mock)' },
} as const

export type CopyKey = keyof typeof dict

export function t(key: CopyKey, lang: Lang): string {
  return dict[key][lang]
}
