'use client'

import type { Lang, PermitType } from '@/types/water'
import { PERMIT_COLORS, PERMIT_LABELS, PERMIT_ORDER, loc } from '@/types/water'
import { t } from '@/i18n/copy'

type Props = {
  lang: Lang
  types: PermitType[]
  counts: Partial<Record<PermitType, number>>
  onToggle: (t: PermitType) => void
  overlayBE: boolean
  onOverlay: (v: boolean) => void
}

export function Legend({ lang, types, counts, onToggle, overlayBE, onOverlay }: Props) {
  return (
    <div className="legend">
      <div className="legend-title">{t('legendTitle', lang)}</div>
      <ul>
        {PERMIT_ORDER.filter((k) => (counts[k] ?? 0) > 0).map((key) => (
          <li key={key}>
            <button type="button" className={types.includes(key) ? 'legend-item' : 'legend-item off'} onClick={() => onToggle(key)}>
              <span className="swatch" style={{ background: PERMIT_COLORS[key] }} />
              {loc(PERMIT_LABELS[key], lang)}
              <span className="count">{counts[key]}</span>
            </button>
          </li>
        ))}
      </ul>
      <label className="overlay-toggle">
        <input type="checkbox" checked={overlayBE} onChange={(e) => onOverlay(e.target.checked)} />
        {t('officialOverlay', lang)}
      </label>
    </div>
  )
}
