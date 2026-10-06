import type { Lang, Quality } from '@/types/water'
import { QUALITY_HELP, loc, qualityLabel } from '@/types/water'

/** Provenance badge: where the permit info comes from (cantonal open data / derived / incomplete). Not an official status. */
export function QualityBadge({ q, lang, long, canton }: { q: Quality; lang: Lang; long?: boolean; canton?: string }) {
  return (
    <span className={`qbadge q-${q}`} title={loc(QUALITY_HELP[q], lang)}>
      {q === 'official' ? '◉' : q === 'derived' ? '≈' : '?'} {qualityLabel(q, lang, canton)}
      {long && <span className="qbadge-help"> – {loc(QUALITY_HELP[q], lang)}</span>}
    </span>
  )
}
