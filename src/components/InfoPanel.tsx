import type { Lang, WaterProps } from '../types/water'
import { PERMIT_COLORS, PERMIT_LABELS } from '../types/water'
import { t } from '../i18n/copy'

type Props = {
  water: WaterProps | null
  lang: Lang
  onClose: () => void
}

export function InfoPanel({ water, lang, onClose }: Props) {
  if (!water) {
    return (
      <aside className="panel panel-empty">
        <p className="muted">{t('selectHint', lang)}</p>
        <p className="disclaimer">{t('disclaimer', lang)}</p>
      </aside>
    )
  }

  const color = PERMIT_COLORS[water.permitType]
  const permitLabel = PERMIT_LABELS[water.permitType][lang]

  return (
    <aside className="panel">
      <div className="panel-head">
        <div>
          <h2>{water.name[lang]}</h2>
          <div className="meta">
            <span className="pill">{t('canton', lang)} {water.canton}</span>
            <span className="pill mock-pill">MOCK</span>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('close', lang)}>
          ×
        </button>
      </div>

      <div className="permit-card" style={{ borderColor: color }}>
        <div className="permit-label">{t('permitNeeded', lang)}</div>
        <div className="permit-type" style={{ color }}>
          <span className="swatch" style={{ background: color }} />
          {permitLabel}
        </div>
        <p className="permit-summary">{water.permitSummary[lang]}</p>
      </div>

      <a
        className="buy-btn"
        href={water.buyUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {water.buyLabel[lang]} →
      </a>
      <div className="buy-caption">{t('buyCta', lang)}</div>

      {water.speciesHint && (
        <div className="block">
          <h3>{t('species', lang)}</h3>
          <p>{water.speciesHint[lang]}</p>
        </div>
      )}

      {water.notes && (
        <div className="block">
          <h3>{t('notes', lang)}</h3>
          <p>{water.notes[lang]}</p>
        </div>
      )}

      <p className="disclaimer">{t('disclaimer', lang)}</p>
    </aside>
  )
}
