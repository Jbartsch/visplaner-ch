'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { InfoPanel } from './InfoPanel'
import { Legend } from './Legend'

const MapView = dynamic(() => import('./MapView').then((m) => m.MapView), { ssr: false })
import type { Lang, WaterProps } from '@/types/water'
import { t } from '@/i18n/copy'

export function VisplanerApp() {
  const [lang, setLang] = useState<Lang>('de')
  const [selected, setSelected] = useState<WaterProps | null>(null)
  const selectedId = useMemo(() => selected?.id ?? null, [selected])

  return (
    <div className="app">
      <div className="mock-banner">{t('mockBanner', lang)}</div>

      <header className="topbar">
        <div className="brand">
          <strong>{t('title', lang)}</strong>
          <span className="tagline">{t('tagline', lang)}</span>
        </div>
        <div className="topbar-right">
          <span className="scope">{t('scope', lang)}</span>
          <div className="lang-toggle" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === 'de' ? 'active' : ''}
              onClick={() => setLang('de')}
            >
              DE
            </button>
            <button
              type="button"
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="map-wrap">
          <MapView onSelect={setSelected} selectedId={selectedId} />
          <Legend lang={lang} />
        </div>
        <InfoPanel water={selected} lang={lang} onClose={() => setSelected(null)} />
      </main>
    </div>
  )
}
