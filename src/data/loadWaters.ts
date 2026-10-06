import type { BorderInfo, Canton, CantonsFile, Water } from '@/types/water'

export type AppData = { cantons: CantonsFile; waters: Water[]; border: Record<string, BorderInfo> }

let p: Promise<AppData> | null = null

async function j<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${url} ${r.status}`)
  return r.json() as Promise<T>
}

export function loadAppData(): Promise<AppData> {
  p ??= Promise.all([
    j<CantonsFile>('/data/cantons.json'),
    j<{ waters: Water[] }>('/data/waters-index.json'),
    j<Record<string, BorderInfo>>('/data/border.json'),
  ]).then(([cantons, w, border]) => ({ cantons, waters: w.waters, border }))
  return p
}

type FC = { type: 'FeatureCollection'; features: unknown[] }
const cantonCache = new Map<Canton, Promise<FC>>()
export function loadCantonGeo(c: Canton): Promise<FC> {
  let q = cantonCache.get(c)
  if (!q) {
    q = j<FC>(`/data/cantons/${c}.geojson`)
    cantonCache.set(c, q)
  }
  return q
}
export function loadOverview(): Promise<FC> {
  return j<FC>('/data/overview.geojson')
}
