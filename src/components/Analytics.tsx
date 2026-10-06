'use client'

import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { track } from '@vercel/analytics'

type Props = Record<string, string>
const clean = (o: Record<string, string | null | undefined>): Props =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== '')) as Props

/**
 * Vercel Web Analytics (cookieless, no banner needed) + custom events:
 * - landing: on load with ?w= deep link and/or utm_* params
 * - any element with data-ev="buy_click" | "buy_via_petripass_click" | … (props from data-w / data-c / data-t)
 * Custom events need a Vercel Pro/Enterprise plan to show up in the dashboard; on Hobby they are dropped server-side.
 */
export function PetripassAnalytics() {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const props = clean({
      water: q.get('w'),
      canton: q.get('canton'),
      utm_source: q.get('utm_source'),
      utm_medium: q.get('utm_medium'),
      utm_campaign: q.get('utm_campaign'),
      path: window.location.pathname,
    })
    if (props.water || props.utm_source || props.utm_campaign) track('landing', props)
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-ev]') as HTMLElement | null
      if (!el?.dataset.ev) return
      track(el.dataset.ev, clean({ water: el.dataset.w, canton: el.dataset.c, target: el.dataset.t }))
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
  return <Analytics />
}
