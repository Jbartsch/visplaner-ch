'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { InfoPanel } from './InfoPanel'
import { Legend } from './Legend'
import { SidePanel } from './SidePanel'
import { AboutStrip } from './AboutStrip'
import { loadAppData, type AppData } from '@/data/loadWaters'
import type { Bbox, Canton, Lang, PermitType } from '@/types/water'
import { CANTON_CODES, LANGS, PERMIT_ORDER } from '@/types/water'
import { borderOf, reportUrl, searchText } from '@/lib/water'
import { t } from '@/i18n/copy'

const MapView = dynamic(() => import('./MapView').then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="map map-loading" />,
})

export function VisplanerApp({ initialLang = 'de' }: { initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [data, setData] = useState<AppData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [canton, setCanton] = useState<Canton | null>(null)
  const [types, setTypes] = useState<PermitType[]>(PERMIT_ORDER)
  const [overlay, setOverlay] = useState(false)
  const [focus, setFocus] = useState<{ bbox: Bbox; seq: number } | null>(null)
  const [detailLoaded, setDetailLoaded] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [freeOnly, setFreeOnly] = useState(false)
  const [noSanaOnly, setNoSanaOnly] = useState(false)

  useEffect(() => {
    loadAppData().then(setData, (e: unknown) => setError(String(e)))
    const params = new URLSearchParams(window.location.search)
    const l = params.get('lang')
    let saved: string | null = null
    try {
      saved = localStorage.getItem('pp-lang')
    } catch {
      /* ignore */
    }
    if (l && (LANGS as string[]).includes(l)) setLang(l as Lang)
    else if (saved && (LANGS as string[]).includes(saved)) setLang(saved as Lang)
    else if (!l && initialLang === 'de') {
      const nl = navigator.language.slice(0, 2)
      if (nl === 'fr' || nl === 'it') setLang(nl)
      else if (nl !== 'de' && nl !== 'gsw') setLang('en')
    }
    const w = params.get('w')
    if (w) setSelectedId(w)
    const c = params.get('canton')?.toUpperCase()
    if (c && (CANTON_CODES as readonly string[]).includes(c)) setCanton(c as Canton)
    if (params.get('free') === '1') setFreeOnly(true)
    if (params.get('nosana') === '1') setNoSanaOnly(true)
  }, [initialLang])

  const byId = useMemo(() => new Map((data?.waters ?? []).map((w) => [w.id, w])), [data])
  const hay = useMemo(() => {
    const m = new Map<string, string>()
    if (data) for (const w of data.waters) m.set(w.id, searchText(w, data.cantons.cantons[w.c]))
    return m
  }, [data])
  const counts = useMemo(() => {
    const c: Partial<Record<PermitType, number>> = {}
    for (const w of data?.waters ?? [])
      if ((!canton || w.c === canton) && (!freeOnly || w.fr === 1) && (!noSanaOnly || w.ns === 1)) c[w.p] = (c[w.p] ?? 0) + 1
    return c
  }, [data, canton, freeOnly, noSanaOnly])

  // deep link focus once data is there
  useEffect(() => {
    if (!data) return
    if (selectedId) {
      const w = byId.get(selectedId)
      if (w) setFocus({ bbox: w.b, seq: 0 })
    } else if (canton) setFocus({ bbox: data.cantons.cantons[canton].bbox, seq: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    const url = new URL(window.location.href)
    const set = (k: string, v: string | null) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k))
    set('w', selectedId)
    set('canton', canton)
    set('lang', lang !== 'de' ? lang : null)
    set('free', freeOnly ? '1' : null)
    set('nosana', noSanaOnly ? '1' : null)
    window.history.replaceState(null, '', url)
    document.documentElement.lang = lang
  }, [selectedId, canton, lang, freeOnly, noSanaOnly])
  const chooseLang = (l: Lang) => {
    setLang(l)
    try {
      localStorage.setItem('pp-lang', l)
    } catch {
      /* ignore */
    }
  }

  const pick = useCallback(
    (id: string) => {
      setSelectedId(id)
      setSheetOpen(true)
      const w = byId.get(id)
      if (w) setFocus((f) => ({ bbox: w.b, seq: (f?.seq ?? 0) + 1 }))
    },
    [byId],
  )
  const chooseCanton = useCallback(
    (c: Canton | null) => {
      setCanton(c)
      setSelectedId(null)
      if (c && data) setFocus((f) => ({ bbox: data.cantons.cantons[c].bbox, seq: (f?.seq ?? 0) + 1 }))
    },
    [data],
  )
  const toggleType = useCallback((p: PermitType) => {
    setTypes((cur) => {
      const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
      return next.length ? next : PERMIT_ORDER
    })
  }, [])

  const selected = selectedId ? byId.get(selectedId) ?? null : null
  const cantonFilter = useMemo(() => (canton ? [canton] : []), [canton])

  return (
    <div className="app">
      <header className="topbar">
        <div className="mock-banner" role="note">
          {t('banner', lang)}
        </div>
        <div className="brand">
          <h1 className="brand-title">
            🎣 {t('title', lang)} <span className="scope">{t('scope', lang)}</span>
          </h1>
          <span className="tagline">{t('tagline', lang)}</span>
        </div>
        <div className="lang-toggle" role="group" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l} type="button" className={lang === l ? 'active' : ''} onClick={() => chooseLang(l)} aria-pressed={lang === l}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      <AboutStrip lang={lang} />
      <main className="main">
        <div className="map-wrap" role="region" aria-label={t('mapLabel', lang)}>
          {data ? (
            <MapView
              cantonInfo={data.cantons.cantons}
              cantons={cantonFilter}
              types={types}
              selectedId={selectedId}
              selectedCanton={selected?.c ?? canton}
              focus={focus}
              overlay={overlay}
              freeOnly={freeOnly}
              noSanaOnly={noSanaOnly}
              onSelect={(id) => (id ? pick(id) : setSelectedId(null))}
              onCanton={(c) => chooseCanton(c)}
              onDetail={setDetailLoaded}
            />
          ) : (
            <div className="map map-loading">{error ?? t('loading', lang)}</div>
          )}
          <Legend lang={lang} types={types} counts={counts} onToggle={toggleType} overlay={overlay} onOverlay={setOverlay} showZoomHint={detailLoaded === 0} />
        </div>
        <aside className={sheetOpen || selected ? 'panel open' : 'panel'}>
          <button type="button" className="sheet-handle" onClick={() => setSheetOpen((o) => !o)} aria-label="toggle panel">
            <span />
          </button>
          {data && selected ? (
            <InfoPanel
              w={selected}
              c={data.cantons.cantons[selected.c]}
              border={borderOf(selected, data.border)}
              source={data.cantons.meta.sources[selected.s]}
              access={data.cantons.meta.access}
              lang={lang}
              onBack={() => setSelectedId(null)}
              onCanton={() => chooseCanton(selected.c)}
            />
          ) : data ? (
            <SidePanel
              lang={lang}
              waters={data.waters}
              hay={hay}
              cantonInfo={data.cantons.cantons}
              order={data.cantons.order}
              query={query}
              onQuery={(q) => {
                setQuery(q)
                setSheetOpen(true)
              }}
              canton={canton}
              onCanton={chooseCanton}
              types={types}
              onToggleType={toggleType}
              onPick={pick}
              freeOnly={freeOnly}
              noSanaOnly={noSanaOnly}
              onFree={setFreeOnly}
              onNoSana={setNoSanaOnly}
            />
          ) : (
            <p className="muted">{error ?? t('loading', lang)}</p>
          )}
        </aside>
      </main>
      <footer className="footer">
        {t('footerData', lang)} · <a href={`/${lang}`}>{t('allCantons', lang)} (FAQ)</a> ·{' '}
        <a href={reportUrl('Petripass: missing/wrong water or canton', t('reportBody', lang))} target="_blank" rel="noopener noreferrer" data-ev="report_missing">
          {t('cantonMissing', lang)}
        </a>
      </footer>
    </div>
  )
}
