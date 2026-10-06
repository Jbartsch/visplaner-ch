import type { BorderInfo, CantonInfo, CantonsFile, Lang, SourceDef, Water } from '@/types/water'
import { PERMIT_COLORS, PERMIT_LABELS, PERMIT_WHERE, loc } from '@/types/water'
import { t } from '@/i18n/copy'
import { SITE, linkTarget, reportUrl, waterLinks, waterRule, waterSummary } from '@/lib/water'

type Access = CantonsFile['meta']['access']

/**
 * Permit card → scope & eligibility (border, free angling, SaNa, day tickets) → where to buy → independence note.
 * Eligibility details come BEFORE the hand-off so nobody buys the wrong thing. Server-safe.
 */
export function WaterFacts({ w, c, border, lang, access, source }: { w: Water; c: CantonInfo; border: BorderInfo | null; lang: Lang; access?: Access; source?: SourceDef }) {
  const color = PERMIT_COLORS[w.p]
  const rule = waterRule(w, c)
  const { primary, secondary } = waterLinks(w, c)
  const ext = (u: string) => (u.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })
  const free = w.x?.free && access ? access.free[w.x.free] : undefined
  const ss = w.x?.ss && access ? access.sanaShort[w.x.ss] : undefined
  const lessee = w.p === 'pacht' || w.p === 'private'
  const specific = !!primary[0] && (w.x?.links ?? []).some((l) => l.url === primary[0].url)
  const pdf = specific ? undefined : [...primary, ...secondary].find((l) => l.kind === 'pacht')
  return (
    <>
      <div className="permit-card" style={{ borderColor: color }}>
        <div className="permit-label">{t('permitNeeded', lang)}</div>
        <div className="permit-type" style={{ color: '#0f172a' }}>
          <span className="swatch" style={{ background: color }} />
          {loc(PERMIT_LABELS[w.p], lang)}
        </div>
        <p className="permit-summary">{loc(waterSummary(w, c), lang)}</p>
        {rule.priceHint && rule.permitType === w.p && (
          <p className="price">
            <strong>{t('price', lang)}:</strong> {loc(rule.priceHint, lang)}
          </p>
        )}
      </div>

      {border && (
        <div className="block border-box">
          <h3>🌐 {t('border', lang)}: {loc(border.name, lang)}</h3>
          <p>
            <strong>{t('authority', lang)}:</strong> {loc(border.authority, lang)}
          </p>
          <p>{loc(border.hint, lang)}</p>
          <p className="muted small">
            {border.cantons.join(' · ')}
            {border.countries.length ? ` · ${border.countries.join(' · ')}` : ''}
          </p>
        </div>
      )}

      {free && (
        <div className="block access-box">
          <h3>🎣 {t('freeTitle', lang)}</h3>
          <p>{loc(free.rule, lang)}</p>
          <p className="small">
            {free.sana === 'required' ? t('freeSanaReq', lang) : free.sana === 'not-required' ? t('freeSanaNo', lang) : t('freeSanaUnk', lang)}
          </p>
          <p className="source">
            {t('source', lang)}:{' '}
            <a href={free.url} {...ext(free.url)}>
              {free.label}
            </a>{' '}
            · {t('checked', lang)} {access?.checked}
          </p>
        </div>
      )}

      {w.p !== 'closed' && w.p !== 'freiangel' && (
        <div className="block">
          <h3>{t('sanaTitle', lang)}</h3>
          {ss ? (
            <>
              <p>{loc(ss.note, lang)}</p>
              <p className="source">
                {t('source', lang)}:{' '}
                <a href={ss.url} {...ext(ss.url)}>
                  {ss.label}
                </a>{' '}
                · {t('checked', lang)} {access?.checked}
              </p>
            </>
          ) : (
            <p>
              {t('sanaUnverified', lang)}{' '}
              <a href="https://www.anglerausbildung.ch/" target="_blank" rel="noopener noreferrer">
                {t('sanaLink', lang)}
              </a>
            </p>
          )}
        </div>
      )}

      {w.x?.dayTicket && (
        <div className="block">
          <h3>{t('dayTicket', lang)}</h3>
          <p>
            {t(w.x.dayTicket === 'yes' ? 'yes' : 'no', lang)}{' '}
            <span className="muted small">
              ({t('dayTicketSrc', lang)}
              {source?.vintage ? `, ${loc(source.vintage, lang)}` : ''})
            </span>
          </p>
        </div>
      )}
      {w.x?.conditions && (
        <div className="block">
          <h3>{t('conditions', lang)}</h3>
          <p>{loc(w.x.conditions, lang)}</p>
        </div>
      )}
      {w.x?.notes && (
        <div className="block">
          <h3>{t('notes', lang)}</h3>
          <p>{loc(w.x.notes, lang)}</p>
        </div>
      )}

      <section className="buy" aria-label={t('whereToBuy', lang)}>
        <h3>
          {lessee ? t('findLessee', lang) : t('whereToBuy', lang)} · <span className="muted">{loc(PERMIT_WHERE[w.p], lang)}</span>
        </h3>
        {primary.map((a, i) => (
          <a key={a.url + i} className={i === 0 ? 'buy-btn' : 'buy-btn secondary'} href={a.url} {...ext(a.url)} data-ev="buy_click" data-w={w.id} data-c={w.c} data-t={linkTarget(a)}>
            {lessee && a.kind === 'pacht' ? `${t('findLessee', lang)}: ` : ''}
            {loc(a.label, lang)} →{a.verified === false && <span className="unverified-note"> {t('linkUnchecked', lang)}</span>}
          </a>
        ))}
        {lessee && pdf && /\.pdf($|\?)/i.test(pdf.url) && <p className="tip">{w.x?.revier ? t('pdfTip', lang).replace('{r}', w.x.revier) : t('pdfTipNoRevier', lang)}</p>}
        {primary.length === 0 && w.p !== 'closed' && <p className="muted small">{t('noBuy', lang)}</p>}
        <p className="indep">{t('indep', lang)}</p>
        {secondary.length > 0 && (
          <div className="more-links">
            <span className="muted small">{t('moreLinks', lang)}:</span>
            {secondary.map((a, i) => (
              <a key={a.url + i} className="action-link" href={a.url} {...ext(a.url)} {...(a.kind === 'pacht' || a.kind === 'enquire' || a.kind === 'prices' ? { 'data-ev': 'buy_click', 'data-w': w.id, 'data-c': w.c, 'data-t': linkTarget(a) } : {})}>
                {a.kind === 'enquire' ? '✉ ' : a.kind === 'pacht' ? '👥 ' : 'ⓘ '}
                {loc(a.label, lang)}
                {a.verified === false && <span className="unverified-note"> {t('linkUnchecked', lang)}</span>}
              </a>
            ))}
          </div>
        )}
      </section>
      <p className="small report">
        <a href={reportUrl(`Petripass: ${w.id} (${w.c})`, `${t('reportBody', lang)}\n\n${SITE}/${lang}/gewaesser/${w.slug}\n`)} {...ext(reportUrl('', ''))} data-ev="report_error" data-w={w.id} data-c={w.c}>
          ⚑ {t('reportError', lang)}
        </a>
      </p>
    </>
  )
}
