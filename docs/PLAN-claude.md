<!-- Generated via OpenRouter anthropic/claude-sonnet-4.6 on 2026-10-05.
     Intended as Claude Code plan, but Claude Code OAuth on the box was expired
     (refreshToken empty); this is the Claude-authored stand-in. -->

# PLAN-claude.md — visplaner-ch Prototype

> **Product**: visplaner-ch — Swiss fishing-waters map prototype for Jonas (via EddA)
> **Reference**: VISplanner.nl (Sportvisserij Nederland)
> **Stack**: Vite + React + TypeScript + MapLibre GL JS + GeoJSON → GitHub Pages
> **Target build time**: ~1–2 hours

---

## 1. Goals & Non-Goals

### Goals ✅

| # | Goal |
|---|------|
| G1 | Fullscreen interactive map of Switzerland centered on major fishing waters |
| G2 | Color-coded water polygons/lines: permitted / restricted / forbidden / unknown |
| G3 | Click-to-open info panel: water name, canton, permit hint, species list, mock patent badge |
| G4 | Persistent **MOCK DATA** banner — prototype is not legal advice |
| G5 | Legend overlay explaining color codes |
| G6 | DE / EN language toggle (FR/IT scaffolded but empty) |
| G7 | Static build deployable to GitHub Pages under `Jbartsch` org/user |
| G8 | Mobile-first responsive layout |

### Non-Goals ❌

| # | Non-Goal |
|---|----------|
| NG1 | Real login / authentication |
| NG2 | Legally binding digital patent / Fischereipatent |
| NG3 | Full national waters database (26 cantons) |
| NG4 | Catch statistics, SaNa certificate flows |
| NG5 | Offline / PWA caching |
| NG6 | Real-time cantonal permit API integration |
| NG7 | GPS location (nice-to-have, explicitly deferred) |

---

## 2. UX Mirror of VISplanner (MVP)

### 2.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [🎣 visplaner.ch]  [DE | EN]              [? Legend]       │  ← Header bar (48px)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   FULLSCREEN MAP                            │
│              (MapLibre GL, CH bounds)                       │
│                                                             │
│  ┌──────────────────────────────┐                          │
│  │  ⚠️  MOCK DATA — prototype   │  ← sticky bottom banner  │
│  │  Not legal advice            │                          │
│  └──────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘

On water click → slide-in panel (right on desktop, bottom sheet on mobile):
┌────────────────────────────────┐
│  Zürichsee                     │
│  Canton: Zürich / St. Gallen   │
│  Status: 🟢 Permitted (mock)   │
│  Species: Hecht, Egli, Forelle │
│  Patent: ZH Fischereipatent    │
│  [→ Kanton ZH Patent kaufen]   │
│  ─────────────────────────────│
│  🏅 Mock Patent Badge          │
│     [DEMO] ZH Jahrespatent     │
│  ─────────────────────────────│
│  ⚠️ Mock data — verify locally │
│                          [✕]   │
└────────────────────────────────┘
```

### 2.2 Color System (VISplanner-inspired, CH-adapted)

| Status | Hex | Fill opacity | Meaning |
|--------|-----|-------------|---------|
| `permitted` | `#2D6A4F` | 0.55 | Fishing allowed with valid patent |
| `restricted` | `#F4A261` | 0.55 | Seasonal / zone restrictions apply |
| `forbidden` | `#E63946` | 0.55 | No fishing / Schongebiet |
| `unknown` | `#ADB5BD` | 0.40 | Status not confirmed (mock) |

Stroke: same hue, 80% darker, width 1.5px. Hover: fill opacity → 0.80.

### 2.3 Legend Panel

Collapsible overlay (bottom-left on desktop, top-right on mobile). Shows four color swatches + labels in active language. Always visible by default on first load.

### 2.4 Mock Patent Badge

Shown in info panel when a water has `permitUrl` defined. Styled card:
- Cantonal coat-of-arms emoji (e.g. 🐟 placeholder)
- "DEMO — [Canton] Fischereipatent"
- External link button to real cantonal patent shop
- Greyed-out "Nicht eingelöst" state (no real auth)

---

## 3. Architecture

### 3.1 Folder Structure

```
visplaner-ch/
├── public/
│   ├── favicon.ico
│   └── data/
│       └── waters.geojson          # all mock water features
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # root: map + panels + header
│   ├── components/
│   │   ├── MapView.tsx             # MapLibre GL wrapper
│   │   ├── InfoPanel.tsx           # slide-in water detail panel
│   │   ├── Legend.tsx              # collapsible legend overlay
│   │   ├── MockBanner.tsx          # sticky MOCK DATA warning
│   │   ├── PatentBadge.tsx         # mock patent card widget
│   │   └── LanguageToggle.tsx      # DE/EN switcher
│   ├── hooks/
│   │   ├── useMapClick.ts          # MapLibre click → feature
│   │   └── useLanguage.ts          # i18n state + helpers
│   ├── i18n/
│   │   ├── de.ts                   # German strings
│   │   └── en.ts                   # English strings
│   ├── types/
│   │   └── water.ts                # WaterFeature, WaterStatus types
│   ├── constants/
│   │   └── colors.ts               # STATUS_COLORS map
│   └── styles/
│       ├── global.css
│       └── components.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── PLAN-claude.md
```

### 3.2 Key Components

#### `App.tsx`
- Holds `selectedFeature` state (null | WaterFeature)
- Holds `lang` state ('de' | 'en')
- Renders: `<MapView>` + `<InfoPanel>` + `<Legend>` + `<MockBanner>` + `<LanguageToggle>`

#### `MapView.tsx`
```
Props: onFeatureClick(feature: WaterFeature) => void
- Initializes MapLibre map, bounds-fit to Switzerland
- Loads waters.geojson as source "waters"
- Adds layer "waters-fill" (fill, color by status)
- Adds layer "waters-stroke" (line)
- Adds layer "waters-hover" (fill, highlight on hover)
- Fires onFeatureClick on map click
```

#### `InfoPanel.tsx`
```
Props: feature: WaterFeature | null, lang: Lang, onClose: () => void
- Slide-in from right (desktop) / slide-up from bottom (mobile)
- Renders name, canton, status badge, species, permit hint
- Renders <PatentBadge> if feature.properties.permitUrl exists
```

#### `types/water.ts`
```typescript
export type WaterStatus = 'permitted' | 'restricted' | 'forbidden' | 'unknown';

export interface WaterProperties {
  id: string;
  name: string;               // primary display name
  name_de: string;
  name_fr?: string;
  canton: string;             // e.g. "ZH / SG"
  cantonCodes: string[];      // ["ZH", "SG"]
  status: WaterStatus;
  statusNote_de?: string;     // e.g. "Schonzeit März–Mai"
  statusNote_en?: string;
  species_de: string[];       // e.g. ["Hecht", "Egli", "Forelle"]
  species_en: string[];
  permitName_de?: string;     // e.g. "ZH Jahres-Fischereipatent"
  permitName_en?: string;
  permitUrl?: string;         // link to cantonal patent shop
  waterType: 'lake' | 'river' | 'reservoir';
  isMock: true;               // always true — compile-time reminder
}

export interface WaterFeature {
  type: 'Feature';
  geometry: GeoJSON.Geometry;
  properties: WaterProperties;
}
```

### 3.3 GeoJSON Data Model

`public/data/waters.geojson` — FeatureCollection of Polygon / MultiPolygon (lakes, reservoirs) and LineString / MultiLineString (rivers). All features carry the full `WaterProperties` schema above.

### 3.4 MapLibre Layer Config

```typescript
// constants/colors.ts
export const STATUS_COLORS: Record<WaterStatus, string> = {
  permitted:  '#2D6A4F',
  restricted: '#F4A261',
  forbidden:  '#E63946',
  unknown:    '#ADB5BD',
};

// MapLibre paint expression
'fill-color': [
  'match', ['get', 'status'],
  'permitted',  '#2D6A4F',
  'restricted', '#F4A261',
  'forbidden',  '#E63946',
  /* default */ '#ADB5BD'
]
```

Base map: **MapTiler Streets** (free tier, good CH coverage) or **OpenFreeMap** (no key needed). Recommended: `https://tiles.openfreemap.org/styles/liberty` — zero API key friction for prototype.

---

## 4. Mock Data Strategy

### 4.1 Waters to Include (12–15 features, representative spread)

#### Lakes (Polygon — simplified bounding shapes, not precise shorelines)

| Name | Canton(s) | Status (mock) | Species (mock) | Permit link |
|------|-----------|---------------|----------------|-------------|
| Zürichsee | ZH / SG | `permitted` | Hecht, Egli, Felchen | zh.ch patent shop |
| Bodensee | TG / SH / SG | `restricted` | Felchen, Barsch, Hecht | tg.ch eFJ |
| Genfersee (Lac Léman) | GE / VD | `restricted` | Perche, Brochet, Omble | ge.ch pêche |
| Vierwaldstättersee | LU / NW / OW / UR | `permitted` | Egli, Hecht, Forelle | lu.ch patent |
| Thunersee | BE | `permitted` | Felchen, Egli, Hecht | be.ch angeln |
| Brienzersee | BE | `permitted` | Felchen, Forelle | be.ch angeln |
| Lago Maggiore | TI | `restricted` | Lavarello, Persico, Luccio | ti.ch pesca |
| Lago di Lugano | TI | `restricted` | Persico, Agone | ti.ch pesca |
| Sihlsee | SZ | `permitted` | Hecht, Egli, Karpfen | sz.ch patent |
| Greifensee | ZH | `permitted` | Hecht, Egli, Karpfen | zh.ch patent |

#### Rivers (LineString — main stem, simplified)

| Name | Canton(s) | Status (mock) | Species (mock) | Permit link |
|------|-----------|---------------|----------------|-------------|
| Aare (Bern reach) | BE | `permitted` | Äsche, Forelle, Barbe | be.ch angeln |
| Rhein (Hochrhein) | SH / ZH / AG | `restricted` | Lachs, Forelle, Äsche | sh.ch patent |
| Reuss (Luzern reach) | LU | `permitted` | Forelle, Äsche | lu.ch patent |
| Rhone (Wallis reach) | VS | `restricted` | Forelle, Äsche | vs.ch pêche |
| Inn (Engadin) | GR | `forbidden` | Forelle (Schongebiet) | gr.ch patent |

### 4.2 Geometry Source

Use simplified GeoJSON coordinates hand-crafted or extracted from:
- **swisstopo WMS** (visual reference only, not copy-paste)
- **Natural Earth** 1:10m lakes layer (free, no attribution issues for prototype)
- **OpenStreetMap** Overpass export for lake polygons (ODbL — add attribution)

For MVP speed: hand-draw ~8-point simplified polygons in [geojson.io](https://geojson.io) for each lake; draw river centerlines as 4–6 point LineStrings. Accuracy ±2km is fine for a prototype.

### 4.3 MOCK DATA Labeling

Every feature has `"isMock": true` in properties. The persistent `MockBanner` component renders at all times. Info panel footer repeats the disclaimer. README and page `<title>` include "PROTOTYPE / MOCK DATA".

---

## 5. Ordered Implementation Steps (~1–2 hours)

### Phase 0 — Scaffold (10 min)

```bash
npm create vite@latest visplaner-ch -- --template react-ts
cd visplaner-ch
npm install maplibre-gl
npm install -D @types/geojson
mkdir -p public/data src/components src/hooks src/i18n src/types src/constants src/styles
```

Add to `index.html`:
```html
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" />
```

Set `vite.config.ts` base to `'/visplaner-ch/'` for GitHub Pages.

### Phase 1 — Types + Constants (5 min)

- Write `src/types/water.ts` (WaterStatus, WaterProperties, WaterFeature)
- Write `src/constants/colors.ts` (STATUS_COLORS)

### Phase 2 — i18n (10 min)

`src/i18n/de.ts`:
```typescript
export const de = {
  appTitle: 'visplaner.ch',
  mockBanner: '⚠️ MOCK-DATEN — Prototyp. Keine Rechtsauskunft.',
  legendTitle: 'Legende',
  status: {
    permitted: 'Erlaubt',
    restricted: 'Eingeschränkt',
    forbidden: 'Verboten',
    unknown: 'Unbekannt',
  },
  panel: {
    canton: 'Kanton',
    species: 'Fischarten',
    permit: 'Patent',
    buyPermit: 'Patent kaufen →',
    mockNote: 'Mock-Daten — vor Ort prüfen',
    close: 'Schliessen',
    badgeLabel: 'DEMO-Patent',
    badgeState: 'Nicht eingelöst',
  },
  legend: { toggle: 'Legende' },
  lang: { de: 'DE', en: 'EN' },
};
```

Mirror structure in `src/i18n/en.ts`.

`src/hooks/useLanguage.ts` — simple `useState<'de'|'en'>('de')` + lookup helper.

### Phase 3 — GeoJSON Mock Data (20 min)

Open [geojson.io](https://geojson.io). Draw polygons for 10 lakes + 5 river lines. For each feature add the full properties object from the table in §4.1. Save as `public/data/waters.geojson`.

Tip: start with Zürichsee (easy rectangle-ish), Bodensee (large), Genfersee (crescent). Rivers: draw 5-point lines along approximate valley paths.

### Phase 4 — MapView Component (20 min)

```typescript
// src/components/MapView.tsx (skeleton)
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { STATUS_COLORS } from '../constants/colors';

export function MapView({ onFeatureClick }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [8.2275, 46.8182],   // Switzerland centroid
      zoom: 7.5,
      maxBounds: [[5.5, 45.5], [11.0, 48.0]],
    });

    map.on('load', () => {
      map.addSource('waters', {
        type: 'geojson',
        data: '/visplaner-ch/data/waters.geojson',
      });

      // Fill layer
      map.addLayer({
        id: 'waters-fill',
        type: 'fill',
        source: 'waters',
        paint: {
          'fill-color': ['match', ['get', 'status'],
            'permitted',  STATUS_COLORS.permitted,
            'restricted', STATUS_COLORS.restricted,
            'forbidden',  STATUS_COLORS.forbidden,
            STATUS_COLORS.unknown],
          'fill-opacity': ['case',
            ['boolean', ['feature-state', 'hover'], false], 0.80, 0.55],
        },
      });

      // Stroke layer
      map.addLayer({
        id: 'waters-stroke',
        type: 'line',
        source: 'waters',
        paint: {
          'line-color': ['match', ['get', 'status'],
            'permitted',  '#1B4332',
            'restricted', '#C77B3A',
            'forbidden',  '#9B1B24',
            '#6C757D'],
          'line-width': 1.5,
        },
      });

      // Hover state
      let hoveredId: string | number | null = null;
      map.on('mousemove', 'waters-fill', (e) => {
        if (e.features?.length) {
          if (hoveredId !== null)
            map.setFeatureState({ source: 'waters', id: hoveredId }, { hover: false });
          hoveredId = e.features[0].id ?? null;
          if (hoveredId !== null)
            map.setFeatureState({ source: 'waters', id: hoveredId }, { hover: true });
          map.getCanvas().style.cursor = 'pointer';
        }
      });
      map.on('mouseleave', 'waters-fill', () => {
        if (hoveredId !== null)
          map.setFeatureState({ source: 'waters', id: hoveredId }, { hover: false });
        hoveredId = null;
        map.getCanvas().style.cursor = '';
      });

      // Click
      map.on('click', 'waters-fill', (e) => {
        if (e.features?.length) onFeatureClick(e.features[0]);
      });
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}
```

### Phase 5 — InfoPanel + PatentBadge (15 min)

`InfoPanel.tsx`: conditional render based on `feature !== null`. Slide-in via CSS transform transition. Show all WaterProperties fields. Render `<PatentBadge>` if `permitUrl` exists.

`PatentBadge.tsx`: styled card with canton name, "DEMO" watermark styling, external link button.

### Phase 6 — Legend + MockBanner + LanguageToggle (10 min)

`Legend.tsx`: absolutely positioned bottom-left div, collapsible with `useState`. Four color swatches.

`MockBanner.tsx`: fixed bottom bar, high z-index, amber background, always visible.

`LanguageToggle.tsx`: two buttons DE/EN in header, updates `lang` state in App.

### Phase 7 — App.tsx Assembly + Styles (10 min)

Wire all components. Add `global.css`:
- `* { box-sizing: border-box; margin: 0; padding: 0; }`
- Map container fills viewport
- Header: `position: fixed; top: 0; width: 100%; z-index: 10; height: 48px;`
- Info panel: `position: fixed; right: 0; top: 48px; width: 360px; height: calc(100vh - 48px);` on desktop; `bottom: 0; width: 100%; height: 60vh;` on mobile via media query
- MockBanner: `position: fixed; bottom: 0; width: 100%; z-index: 20;`

### Phase 8 — Build + Deploy (5 min)

See §6.

---

## 6. Deploy to GitHub Pages

### 6.1 vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/visplaner-ch/',   // matches GitHub Pages repo path
});
```

### 6.2 GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - uses: actions/deploy-pages@v4
        id: deployment
```

### 6.3 Repository Setup

1. Create repo `Jbartsch/visplaner-ch` on GitHub
2. Settings → Pages → Source: **GitHub Actions**
3. Push `main` branch → workflow triggers → live at `https://jbartsch.github.io/visplaner-ch/`

### 6.4 Manual Deploy Alternative (faster for first test)

```bash
npm run build
npx gh-pages -d dist
```

---

## 7. Risks & Open Questions

### 7.1 Legal / Positioning Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Users mistake mock data for real permit status | High | Persistent MockBanner + disclaimer in every info panel + README + page title |
| Cantonal permit links go stale | Low | External links open in new tab; note "verify current URL" in README |
| Border lake international rules misrepresented | Medium | Mark Bodensee, Genfersee, Lago Maggiore as `restricted` + note "intercantonal rules apply" in statusNote |

### 7.2 Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| OpenFreeMap tile availability / rate limits | Medium | Fallback: MapTiler free tier (requires API key in `.env`) or Stadia Maps |
| GeoJSON polygon accuracy looks wrong at high zoom | Low | Add disclaimer "simplified geometry for prototype"; don't zoom past z12 |
| MapLibre hover feature-state requires numeric `id` in GeoJSON | Medium | Add `"id": 1` (integer) to each GeoJSON feature, or use `promoteId: "id"` in source config |
| Mobile bottom sheet overlaps map controls | Low | Add `padding-bottom` to MapLibre map equal to panel height when panel open |

### 7.3 Open Questions for Jonas / EddA

1. **Branding**: Use "visplaner.ch" (one 'n', Swiss spelling) or "visplanner.ch"? Domain registered?
2. **Tile provider**: OK to use OpenFreeMap (no key) or do we want MapTiler for better CH cartography?
3. **Scope creep guard**: GPS location feature — defer to v2 or include if trivial?
4. **FR/IT scaffold**: Should i18n keys for French/Italian be stubbed now (copy of DE) or truly empty?
5. **Real data path**: Which canton(s) should be targeted first for real geodata partnership? (Bern and Fribourg have the most open data.)
6. **SFV involvement**: Has SFV / Schweizerischer Fischerei-Verband been contacted? Their endorsement would change the legal risk profile significantly.
7. **Patent badge interaction**: Should clicking "Patent kaufen" be tracked (analytics) for the demo pitch?

---

## 8. Suggested File Tree (Final)

```
visplaner-ch/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── favicon.ico                  # fishing rod emoji favicon
│   └── data/
│       └── waters.geojson           # 15 mock features, FeatureCollection
├── src/
│   ├── main.tsx                     # ReactDOM.createRoot
│   ├── App.tsx                      # root component, state owner
│   ├── components/
│   │   ├── MapView.tsx              # MapLibre GL, layers, events
│   │   ├── InfoPanel.tsx            # slide-in detail panel
│   │   ├── Legend.tsx               # collapsible color legend
│   │   ├── MockBanner.tsx           # fixed MOCK DATA warning bar
│   │   ├── PatentBadge.tsx          # mock patent card
│   │   └── LanguageToggle.tsx       # DE / EN switcher buttons
│   ├── hooks/
│   │   ├── useMapClick.ts           # encapsulates MapLibre click logic
│   │   └── useLanguage.ts           # lang state + t() helper
│   ├── i18n/
│   │   ├── de.ts                    # all German UI strings
│   │   ├── en.ts                    # all English UI strings
│   │   ├── fr.ts                    # stub (copy of de.ts keys, untranslated)
│   │   └── index.ts                 # re-exports, type Lang = 'de'|'en'|'fr'
│   ├── types/
│   │   └── water.ts                 # WaterStatus, WaterProperties, WaterFeature
│   ├── constants/
│   │   └── colors.ts                # STATUS_COLORS, STROKE_COLORS
│   └── styles/
│       ├── global.css               # reset, layout, map container
│       └── components.css           # panel, legend, banner, badge styles
├── index.html                       # <title>visplaner.ch — PROTOTYPE</title>
├── vite.config.ts                   # base: '/visplaner-ch/'
├── tsconfig.json
├── tsconfig.node.json
├── package.json
├── .gitignore
└── PLAN-claude.md                   # this document
```

---

## Quick-Reference: Key Coordinates

```
Switzerland map center:  [8.2275, 46.8182]
Default zoom:            7.5
Max bounds:              SW [5.5, 45.5]  NE [11.0, 48.0]

Zürichsee approx center: [8.72, 47.23]
Bodensee approx center:  [9.37, 47.60]
Genfersee approx center: [6.55, 46.45]
Lago Maggiore CH part:   [8.72, 46.10]
Brienzersee:             [7.97, 46.72]
Thunersee:               [7.70, 46.68]
```

---

*Document version: 2026-10-05 — Claude Sonnet — for Jonas / EddA — visplaner-ch prototype*