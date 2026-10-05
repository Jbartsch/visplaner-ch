'use client'

import { useEffect, useState } from 'react'
import type { Lang } from '@/types/water'
import { t } from '@/i18n/copy'

export function AboutStrip({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(true)
  useEffect(() => {
    if (localStorage.getItem('vp-about-hidden') === '1') setOpen(false)
  }, [])
  if (!open) return null
  return (
    <section className="about" aria-label={t('aboutTitle', lang)}>
      <strong className="about-title">{t('aboutTitle', lang)}</strong>
      <span>① {t('about1', lang)}</span>
      <span>② {t('about2', lang)}</span>
      <span>③ {t('about3', lang)}</span>
      <button
        type="button"
        className="link-btn about-hide"
        onClick={() => {
          localStorage.setItem('vp-about-hidden', '1')
          setOpen(false)
        }}
      >
        {t('hide', lang)} ✕
      </button>
    </section>
  )
}
