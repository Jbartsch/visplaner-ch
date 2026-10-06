import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BORDER, CF, RULES, WATERS, geoExtra, getWater } from '@/data/server'
import { QuickAnswers } from '@/components/QuickAnswers'
import { waterQA } from '@/lib/answers'
import { KIND_LABEL, LANGS, PERMIT_LABELS, PERMIT_WHERE, QUALITY_HELP, loc, qualityLabel, type Lang, type Water } from '@/types/water'
import { borderOf, waterLinks, waterSummary } from '@/lib/water'
import { crumbs, faqLd, isLang, pageMeta } from '@/lib/seo'
import { p } from '@/i18n/pages'
import { t } from '@/i18n/copy'
import { JsonLd, PageShell } from '@/components/PageShell'
import { QualityBadge } from '@/components/Badges'
import { WaterFacts } from '@/components/WaterFacts'
import { SITE } from '@/lib/water'

type Params = { locale: string; slug: string }

// Prerender lakes in all locales; all other waters render on first request and are cached (ISR).
export const dynamicParams = true
export const revalidate = false

export function generateStaticParams(): Params[] {
  return WATERS.filter((w) => w.k === 'lake').flatMap((w) => LANGS.map((locale) => ({ locale, slug: w.slug })))
}

function ctx(params: Params) {
  if (!isLang(params.locale)) return null
  const w = getWater(params.slug)
  if (!w) return null
  return { lang: params.locale as Lang, w, c: CF.cantons[w.c] }
}

function whereText(w: Water, lang: Lang) {
  const c = CF.cantons[w.c]
  const { primary } = waterLinks(w, c)
  return primary.length ? `${p('buyAt', lang)}: ${primary.map((l) => loc(l.label, lang)).join(', ')}` : loc(PERMIT_WHERE[w.p], lang)
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const x = ctx(await params)
  if (!x) return {}
  const { lang, w, c } = x
  const name = loc(w.n, lang)
  return pageMeta(
    lang,
    `/gewaesser/${w.slug}`,
    `${p('waterTitle', lang, { name })} | Petripass`,
    p('waterDesc', lang, { name, canton: loc(c.name, lang), permit: loc(PERMIT_LABELS[w.p], lang), where: whereText(w, lang), quality: qualityLabel(w.q, lang, w.c) }),
  )
}

const LD_TYPE = { lake: 'LakeBodyOfWater', river: 'RiverBodyOfWater', pond: 'Pond', canal: 'Canal', reach: 'BodyOfWater' } as const

export default async function WaterPage({ params }: { params: Promise<Params> }) {
  const x = ctx(await params)
  if (!x) notFound()
  const { lang, w, c } = x
  const name = loc(w.n, lang)
  const cname = loc(c.name, lang)
  const border = borderOf(w, BORDER)
  const { primary } = waterLinks(w, c)
  const src = CF.meta.sources[w.s]
  const permit = loc(PERMIT_LABELS[w.p], lang)
  const summary = loc(waterSummary(w, c), lang)

  const geo = geoExtra(w.id)
  const qa: { q: string; a: string }[] = [
    ...waterQA(w, c, lang, RULES, geo, name),
    {
      q: p('qWhich', lang, { name }),
      a: w.p === 'unknown' ? p('answerStub', lang, { name, canton: cname }) : `${p('answerWater', lang, { name, canton: cname, permit })} ${summary}`,
    },
  ]
  if (border) qa.push({ q: p('qBorder', lang, { name }), a: `${loc(border.name, lang)}: ${loc(border.authority, lang)}. ${loc(border.hint, lang)}` })
  qa.push({ q: p('qReliable', lang), a: p('aReliable', lang, { quality: qualityLabel(w.q, lang, w.c), help: loc(QUALITY_HELP[w.q], lang), source: src?.label ?? '' }) })
  qa.push({ q: p('qCanton', lang, { canton: cname }), a: loc(c.system, lang) })

  const related = WATERS.filter((o) => o.c === w.c && o.id !== w.id && (o.k === 'lake' || o.k === 'river'))
    .sort((a, b) => (a.k === w.k ? 0 : 1) - (b.k === w.k ? 0 : 1) || (a.q === 'stub' ? 1 : 0) - (b.q === 'stub' ? 1 : 0))
    .slice(0, 12)

  const [w0, s0, e0, n0] = w.b
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': LD_TYPE[w.k],
      name,
      url: `${SITE}/${lang}/gewaesser/${w.slug}`,
      description: `${permit}. ${summary}`,
      geo: { '@type': 'GeoShape', box: `${s0} ${w0} ${n0} ${e0}` },
      containedInPlace: { '@type': 'AdministrativeArea', name: `${t('canton', lang)} ${cname}`, url: `${SITE}/${lang}/kanton/${c.slug}` },
    },
    crumbs([
      { name: p('home', lang), url: `/${lang}` },
      { name: cname, url: `/${lang}/kanton/${c.slug}` },
      { name, url: `/${lang}/gewaesser/${w.slug}` },
    ]),
    faqLd(qa),
  ]

  return (
    <PageShell lang={lang} path={`/gewaesser/${w.slug}`}>
      <JsonLd data={ld} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href={`/${lang}`}>{p('home', lang)}</a> › <a href={`/${lang}/kanton/${c.slug}`}>{cname}</a> › {name}
      </nav>
      <div>
        <h1>{p('waterTitle', lang, { name })}</h1>
        <div className="meta" style={{ marginTop: '0.4rem' }}>
          <span className="pill">{t('canton', lang)} {c.code}</span>
          <span className="pill">{loc(KIND_LABEL[w.k], lang)}</span>
          <QualityBadge q={w.q} lang={lang} canton={w.c} long />
        </div>
      </div>
      <QuickAnswers w={w} c={c} lang={lang} rules={RULES} geo={geo} open />
      <section className="answer" aria-label={p('shortAnswer', lang)}>
        <p>
          <strong>{p('shortAnswer', lang)}:</strong>{' '}
          {w.p === 'unknown' ? p('answerStub', lang, { name, canton: cname }) : p('answerWater', lang, { name, canton: cname, permit })}
        </p>
        <p>{summary}</p>
        {primary[0] && (
          <p>
            {p('buyAt', lang)}:{' '}
            <a href={primary[0].url} target="_blank" rel="noopener noreferrer">
              {loc(primary[0].label, lang)}
            </a>
          </p>
        )}
        <p>
          <a className="map-cta" href={`/?w=${encodeURIComponent(w.id)}&lang=${lang}`}>
            🗺 {p('openMap', lang)}
          </a>
        </p>
      </section>
      <section className="card">
        <h2 className="sr-only">{t('permitNeeded', lang)}</h2>
        <WaterFacts w={w} c={c} border={border} lang={lang} access={CF.meta.access} source={src} />
        {src && (
          <p className="source">
            {t('source', lang)}:{' '}
            <a href={src.url} target="_blank" rel="noopener noreferrer">
              {src.label}
            </a>
            {src.vintage && <> · {loc(src.vintage, lang)}</>}
          </p>
        )}
      </section>
      <section className="card faq">
        <h2>{p('faq', lang)}</h2>
        {qa.map(({ q, a }) => (
          <div key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </section>
      {related.length > 0 && (
        <section className="card">
          <h2>{p('sameCanton', lang, { canton: cname })}</h2>
          <ul className="wlist">
            {related.map((o) => (
              <li key={o.id}>
                <a href={`/${lang}/gewaesser/${o.slug}`}>{loc(o.n, lang)}</a> <span className="muted small">· {loc(PERMIT_LABELS[o.p], lang)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  )
}
