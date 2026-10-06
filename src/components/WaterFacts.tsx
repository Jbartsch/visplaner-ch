import type { BorderInfo, CantonInfo, Lang, Water } from '@/types/water'
import { PERMIT_COLORS, PERMIT_LABELS, PERMIT_WHERE, loc } from '@/types/water'
import { t } from '@/i18n/copy'
import { waterLinks, waterRule, waterSummary } from '@/lib/water'
import { BuyVia } from './BuyVia'

/** Permit card + buy links + border info + notes. Server-safe (BuyVia is a client island). */
export function WaterFacts({ w, c, border, lang }: { w: Water; c: CantonInfo; border: BorderInfo | null; lang: Lang }) {
  const color = PERMIT_COLORS[w.p]
  const rule = waterRule(w, c)
  const { primary, secondary } = waterLinks(w, c)
  const ext = (u: string) => (u.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })
  return (
    <>
      <div className="permit-card" style={{ borderColor: color }}>
        <div className="permit-label">{t('permitNeeded', lang)}</div>
        <div className="permit-type" style={{ color }}>
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

      <section className="buy">
        <h3>
          {t('whereToBuy', lang)} · <span className="muted">{loc(PERMIT_WHERE[w.p], lang)}</span>
        </h3>
        {primary.map((a, i) => (
          <a key={a.url + i} className={i === 0 ? 'buy-btn' : 'buy-btn secondary'} href={a.url} {...ext(a.url)}>
            {loc(a.label, lang)} →{a.verified === false && <span className="unverified" title={t('unverified', lang)}> *</span>}
          </a>
        ))}
        {primary.length === 0 && w.p !== 'closed' && <p className="muted small">{t('noBuy', lang)}</p>}
        {(w.p === 'patent' || w.p === 'mixed') && primary.length > 0 && <BuyVia lang={lang} waterId={w.id} />}
        {secondary.length > 0 && (
          <div className="more-links">
            <span className="muted small">{t('moreLinks', lang)}:</span>
            {secondary.map((a, i) => (
              <a key={a.url + i} className="action-link" href={a.url} {...ext(a.url)}>
                {a.kind === 'enquire' ? '✉ ' : a.kind === 'pacht' ? '👥 ' : 'ⓘ '}
                {loc(a.label, lang)}
                {a.verified === false && <span className="unverified" title={t('unverified', lang)}> *</span>}
              </a>
            ))}
          </div>
        )}
      </section>

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

      {w.x?.dayTicket && (
        <div className="block">
          <h3>{t('dayTicket', lang)}</h3>
          <p>{t(w.x.dayTicket === 'yes' ? 'yes' : 'no', lang)}</p>
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
      {w.p !== 'closed' && w.p !== 'freiangel' && (
        <div className="block">
          <h3>{t('sanaTitle', lang)}</h3>
          <p>
            {t('sanaText', lang)}{' '}
            <a href="https://www.anglerausbildung.ch/" target="_blank" rel="noopener noreferrer">
              {t('sanaLink', lang)}
            </a>
          </p>
        </div>
      )}
    </>
  )
}
