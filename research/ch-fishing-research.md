# Switzerland fishing — research notes (2026-10-05)

## Legal / permit model (≠ Netherlands)
- **Cantonal sovereignty**: each of 26 cantons issues its own Fischereipatent / carte de pêche / patente.
- No national equivalent of the Dutch VISpas covering ~80% of waters.
- **SaNa** (Sachkundenachweis Angelfischerei) often required for annual patents; day tickets sometimes exempt.
- **Border lakes** (Geneva, Constance, Maggiore, Lugano) add international / intercantonal rules.
- SFV / Swiss Fishing Federation (Schweizerischer Fischerei-Verband) is the national association — advocacy, not a unified permit issuer.

## Buying patents
- Per-canton webshops / apps: eFJ (TG, SZ, SO…), Uri fischereipatente.ur.ch, Valais FCVPA, etc.
- Day / week / year patents; prices vary heavily by resident vs non-resident.
- Digital patents via apps increasingly common (eFJ Mobile, cantonal apps).

## Open geodata (public vs mock-needed)
### Available (cantonal / thematic — fragmented)
- **Fribourg**: Pêche à permis — permit waters, permanent & temporary reserves (maps.fr.ch / opendata.swiss).
- **Bern**: Angelfischerei — Patent- & Pachtgewässer, Schongebiete (GeoParquet).
- **Thurgau**: Fischenzen / Fischereiverbote (WFS).
- **Solothurn**: Fischerei GeoPackage + INTERLIS.
- **Valais / Lucerne**: fishing-network / ArcGIS layers exist.
- **swisstopo**: swissTLM / VECTOR25 / lakes & rivers hydrology (geometry OK; **no fishing rights attributes**).

### Gap
- **No national fishing-rights layer**. Geometry is easy; *permission status* is cantonal, seasonal, and often not open.
- MVP must use **clearly labeled MOCK** polygons for status colors; link out to cantonal patent shops as hints.

## Feasibility take for prototype
- Map of major lakes/rivers: feasible with mocked polygons + real-ish names/cantons.
- True "am I allowed to fish here with my patent?" nationwide: **not** feasible without multi-canton partnerships + legal review.
- Positioning: educational / planning prototype "à la VISplanner", **not** legal advice or digital patent.
