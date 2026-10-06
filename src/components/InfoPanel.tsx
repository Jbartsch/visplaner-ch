'use client'

import { useEffect, useState } from 'react'
import { loadDetails, loadGeoExtra, loadRules } from '@/data/loadWaters'
import type { Parking, RulesFile, WaterGeoExtra } from '@/lib/rules'
import { QuickAnswers } from './QuickAnswers'
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
  onParking?: (p: Parking) => void
  onGeo?: (id: string, g: WaterGeoExtra | null) => void
}

export function InfoPanel({ w: base, c, border, source, access, lang, onBack, onCanton, onParking, onGeo }: Props) {
  const [rules, setRules] = useState<RulesFile | null | undefined>(undefined)
  const [geo, setGeo] = useState<{ id: string; g: WaterGeoExtra | null } | null>(null)
  useEffect(() => {
    let live = true
    loadRules().then(
      (r) => live && setRules(r),
      () => live && setRules(null),
    )
    return () => {
      live = false
    }
  }, [])
  useEffect(() => {
    let live = true
    loadGeoExtra(base.c).then(
      (d) => {
        if (!live) return
        setGeo({ id: base.id, g: d[base.id] ?? null })
        onGeo?.(base.id, d[base.id] ?? null)
      },
      () => live && setGeo({ id: base.id, g: null }),
    )
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base.id, base.c])
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
      <QuickAnswers w={w} c={c} lang={lang} rules={rules} geo={geo?.id === base.id ? geo.g : undefined} onParking={onParking} />
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
