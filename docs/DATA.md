# Data — Visplaner CH

Output: `public/data/waters.geojson` (built by `scripts/build_data.py`, raw inputs in gitignored `data-raw/`).

## Zürich — official (Kanton Zürich OGD)
- Dataset: *Fischereireviere* (geolion 314) via `https://maps.zh.ch/wfs/OGDZHWFS`
  layers `ogd-0314_giszhpub_fischrevier_stillgewaesser_f`, `…_gewaessernetz_l`, `…_bereiche_f`.
- **Datenstand 2010** (Bonitierung 2009). Pachtperiode 2026–2034 may have changed individual reviers → panel links the current
  *Fischereirevierverzeichnis* (PDF, 22.09.2026) and per-revier *Fischereidatenblatt* PDFs.
- Mapping `pachtverfahren` → permit type:
  | value | type |
  |---|---|
  | Versteigerung, Freihändige Verpachtung | `pacht` |
  | Patentrevier (Limmat 358, Rhein 32) + reviers 1/2/3 (Zürich-, Greifen-, Pfäffikersee) | `patent` |
  | Privatrevier | `private` |
  | Schonrevier | `closed` |
  | Kanton Zug / empty | `unknown` |
- `tageskarten_max` → day-ticket flag; `bemerk_beding` → official reach description.
- Streams: open (not culverted) `Fliessgewässer`/`Kanal` lines merged per revier, simplified 12 m. Ponds ≥ 0.3 ha.

## Bern — derived
- The official vector dataset **ANGFISCH** (geofiles.be.ch, opendata.swiss "Angelfischerei") was **not reachable from the build box**
  (all `*.be.ch` hosts TLS-reset). Instead:
  - Geometry: swisstopo/BAFU **VECTOR25 lakes** and **Gewässernetz 1:2 Mio** via `api3.geo.admin.ch`, clipped to the BE canton polygon (swissBOUNDARIES3D).
  - Regime: official BE patent list (3 big lakes, 6 mountain lakes, 5 reservoirs, 27 rivers — be.ch / BKFV). Listed waters → `patent`
    (`confidence: derived`); other lakes/rivers → `unknown` (likely Pacht/private) or `mixed` (border lakes).
  - Aare split into reaches by position (above Brienzersee, Interlaken, Thun–Bern–Wohlensee, Niederried–Aarberg–Hagneck, Büren–SO/AG).
- In the app the **official ANGFISCH WMS** (patent/pacht/Schongebiete) can be overlaid; served via `/api/be-wms` proxy on Vercel.
- TODO: when ANGFISCH GeoPackage/GeoParquet is reachable (e.g. from CI/Vercel build), replace derived BE data with official polygons/lines incl. Pacht reaches & Schongebiete.

## Buy / enquire links
- ZH: eFJ2 app page, «Fischereipatente beziehen 2026», price list 2026 PDF, Fischereirevierverzeichnis PDF, Fischereidatenblatt PDFs.
- BE: «Fischereipatent beziehen» (online shop entry), «Fischen Bern» app, Patente & Preise, BKFV (Pachtvereinigungen), info.fi@be.ch.
- Prices shown are guides from the cantonal 2026 pages (adults); always check the shop.

## Licences / attribution
- Kanton Zürich OGD (open data). Angelfischerei © Amt für Landwirtschaft und Natur des Kantons Bern. swisstopo / BAFU geodata (open). Basemap © OpenStreetMap contributors.
