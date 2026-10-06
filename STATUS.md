# STATUS.md — Petripass (repo visplaner-ch)

**Updated:** 2026-10-06 Europe/Zurich

## Live URLs
| | URL |
|---|---|
| **Production (Vercel, primary)** | https://visplaner-ch.vercel.app |
| Vercel project | https://vercel.com/innoveto/visplaner-ch (team Innoveto, `fra1`) |
| PR preview (example, PR #1) | https://visplaner-ch-git-feat-real-gis-zh-be-innoveto.vercel.app (Vercel Authentication — team login required) |
| Legacy GitHub Pages (old Vite MVP, frozen) | https://jbartsch.github.io/visplaner-ch/ |

## Repo URL
https://github.com/Jbartsch/visplaner-ch

## v0.5 — Five questions (soft-launch feedback, 2026-10-06)
A German friend tested the soft launch: Google first, then ChatGPT. His questions, in order: permit + price, parking, rules, catch limit, no-fishing zones. Foreign/guest access matters to him.
- **QuickAnswers block** (`src/components/QuickAnswers.tsx`): five compact rows right under the water name, in the map panel (mobile bottom sheet above the buy section) and on `/{locale}/gewaesser/{slug}`. Each row is icon + question + short answer, or «nicht in unseren Daten». Rows expand to the detail with source and check date.
- **Prices + rules:** `scripts/lib/rules_cfg.py` → `public/data/rules.json`. Hand-curated; every value carries a source URL.
  - Full rules for ZH and BE: closed seasons, minimum sizes, bag limits, methods, night fishing, guests/foreigners.
  - Prices for ZH, BE, GR, LU (Sempacher-/Vierwaldstättersee), SZ, SG (Bodensee), VS and TI, split resident vs non-resident.
  - Federal TSchV baseline applies everywhere.
- **Sperrzonen:** `public/data/zones.geojson` combines BE ANGFISCH Schongebiete, TG Fischereiverbote and BAFU WZVV. The map shows it as hatched red / dashed purple with a legend toggle.
  - The per-water list of zones is computed with a 150 m buffer.
  - ZH zones are text only (from the Vorschriften).
- **Parking:** nearest `amenity=parking` from OSM (Geofabrik CH extract 2026-10-04, `scripts/extract_osm_parking.py`). Excludes private/customers/permit access.
  - Up to 6 spread-out spots per water, labelled with the nearest locality.
  - Shown as P markers on the map, with route and OSM links. Carries an ODbL attribution and a "check signage" note.
- **SEO/AEO:** the five questions (his phrasing) appear as crawlable text plus FAQPage JSON-LD on water pages, canton pages and `/{locale}`, in all locales.
  - The landing page and map side panel have a subtle question row (`?ask=park` opens that row).
- **Fix:** ZH Revier 2/3 geometries were swapped (Greifensee ↔ Pfäffikersee).
- Coverage per canton: `docs/COVERAGE-ANSWERS.md` (generated).
- Rebuild: `.venv/bin/python scripts/build_extras.py`. Needs data-raw/osm (Geofabrik pbf → extract scripts), BE/TG raw and data-raw/zones/wzvv.

## v0.4 — Friend soft-launch gate (2026-10-06)
Scope from the Astra design review (`/workspace/petripass-design-review/gpt-6-astra-review.md`) plus the earlier soft-launch review.
- **Freiangeln + no-SaNa filters** (`?free=1`, `?nosana=1`). They use sourced flags only (`scripts/lib/access_cfg.py`, each with its official URL and check date). Waters without a source stay unknown and are not counted as "no".
- **Removed the "Buy via Petripass" checkout stub everywhere.** It is replaced by an independence note next to the buy section: "Petripass ist unabhängig, kein Angebot des Kantons, und verkauft keine Patente". `docs/MONETIZATION.md` is kept.
- **Panel order:** permit card → border water → Freiangel rule → SaNa (sourced note, or "nicht verifiziert") → day ticket (with source and data vintage) → buy.
  - Pacht CTA is "Pächter finden: …". It prefers the water's own BE Pachtblatt, else the ZH Revierverzeichnis plus the tip "Im PDF nach Revier N suchen".
- **Badge** shows permit-type provenance only ("Bewilligungstyp: Quelle Kanton ZH (OGD)" / "abgeleitet" / "unvollständig"). No "amtlich"/"official" copy anywhere.
- **Data vintage** is shown per source (ZH dataset "Datenstand 2010").
- **Unverified links** show "(Link nicht geprüft)" instead of an asterisk.
- **Start shortcuts** Zürich / Bern / Alle Kantone in the panel and on the landing page.
- **Deep links:** `/zh`, `/be`, … (every canton except FR, which clashes with the locale), `/karte/<code>`, `/?canton=ZH`, `/?w=<id>`.
- **Mobile:** header 96 → 68 px, short BETA line, no horizontal overflow on `/de` (compact table rows).
- **a11y:** single H1 (brand on the map page), banner inside `<header>`/`<aside>`, map region label, border-box heading contrast. axe (WCAG 2 A/AA + best practice): 0 violations on the map panels.
- **WMS proxy:** passes only `image/*` with 200; XML ServiceExceptions → 502 `no-store`; tile-aligned Swiss bbox only; no error leak; no ACAO `*`.
- **Payload:** the slim `waters-index.json` is 619 KB (104 KB gzip), down from 1.07 MB. Per-canton `details/XX.json` loads on demand. Failed fetches are retried.
- **Feedback:** mailto `NEXT_PUBLIC_FEEDBACK_EMAIL`, fallback `jonas@innoveto.ch`.
- **Mobile smoke test:** `research/screens/` (Playwright, Chrome with iPhone 14 / Pixel 7 emulation; not real Safari).

### Deferred until after soft launch
Winter/ice, species by season, chat. (Rules summary shipped in v0.5 for ZH/BE.) No WIP code exists for these yet.

### Open issues
- IT copy is machine-drafted. BE reach notes come from the dataset in German only.
- ZH permit dataset is from 2010 (shown on panels).
- Links not confirmed: UR web shop (HTTP 500/timeout), fischerei.ai.ch (403). The SZ web shop is desktop-only (labelled).
- The no-SaNa flag is applied per canton where the canton's own page states that short-term permits need no SaNa (ZH, BE, LU, GR, VS; UR only for the Göscheneralp, Urnersee and Seelisbergersee). Pacht waters are never flagged.
- Vercel Web Analytics must be enabled in the dashboard. Custom events need Pro. The MCP token cannot see the project, so env vars must be set by Jonas.

## v0.3 — Petripass, all 26 cantons + landing pages (2026-10-06)
- **Brand:** working name **Petripass** (UI title/meta/OG, schema.org, docs). Tagline (locked): *Find your water. Understand the rules. Get the right permit.* with DE/FR/IT translations.
  Positioning: the decision layer before you buy. Purchase links go to the official seller (cantonal eFJ shop/app, lessee). Independent service, not an authority (shown in the disclaimer).
- **Coverage:** 3,644 waters in all 26 cantons. Canton tiers: official 4 (ZH, BE, SO, VS) · derived 21 · stub 1 (SH). Details in `docs/COVERAGE.md`.
- **UI:** canton filter (26), coverage choropleth and grid, quality badge per water, border-water authority, lazy per-canton geometry, IT locale, mobile bottom sheet. (The "Buy via Petripass" stub was removed in v0.4.)
- **Pages:** `/{de,fr,it,en}`, `/{locale}/kanton/{slug}` (104), `/{locale}/gewaesser/{slug}` (lakes prerendered, the rest ISR). Each has an answer block, FAQ, JSON-LD (FAQPage, BodyOfWater/Place, BreadcrumbList) and hreflang. `sitemap.xml` (~14.7k URLs) and `robots.txt`.
- Docs: `docs/DATA.md`, `docs/COVERAGE.md`, `docs/MONETIZATION.md`, `research/competitors.md`.

### Follow-ups
- **IT copy is machine-drafted. It needs review** (`src/i18n/copy.ts`, `src/i18n/pages.ts`, `scripts/lib/cantons_cfg.py`).
- Deeper rename (repo, Vercel project, domain `petripass.ch`?, `VisplanerApp` component, localStorage keys `vp-*`) is deliberately not done.
- Next PRs (after soft launch): winter/ice mode, species-by-season, rules summary and grounded rules chat.
- Hejfish seller links per water (where Hejfish is the official seller): to research and source.
- Sitemap is ~9 MB; split with `generateSitemaps` if Search Console complains.

## v0.2 — Next.js + real data (2026-10-05)
- Migrated Vite → **Next.js 16 App Router** (`636be9b` on `main`), Vercel Git-linked; PRs get Preview Deployments.
- PR #1 `feat/real-gis-zh-be`: ~330 waters from **ZH OGD Fischereireviere** (official) + **BE patent list on swisstopo geometry** (derived),
  search/filter (name, canton, permit type), richer permit→buy panel (price guide, SaNa, day ticket, enquire fallback, species/season),
  about strip, DE/EN/FR, official **BE ANGFISCH WMS overlay** via `/api/be-wms`, shareable deep links. Data docs: `docs/DATA.md`.
- Blockers: all `*.be.ch` hosts + Overpass are TLS-reset from the build box → BE vector data derived; official BE map shown as WMS (fetched by Vercel, not the box).
  Box `VERCEL_TOKEN` is scoped to project `kobayashi` only (403 on create; cannot read visplaner-ch deployments) — Jonas linked the project manually.

---

## Previous (v0.1 MVP)

## Doc paths
| File | Path |
|---|---|
| Claude plan | `/workspace/visplaner-ch/docs/PLAN-claude.md` |
| Astra critique | `/workspace/visplaner-ch/docs/PLAN-astra.md` |
| Merged plan | `/workspace/visplaner-ch/docs/PLAN.md` |
| Feasibility | `/workspace/visplaner-ch/docs/FEASIBILITY.md` |
| Status | `/workspace/visplaner-ch/STATUS.md` |
| Product wedge | `/workspace/visplaner-ch/research/product-wedge.md` |

## Product shipped
**Wedge:** (1) what permit for this spot (2) where to buy it — ZH + BE mock.

Flow: fullscreen map → tap water → info panel with **permit type** (Patent / Pacht / Freiangel / mixed / unknown) + summary + **Buy/Enquire CTA** + disclaimer. Legend supports orientation; primary UX is purchase path, not NL legality colours. Persistent MOCK banner. DE/EN toggle.

## Claude vs Astra
- **Claude** (`anthropic/claude-sonnet-4.6` via OpenRouter; Claude Code OAuth expired on box): architecture, Vite/React/MapLibre stack, file tree, mock layer approach, GH Pages steps → `PLAN-claude.md`.
- **Astra** (`openai/gpt-6-astra`): replaced Dutch permitted/forbidden hierarchy with **permit-needed + buy-link**; ZH+BE only; panel-as-product; schema for `permitType`/`buyUrl`; cut species/nationwide → `PLAN-astra.md`.
- **Executor:** merged `PLAN.md`, built app, GeoJSON mock (10 waters), deployed Pages.

## Feasibility takeaways
1. No national VISpas — cantonal Patent / Pacht / Freiangel.
2. Fragmentation = core pain → purchase-path UX beats colour-legality clone.
3. Open lake/river geometry exists; national fishing-rights attributes do not.
4. Cantonal GIS (BE Angelfischerei, FR, TG, SO) usable for later real status.
5. Buy links must deep-link cantonal shops / eFJ / clubs — no national checkout.
6. SaNa often required for annual patents — show as note, not a gate.
7. Border lakes (Geneva/Constance/…) out of ZH+BE MVP.
8. Loud “not legal permission” disclaimer is mandatory.
9. Labeled mock is correct until multi-canton data + legal review.
10. ZH+BE is a strong wedge (density + patent vs pacht contrast).

## Blockers / notes
- Claude Code OAuth on box: expired, empty refreshToken — could not run `claude -p`; OpenRouter Claude used for plan; implementation by executor.
- Mock geometries are simplified (not survey-grade).
- Buy URLs are public portals / SFV; exact eFJ deep-links vary by canton and may need curation.
- OSM raster tiles require network; fine for preview.

## MVP checklist
- [x] Dual plans on disk + merged PLAN.md
- [x] Map-first UI with ZH+BE mock waters
- [x] Permit-type legend + info panel + buy CTA
- [x] MOCK banner + disclaimer
- [x] DE/EN toggle
- [x] Live GitHub Pages preview (legacy)
- [x] Vercel production + PR previews (Next.js)
- [x] Real ZH OGD data, derived BE data, search/filter, DE/EN/FR
