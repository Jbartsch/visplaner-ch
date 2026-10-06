# Data — Petripass (repo `visplaner-ch`)

All 26 cantons. Coverage per canton: **[docs/COVERAGE.md](COVERAGE.md)** (generated).

## Pipeline
```bash
python3 -m venv .venv && .venv/bin/pip install geopandas shapely pyarrow pyogrio
bash scripts/fetch_data.sh         # ZH OGD WFS (+ legacy BE helper)
bash scripts/fetch_cantons.sh      # official cantonal datasets: SO, SH, VS, LU, SZ, TG (+ others where reachable)
python3 scripts/fetch_ch.py        # CH base: swissBOUNDARIES3D cantons, VECTOR25 lakes, Gewässernetz 1:2 Mio
python3 scripts/fetch_vec25.py     # VECTOR25 river network for cantons without an official dataset (slow, ~10 min)
# BE ANGFISCH (geofiles.be.ch is TLS-reset from the box): run GitHub Action "fetch-geodata",
#   then `gh run download <id> -n geodata-blocked -D data-raw/be_official`
.venv/bin/python scripts/build_all.py
```
`npm run data` chains the reachable steps. Raw inputs live in gitignored `data-raw/`.

### Outputs
| File | Use |
|---|---|
| `src/data/generated/cantons.json` | canton meta: system, links, rules, sources, coverage, quality (SSR and client) |
| `src/data/generated/waters.json` | full water index: id, slug, names, canton, kind, permit, quality, bbox, extras (SSR pages) |
| `src/data/generated/border.json` | border/intercantonal waters: authority, permit hint |
| `public/data/waters-index.json` | slim client index: id, n, c, k, p, q, r, s, b (4 dp), `fr` (1 = sourced Freiangel right), `ns` (1 = possible without SaNa, 0 = SaNa required, absent = unknown), `bd` (border key). 619 KB / 104 KB gzip |
| `public/data/details/XX.json` | per-canton extras (revier, links, notes, day ticket, `free`, `ss`), loaded when a water panel opens |
| `public/data/cantons.json`, `border.json` | client copies. `meta.access` = Freiangel and short-term-SaNa definitions (rule text, official URL, check date). `meta.sources[*].vintage` = data vintage |
| `public/data/overview.geojson` (~400 KB) | big lakes and long rivers, loaded first |
| `public/data/cantons/XX.geojson` | per-canton detail geometry, lazy-loaded at zoom ≥ 8.6 or when a canton is selected |
| `public/data/cantons-shape.geojson` | canton polygons for the coverage choropleth |
| `docs/COVERAGE.md` | coverage matrix |

Geometry is simplified (12 m lines / 8 m polygons for detail; 120–350 m for the overview) and rounded to 5 decimals.

## Access flags (Freiangeln / SaNa)
`scripts/lib/access_cfg.py` holds hand-curated, sourced rules:
- `FREE`: canton plus water-slug regex → Freiangel rule, official URL, SaNa requirement and season.
- `SANA_SHORT`: canton-level statement that short-term permits need no SaNa (or that SaNa is always required), with URL.

Only waters matched by a sourced rule get `fr`/`ns`; everything else stays unknown. `CHECKED` is the verification date. The build fails its sanity gates if the counts collapse (override with `--force`).

## Quality tiers (per water `q`, per canton `quality`)
- **official**: the permit regime for this water comes from an official cantonal geodataset (ZH, BE, SO, VS, plus TG Fischenzen/Verbote and the SH Pacht revier).
- **derived**: the regime is inferred from the canton's published rules (e.g. "all public waters require the cantonal patent", or lake vs. river rules), applied to official or swisstopo geometry.
- **stub**: the regime could not be determined. The panel says so and links the cantonal office.

## Per-canton sources
Configured in `scripts/lib/cantons_cfg.py` (system text, buy/app/price/Pacht links, rules, notes, sources, WMS overlays).
Highlights:
- **ZH**: OGD Fischereireviere (WFS, Datenstand 2010; the current Pacht period may differ, so the Revierverzeichnis PDF is linked).
- **BE**: ANGFISCH GeoParquet (patent lakes/reaches, Pacht reaches with lessee sheets, Schongebiete), fetched via GitHub Actions.
- **SO**: `ch.so.awjf.gewaesser.fischerei` GeoPackage (Patent/Pacht/Privat per revier).
- **VS**: SCPF carte piscicole (ArcGIS FeatureServer: rivers/lakes with regime and conditions).
- **LU**: Fischereireviere (OGD) geometry; regime derived (lakes patent, rivers Pacht).
- **SZ**: Fischgewässer WFS geometry; patent regime derived.
- **SH**: Fischereireviere OGD (Pacht revier) + swisstopo; regime mostly unknown, so **stub**.
- **TG**: Freiangelrecht / Fischenzen / Fischereiverbote WFS + swisstopo.
- **AG**: Fischereireviere only as WMS/order portal, so shown as an official WMS overlay (proxied `/api/wms/ag`); vector regime derived.
- **BE**: ANGFISCH WMS overlay also available (`/api/wms/be`).
- **All others**: swisstopo VECTOR25 lakes + rivers, regime derived from the official cantonal fisheries page.

## Border waters
`BORDER` in `cantons_cfg.py`: Léman (CIPL), Bodensee (IBKF), Untersee/Rhein, Neuchâtel (concordat), Murten, Biel, Lugano, Maggiore,
Zürichsee, Vierwaldstättersee, Zugersee, Walensee, Hallwilersee, Doubs, Hochrhein. Each water carries `x.border`; the panel shows authority + permit hint.

## Blockers
- `*.be.ch` TLS resets from the box → solved via GitHub Actions artifact.
- FR "Pêche à permis" layer on maps.fr.ch → 404 from box; FR derived.
- Several cantonal buy pages (UR, OW, NW, GL, AI, TI) not reachable from the box → links kept, flagged "not verified from build box".
- AG revier vectors only via order portal → WMS overlay.

## Prices, rules, zones, parking (v0.5)
- `scripts/lib/rules_cfg.py` is hand-curated. Each price/rule has a source URL and `CHECKED` date; missing stays missing.
  - Profiles match water ids, id regexes, permit types or kinds.
- `scripts/extract_osm_parking.py` and `scripts/extract_osm_places.py` (pyosmium) run on `data-raw/osm/switzerland.osm.pbf` from https://download.geofabrik.de/europe/switzerland-latest.osm.pbf. Overpass mirrors are unreachable from the box.
- `scripts/build_extras.py` writes:
  - `public/data/rules.json`
  - `public/data/zones.geojson`
  - `public/data/extra/XX.json` (pk = parking, z = zones per water)
  - `src/data/generated/{rules,extra}.json`
  - `docs/COVERAGE-ANSWERS.md`
- WZVV: https://data.geo.admin.ch/ch.bafu.bundesinventare-vogelreservate/ (shapefile LV95). It is labelled as "fishing may be restricted – see Objektblatt", not as a blanket ban.

## Licences / attribution
- Parking: © OpenStreetMap contributors, ODbL (attribution in panel + map).
Cantonal OGD (ZH, BE, SO, VS, LU, SZ, SH, TG, AG) per their terms, swisstopo/BAFU geodata (open), basemap © OpenStreetMap contributors.
Attribution is shown in the map footer and in the per-water source line.
