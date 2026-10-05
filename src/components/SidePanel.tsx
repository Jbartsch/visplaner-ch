'use client'

import { useMemo, useState } from 'react'
import type { Canton, Lang, PermitType, WaterEntry } from '@/types/water'
import { PERMIT_COLORS, PERMIT_LABELS, PERMIT_ORDER, loc } from '@/types/water'
import { normalize } from '@/data/loadWaters'
import { t } from '@/i18n/copy'

type Props = {
  lang: Lang
  entries: WaterEntry[]
  query: string
  onQuery: (q: string) => void
  cantons: Canton[]
  onCantons: (c: Canton[]) => void
  types: PermitType[]
  onToggleType: (t: PermitType) => void
  onPick: (id: string) => void
}

const KIND_RANK = { lake: 0, river: 1, canal: 2, reach: 3, pond: 4 } as const
const TYPE_RANK = Object.fromEntries(PERMIT_ORDER.map((p, i) => [p, i])) as Record<PermitType, number>

export function SidePanel({ lang, entries, query, onQuery, cantons, onCantons, types, onToggleType, onPick }: Props) {
  const [limit, setLimit] = useState(40)
  const results = useMemo(() => {
    const q = normalize(query.trim())
    const terms = q.split(/\s+/).filter(Boolean)
    return entries
      .filter((e) => cantons.includes(e.props.canton) && types.includes(e.props.permitType))
      .filter((e) => {
        if (!terms.length) return true
        const hay = normalize(`${e.props.name.de} ${e.props.name.en} ${e.props.search ?? ''}`)
        return terms.every((tm) => hay.includes(tm))
      })
      .sort(
        (a, b) =>
          KIND_RANK[a.props.waterKind] - KIND_RANK[b.props.waterKind] ||
          TYPE_RANK[a.props.permitType] - TYPE_RANK[b.props.permitType] ||
          a.props.name.de.localeCompare(b.props.name.de, 'de'),
      )
  }, [entries, query, cantons, types])

  const cantonOpts: { key: string; value: Canton[] }[] = [
    { key: 'all', value: ['ZH', 'BE'] },
    { key: 'ZH', value: ['ZH'] },
    { key: 'BE', value: ['BE'] },
  ]
  const activeCanton = cantons.length === 2 ? 'all' : cantons[0]

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
      <div className="chips" role="group" aria-label={t('canton', lang)}>
        {cantonOpts.map((o) => (
          <button key={o.key} type="button" className={activeCanton === o.key ? 'chip active' : 'chip'} onClick={() => onCantons(o.value)}>
            {o.key === 'all' ? t('all', lang) : o.key}
          </button>
        ))}
      </div>
      <div className="chips small" role="group" aria-label={t('legendTitle', lang)}>
        {PERMIT_ORDER.filter((p) => p !== 'freiangel').map((p) => (
          <button
            key={p}
            type="button"
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
        {results.slice(0, limit).map((e) => (
          <li key={e.props.id}>
            <button type="button" className="result" onClick={() => onPick(e.props.id)}>
              <span className="swatch" style={{ background: PERMIT_COLORS[e.props.permitType] }} />
              <span className="result-name">{loc(e.props.name, lang)}</span>
              <span className="result-meta">
                {e.props.canton} · {loc(PERMIT_LABELS[e.props.permitType], lang)}
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
