import type { BorderInfo, Canton, CantonsFile, Water, WaterExtra } from '@/types/water'

export type AppData = { cantons: CantonsFile; waters: Water[]; border: Record<string, BorderInfo> }

async function j<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${url} ${r.status}`)
  return r.json() as Promise<T>
}

/** Memoised fetch that forgets failures, so the next call retries (flaky mobile networks). */
function cached<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>): Promise<T> {
  let q = cache.get(key)
  if (!q) {
    q = load().catch((e) => {
      cache.delete(key)
      throw e
    })
    cache.set(key, q)
  }
  return q
}

const appCache = new Map<string, Promise<AppData>>()
export function loadAppData(): Promise<AppData> {
  return cached(appCache, 'app', () =>
    Promise.all([
      j<CantonsFile>('/data/cantons.json'),
      j<{ waters: Water[] }>('/data/waters-index.json'),
      j<Record<string, BorderInfo>>('/data/border.json'),
    ]).then(([cantons, w, border]) => ({ cantons, waters: w.waters.map((x) => ({ ...x, slug: x.id })), border })),
  )
}

type FC = { type: 'FeatureCollection'; features: unknown[] }
const geoCache = new Map<string, Promise<FC>>()
export function loadCantonGeo(c: Canton): Promise<FC> {
  return cached(geoCache, c, () => j<FC>(`/data/cantons/${c}.geojson`))
}
export function loadOverview(): Promise<FC> {
  return cached(geoCache, '__overview', () => j<FC>('/data/overview.geojson'))
}

const detailCache = new Map<string, Promise<Record<string, WaterExtra>>>()
/** Per-canton water extras (links, notes, revier, access keys) – lazy-loaded when a water is opened. */
export function loadDetails(c: Canton): Promise<Record<string, WaterExtra>> {
  return cached(detailCache, c, () => j<Record<string, WaterExtra>>(`/data/details/${c}.json`))
}
