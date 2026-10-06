# Petripass

_Working brand name (formerly Visplaner CH). Repo, Vercel project and URLs keep the `visplaner-ch` name._

Swiss fishing-waters **permit finder** (inspired by [visplanner.nl](https://visplanner.nl/) — fishing map, not visas).

**Job:** *What permit do I need for this water, and where do I buy it?*
Map → tap a water → permit type (Kantonspatent / Pacht / privat / Schonrevier / unklar) → buy or enquire (cantonal web shop & app, lessee directory, fisheries office).

- Scope: **all 26 cantons** (coverage: [`docs/COVERAGE.md`](docs/COVERAGE.md)) · UI in **DE / FR / IT / EN**
- Stack: **Next.js 16 (App Router) + React 19 + TypeScript + MapLibre GL 6**
- Hosting: **Vercel** — team *Innoveto*, project [`visplaner-ch`](https://vercel.com/innoveto/visplaner-ch), region `fra1`
  - Production: https://visplaner-ch.vercel.app (deploys from `main`)
  - Every PR gets a Preview Deployment (Vercel bot comments the URL on the PR)
- **Disclaimer:** informational only — not permission to fish, not legal advice, not a digital permit.

## Features
- Map of ~3,600 waters across Switzerland. Each water shows its permit type, a quality badge (official / derived / stub) and a source line
- Canton filter (all 26), a coverage choropleth and grid, search across names and cantons in all languages, deep links (`?w=<id>&c=XX&lang=fr`)
- Info panel: permit type → official buy/app link or lessee list; border-water authority; price guide; SaNa note; "Buy via Petripass" stub (coming soon)
- Official WMS overlays: BE ANGFISCH, AG Fischereireviere (proxied via `/api/wms/[id]`)
- Crawlable landing pages: `/{de,fr,it,en}` index, `/{locale}/kanton/{slug}`, `/{locale}/gewaesser/{slug}` with an answer block, FAQ and JSON-LD; `sitemap.xml`, `robots.txt`

## Develop
```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```
`predev`/`prebuild` copy MapLibre's module worker into `public/maplibre/` (Turbopack can't bundle it).

## Data
See [`docs/DATA.md`](docs/DATA.md) for the full pipeline (`npm run data`, then `scripts/build_all.py`).

## Deploy / PR previews
1. Branch off `main`, push, open a PR → Vercel builds a Preview Deployment and comments the URL.
2. Merge to `main` → Production.
3. `vercel.json` pins `framework: nextjs` + `regions: ["fra1"]` (project was first linked while the repo was Vite).

GitHub Pages (`gh-pages` branch, old Vite MVP) is legacy and no longer updated.

## Docs
- `docs/DATA.md` — sources, mapping rules, caveats · `docs/COVERAGE.md` — per-canton matrix
- `docs/MONETIZATION.md` — monetization groundwork · `research/competitors.md` — competitive note
- `docs/PLAN.md` — merged plan · `docs/FEASIBILITY.md` — CH data/legal notes
- `STATUS.md` — live URLs, blockers
