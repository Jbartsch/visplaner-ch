'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { InfoPanel } from './InfoPanel'
import { Legend } from './Legend'
import { SidePanel } from './SidePanel'
import { AboutStrip } from './AboutStrip'
import { buildIndex, loadWaters, type WaterFC } from '@/data/loadWaters'
import type { Bbox, Canton, Lang, PermitType, WaterEntry } from '@/types/water'
import { PERMIT_ORDER } from '@/types/water'
import { t } from '@/i18n/copy'

const MapView = dynamic(() => import('./MapView').then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="map map-loading" />,
})

const LANGS: Lang[] = ['de', 'en', 'fr']

export function VisplanerApp() {
  const [lang, setLang] = useState<Lang>('de')
  const [data, setData] = useState<WaterFC | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [cantons, setCantons] = useState<Canton[]>(['ZH', 'BE'])
  const [types, setTypes] = useState<PermitType[]>(PERMIT_ORDER)
  const [overlayBE, setOverlayBE] = useState(false)
  const [focus, setFocus] = useState<{ bbox: Bbox; seq: number } | null>(null)

  useEffect(() => {
    loadWaters().then(setData, (e: unknown) => setError(String(e)))
    const params = new URLSearchParams(window.location.search)
    const l = params.get('lang')
    if (l && (LANGS as string[]).includes(l)) setLang(l as Lang)
    else if (navigator.language.startsWith('fr')) setLang('fr')
    else if (!navigator.language.startsWith('de')) setLang('en')
    const w = params.get('w')
    if (w) setSelectedId(w)
  }, [])

  const index = useMemo(() => (data ? buildIndex(data) : new Map<string, WaterEntry>()), [data])
  const entries = useMemo(() => [...index.values()], [index])
  const counts = useMemo(() => {
    const c: Partial<Record<PermitType, number>> = {}
    for (const e of entries) if (cantons.includes(e.props.canton)) c[e.props.permitType] = (c[e.props.permitType] ?? 0) + 1
    return c
  }, [entries, cantons])

  // focus a deep-linked water once data is there
  useEffect(() => {
    if (!data || !selectedId) return
    const e = index.get(selectedId)
    if (e) setFocus((f) => f ?? { bbox: e.bbox, seq: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // keep URL shareable
  useEffect(() => {
    const url = new URL(window.location.href)
    if (selectedId) url.searchParams.set('w', selectedId)
    else url.searchParams.delete('w')
    if (lang !== 'de') url.searchParams.set('lang', lang)
    else url.searchParams.delete('lang')
    window.history.replaceState(null, '', url)
    document.documentElement.lang = lang
  }, [selectedId, lang])

  const pick = useCallback(
    (id: string) => {
      setSelectedId(id)
      const e = index.get(id)
      if (e) setFocus((f) => ({ bbox: e.bbox, seq: (f?.seq ?? 0) + 1 }))
    },
    [index],
  )
  const toggleType = useCallback((p: PermitType) => {
    setTypes((cur) => {
      const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
      return next.length ? next : PERMIT_ORDER
    })
  }, [])

  const selected = selectedId ? index.get(selectedId)?.props ?? null : null

  return (
    <div className="app">
      <div className="mock-banner" role="note">
        {t('banner', lang)}
      </div>

      <header className="topbar">
        <div className="brand">
          <strong>
            🎣 {t('title', lang)} <span className="scope">{t('scope', lang)}</span>
          </strong>
          <span className="tagline">{t('tagline', lang)}</span>
        </div>
        <div className="lang-toggle" role="group" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l} type="button" className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <AboutStrip lang={lang} />

      <main className="main">
        <div className="map-wrap">
          {data ? (
            <MapView
              data={data}
              cantons={cantons}
              types={types}
              selectedId={selectedId}
              focus={focus}
              overlayBE={overlayBE}
              onSelect={(id) => (id ? setSelectedId(id) : setSelectedId(null))}
            />
          ) : (
            <div className="map map-loading">{error ?? t('loading', lang)}</div>
          )}
          <Legend lang={lang} types={types} counts={counts} onToggle={toggleType} overlayBE={overlayBE} onOverlay={setOverlayBE} />
        </div>
        <aside className="panel">
          {selected ? (
            <InfoPanel water={selected} lang={lang} onBack={() => setSelectedId(null)} />
          ) : (
            <SidePanel
              lang={lang}
              entries={entries}
              query={query}
              onQuery={setQuery}
              cantons={cantons}
              onCantons={setCantons}
              types={types}
              onToggleType={toggleType}
              onPick={pick}
            />
          )}
        </aside>
      </main>
      <footer className="footer">{t('footerData', lang)}</footer>
    </div>
  )
}
