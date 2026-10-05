// Proxy for the official Kanton Bern "Angelfischerei" (ANGFISCH) WMS.
// Source: Amt für Landwirtschaft und Natur des Kantons Bern — free use with attribution.
import { NextRequest } from 'next/server'

const UPSTREAM = 'https://www.geoservice.apps.be.ch/geoservice3/services/a42geo/of_inlandwaters01_de_ms_wms/MapServer/WMSServer'
const LAYERS = [
  'ANGFISCH_PACHTFLG_VW_17184',
  'ANGFISCH_PACHTSTG_VW_17185',
  'ANGFISCH_PATFLGEW_VW_17187',
  'ANGFISCH_PATSTGEW_VW_17188',
  'ANGFISCH_SCHONGEB_VW_17189',
].join(',')

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const bbox = req.nextUrl.searchParams.get('bbox') ?? ''
  const parts = bbox.split(',').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    return new Response('bad bbox', { status: 400 })
  }
  const qs = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetMap',
    FORMAT: 'image/png',
    TRANSPARENT: 'true',
    STYLES: '',
    CRS: 'EPSG:3857',
    WIDTH: '256',
    HEIGHT: '256',
    LAYERS,
    BBOX: parts.join(','),
  })
  try {
    const r = await fetch(`${UPSTREAM}?${qs}`, { signal: AbortSignal.timeout(15000) })
    if (!r.ok) return new Response(`upstream ${r.status}`, { status: 502 })
    const body = await r.arrayBuffer()
    return new Response(body, {
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
