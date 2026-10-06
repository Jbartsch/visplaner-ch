import type { CantonInfo, Lang, Water } from '@/types/water'
import { PERMIT_LABELS, PERMIT_WHERE, loc } from '@/types/water'
import { t } from '@/i18n/copy'
import { waterLinks, waterRule } from '@/lib/water'
import type { Profile, RulesFile, WaterGeoExtra } from '@/lib/rules'
import { OSM_AS_OF, rulesFor, sideText, sp, val, zoneName } from '@/lib/rules'

export type QA = { q: string; a: string; id: string }

const join = (xs: (string | number | false | undefined | null)[], sep = ' ') => xs.filter(Boolean).join(sep)

export function priceText(pr: Profile['prices'], lang: Lang): string {
  if (!pr) return ''
  const rows = pr.rows.map((r) => {
    const res = sideText(r.res, lang)
    const non = r.non === null ? t('samePrice', lang) : r.non ? sideText(r.non, lang) : t('notInData', lang)
    return `${loc(r.label, lang)}: ${t('resident', lang)} ${res}; ${t('nonResident', lang)} ${non}`
  })
  return `${rows.join(' · ')}.${pr.note ? ' ' + loc(pr.note, lang) : ''} (${t('source', lang)}: ${pr.src.label}${pr.asOf ? `, ${t('asOf', lang)} ${pr.asOf}` : ''})`
}

export function rulesText(r: Profile | null, lang: Lang, cantonCode: string): string {
  if (!r || (!r.closed?.length && !r.sizes?.length)) return `${t('rulesNotCurated', lang)} ${t('rulesCanton', lang)} ${cantonCode}.`
  return join([
    r.closed?.length && `${t('closedTitle', lang)}: ${r.closed.map((x) => `${sp(x.sp, lang)} ${val(x.period, lang).replace(/\.$/, '')}${x.where ? ` (${loc(x.where, lang)})` : ''}`).join('; ')}.`,
    r.sizes?.length && `${t('sizesTitle', lang)}: ${r.sizes.map((x) => `${sp(x.sp, lang)} ${typeof x.cm === 'number' ? x.cm + ' cm' : val(x.cm, lang)}${x.where ? ` (${loc(x.where, lang)})` : ''}`).join('; ')}.`,
    r.night && `${t('nightTitle', lang)}: ${loc(r.night, lang)}`,
    r.guest && `${t('guestTitle', lang)}: ${loc(r.guest, lang)}`,
    r.src?.length && `(${t('source', lang)}: ${r.src.map((s) => s.label).join('; ')})`,
  ])
}

export function catchText(r: Profile | null, lang: Lang): string {
  if (!r?.catch?.length) return `${t('notInData', lang)}.`
  return `${r.catch.map((x) => join([sp(x.sp, lang) + ':', x.day !== undefined && `${val(x.day, lang)} ${t('daily', lang)}${x.year !== undefined ? ',' : ''}`, x.year !== undefined && `${val(x.year, lang)} ${t('yearly', lang)}`])).join(' · ')}.${r.src?.[0] ? ` (${t('source', lang)}: ${r.src.map((s) => s.label).join('; ')})` : ''}`
}

/** The five questions as plain text (FAQ section + FAQPage JSON-LD) for one water. */
export function waterQA(w: Water, c: CantonInfo, lang: Lang, rules: RulesFile, geo: WaterGeoExtra | null, name: string): QA[] {
  const r = rulesFor(w, rules)
  const rule = waterRule(w, c)
  const { primary } = waterLinks(w, c)
  const permit = loc(PERMIT_LABELS[w.p], lang)
  const hint = rule.priceHint && rule.permitType === w.p ? loc(rule.priceHint, lang) : ''
  const where = primary.length ? primary.map((l) => `${loc(l.label, lang)} (${l.url.replace(/^mailto:/, '')})`).join(', ') : loc(PERMIT_WHERE[w.p], lang)
  const pk = geo?.pk ?? []
  const zs = geo?.z ?? []
  const nd = t('notInData', lang)
  return [
    {
      id: 'permit',
      q: `${name}: ${t('qPermit', lang)}`,
      a: w.p === 'closed' ? t('banClosed', lang) : join([`${permit}.`, `${t('toBuy', lang)}: ${where}.`, r?.prices ? priceText(r.prices, lang) : hint ? `${t('price', lang)}: ${hint}` : `${t('price', lang)}: ${nd}.`]),
    },
    {
      id: 'park',
      q: `${name}: ${t('qPark', lang)}`,
      a: pk.length
        ? `${pk.map((p) => `${p.name ?? t('parkUnnamed', lang)}${p.loc ? ', ' + p.loc : ''} (~${p.m} m${p.fee === 'yes' ? ', ' + t('feeYes', lang) : p.fee === 'no' ? ', ' + t('feeNo', lang) : ''})`).join('; ')}. ${t('parkNote', lang).replace('{d}', OSM_AS_OF)}`
        : t('parkNone', lang),
    },
    { id: 'rules', q: `${name}: ${t('qRules', lang)}`, a: join([rulesText(r, lang, c.code), r?.methods?.length && `${t('methodsTitle', lang)}: ${r.methods.map((m) => loc(m, lang)).join(' ')}`, rules.federal.items.map((m) => loc(m, lang)).join(' ')]) },
    { id: 'catch', q: `${name}: ${t('qCatch', lang)}`, a: catchText(r, lang) },
    {
      id: 'ban',
      q: `${name}: ${t('qBan', lang)}`,
      a:
        w.p === 'closed'
          ? t('banClosed', lang)
          : join([
              zs.length && `${zs.map((z) => `${zoneName(z, lang)} (${z.k === 'fish' ? t('zFish', lang) : t('zWzvv', lang)})`).join('; ')}.`,
              r?.zones && loc(r.zones, lang),
              !zs.length && !r?.zones && t('banNone', lang),
            ]),
    },
  ]
}

/** Canton-level five questions (canton landing page). */
export function cantonQA(c: CantonInfo, ws: Water[], lang: Lang, rules: RulesFile, geo: (id: string) => WaterGeoExtra | null, canton: string): QA[] {
  const cr = rules.cantons[c.code]
  const generic = cr?.profiles.find((p) => !p.match.ids && p.prices && (!p.match.p || p.match.p.includes('patent'))) ?? cr?.profiles.find((p) => p.prices)
  const prof: Profile | null = cr ? { ...cr.base, ...(generic ?? {}) } : null
  const buys = c.links.filter((l) => l.kind === 'buy' || l.kind === 'app')
  const withPk = ws.filter((w) => geo(w.id)?.pk?.length).length
  const withZ = ws.filter((w) => geo(w.id)?.z?.length).length
  const closed = ws.filter((w) => w.p === 'closed').length
  const hints = Object.values(c.rules)
    .map((r) => r.priceHint && loc(r.priceHint, lang))
    .filter(Boolean)
  const nd = t('notInData', lang)
  const scope = prof?.label && generic ? ` (${t('appliesTo', lang)}: ${loc(prof.label, lang)})` : ''
  return [
    {
      id: 'permit',
      q: `${canton}: ${t('qPermit', lang)}`,
      a: join([
        buys.length ? `${t('toBuy', lang)}: ${buys.map((l) => `${loc(l.label, lang)} (${l.url})`).join(', ')}.` : '',
        prof?.prices ? priceText(prof.prices, lang) + scope : hints.length ? `${t('price', lang)}: ${hints.join(' · ')}` : `${t('price', lang)}: ${nd}.`,
      ]),
    },
    {
      id: 'park',
      q: `${canton}: ${t('qPark', lang)}`,
      a: `${t('parkCanton', lang).replace('{n}', String(withPk)).replace('{m}', String(ws.length))} ${t('parkNote', lang).replace('{d}', OSM_AS_OF)}`,
    },
    { id: 'rules', q: `${canton}: ${t('qRules', lang)}`, a: join([rulesText(prof, lang, c.code) + scope, loc(c.system, lang), rules.federal.items.map((m) => loc(m, lang)).join(' ')]) },
    { id: 'catch', q: `${canton}: ${t('qCatch', lang)}`, a: catchText(prof, lang) + (prof?.catch?.length ? scope : '') },
    {
      id: 'ban',
      q: `${canton}: ${t('qBan', lang)}`,
      a: join([
        closed ? t('closedCanton', lang).replace('{n}', String(closed)) : '',
        withZ ? t('banCanton', lang).replace('{n}', String(withZ)) : '',
        prof?.zones && loc(prof.zones, lang),
        !closed && !withZ && !prof?.zones && t('banNone', lang),
        t('zoneOverlayNote', lang),
      ]),
    },
  ]
}
