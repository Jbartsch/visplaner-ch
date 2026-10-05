import type { Lang } from '@/types/water'

type Entry = { de: string; en: string; fr?: string }

const dict = {
  title: { de: 'Visplaner CH', en: 'Visplaner CH', fr: 'Visplaner CH' },
  tagline: {
    de: 'Welches Fischereipatent brauche ich hier — und wo kaufe ich es?',
    en: 'Which fishing permit do I need here — and where do I buy it?',
    fr: 'Quel permis de pêche me faut-il ici — et où l’acheter ?',
  },
  banner: {
    de: 'PROTOTYP · ZH + BE · Nur Information, keine Rechtsauskunft, kein Patent · Daten teils abgeleitet',
    en: 'PROTOTYPE · ZH + BE · Informational only, not legal advice, not a permit · data partly derived',
    fr: 'PROTOTYPE · ZH + BE · Information seulement, pas un avis juridique ni un permis',
  },
  aboutTitle: { de: 'Warum Visplaner?', en: 'Why Visplaner?', fr: 'Pourquoi Visplaner ?' },
  about1: {
    de: '26 Kantone, 26 Systeme: Jeder Kanton regelt die Angelfischerei selbst — es gibt keinen nationalen Fischerpass.',
    en: '26 cantons, 26 systems: each canton regulates angling itself — there is no national fishing licence.',
    fr: '26 cantons, 26 systèmes : chaque canton règle la pêche — pas de permis national.',
  },
  about2: {
    de: 'Patent, Pacht oder privat? Am See gilt oft das Kantonspatent, am Bach daneben braucht es eine Karte vom Pächter.',
    en: 'Patent, lease or private? The lake may need a cantonal permit while the stream next to it needs a card from the lessee.',
    fr: 'Permis, affermage ou privé ? Le lac peut exiger un permis cantonal, le ruisseau voisin une carte du fermier.',
  },
  about3: {
    de: 'Visplaner zeigt pro Gewässer den Bewilligungstyp und den direkten Weg zum Kauf (Kanton, App, Pächter).',
    en: 'Visplaner shows the permit type per water and the direct path to buy (canton, app, lessee).',
    fr: 'Visplaner montre le type de permis par plan d’eau et où l’acheter.',
  },
  hide: { de: 'Ausblenden', en: 'Hide', fr: 'Masquer' },
  legendTitle: { de: 'Bewilligungstyp', en: 'Permit type', fr: 'Type de permis' },
  searchPlaceholder: { de: 'Gewässer suchen (z. B. Thunersee, Limmat, Töss)…', en: 'Search waters (e.g. Lake Thun, Limmat, Töss)…', fr: 'Chercher (ex. lac de Thoune, Limmat)…' },
  canton: { de: 'Kanton', en: 'Canton', fr: 'Canton' },
  all: { de: 'Alle', en: 'All', fr: 'Tous' },
  results: { de: 'Treffer', en: 'results', fr: 'résultats' },
  showMore: { de: 'Mehr anzeigen', en: 'Show more', fr: 'Afficher plus' },
  selectHint: { de: 'Gewässer auf der Karte antippen oder suchen.', en: 'Tap a water on the map or search.', fr: 'Touchez un plan d’eau ou cherchez.' },
  back: { de: 'Zurück zur Liste', en: 'Back to list', fr: 'Retour à la liste' },
  permitNeeded: { de: 'Benötigte Bewilligung', en: 'Permit needed', fr: 'Permis requis' },
  whereToBuy: { de: 'Wo kaufen / nachfragen', en: 'Where to buy / enquire', fr: 'Où acheter / se renseigner' },
  sanaTitle: { de: 'SaNa (Sachkunde-Nachweis)', en: 'SaNa (angler competence certificate)', fr: 'Attestation de compétence (SaNa)' },
  sanaAnnual: {
    de: 'Für Monats-/Jahrespatente nötig. Tages- (und in BE Wochen-)patente ohne SaNa erhältlich.',
    en: 'Required for monthly/annual permits. Day (and in BE week) permits available without SaNa.',
    fr: 'Requise pour les permis mensuels/annuels. Permis journaliers sans SaNa.',
  },
  sanaAsk: {
    de: 'Je nach Pächter/Berechtigten — für Jahreskarten meist erforderlich.',
    en: 'Depends on the lessee/right holder — usually required for annual cards.',
    fr: 'Selon le fermier — généralement requise pour les cartes annuelles.',
  },
  sanaLink: { de: 'Was ist der SaNa?', en: 'What is SaNa?', fr: 'Qu’est-ce que la SaNa ?' },
  dayTicket: { de: 'Tageskarte / Tagespatent', en: 'Day ticket', fr: 'Permis journalier' },
  yes: { de: 'Ja', en: 'Yes', fr: 'Oui' },
  no: { de: 'Nein', en: 'No', fr: 'Non' },
  unknownShort: { de: 'Unbekannt', en: 'Unknown', fr: 'Inconnu' },
  price: { de: 'Preis-Richtwert', en: 'Price guide', fr: 'Prix indicatif' },
  conditions: { de: 'Revierbeschrieb (amtlich)', en: 'Reach description (official, German)', fr: 'Description officielle' },
  species: { de: 'Fischarten (Hinweis)', en: 'Species (hint)', fr: 'Espèces (indication)' },
  season: { de: 'Schonzeiten', en: 'Closed seasons', fr: 'Périodes de protection' },
  notes: { de: 'Hinweise', en: 'Notes', fr: 'Remarques' },
  source: { de: 'Datenquelle', en: 'Data source', fr: 'Source' },
  revier: { de: 'Revier', en: 'Revier', fr: 'Secteur' },
  official: { de: 'Amtliche Daten', en: 'Official data', fr: 'Données officielles' },
  derived: { de: 'Abgeleitet', en: 'Derived', fr: 'Dérivé' },
  demo: { de: 'MOCK', en: 'MOCK', fr: 'MOCK' },
  close: { de: 'Schliessen', en: 'Close', fr: 'Fermer' },
  share: { de: 'Link kopieren', en: 'Copy link', fr: 'Copier le lien' },
  copied: { de: 'Kopiert ✓', en: 'Copied ✓', fr: 'Copié ✓' },
  enquireFallback: {
    de: 'Unsicher? Frag die kantonale Fischereiverwaltung — sie kennt Pächter und Sonderregeln.',
    en: 'Unsure? Ask the cantonal fisheries office — they know lessees and special rules.',
    fr: 'Un doute ? Demandez au service cantonal de la pêche.',
  },
  enquireZH: { de: 'Fischerei- und Jagdverwaltung ZH', en: 'ZH fisheries & hunting office', fr: 'Service pêche ZH' },
  enquireBE: { de: 'Fischereiinspektorat BE', en: 'BE fisheries inspectorate', fr: 'Inspection de la pêche BE' },
  officialOverlay: { de: 'Offizielle Karte BE (Angelfischerei)', en: 'Official BE map (angling)', fr: 'Carte officielle BE (pêche)' },
  disclaimer: {
    de: 'Nur Information — keine Erlaubnis zum Fischen und keine Rechtsauskunft. Massgebend sind die kantonalen Vorschriften, Patente und Pachtverträge. Daten können veraltet oder vereinfacht sein (ZH-Reviere: Datenstand 2010; BE: aus Patentliste abgeleitet).',
    en: 'Informational only — not permission to fish and not legal advice. Cantonal rules, permits and lease contracts prevail. Data may be outdated or simplified (ZH reviers: data as of 2010; BE: derived from the patent list).',
    fr: 'Information seulement — ni autorisation de pêcher ni avis juridique. Les prescriptions cantonales font foi.',
  },
  scope: { de: 'Zürich & Bern', en: 'Zurich & Bern', fr: 'Zurich & Berne' },
  footerData: {
    de: 'Daten: Kanton Zürich OGD (Fischereireviere), Kanton Bern (Patentgewässer, Angelfischerei-WMS), swisstopo/BAFU VECTOR25. Karte © OpenStreetMap.',
    en: 'Data: Canton of Zurich OGD (fishing reviers), Canton of Bern (patent waters, angling WMS), swisstopo/FOEN VECTOR25. Map © OpenStreetMap.',
    fr: 'Données : OGD Zurich, canton de Berne, swisstopo/OFEV VECTOR25. Carte © OpenStreetMap.',
  },
  loading: { de: 'Lade Gewässer…', en: 'Loading waters…', fr: 'Chargement…' },
} satisfies Record<string, Entry>

export type CopyKey = keyof typeof dict

export function t(key: CopyKey, lang: Lang): string {
  const e: Entry = dict[key]
  return (lang === 'fr' ? e.fr : e[lang]) ?? e.de
}
