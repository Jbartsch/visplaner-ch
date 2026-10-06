import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BORDER, CF, getCantonBySlug, watersOf } from '@/data/server'
import { LANGS, PERMIT_COLORS, PERMIT_LABELS, PERMIT_ORDER, QUALITY_HELP, loc, qualityLabel, type Lang } from '@/types/water'
import { crumbs, faqLd, isLang, pageMeta } from '@/lib/seo'
import { p } from '@/i18n/pages'
import { t } from '@/i18n/copy'
import { JsonLd, PageShell } from '@/components/PageShell'
import { QualityBadge } from '@/components/Badges'
import { SITE } from '@/lib/water'

type Params = { locale: string; slug: string }
export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return Object.values(CF.cantons).flatMap((c) => LANGS.map((locale) => ({ locale, slug: c.slug })))
}

function ctx(params: Params) {
  if (!isLang(params.locale)) return null
  const c = getCantonBySlug(params.slug)
  return c ? { lang: params.locale as Lang, c } : null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const x = ctx(await params)
  if (!x) return {}
  const { lang, c } = x
  const canton = loc(c.name, lang)
  return pageMeta(lang, `/kanton/${c.slug}`, `${p('cantonTitle', lang, { canton })} | Petripass`,
    p('cantonDesc', lang, { canton, system: loc(c.system, lang), n: String(c.count), quality: qualityLabel(c.quality, lang, c.code) }))
}

const KRANK = { lake: 0, river: 1, canal: 2, pond: 3, reach: 4 } as const
const MAX_LIST = 200

export default async function CantonPage({ params }: { params: Promise<Params> }) {
  const x = ctx(await params)
  if (!x) notFound()
  const { lang, c } = x
  const canton = loc(c.name, lang)
  const ws = watersOf(c.code).sort((a, b) => KRANK[a.k] - KRANK[b.k] || (a.q === 'stub' ? 1 : 0) - (b.q === 'stub' ? 1 : 0) || loc(a.n, lang).localeCompare(loc(b.n, lang), lang))
  const buys = c.links.filter((l) => l.kind === 'buy' || l.kind === 'app')
  const pacht = c.links.filter((l) => l.kind === 'pacht' || l.kind === 'enquire')
  const borders = Object.values(BORDER).filter((b) => b.cantons.includes(c.code))
  const free = ws.filter((w) => w.p === 'freiangel' || w.r === 'tg_shore').length
  const linkTxt = (ls: typeof c.links) => ls.map((l) => `${loc(l.label, lang)}: ${l.url.replace(/^mailto:/, '')}`).join(' · ')

  const qa = [
    { q: p('qCanton', lang, { canton }), a: `${loc(c.system, lang)}${c.quality === 'stub' ? ' ' + t('stubCanton', lang) : ''}` },
    { q: p('qWhereCanton', lang, { canton }), a: [linkTxt(buys), linkTxt(pacht)].filter(Boolean).join(' · ') || linkTxt(c.links) },
    { q: p('qFree', lang, { canton }), a: free ? p('aFreeYes', lang, { n: String(free), canton }) : p('aFreeNo', lang, { canton }) },
    { q: p('qReliable', lang), a: p('aReliable', lang, { quality: qualityLabel(c.quality, lang, c.code), help: loc(QUALITY_HELP[c.quality], lang), source: c.sources.map((s) => s.label).join('; ') }) },
  ]
  const ld = [
    { '@context': 'https://schema.org', '@type': 'AdministrativeArea', name: `${t('canton', lang)} ${canton}`, url: `${SITE}/${lang}/kanton/${c.slug}`, containedInPlace: { '@type': 'Country', name: 'Switzerland' } },
    crumbs([{ name: p('home', lang), url: `/${lang}` }, { name: canton, url: `/${lang}/kanton/${c.slug}` }]),
    faqLd(qa),
  ]

  return (
    <PageShell lang={lang} path={`/kanton/${c.slug}`}>
      <JsonLd data={ld} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href={`/${lang}`}>{p('home', lang)}</a> › {canton}
      </nav>
      <div>
        <h1>{p('cantonTitle', lang, { canton })}</h1>
        <div className="meta" style={{ marginTop: '0.4rem' }}>
          <span className="pill">{c.code}</span>
          <QualityBadge q={c.quality} lang={lang} canton={c.code} long />
        </div>
      </div>
      <section className="answer">
        <p>
          <strong>{p('shortAnswer', lang)}:</strong> {loc(c.system, lang)}
        </p>
        {c.quality === 'stub' && <p className="stub-note">⚠ {t('stubCanton', lang)}</p>}
        {buys[0] && (
          <p>
            {p('buyAt', lang)}:{' '}
            {buys.map((l, i) => (
              <span key={l.url}>
                {i > 0 && ' · '}
                <a href={l.url} target="_blank" rel="noopener noreferrer">{loc(l.label, lang)}</a>
              </span>
            ))}
          </p>
        )}
        <p>
          <a className="map-cta" href={`/?canton=${c.code}&lang=${lang}`}>🗺 {p('openMap', lang)}</a>
        </p>
      </section>

      <section className="card">
        <h2>{t('whereToBuy', lang)}</h2>
        <ul>
          {c.links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target={l.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">{loc(l.label, lang)}</a>
              {l.verified === false && <span className="unverified small"> * {t('unverified', lang)}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>{p('coverageTitle', lang)}</h2>
        <table className="ctable">
          <tbody>
            <tr><th>{t('quality', lang)}</th><td><QualityBadge q={c.quality} lang={lang} canton={c.code} /> · ◉ {c.byQuality.official ?? 0} · ≈ {c.byQuality.derived ?? 0} · ? {c.byQuality.stub ?? 0} ({c.count} {t('waters', lang)})</td></tr>
            <tr><th>{t('legendTitle', lang)}</th><td>{PERMIT_ORDER.filter((k) => c.byPermit[k]).map((k) => (
              <span key={k} style={{ marginRight: '0.6rem', whiteSpace: 'nowrap' }}><span className="swatch" style={{ background: PERMIT_COLORS[k] }} /> {loc(PERMIT_LABELS[k], lang)} {c.byPermit[k]}</span>
            ))}</td></tr>
            <tr><th>{p('geometry', lang)}</th><td>{c.coverage.geometry}</td></tr>
            <tr><th>{p('rules', lang)}</th><td>{c.coverage.rules}</td></tr>
            <tr><th>{p('buyLinks', lang)}</th><td>{c.coverage.buy}</td></tr>
            <tr><th>{t('source', lang)}</th><td>{c.sources.map((s) => (<div key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></div>))}</td></tr>
            {c.notes && <tr><th>{t('notes', lang)}</th><td>{loc(c.notes, lang)}</td></tr>}
          </tbody>
        </table>
      </section>

      {borders.length > 0 && (
        <section className="card">
          <h2>{p('borderIn', lang)}</h2>
          {borders.map((b) => (
            <div key={b.key} className="border-box">
              <strong>{loc(b.name, lang)}</strong> – {loc(b.authority, lang)}
              <p className="small">{loc(b.hint, lang)}</p>
            </div>
          ))}
        </section>
      )}

      <section className="card faq">
        <h2>{p('faq', lang)}</h2>
        {qa.map(({ q, a }) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </section>

      <section className="card">
        <h2>{p('watersIn', lang, { canton })}</h2>
        <ul className="wlist">
          {ws.slice(0, MAX_LIST).map((w) => (
            <li key={w.id}>
              <a href={`/${lang}/gewaesser/${w.slug}`}>{loc(w.n, lang)}</a>{' '}
              <span className="muted small">· {loc(PERMIT_LABELS[w.p], lang)}{w.q === 'stub' ? ' · ?' : ''}</span>
            </li>
          ))}
        </ul>
        {ws.length > MAX_LIST && <p className="muted small">{p('moreWaters', lang, { n: String(ws.length - MAX_LIST) })}</p>}
      </section>
    </PageShell>
  )
}
