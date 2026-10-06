// Proxy for official cantonal fisheries WMS (adds CORS + CDN caching). Allow-listed upstreams only.
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

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const up = UPSTREAMS[id]
  if (!up) return new Response('unknown layer', { status: 404 })
  const parts = (req.nextUrl.searchParams.get('bbox') ?? '').split(',').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return new Response('bad bbox', { status: 400 })
  const qs = new URLSearchParams({
    SERVICE: 'WMS', VERSION: '1.3.0', REQUEST: 'GetMap', FORMAT: 'image/png', TRANSPARENT: 'true', STYLES: '',
    CRS: 'EPSG:3857', WIDTH: '256', HEIGHT: '256', LAYERS: up.layers, BBOX: parts.join(','),
  })
  try {
    const r = await fetch(`${up.url}?${qs}`, { signal: AbortSignal.timeout(15000) })
    if (!r.ok) return new Response(`upstream ${r.status}`, { status: 502 })
    return new Response(await r.arrayBuffer(), {
      headers: {
        'content-type': r.headers.get('content-type') ?? 'image/png',
        'cache-control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'access-control-allow-origin': '*',
      },
    })
  } catch (e) {
    return new Response(`upstream error: ${String(e)}`, { status: 504 })
  }
}
