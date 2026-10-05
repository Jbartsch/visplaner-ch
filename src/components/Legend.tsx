'use client'

import type { Lang, PermitType } from '@/types/water'
import { PERMIT_COLORS, PERMIT_LABELS } from '@/types/water'
import { t } from '@/i18n/copy'

const ORDER: PermitType[] = ['patent', 'pacht', 'freiangel', 'mixed', 'unknown']

export function Legend({ lang }: { lang: Lang }) {
  return (
    <div className="legend">
      <div className="legend-title">{t('legendTitle', lang)}</div>
      <ul>
        {ORDER.map((key) => (
          <li key={key}>
            <span className="swatch" style={{ background: PERMIT_COLORS[key] }} />
            {PERMIT_LABELS[key][lang]}
          </li>
        ))}
      </ul>
    </div>
  )
}
