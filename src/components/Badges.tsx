import type { Lang, Quality } from '@/types/water'
import { QUALITY_HELP, QUALITY_LABELS, loc } from '@/types/water'

export function QualityBadge({ q, lang, long }: { q: Quality; lang: Lang; long?: boolean }) {
  return (
    <span className={`qbadge q-${q}`} title={loc(QUALITY_HELP[q], lang)}>
      {q === 'official' ? '✓' : q === 'derived' ? '≈' : '?'} {loc(QUALITY_LABELS[q], lang)}
      {long && <span className="qbadge-help"> – {loc(QUALITY_HELP[q], lang)}</span>}
    </span>
  )
}
