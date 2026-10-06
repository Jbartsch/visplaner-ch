import cantonsFile from './generated/cantons.json'
import borderFile from './generated/border.json'
import watersFile from './generated/waters.json'
import rulesFile from './generated/rules.json'
import extraFile from './generated/extra.json'
import type { RulesFile, WaterGeoExtra } from '@/lib/rules'
import type { BorderInfo, Canton, CantonInfo, CantonsFile, Water } from '@/types/water'

export const CF = cantonsFile as unknown as CantonsFile
export const BORDER = borderFile as unknown as Record<string, BorderInfo>
export const WATERS = watersFile as unknown as Water[]
export const RULES = rulesFile as unknown as RulesFile
const EXTRA = (extraFile as unknown as { waters: Record<string, WaterGeoExtra> }).waters
export function geoExtra(id: string): WaterGeoExtra | null {
  return EXTRA[id] ?? null
}

const bySlug = new Map(WATERS.map((w) => [w.slug, w]))
const cantonBySlug = new Map(Object.values(CF.cantons).map((c) => [c.slug, c]))

export function getWater(slug: string): Water | undefined {
  return bySlug.get(slug)
}
export function getCantonBySlug(slug: string): CantonInfo | undefined {
  return cantonBySlug.get(slug)
}
export function canton(c: Canton): CantonInfo {
  return CF.cantons[c]
}
export function watersOf(c: Canton): Water[] {
  return WATERS.filter((w) => w.c === c)
}
