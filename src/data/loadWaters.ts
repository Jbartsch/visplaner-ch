import type { WaterProps } from '../types/water'

type Feature = {
  type: string
  properties: WaterProps
  geometry: unknown
}

type FC = { type: string; features: Feature[] }

let cache: Map<string, WaterProps> | null = null
let raw: FC | null = null

export async function loadWaters(): Promise<FC> {
  if (raw) return raw
  const res = await fetch('/data/waters.geojson')
  raw = (await res.json()) as FC
  cache = new Map(raw.features.map((f) => [f.properties.id, f.properties]))
  return raw
}

export function getWaterById(id: string): WaterProps | null {
  return cache?.get(id) ?? null
}
