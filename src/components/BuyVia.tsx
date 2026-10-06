'use client'

import { useEffect, useState } from 'react'
import type { Lang } from '@/types/water'
import { t } from '@/i18n/copy'

/** Monetization groundwork: stubbed "Buy via Petripass" CTA. No payment, no data sent – interest kept in localStorage only. */
export function BuyVia({ lang, waterId, canton }: { lang: Lang; waterId: string; canton?: string }) {
  const [open, setOpen] = useState(false)
  const [noted, setNoted] = useState(false)
  useEffect(() => {
    setOpen(false)
    try {
      const s = JSON.parse(localStorage.getItem('vp-buyvia-interest') ?? '[]') as string[]
      setNoted(s.includes(waterId))
    } catch {
      setNoted(false)
    }
  }, [waterId])
  const note = () => {
    try {
      const s = new Set(JSON.parse(localStorage.getItem('vp-buyvia-interest') ?? '[]') as string[])
      s.add(waterId)
      localStorage.setItem('vp-buyvia-interest', JSON.stringify([...s]))
    } catch {
      /* ignore */
    }
    setNoted(true)
  }
  return (
    <div className="buyvia">
      <button type="button" className="buy-btn ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open} data-ev={open ? undefined : 'buy_via_petripass_click'} data-w={waterId} data-c={canton}>
        {t('buyVia', lang)} <span className="soon">{t('soon', lang)}</span>
      </button>
      {open && (
        <div className="buyvia-pop" role="status">
          <p>{t('soonText', lang)}</p>
          {noted ? <p className="muted">✓ {t('notified', lang)}</p> : (
            <button type="button" className="link-btn" onClick={note}>
              ☆ {t('notifyMe', lang)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
