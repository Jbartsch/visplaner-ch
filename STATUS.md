# STATUS.md — Petripass (repo visplaner-ch)

**Updated:** 2026-10-06 ~07:50 Europe/Zurich

## Live URLs
| | URL |
|---|---|
| **Production (Vercel, primary)** | https://visplaner-ch.vercel.app |
| Vercel project | https://vercel.com/innoveto/visplaner-ch (team Innoveto, `fra1`) |
| PR preview (example, PR #1) | https://visplaner-ch-git-feat-real-gis-zh-be-innoveto.vercel.app (Vercel Authentication — team login required) |
| Legacy GitHub Pages (old Vite MVP, frozen) | https://jbartsch.github.io/visplaner-ch/ |

## Repo URL
https://github.com/Jbartsch/visplaner-ch

## v0.3 — Petripass, all 26 cantons + landing pages (2026-10-06)
- **Brand:** working name **Petripass** (UI title/meta/OG, schema.org, docs). Tagline (locked): *Find your water. Understand the rules. Get the right permit.* with DE/FR/IT translations.
  Positioning: the decision layer before you buy. Purchase links go to the official seller (cantonal eFJ shop/app, lessee). Independent service, not an authority (shown in the disclaimer).
- **Coverage:** 3,644 waters in all 26 cantons. Canton tiers: official 4 (ZH, BE, SO, VS) · derived 21 · stub 1 (SH). Details in `docs/COVERAGE.md`.
- **UI:** canton filter (26), coverage choropleth and grid, quality badge per water, border-water authority, lazy per-canton geometry, IT locale, mobile bottom sheet, "Buy via Petripass" stub (coming soon, localStorage only).
- **Pages:** `/{de,fr,it,en}`, `/{locale}/kanton/{slug}` (104), `/{locale}/gewaesser/{slug}` (lakes prerendered, the rest ISR). Each has an answer block, FAQ, JSON-LD (FAQPage, BodyOfWater/Place, BreadcrumbList) and hreflang. `sitemap.xml` (~14.7k URLs) and `robots.txt`.
- Docs: `docs/DATA.md`, `docs/COVERAGE.md`, `docs/MONETIZATION.md`, `research/competitors.md`.

### Follow-ups
- **IT copy is machine-drafted. It needs review** (`src/i18n/copy.ts`, `src/i18n/pages.ts`, `scripts/lib/cantons_cfg.py`).
- Deeper rename (repo, Vercel project, domain `petripass.ch`?, `VisplanerApp` component, localStorage keys `vp-*`) is deliberately not done.
- Next PRs: Freiangeln / no-SaNa filters (sourced flags only), winter/ice mode, species-by-season, rules summary and grounded rules chat.
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
