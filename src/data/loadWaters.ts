import type { Bbox, WaterEntry, WaterProps } from '@/types/water'

type Geometry = { type: string; coordinates: unknown }
export type WaterFeature = { type: 'Feature'; properties: WaterProps; geometry: Geometry }
export type WaterFC = { type: 'FeatureCollection'; features: WaterFeature[] }

let rawPromise: Promise<WaterFC> | null = null

export function loadWaters(): Promise<WaterFC> {
  rawPromise ??= fetch('/data/waters.geojson').then((r) => {
    if (!r.ok) throw new Error(`waters.geojson ${r.status}`)
    return r.json() as Promise<WaterFC>
  })
  return rawPromise
}

function extend(b: Bbox, c: unknown): void {
  if (Array.isArray(c) && typeof c[0] === 'number') {
    const [x, y] = c as [number, number]
    if (x < b[0]) b[0] = x
    if (y < b[1]) b[1] = y
    if (x > b[2]) b[2] = x
    if (y > b[3]) b[3] = y
  } else if (Array.isArray(c)) {
    for (const cc of c) extend(b, cc)
  }
}

/** One entry per water id (several features may share an id, e.g. a revier's stream + pond). */
export function buildIndex(fc: WaterFC): Map<string, WaterEntry> {
  const idx = new Map<string, WaterEntry>()
  for (const f of fc.features) {
    const id = f.properties.id
    let e = idx.get(id)
    if (!e) {
      e = { props: f.properties, bbox: [Infinity, Infinity, -Infinity, -Infinity] }
      idx.set(id, e)
    }
    extend(e.bbox, f.geometry.coordinates)
  }
  return idx
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
