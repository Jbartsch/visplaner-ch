import type { Lang } from '@/types/water'
import { LANGS } from '@/types/water'
import { t } from '@/i18n/copy'
import { p } from '@/i18n/pages'
import { reportUrl } from '@/lib/water'

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

/** Static page frame: language switch (same path), prominent disclaimer top + bottom. `path` excludes the locale prefix. */
export function PageShell({ lang, path, children }: { lang: Lang; path: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <header className="page-top">
        <a href={`/${lang}`}>🎣 Petripass</a>
        <span className="page-tag">{t('tagline', lang)}</span>
        <nav aria-label="Language">
          {LANGS.map((l) => (
            <a key={l} href={`/${l}${path}`} hrefLang={l} aria-current={l === lang ? 'page' : undefined}>
              {l.toUpperCase()}
            </a>
          ))}
        </nav>
      </header>
      <div className="mock-banner" role="note">
        {t('banner', lang)}
      </div>
      <main className="page-main">
        {children}
        <p className="disclaimer">{t('disclaimer', lang)}</p>
        <p className="source">
          <a href={`/?lang=${lang}`}>{p('openMapAll', lang)} →</a> · {t('footerData', lang)} ·{' '}
          <a href={reportUrl('Petripass: missing/wrong water or canton', t('reportBody', lang))} target="_blank" rel="noopener noreferrer">
            {t('cantonMissing', lang)}
          </a>
        </p>
      </main>
    </div>
  )
}
