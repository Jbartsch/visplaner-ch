'use client'

import { useState } from 'react'
import type { Lang, WaterProps } from '@/types/water'
import { PERMIT_COLORS, PERMIT_LABELS, PERMIT_WHERE, loc } from '@/types/water'
import { t } from '@/i18n/copy'

type Props = {
  water: WaterProps
  lang: Lang
  onBack: () => void
}

const ENQUIRE = {
  ZH: 'https://www.zh.ch/de/umwelt-tiere/tiere/fischerei.html',
  BE: 'https://www.weu.be.ch/de/start/themen/jagd-fischerei/fischerei.html',
} as const

const KIND_LABEL = {
  lake: { de: 'See', en: 'Lake', fr: 'Lac' },
  river: { de: 'Fliessgewässer', en: 'River / stream', fr: 'Cours d’eau' },
  pond: { de: 'Weiher / Kleinsee', en: 'Pond / small lake', fr: 'Étang' },
  reach: { de: 'Abschnitt', en: 'Reach', fr: 'Secteur' },
  canal: { de: 'Kanal', en: 'Canal', fr: 'Canal' },
}

export function InfoPanel({ water, lang, onBack }: Props) {
  const [copied, setCopied] = useState(false)
  const color = PERMIT_COLORS[water.permitType]
  const buys = water.actions.filter((a) => a.kind === 'buy')
  const others = water.actions.filter((a) => a.kind !== 'buy')

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
        <h2>{loc(water.name, lang)}</h2>
        <div className="meta">
          <span className="pill">{t('canton', lang)} {water.canton}</span>
          <span className="pill">{loc(KIND_LABEL[water.waterKind], lang)}</span>
          {water.revier && <span className="pill">{t('revier', lang)} {water.revier}</span>}
          <span className={`pill conf-${water.confidence}`}>{t(water.confidence, lang)}</span>
        </div>
      </div>

      <div className="permit-card" style={{ borderColor: color }}>
        <div className="permit-label">{t('permitNeeded', lang)}</div>
        <div className="permit-type" style={{ color }}>
          <span className="swatch" style={{ background: color }} />
          {loc(PERMIT_LABELS[water.permitType], lang)}
        </div>
        <p className="permit-summary">{loc(water.summary, lang)}</p>
        {water.priceHint && (
          <p className="price">
            <strong>{t('price', lang)}:</strong> {loc(water.priceHint, lang)}
          </p>
        )}
      </div>

      <section className="buy">
        <h3>
          {t('whereToBuy', lang)} · <span className="muted">{loc(PERMIT_WHERE[water.permitType], lang)}</span>
        </h3>
        {buys.map((a, i) => (
          <a key={a.url + i} className={i === 0 ? 'buy-btn' : 'buy-btn secondary'} href={a.url} target="_blank" rel="noopener noreferrer">
            {loc(a.label, lang)} →
          </a>
        ))}
        {others.map((a, i) => (
          <a key={a.url + i} className={a.kind === 'enquire' && buys.length === 0 && i === 0 ? 'buy-btn enquire' : 'action-link'} href={a.url} target="_blank" rel="noopener noreferrer">
            {a.kind === 'enquire' ? '✉ ' : 'ⓘ '}
            {loc(a.label, lang)}
          </a>
        ))}
      </section>

      <div className="facts">
        {water.sana && water.sana !== 'none' && (
          <div className="fact">
            <h3>{t('sanaTitle', lang)}</h3>
            <p>
              {t(water.sana === 'annual' ? 'sanaAnnual' : 'sanaAsk', lang)}{' '}
              <a href="https://www.anglerausbildung.ch/" target="_blank" rel="noopener noreferrer">
                {t('sanaLink', lang)}
              </a>
            </p>
          </div>
        )}
        {water.dayTicket && (
          <div className="fact">
            <h3>{t('dayTicket', lang)}</h3>
            <p>{t(water.dayTicket === 'yes' ? 'yes' : water.dayTicket === 'no' ? 'no' : 'unknownShort', lang)}</p>
          </div>
        )}
      </div>

      {water.conditions && (
        <div className="block">
          <h3>{t('conditions', lang)}</h3>
          <p>{loc(water.conditions, lang)}</p>
        </div>
      )}
      {water.notes && (
        <div className="block">
          <h3>{t('notes', lang)}</h3>
          <p>{loc(water.notes, lang)}</p>
        </div>
      )}

      <details className="secondary-info">
        <summary>
          {t('species', lang)} · {t('season', lang)}
        </summary>
        {water.species && (
          <div className="block">
            <h3>{t('species', lang)}</h3>
            <p>{loc(water.species, lang)}</p>
          </div>
        )}
        {water.season && (
          <div className="block">
            <h3>{t('season', lang)}</h3>
            <p>{loc(water.season, lang)}</p>
          </div>
        )}
      </details>

      <p className="enquire-fallback">
        {t('enquireFallback', lang)}{' '}
        <a href={ENQUIRE[water.canton]} target="_blank" rel="noopener noreferrer">
          {t(water.canton === 'ZH' ? 'enquireZH' : 'enquireBE', lang)} →
        </a>
      </p>

      <p className="source">
        {t('source', lang)}:{' '}
        <a href={water.source.url} target="_blank" rel="noopener noreferrer">
          {water.source.label}
        </a>
      </p>

      <p className="disclaimer">{t('disclaimer', lang)}</p>
    </div>
  )
}
