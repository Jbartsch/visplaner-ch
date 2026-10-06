'use client'

import { useMemo, useState } from 'react'
import type { Canton, CantonInfo, Lang, PermitType, Water } from '@/types/water'
import { PERMIT_COLORS, PERMIT_LABELS, PERMIT_ORDER, loc } from '@/types/water'
import { normalize } from '@/lib/water'
import { t } from '@/i18n/copy'
import { QualityBadge } from './Badges'
import { QCOLORS } from './Legend'

type Props = {
  lang: Lang
  waters: Water[]
  hay: Map<string, string>
  cantonInfo: Record<Canton, CantonInfo>
  order: Canton[]
  query: string
  onQuery: (q: string) => void
  canton: Canton | null
  onCanton: (c: Canton | null) => void
  types: PermitType[]
  onToggleType: (t: PermitType) => void
  onPick: (id: string) => void
}

const KIND_RANK = { lake: 0, river: 1, canal: 2, reach: 3, pond: 4 } as const
const Q_RANK = { official: 0, derived: 1, stub: 2 } as const

export function SidePanel({ lang, waters, hay, cantonInfo, order, query, onQuery, canton, onCanton, types, onToggleType, onPick }: Props) {
  const [limit, setLimit] = useState(40)
  const terms = useMemo(() => normalize(query.trim()).split(/\s+/).filter(Boolean), [query])
  const results = useMemo(() => {
    return waters
      .filter((w) => (!canton || w.c === canton) && types.includes(w.p))
      .filter((w) => !terms.length || terms.every((tm) => (hay.get(w.id) ?? '').includes(tm)))
      .sort((a, b) => {
        if (terms.length) {
          const an = normalize(loc(a.n, lang)).startsWith(terms[0]) ? 0 : 1
          const bn = normalize(loc(b.n, lang)).startsWith(terms[0]) ? 0 : 1
          if (an !== bn) return an - bn
        }
        return KIND_RANK[a.k] - KIND_RANK[b.k] || Q_RANK[a.q] - Q_RANK[b.q] || loc(a.n, lang).localeCompare(loc(b.n, lang), lang)
      })
  }, [waters, hay, terms, canton, types, lang])
  const cantonHits = useMemo(
    () =>
      terms.length
        ? order.filter((c) => {
            const i = cantonInfo[c]
            const h = normalize(`${c} ${i.name.de} ${i.name.fr} ${i.name.it} ${i.name.en}`)
            return terms.every((tm) => h.includes(tm))
          })
        : [],
    [terms, order, cantonInfo],
  )
  const ci = canton ? cantonInfo[canton] : null

  return (
    <div className="side">
      <input
        className="search"
        type="search"
        value={query}
        placeholder={t('searchPlaceholder', lang)}
        onChange={(e) => {
          onQuery(e.target.value)
          setLimit(40)
        }}
        aria-label={t('searchPlaceholder', lang)}
      />
      <div className="canton-row">
        <label className="sr-only" htmlFor="canton-select">
          {t('canton', lang)}
        </label>
        <select id="canton-select" className="canton-select" value={canton ?? ''} onChange={(e) => onCanton((e.target.value || null) as Canton | null)}>
          <option value="">{t('allCantons', lang)}</option>
          {order.map((c) => (
            <option key={c} value={c}>
              {c} – {loc(cantonInfo[c].name, lang)} ({cantonInfo[c].count}) {cantonInfo[c].quality === 'official' ? '✓' : cantonInfo[c].quality === 'stub' ? '?' : '≈'}
            </option>
          ))}
        </select>
      </div>

      {ci ? (
        <div className={`canton-card q-${ci.quality}`}>
          <div className="canton-card-head">
            <strong>{loc(ci.name, lang)}</strong>
            <QualityBadge q={ci.quality} lang={lang} />
          </div>
          <p>{loc(ci.system, lang)}</p>
          {ci.quality === 'stub' && <p className="stub-note">⚠ {t('stubCanton', lang)}</p>}
          <div className="canton-links">
            {ci.links
              .filter((l) => l.kind === 'buy' || l.kind === 'app' || l.kind === 'pacht')
              .slice(0, 3)
              .map((l) => (
                <a key={l.url} className="action-link" href={l.url} target={l.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
                  {l.kind === 'pacht' ? '👥' : '🛒'} {loc(l.label, lang)}
                </a>
              ))}
            <a className="action-link" href={`/${lang}/kanton/${ci.slug}`}>
              ⓘ {t('cantonPage', lang)} →
            </a>
          </div>
          <div className="qbar" aria-label={t('quality', lang)}>
            {(['official', 'derived', 'stub'] as const).map((q) =>
              ci.byQuality[q] ? <span key={q} style={{ flex: ci.byQuality[q], background: QCOLORS[q] }} title={`${q}: ${ci.byQuality[q]}`} /> : null,
            )}
          </div>
          <div className="muted small">
            {ci.count} {t('waters', lang)} · ✓{ci.byQuality.official ?? 0} ≈{ci.byQuality.derived ?? 0} ?{ci.byQuality.stub ?? 0}
          </div>
        </div>
      ) : (
        !terms.length && (
          <details className="coverage-grid-wrap">
            <summary>
              {t('coverage', lang)}: 26 {t('canton', lang)} ·{' '}
              {(['official', 'derived', 'stub'] as const).map((q) => (
                <span key={q} className="cov-sum">
                  <span className="qbox" style={{ background: QCOLORS[q] }} />
                  {order.filter((c) => cantonInfo[c].quality === q).length}
                </span>
              ))}
            </summary>
            <div className="coverage-grid">
              {order.map((c) => (
                <button key={c} type="button" className={`cov-cell q-${cantonInfo[c].quality}`} onClick={() => onCanton(c)} title={`${loc(cantonInfo[c].name, lang)} – ${cantonInfo[c].quality}`}>
                  <strong>{c}</strong>
                  <span>{cantonInfo[c].count}</span>
                </button>
              ))}
            </div>
          </details>
        )
      )}

      {cantonHits.length > 0 && (
        <div className="chips">
          {cantonHits.map((c) => (
            <button key={c} type="button" className="chip" onClick={() => onCanton(c)}>
              {c} · {loc(cantonInfo[c].name, lang)}
            </button>
          ))}
        </div>
      )}

      <div className="chips small" role="group" aria-label={t('legendTitle', lang)}>
        {PERMIT_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={types.includes(p)}
            className={types.includes(p) ? 'chip type active' : 'chip type'}
            style={types.includes(p) ? { background: PERMIT_COLORS[p], borderColor: PERMIT_COLORS[p] } : { borderColor: PERMIT_COLORS[p] }}
            onClick={() => onToggleType(p)}
          >
            {loc(PERMIT_LABELS[p], lang)}
          </button>
        ))}
      </div>
      <div className="result-count muted">
        {results.length} {t('results', lang)} · {t('selectHint', lang)}
      </div>
      <ul className="results">
        {results.slice(0, limit).map((w) => (
          <li key={w.id}>
            <button type="button" className="result" onClick={() => onPick(w.id)}>
              <span className="swatch" style={{ background: PERMIT_COLORS[w.p], opacity: w.q === 'stub' ? 0.5 : 1 }} />
              <span className="result-name">{loc(w.n, lang)}</span>
              <span className="result-meta">
                {w.c} · {loc(PERMIT_LABELS[w.p], lang)} · <span className={`qdot q-${w.q}`}>{w.q === 'official' ? '✓' : w.q === 'derived' ? '≈' : '?'}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {results.length > limit && (
        <button type="button" className="link-btn more" onClick={() => setLimit((l) => l + 60)}>
          {t('showMore', lang)} ({results.length - limit})
        </button>
      )}
      <p className="disclaimer">{t('disclaimer', lang)}</p>
    </div>
  )
}
