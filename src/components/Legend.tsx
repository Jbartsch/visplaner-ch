'use client'

import type { Lang, PermitType, Quality } from '@/types/water'
import { PERMIT_COLORS, PERMIT_LABELS, PERMIT_ORDER, QUALITY_LABELS, loc } from '@/types/water'
import { t } from '@/i18n/copy'
import { useEffect, useRef } from 'react'

type Props = {
  lang: Lang
  types: PermitType[]
  counts: Partial<Record<PermitType, number>>
  onToggle: (t: PermitType) => void
  overlay: boolean
  onOverlay: (v: boolean) => void
  zones: boolean
  onZones: (v: boolean) => void
  parking: boolean
  showZoomHint: boolean
}

export const QCOLORS: Record<Quality, string> = { official: '#16a34a', derived: '#f59e0b', stub: '#9ca3af' }

export function Legend({ lang, types, counts, onToggle, overlay, onOverlay, zones, onZones, parking, showZoomHint }: Props) {
  const ref = useRef<HTMLDetailsElement>(null)
  // collapsed by default on small screens so the map stays visible
  useEffect(() => {
    if (ref.current && window.matchMedia('(max-width: 880px)').matches) ref.current.open = false
  }, [])
  return (
    <div className="legend">
      <details open ref={ref}>
        <summary className="legend-title">{t('legendTitle', lang)}</summary>
        <ul>
          {PERMIT_ORDER.filter((k) => (counts[k] ?? 0) > 0).map((key) => (
            <li key={key}>
              <button type="button" className={types.includes(key) ? 'legend-item' : 'legend-item off'} onClick={() => onToggle(key)} aria-pressed={types.includes(key)}>
                <span className="swatch" style={{ background: PERMIT_COLORS[key] }} />
                {loc(PERMIT_LABELS[key], lang)}
                <span className="count">{counts[key]}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="legend-title small">{t('dataOrigin', lang)}</div>
        <div className="qlegend">
          {(['official', 'derived', 'stub'] as Quality[]).map((q) => (
            <span key={q} className="qitem">
              <span className="qbox" style={{ background: QCOLORS[q] }} />
              {q === 'official' ? t('srcOpenData', lang) : loc(QUALITY_LABELS[q], lang)}
            </span>
          ))}
        </div>
        <label className="overlay-toggle">
          <input type="checkbox" checked={overlay} onChange={(e) => onOverlay(e.target.checked)} />
          {t('officialOverlay', lang)} (BE, AG)
        </label>
        <label className="overlay-toggle">
          <input type="checkbox" checked={zones} onChange={(e) => onZones(e.target.checked)} />
          {t('zoneOverlay', lang)}
        </label>
        {zones && (
          <div className="qlegend">
            <span className="qitem">
              <span className="zsw fish" /> {t('zFish', lang)}
            </span>
            <span className="qitem">
              <span className="zsw wzvv" /> WZVV ({lang === 'de' ? 'Bund' : lang === 'en' ? 'federal' : lang === 'it' ? 'Confed.' : 'Conféd.'})
            </span>
            <span className="qitem small muted">{t('zoneOverlayNote', lang)}</span>
          </div>
        )}
        {parking && (
          <div className="qlegend">
            <span className="qitem">
              <span className="pk-dot">P</span> {t('parkLayer', lang)}
            </span>
          </div>
        )}
        {showZoomHint && <div className="zoom-hint">🔍 {t('zoomForDetail', lang)}</div>}
      </details>
    </div>
  )
}
