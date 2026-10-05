'use client'

import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { getWaterById, loadWaters } from '@/data/loadWaters'
import type { WaterProps } from '@/types/water'
import { PERMIT_COLORS } from '@/types/water'

type Props = {
  onSelect: (water: WaterProps | null) => void
  selectedId: string | null
}

const FILL_COLOR: maplibregl.ExpressionSpecification = [
  'match',
  ['get', 'permitType'],
  'patent', PERMIT_COLORS.patent,
  'pacht', PERMIT_COLORS.pacht,
  'freiangel', PERMIT_COLORS.freiangel,
  'mixed', PERMIT_COLORS.mixed,
  PERMIT_COLORS.unknown,
]

export function MapView({ onSelect, selectedId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [8.15, 47.05],
      zoom: 8.1,
      minZoom: 7,
      maxZoom: 14,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map

    map.on('load', async () => {
      const data = await loadWaters()
      // MapLibre stringifies nested props; keep flat fields for styling + id for lookup
      const flat = {
        ...data,
        features: data.features.map((f) => ({
          ...f,
          properties: {
            id: f.properties.id,
            permitType: f.properties.permitType,
            canton: f.properties.canton,
            mock: true,
          },
        })),
      }

      map.addSource('waters', { type: 'geojson', data: flat as never })

      map.addLayer({
        id: 'waters-fill',
        type: 'fill',
        source: 'waters',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': FILL_COLOR, 'fill-opacity': 0.48 },
      })
      map.addLayer({
        id: 'waters-outline',
        type: 'line',
        source: 'waters',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'line-color': FILL_COLOR, 'line-width': 2.2 },
      })
      map.addLayer({
        id: 'waters-line',
        type: 'line',
        source: 'waters',
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: {
          'line-color': FILL_COLOR,
          'line-width': 6,
          'line-opacity': 0.9,
        },
      })
      map.addLayer({
        id: 'waters-highlight',
        type: 'line',
        source: 'waters',
        paint: { 'line-color': '#0f172a', 'line-width': 3.5, 'line-opacity': 0 },
      })

      const pick = (e: maplibregl.MapLayerMouseEvent) => {
        e.originalEvent.stopPropagation()
        const id = e.features?.[0]?.properties?.id as string | undefined
        onSelectRef.current(id ? getWaterById(id) : null)
      }

      for (const id of ['waters-fill', 'waters-line'] as const) {
        map.on('click', id, pick)
        map.on('mouseenter', id, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', id, () => {
          map.getCanvas().style.cursor = ''
        })
      }

      map.on('click', (e: maplibregl.MapMouseEvent) => {
        const feats = map.queryRenderedFeatures(e.point, {
          layers: ['waters-fill', 'waters-line'],
        })
        if (!feats.length) onSelectRef.current(null)
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.getLayer('waters-highlight')) return
    if (selectedId) {
      map.setFilter('waters-highlight', ['==', ['get', 'id'], selectedId])
      map.setPaintProperty('waters-highlight', 'line-opacity', 1)
    } else {
      map.setPaintProperty('waters-highlight', 'line-opacity', 0)
    }
  }, [selectedId])

  return <div className="map" ref={containerRef} />
}
