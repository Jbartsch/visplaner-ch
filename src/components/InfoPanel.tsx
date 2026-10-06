'use client'

import { useState } from 'react'
import type { BorderInfo, CantonInfo, Lang, Water } from '@/types/water'
import { KIND_LABEL, loc } from '@/types/water'
import { t } from '@/i18n/copy'
import { QualityBadge } from './Badges'
import { WaterFacts } from './WaterFacts'

type Props = {
  w: Water
  c: CantonInfo
  border: BorderInfo | null
  source: { label: string; url: string } | undefined
  lang: Lang
  onBack: () => void
  onCanton: () => void
}

export function InfoPanel({ w, c, border, source, lang, onBack, onCanton }: Props) {
  const [copied, setCopied] = useState(false)
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
          <h2>{loc(w.n, lang)}</h2>
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
            <QualityBadge q={w.q} lang={lang} />
          </div>
        </div>
      </div>
      <WaterFacts w={w} c={c} border={border} lang={lang} />
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
        </p>
      )}
      <p className="disclaimer">{t('disclaimer', lang)}</p>
    </div>
  )
}
