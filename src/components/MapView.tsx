'use client'

import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { WaterFC } from '@/data/loadWaters'
import type { Bbox, Canton, PermitType } from '@/types/water'
import { PERMIT_COLORS } from '@/types/water'

type Props = {
  data: WaterFC
  cantons: Canton[]
  types: PermitType[]
  selectedId: string | null
  focus: { bbox: Bbox; seq: number } | null
  overlayBE: boolean
  onSelect: (id: string | null) => void
}

const COLOR: maplibregl.ExpressionSpecification = [
  'match',
  ['get', 'permitType'],
  ...(Object.entries(PERMIT_COLORS).flatMap(([k, v]) => [k, v]) as string[]),
  PERMIT_COLORS.unknown,
] as unknown as maplibregl.ExpressionSpecification

maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

// Official Kanton Bern ANGFISCH WMS, proxied via /api/be-wms (adds CORS + CDN caching)
const BE_WMS = '/api/be-wms?bbox={bbox-epsg-3857}'

const POLY: maplibregl.FilterSpecification = ['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false]
const LINE: maplibregl.FilterSpecification = ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false]

function dataFilter(base: maplibregl.FilterSpecification, cantons: Canton[], types: PermitType[]): maplibregl.FilterSpecification {
  return [
    'all',
    base,
    ['in', ['get', 'canton'], ['literal', cantons]],
    ['in', ['get', 'permitType'], ['literal', types]],
  ] as maplibregl.FilterSpecification
}

export function MapView({ data, cantons, types, selectedId, focus, overlayBE, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const readyRef = useRef(false)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const stateRef = useRef({ cantons, types, selectedId, overlayBE })
  stateRef.current = { cantons, types, selectedId, overlayBE }

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
          bewms: {
            type: 'raster',
            tiles: [BE_WMS],
            tileSize: 256,
            attribution: 'Angelfischerei © Amt für Landwirtschaft und Natur des Kantons Bern',
          },
        },
        layers: [
          { id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.35 } },
          { id: 'be-official', type: 'raster', source: 'bewms', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.85 } },
        ],
      },
      center: [8.05, 46.98],
      zoom: 7.9,
      minZoom: 6.5,
      maxZoom: 16,
      maxBounds: [
        [5.5, 45.6],
        [10.8, 48.1],
      ],
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')
    mapRef.current = map

    map.on('load', () => {
      const flat = {
        type: 'FeatureCollection',
        features: data.features.map((f) => ({
          type: 'Feature',
          geometry: f.geometry,
          properties: {
            id: f.properties.id,
            permitType: f.properties.permitType,
            canton: f.properties.canton,
            name: f.properties.name.de,
          },
        })),
      }
      map.addSource('waters', { type: 'geojson', data: flat as never, tolerance: 0.3 })
      const { cantons: c, types: ty } = stateRef.current
      map.addLayer({
        id: 'waters-highlight',
        type: 'line',
        source: 'waters',
        filter: ['==', ['get', 'id'], '__none__'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#0f172a', 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 5, 13, 13], 'line-opacity': 0.85 },
      })

      map.addLayer({
        id: 'waters-fill',
        type: 'fill',
        source: 'waters',
        filter: dataFilter(POLY, c, ty),
        paint: { 'fill-color': COLOR, 'fill-opacity': 0.42 },
      })
      map.addLayer({
        id: 'waters-outline',
        type: 'line',
        source: 'waters',
        filter: dataFilter(POLY, c, ty),
        paint: { 'line-color': COLOR, 'line-width': 1.6 },
      })
      map.addLayer({
        id: 'waters-line',
        type: 'line',
        source: 'waters',
        filter: dataFilter(LINE, c, ty),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': COLOR,
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1, 10, 2.5, 13, 5],
          'line-opacity': 0.92,
        },
      })
      map.addLayer({
        id: 'waters-hit',
        type: 'line',
        source: 'waters',
        filter: dataFilter(LINE, c, ty),
        paint: { 'line-color': '#000', 'line-opacity': 0, 'line-width': 14 },
      })
      readyRef.current = true
      applyState()

      const hitLayers = ['waters-fill', 'waters-hit']
      map.on('click', (e) => {
        const feats = map.queryRenderedFeatures(
          [
            [e.point.x - 4, e.point.y - 4],
            [e.point.x + 4, e.point.y + 4],
          ],
          { layers: hitLayers },
        )
        // prefer lines (streams) over big lake polygons when both are hit
        const line = feats.find((f) => f.layer.id === 'waters-hit')
        const f = line ?? feats[0]
        onSelectRef.current((f?.properties?.id as string | undefined) ?? null)
      })
      for (const id of hitLayers) {
        map.on('mouseenter', id, () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', id, () => (map.getCanvas().style.cursor = ''))
      }
    })

    function applyState() {
      if (!readyRef.current) return
      const { cantons: c, types: ty, selectedId: sel, overlayBE: ov } = stateRef.current
      map.setFilter('waters-fill', dataFilter(POLY, c, ty))
      map.setFilter('waters-outline', dataFilter(POLY, c, ty))
      map.setFilter('waters-line', dataFilter(LINE, c, ty))
      map.setFilter('waters-hit', dataFilter(LINE, c, ty))
      map.setFilter('waters-highlight', ['==', ['get', 'id'], sel ?? '__none__'])
      map.setLayoutProperty('be-official', 'visibility', ov ? 'visible' : 'none')
      map.setPaintProperty('waters-fill', 'fill-opacity', ov ? 0.15 : 0.42)
    }
    ;(map as unknown as { __apply: () => void }).__apply = applyState

    return () => {
      map.remove()
      mapRef.current = null
      readyRef.current = false
    }
  }, [data])

  useEffect(() => {
    const map = mapRef.current as unknown as { __apply?: () => void } | null
    map?.__apply?.()
  }, [cantons, types, selectedId, overlayBE])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !focus) return
    const [w, s, e, n] = focus.bbox
    map.fitBounds(
      [
        [w, s],
        [e, n],
      ],
      { padding: 60, maxZoom: 13.5, duration: 900 },
    )
  }, [focus])

  return <div className="map" ref={containerRef} />
}
