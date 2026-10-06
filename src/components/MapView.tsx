'use client'

import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { loadCantonGeo, loadOverview } from '@/data/loadWaters'
import type { Bbox, Canton, CantonInfo, PermitType } from '@/types/water'
import { PERMIT_COLORS } from '@/types/water'

type Props = {
  cantonInfo: Record<Canton, CantonInfo>
  cantons: Canton[] // empty = all
  types: PermitType[]
  selectedId: string | null
  selectedCanton: Canton | null
  focus: { bbox: Bbox; seq: number } | null
  overlay: boolean
  freeOnly: boolean
  noSanaOnly: boolean
  onSelect: (id: string | null) => void
  onCanton: (c: Canton) => void
  onDetail: (loaded: number) => void
}

const COLOR = [
  'match',
  ['get', 'p'],
  ...Object.entries(PERMIT_COLORS).flatMap(([k, v]) => [k, v]),
  PERMIT_COLORS.unknown,
] as unknown as maplibregl.ExpressionSpecification
const OPACITY = ['match', ['get', 'q'], 'stub', 0.5, 0.92] as unknown as maplibregl.ExpressionSpecification
const QCOLOR = ['match', ['get', 'q'], 'official', '#16a34a', 'derived', '#f59e0b', '#9ca3af'] as unknown as maplibregl.ExpressionSpecification

maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

const DETAIL_ZOOM = 8.6
const POLY: maplibregl.FilterSpecification = ['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false]
const LINE: maplibregl.FilterSpecification = ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false]

type Acc = { freeOnly: boolean; noSanaOnly: boolean }
function filt(base: maplibregl.FilterSpecification, cantons: Canton[], types: PermitType[], exclude?: Canton[], acc?: Acc): maplibregl.FilterSpecification {
  const f: unknown[] = ['all', base, ['in', ['get', 'p'], ['literal', types]]]
  if (acc?.freeOnly) f.push(['==', ['get', 'fr'], 1])
  if (acc?.noSanaOnly) f.push(['==', ['get', 'ns'], 1])
  if (cantons.length) f.push(['in', ['get', 'c'], ['literal', cantons]])
  if (exclude?.length) f.push(['!', ['in', ['get', 'c'], ['literal', exclude]]])
  return f as maplibregl.FilterSpecification
}

const intersects = (a: Bbox, b: Bbox) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]

export function MapView(props: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const cb = useRef(props)
  cb.current = props
  const loaded = useRef(new Map<Canton, unknown[]>())
  const pending = useRef(new Set<Canton>())
  const apply = useRef<() => void>(() => {})
  const ensure = useRef<() => void>(() => {})

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
          bewms: { type: 'raster', tiles: ['/api/wms/be?bbox={bbox-epsg-3857}'], tileSize: 256, minzoom: 8, bounds: [6.86, 46.32, 8.46, 47.35], attribution: 'Angelfischerei © Kanton Bern' },
          agwms: { type: 'raster', tiles: ['/api/wms/ag?bbox={bbox-epsg-3857}'], tileSize: 256, minzoom: 8, bounds: [7.71, 47.13, 8.46, 47.63], attribution: 'Fischereireviere © Kanton Aargau' },
        },
        layers: [
          { id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.4 } },
          { id: 'be-official', type: 'raster', source: 'bewms', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.85 } },
          { id: 'ag-official', type: 'raster', source: 'agwms', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.85 } },
        ],
      },
      bounds: [
        [5.96, 45.82],
        [10.49, 47.81],
      ],
      fitBoundsOptions: { padding: 10 },
      minZoom: 6,
      maxZoom: 16,
      maxBounds: [
        [4.8, 45.2],
        [11.6, 48.4],
      ],
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')
    mapRef.current = map

    const empty = { type: 'FeatureCollection', features: [] } as never

    map.on('load', async () => {
      map.addSource('cshape', { type: 'geojson', data: '/data/cantons-shape.geojson' })
      map.addLayer({
        id: 'cshape-fill',
        type: 'fill',
        source: 'cshape',
        paint: { 'fill-color': QCOLOR, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.2, 8.5, 0.08, 10, 0] },
      })
      map.addLayer({ id: 'cshape-line', type: 'line', source: 'cshape', paint: { 'line-color': '#334155', 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.6, 10, 1.4], 'line-opacity': 0.6 } })
      map.addLayer({ id: 'cshape-sel', type: 'line', source: 'cshape', filter: ['==', ['get', 'c'], '__'], paint: { 'line-color': '#0f172a', 'line-width': 3 } })

      for (const src of ['ov', 'dt'] as const) {
        map.addSource(src, { type: 'geojson', data: empty, tolerance: src === 'ov' ? 0.6 : 0.35 })
        map.addLayer({ id: `${src}-fill`, type: 'fill', source: src, filter: POLY, paint: { 'fill-color': COLOR, 'fill-opacity': ['match', ['get', 'q'], 'stub', 0.22, 0.42] } })
        map.addLayer({ id: `${src}-outline`, type: 'line', source: src, filter: POLY, paint: { 'line-color': COLOR, 'line-width': 1.4, 'line-opacity': OPACITY } })
        map.addLayer({
          id: `${src}-line`,
          type: 'line',
          source: src,
          filter: LINE,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': COLOR, 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1, 10, 2.4, 13, 5], 'line-opacity': OPACITY },
        })
        map.addLayer({ id: `${src}-hit`, type: 'line', source: src, filter: LINE, paint: { 'line-color': '#000', 'line-opacity': 0, 'line-width': 14 } })
        map.addLayer({
          id: `${src}-hl`,
          type: 'line',
          source: src,
          filter: ['==', ['get', 'id'], '__none__'],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#0f172a', 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 4, 13, 10], 'line-opacity': 0.75 },
        })
      }
      let ovDone = false
      const loadOv = () =>
        loadOverview()
          .then((fc) => {
            ovDone = true
            ;(map.getSource('ov') as maplibregl.GeoJSONSource).setData(fc as never)
          })
          .catch(() => {})
      loadOv()
      map.on('moveend', () => {
        if (!ovDone) loadOv()
      })
      apply.current()
      ensure.current()

      const hit = ['dt-fill', 'dt-hit', 'ov-fill', 'ov-hit']
      map.on('click', (e) => {
        const feats = map.queryRenderedFeatures(
          [
            [e.point.x - 5, e.point.y - 5],
            [e.point.x + 5, e.point.y + 5],
          ],
          { layers: hit },
        )
        const line = feats.find((f) => f.layer.id.endsWith('-hit'))
        const f = line ?? feats[0]
        if (f) return cb.current.onSelect(f.properties.id as string)
        const c = map.queryRenderedFeatures(e.point, { layers: ['cshape-fill'] })[0]
        if (c && map.getZoom() < DETAIL_ZOOM) cb.current.onCanton(c.properties.c as Canton)
        else cb.current.onSelect(null)
      })
      for (const id of hit) {
        map.on('mouseenter', id, () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', id, () => (map.getCanvas().style.cursor = ''))
      }
      map.on('moveend', () => ensure.current())
    })

    function rebuildDetail() {
      const feats = [...loaded.current.values()].flat()
      ;(map.getSource('dt') as maplibregl.GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features: feats } as never)
      apply.current()
      cb.current.onDetail(loaded.current.size)
    }

    ensure.current = () => {
      if (!map.getSource('dt')) return
      const { cantonInfo, cantons, selectedCanton } = cb.current
      const want = new Set<Canton>()
      if (map.getZoom() >= DETAIL_ZOOM) {
        const b = map.getBounds()
        const view: Bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]
        for (const c of Object.values(cantonInfo)) if (intersects(view, c.bbox)) want.add(c.code)
      }
      if (cantons.length && cantons.length <= 3) cantons.forEach((c) => want.add(c))
      if (selectedCanton) want.add(selectedCanton)
      for (const c of want) {
        if (loaded.current.has(c) || pending.current.has(c)) continue
        pending.current.add(c)
        loadCantonGeo(c)
          .then((fc) => {
            loaded.current.set(c, fc.features)
            rebuildDetail()
          })
          .catch(() => {}) // retried on next moveend
          .finally(() => pending.current.delete(c))
      }
    }

    apply.current = () => {
      if (!map.getLayer('dt-fill')) return
      const { cantons, types, selectedId, overlay, selectedCanton, freeOnly, noSanaOnly } = cb.current
      const acc = { freeOnly, noSanaOnly }
      const ex = [...loaded.current.keys()]
      for (const src of ['ov', 'dt'] as const) {
        const exc = src === 'ov' ? ex : undefined
        map.setFilter(`${src}-fill`, filt(POLY, cantons, types, exc, acc))
        map.setFilter(`${src}-outline`, filt(POLY, cantons, types, exc, acc))
        map.setFilter(`${src}-line`, filt(LINE, cantons, types, exc, acc))
        map.setFilter(`${src}-hit`, filt(LINE, cantons, types, exc, acc))
        map.setFilter(`${src}-hl`, ['==', ['get', 'id'], selectedId ?? '__none__'])
        map.setPaintProperty(`${src}-fill`, 'fill-opacity', overlay ? 0.12 : ['match', ['get', 'q'], 'stub', 0.22, 0.42])
      }
      map.setFilter('cshape-sel', ['in', ['get', 'c'], ['literal', selectedCanton ? [selectedCanton] : cantons.length <= 3 ? cantons : []]])
      map.setLayoutProperty('be-official', 'visibility', overlay ? 'visible' : 'none')
      map.setLayoutProperty('ag-official', 'visibility', overlay ? 'visible' : 'none')
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    apply.current()
    ensure.current()
  }, [props.cantons, props.types, props.selectedId, props.overlay, props.selectedCanton, props.freeOnly, props.noSanaOnly])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !props.focus) return
    const [w, s, e, n] = props.focus.bbox
    map.fitBounds(
      [
        [w, s],
        [e, n],
      ],
      { padding: 50, maxZoom: 13.5, duration: 800 },
    )
  }, [props.focus])

  return <div className="map" ref={containerRef} />
}
