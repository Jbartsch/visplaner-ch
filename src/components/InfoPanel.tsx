'use client'

import { useEffect, useState } from 'react'
import { loadDetails } from '@/data/loadWaters'
import type { BorderInfo, CantonInfo, CantonsFile, Lang, SourceDef, Water, WaterExtra } from '@/types/water'
import { KIND_LABEL, loc } from '@/types/water'
import { t } from '@/i18n/copy'
import { QualityBadge } from './Badges'
import { WaterFacts } from './WaterFacts'

type Props = {
  w: Water
  c: CantonInfo
  border: BorderInfo | null
  source: SourceDef | undefined
  access: CantonsFile['meta']['access']
  lang: Lang
  onBack: () => void
  onCanton: () => void
}

export function InfoPanel({ w: base, c, border, source, access, lang, onBack, onCanton }: Props) {
  const [copied, setCopied] = useState(false)
  const [extra, setExtra] = useState<{ id: string; x?: WaterExtra } | null>(null)
  useEffect(() => {
    let live = true
    loadDetails(base.c).then(
      (d) => live && setExtra({ id: base.id, x: d[base.id] }),
      () => live && setExtra({ id: base.id }),
    )
    return () => {
      live = false
    }
  }, [base.id, base.c])
  const w: Water = extra?.id === base.id && extra.x ? { ...base, x: extra.x } : base
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="detail">
      <div className="detail-nav">
        <button type="button" className="link-btn" onClick={onBack}>
          ← {t('back', lang)}
        </button>
        <button type="button" className="link-btn" onClick={share}>
          {copied ? t('copied', lang) : t('share', lang)}
        </button>
      </div>
      <div className="panel-head">
        <div>
          <h2 tabIndex={-1} ref={(el) => el?.focus({ preventScroll: true })}>{loc(w.n, lang)}</h2>
          <div className="meta">
            <button type="button" className="pill pill-btn" onClick={onCanton}>
              {t('canton', lang)} {c.code}
            </button>
            <span className="pill">{loc(KIND_LABEL[w.k], lang)}</span>
            {w.x?.revier && (
              <span className="pill">
                {t('revier', lang)} {w.x.revier}
              </span>
            )}
            <QualityBadge q={w.q} lang={lang} canton={w.c} />
          </div>
        </div>
      </div>
      <WaterFacts w={w} c={c} border={border} lang={lang} access={access} source={source} />
      <p className="source">
        <a href={`/${lang}/gewaesser/${w.slug}`}>{t('detailsPage', lang)} →</a> ·{' '}
        <a href={`/${lang}/kanton/${c.slug}`}>{t('cantonPage', lang)} →</a>
      </p>
      {source && (
        <p className="source">
          {t('source', lang)}:{' '}
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.label}
          </a>
          {source.vintage && <span className="vintage"> · {loc(source.vintage, lang)}</span>}
        </p>
      )}
      <p className="disclaimer">{t('disclaimer', lang)}</p>
    </div>
  )
}
