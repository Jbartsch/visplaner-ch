import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CF } from '@/data/server'
import { QUALITY_LABELS, loc, type Lang } from '@/types/water'
import { faqLd, isLang, pageMeta } from '@/lib/seo'
import { p } from '@/i18n/pages'
import { t } from '@/i18n/copy'
import { JsonLd, PageShell } from '@/components/PageShell'
import { QualityBadge } from '@/components/Badges'
import { SITE } from '@/lib/water'

type Params = { locale: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLang(locale)) return {}
  return pageMeta(locale, '', `${p('homeTitle', locale)} | Petripass`, p('homeDesc', locale))
}

export default async function LocaleHome({ params }: { params: Promise<Params> }) {
  const { locale } = await params
  if (!isLang(locale)) notFound()
  const lang = locale as Lang
  const tiers = { official: 0, derived: 0, stub: 0 }
  for (const c of Object.values(CF.cantons)) tiers[c.quality]++
  const qa = [
    { q: p('qNational', lang), a: p('aNational', lang) },
    { q: p('qPatentPacht', lang), a: p('aPatentPacht', lang) },
    { q: p('qReliable', lang), a: `${loc(QUALITY_LABELS.official, lang)}: ${tiers.official} · ${loc(QUALITY_LABELS.derived, lang)}: ${tiers.derived} · ${loc(QUALITY_LABELS.stub, lang)}: ${tiers.stub}. ${t('disclaimer', lang)}` },
  ]
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Petripass', url: `${SITE}/${lang}`, inLanguage: lang },
    faqLd(qa),
  ]
  return (
    <PageShell lang={lang} path="">
      <JsonLd data={ld} />
      <h1>{p('homeTitle', lang)}</h1>
      <section className="answer">
        <p>{p('homeAnswer', lang)}</p>
        <p className="start-links">
          <a className="map-cta" href={`/?canton=ZH&lang=${lang}`}>🗺 Zürich</a>{' '}
          <a className="map-cta" href={`/?canton=BE&lang=${lang}`}>🗺 Bern</a>{' '}
          <a className="map-cta secondary" href={`/?lang=${lang}`}>{p('openMapAll', lang)}</a>
        </p>
      </section>
      <section className="card">
        <table className="ctable">
          <thead><tr><th>{p('table', lang)}</th><th>{p('system', lang)}</th><th>{t('quality', lang)}</th></tr></thead>
          <tbody>
            {CF.order.map((code) => {
              const c = CF.cantons[code]
              return (
                <tr key={code}>
                  <td><a href={`/${lang}/kanton/${c.slug}`}><strong>{code}</strong> {loc(c.name, lang)}</a></td>
                  <td className="small">{loc(c.system, lang)}</td>
                  <td><QualityBadge q={c.quality} lang={lang} canton={c.code} /><div className="muted small">{c.count} {t('waters', lang)}</div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
      <section className="card faq">
        <h2>{p('faq', lang)}</h2>
        {qa.map(({ q, a }) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </section>
    </PageShell>
  )
}
