import type { CantonInfo, Lang, Water } from '@/types/water'
import { PERMIT_LABELS, loc } from '@/types/water'
import { t } from '@/i18n/copy'
import { waterLinks, waterRule } from '@/lib/water'
import type { Parking, RulesFile, WaterGeoExtra } from '@/lib/rules'
import { OSM_AS_OF, ZONE_SRC, navUrl, osmUrl, priceShort, rulesFor, sideText, sp, val, zoneDesc, zoneName } from '@/lib/rules'

type Props = {
  w: Water
  c: CantonInfo
  lang: Lang
  rules: RulesFile | null | undefined
  /** undefined = still loading, null = none */
  geo: WaterGeoExtra | null | undefined
  /** expand all rows (SSR water page: crawlable + readable) */
  open?: boolean
  /** open just this row (e.g. ask=park from the landing page) */
  openId?: string
  onParking?: (p: Parking) => void
}

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const

function Src({ label, url, asOf, lang }: { label: string; url: string; asOf?: string; lang: Lang }) {
  return (
    <p className="source">
      {t('source', lang)}:{' '}
      <a href={url} {...ext}>
        {label}
      </a>
      {asOf && (
        <>
          {' '}
          · {t('asOf', lang)} {asOf}
        </>
      )}
    </p>
  )
}

function Row({ id, icon, q, a, open, missing, children }: { id: string; icon: string; q: string; a: string; open?: boolean; missing?: boolean; children: React.ReactNode }) {
  return (
    <details className="qa-row" id={id} open={open}>
      <summary>
        <span className="qa-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="qa-text">
          <span className="qa-q">{q}</span>
          <span className={missing ? 'qa-a missing' : 'qa-a'}>{a}</span>
        </span>
      </summary>
      <div className="qa-body">{children}</div>
    </details>
  )
}

const fee = (f: string | undefined, lang: Lang) => (!f ? '' : f === 'yes' ? t('feeYes', lang) : f === 'no' ? t('feeNo', lang) : f)

/** The five questions anglers ask first – compact answer rows directly under the water name. Server-safe. */
export function QuickAnswers({ w, c, lang, rules, geo, open, openId, onParking }: Props) {
  const o = (id: string) => open || openId === id
  const r = rulesFor(w, rules)
  const nd = t('notInData', lang)
  const loading = t('loadingShort', lang)
  const permit = loc(PERMIT_LABELS[w.p], lang)
  const rule = waterRule(w, c)
  const hint = rule.priceHint && rule.permitType === w.p ? loc(rule.priceHint, lang) : ''
  const { primary } = waterLinks(w, c)
  const closed = w.p === 'closed'

  // 1 permit + price
  const ps = r?.prices ? priceShort(r.prices, lang) : ''
  const permitA = closed ? t('banClosed', lang) : `${permit} · ${ps || (hint ? hint.split(/[.;(]/)[0].slice(0, 60) : `${t('price', lang)}: ${nd}`)}`

  // 3 rules
  const firstClosed = r?.closed?.find((x) => typeof x.period === 'string')
  const firstSize = r?.sizes?.find((x) => typeof x.cm === 'number')
  const rulesA = r?.closed?.length || r?.sizes?.length
    ? [firstClosed && `${t('closedSeason', lang)} ${sp(firstClosed.sp, lang)} ${val(firstClosed.period, lang)}`, firstSize && `${t('minSize', lang)} ${sp(firstSize.sp, lang)} ${firstSize.cm} cm`].filter(Boolean).join(' · ')
    : `${t('rulesFed', lang)} – ${t('details', lang).toLowerCase()}: ${nd}`

  // 4 catch
  const catchA = r?.catch?.length
    ? r.catch
        .slice(0, 3)
        .map((x) => `${sp(x.sp, lang)} ${x.day !== undefined ? val(x.day, lang) + (typeof x.day === 'number' ? t('perDay', lang) : '') : val(x.year, lang) + (typeof x.year === 'number' ? t('perYear', lang) : '')}`)
        .join(' · ')
    : nd

  // 5 zones
  const zs = geo?.z ?? []
  const banA = closed ? t('banClosed', lang) : zs.length ? t('banZones', lang).replace('{n}', String(zs.length)) : r?.zones ? t('banText', lang) : geo === undefined ? loading : t('banNone', lang)

  // 2 parking
  const pk = geo?.pk ?? []
  const parkA = geo === undefined ? loading : pk.length ? `${t('parkCount', lang).replace('{n}', String(pk.length))} · ${pk[0].loc ?? pk[0].name ?? ''} ~${pk[0].m} m` : nd

  const fed = rules?.federal
  return (
    <section className="qa5" aria-label={t('qaTitle', lang)}>
      <Row id="q-permit" icon="🎫" q={t('qPermit', lang)} a={permitA} open={o('permit')} missing={!closed && !ps && !hint}>
        {r?.label && r.scoped && (
          <p className="small muted">
            {t('appliesTo', lang)}: {loc(r.label, lang)}
          </p>
        )}
        {r?.prices ? (
          <>
            <table className="ptable">
              <thead>
                <tr>
                  <th scope="col">{t('priceTitle', lang)}</th>
                  <th scope="col">{t('resident', lang)}</th>
                  <th scope="col">{t('nonResident', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {r.prices.rows.map((row, i) => (
                  <tr key={i}>
                    <th scope="row">
                      {loc(row.label, lang)}
                      {row.note && <span className="muted small"> · {loc(row.note, lang)}</span>}
                    </th>
                    <td>{sideText(row.res, lang)}</td>
                    <td>{row.non === null ? t('samePrice', lang) : row.non ? sideText(row.non, lang) : <span className="missing">{nd}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {r.prices.note && <p className="small">{loc(r.prices.note, lang)}</p>}
            <Src label={r.prices.src.label} url={r.prices.src.url} asOf={`${r.prices.asOf ?? ''} (${t('checked', lang)} ${r.checked})`.trim()} lang={lang} />
          </>
        ) : hint ? (
          <p>
            {t('priceHintOnly', lang)} {hint}
          </p>
        ) : (
          <p className="missing">
            {t('price', lang)}: {nd}
          </p>
        )}
        {!closed && (
          <p>
            <a href="#buy">{t('toBuy', lang)} ↓</a>
            {primary[0] && <span className="muted small"> · {loc(primary[0].label, lang)}</span>}
          </p>
        )}
      </Row>

      <Row id="q-park" icon="🅿️" q={t('qPark', lang)} a={parkA} open={o('park')} missing={geo !== undefined && !pk.length}>
        {pk.length ? (
          <ul className="plist">
            {pk.map((p) => (
              <li key={p.id}>
                {onParking ? (
                  <button type="button" className="link-btn" onClick={() => onParking(p)}>
                    {p.name ?? t('parkUnnamed', lang)}
                    {p.loc ? `, ${p.loc}` : ''}
                  </button>
                ) : (
                  <span>
                    {p.name ?? t('parkUnnamed', lang)}
                    {p.loc ? `, ${p.loc}` : ''}
                  </span>
                )}
                <span className="muted small">
                  {' '}
                  · ~{p.m} m{p.fee ? ` · ${fee(p.fee, lang)}` : ''}
                  {p.cap ? ` · ${p.cap} ${t('spaces', lang)}` : ''} ·{' '}
                  <a href={navUrl(p)} {...ext}>
                    {t('route', lang)}
                  </a>{' '}
                  ·{' '}
                  <a href={osmUrl(p)} {...ext}>
                    OSM
                  </a>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="missing">{geo === undefined ? loading : t('parkNone', lang)}</p>
        )}
        <p className="small muted">{t('parkNote', lang).replace('{d}', OSM_AS_OF)}</p>
      </Row>

      <Row id="q-rules" icon="📋" q={t('qRules', lang)} a={rulesA} open={o('rules')} missing={!r?.closed?.length && !r?.sizes?.length}>
        {r?.label && r.scoped && (r.closed?.length || r.sizes?.length) ? (
          <p className="small muted">
            {t('appliesTo', lang)}: {loc(r.label, lang)}
          </p>
        ) : null}
        {r?.closed?.length || r?.sizes?.length ? (
          <table className="ptable">
            <thead>
              <tr>
                <th scope="col">{t('species', lang)}</th>
                <th scope="col">{t('closedTitle', lang)}</th>
                <th scope="col">{t('sizesTitle', lang)}</th>
              </tr>
            </thead>
            <tbody>
              {[...new Set([...(r.closed ?? []).map((x) => x.sp), ...(r.sizes ?? []).map((x) => x.sp)])].map((k) => {
                const cl = r.closed?.filter((x) => x.sp === k) ?? []
                const sz = r.sizes?.filter((x) => x.sp === k) ?? []
                return (
                  <tr key={k}>
                    <th scope="row">{sp(k, lang)}</th>
                    <td>{cl.length ? cl.map((x) => val(x.period, lang) + (x.where ? ` (${loc(x.where, lang)})` : '')).join('; ') : '–'}</td>
                    <td>{sz.length ? sz.map((x) => (typeof x.cm === 'number' ? `${x.cm} cm` : val(x.cm, lang)) + (x.where ? ` (${loc(x.where, lang)})` : '')).join('; ') : '–'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="missing">{t('rulesNotCurated', lang)}</p>
        )}
        {r?.methods?.length ? (
          <>
            <h4>{t('methodsTitle', lang)}</h4>
            <ul>
              {r.methods.map((m, i) => (
                <li key={i}>{loc(m, lang)}</li>
              ))}
            </ul>
          </>
        ) : null}
        {r?.night && (
          <>
            <h4>{t('nightTitle', lang)}</h4>
            <p>{loc(r.night, lang)}</p>
          </>
        )}
        {r?.guest && (
          <>
            <h4>{t('guestTitle', lang)}</h4>
            <p>{loc(r.guest, lang)}</p>
          </>
        )}
        {(r?.src ?? []).map((s) => (
          <Src key={s.url} label={s.label} url={s.url} asOf={r?.checked ? `${t('checked', lang)} ${r.checked}` : undefined} lang={lang} />
        ))}
        {!r?.src?.length && r?.rulesUrl && <Src label={`${t('rulesCanton', lang)} ${c.code}`} url={r.rulesUrl} lang={lang} />}
        {fed && (
          <>
            <h4>{t('federalTitle', lang)}</h4>
            <ul>
              {fed.items.map((m, i) => (
                <li key={i}>{loc(m, lang)}</li>
              ))}
            </ul>
            <Src label={fed.src[0].label} url={fed.src[0].url} asOf={`${t('checked', lang)} ${rules?.checked}`} lang={lang} />
          </>
        )}
      </Row>

      <Row id="q-catch" icon="🐟" q={t('qCatch', lang)} a={catchA} open={o('catch')} missing={!r?.catch?.length}>
        {r?.catch?.length ? (
          <>
            <table className="ptable">
              <thead>
                <tr>
                  <th scope="col">{t('species', lang)}</th>
                  <th scope="col">{t('daily', lang)}</th>
                  <th scope="col">{t('yearly', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {r.catch.map((x, i) => (
                  <tr key={i}>
                    <th scope="row">
                      {sp(x.sp, lang)}
                      {x.note && <span className="muted small"> · {loc(x.note, lang)}</span>}
                    </th>
                    <td>{x.day !== undefined ? val(x.day, lang) : '–'}</td>
                    <td>{x.year !== undefined ? val(x.year, lang) : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(r.src ?? []).slice(0, 2).map((s) => (
              <Src key={s.url} label={s.label} url={s.url} asOf={`${t('checked', lang)} ${r.checked}`} lang={lang} />
            ))}
          </>
        ) : (
          <p className="missing">
            {t('qCatch', lang)} – {nd}.
            {r?.rulesUrl && (
              <>
                {' '}
                <a href={r.rulesUrl} {...ext}>
                  {t('rulesCanton', lang)} {c.code} →
                </a>
              </>
            )}
          </p>
        )}
      </Row>

      <Row id="q-ban" icon="🚫" q={t('qBan', lang)} a={banA} open={o('ban')} missing={!closed && !zs.length && !r?.zones}>
        {closed && <p>{t('banClosed', lang)}</p>}
        {zs.length > 0 && (
          <ul className="zlist">
            {zs.map((z, i) => (
              <li key={i}>
                <span className={`zsw ${z.k}`} aria-hidden="true" /> <strong>{zoneName(z, lang)}</strong> <span className="muted small">· {z.k === 'fish' ? t('zFish', lang) : t('zWzvv', lang)}</span>
                {zoneDesc(z, lang) && <div className="small">{zoneDesc(z, lang)}</div>}
                {z.u && (
                  <div className="small">
                    <a href={z.u} {...ext}>
                      {z.k === 'wzvv' ? 'Objektblatt (PDF)' : t('details', lang)} →
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {r?.zones && <p>{loc(r.zones, lang)}</p>}
        {!closed && !zs.length && !r?.zones && <p className="missing">{t('banNone', lang)}</p>}
        {[...new Set(zs.map((z) => z.s))].map((k) => (
          <Src key={k} label={ZONE_SRC[k]?.label ?? k} url={ZONE_SRC[k]?.url ?? ''} asOf={`${t('checked', lang)} ${rules?.checked ?? ''}`} lang={lang} />
        ))}
        <p className="small muted">{t('zoneOverlayNote', lang)}</p>
      </Row>
    </section>
  )
}

