// Proxy for official cantonal fisheries WMS (same-origin tiles + CDN caching). Allow-listed upstreams only.
import { NextRequest } from 'next/server'

const UPSTREAMS: Record<string, { url: string; layers: string; attribution: string }> = {
  // Kanton Bern – Amt für Landwirtschaft und Natur, Geoprodukt ANGFISCH (free use with attribution)
  be: {
    url: 'https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_inlandwaters01_de_ms_wms/MapServer/WMSServer',
    layers: 'ANGFISCH_PACHTFLG_VW_17184,ANGFISCH_PACHTSTG_VW_17185,ANGFISCH_PATFLGEW_VW_17187,ANGFISCH_PATSTGEW_VW_17188,ANGFISCH_SCHONGEB_VW_17189',
    attribution: 'Kanton Bern',
  },
  // Kanton Aargau – Abteilung Wald, Fischereireviere (opendata.swiss "Fischereireviere (Linien)")
  ag: { url: 'https://wms.geo.ag.ch/public/ch_ag_geo_aw_fish/wms', layers: 'ch_ag_geo_aw_fish', attribution: 'Kanton Aargau' },
}

export const runtime = 'nodejs'

const HALF = 20037508.342789244
// Rough Swiss extent in EPSG:3857 (with margin) – rejects arbitrary bboxes that would bloat the CDN cache.
const CH = { minX: 600000, maxX: 1200000, minY: 5650000, maxY: 6150000 }
const NO_STORE = { 'cache-control': 'no-store' }

/** Accept only bboxes that are exactly one XYZ tile (z 7–19) inside Switzerland, so the CDN cache key space stays bounded. */
function tileAligned(b: number[]): boolean {
  const [x0, y0, x1, y1] = b
  const w = x1 - x0
  if (!(w > 0) || Math.abs(y1 - y0 - w) > 1e-3 * w) return false
  const z = Math.round(Math.log2((2 * HALF) / w))
  if (z < 7 || z > 19 || Math.abs((2 * HALF) / 2 ** z - w) > 1e-6 * w + 0.01) return false
  const fx = (x0 + HALF) / w
  const fy = (HALF - y1) / w
  if (Math.abs(fx - Math.round(fx)) > 1e-4 || Math.abs(fy - Math.round(fy)) > 1e-4) return false
  return x1 > CH.minX && x0 < CH.maxX && y1 > CH.minY && y0 < CH.maxY
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const up = UPSTREAMS[id]
  if (!up) return new Response('unknown layer', { status: 404, headers: NO_STORE })
  const parts = (req.nextUrl.searchParams.get('bbox') ?? '').split(',').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n)) || !tileAligned(parts)) return new Response('bad bbox', { status: 400, headers: NO_STORE })
  const qs = new URLSearchParams({
    SERVICE: 'WMS', VERSION: '1.3.0', REQUEST: 'GetMap', FORMAT: 'image/png', TRANSPARENT: 'true', STYLES: '',
    CRS: 'EPSG:3857', WIDTH: '256', HEIGHT: '256', LAYERS: up.layers, BBOX: parts.join(','),
  })
  try {
    const r = await fetch(`${up.url}?${qs}`, { signal: AbortSignal.timeout(15000), cache: 'no-store' })
    const ct = r.headers.get('content-type') ?? ''
    // WMS servers report errors as HTTP 200 + XML ServiceException: never pass those on or cache them.
    if (!r.ok || !ct.startsWith('image/')) {
      console.error(`[wms:${id}] upstream ${r.status} ${ct}`)
      return new Response('upstream error', { status: 502, headers: NO_STORE })
    }
    return new Response(await r.arrayBuffer(), {
      headers: {
        'content-type': ct,
        'cache-control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'x-content-type-options': 'nosniff',
      },
    })
  } catch (e) {
    console.error(`[wms:${id}] fetch failed`, e)
    return new Response('upstream timeout', { status: 504, headers: NO_STORE })
  }
}
