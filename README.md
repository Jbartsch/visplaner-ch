# Visplaner CH

Swiss fishing-waters **permit finder** (inspired by [visplanner.nl](https://visplanner.nl/) — fishing map, not visas).

**Job:** *What permit do I need for this water, and where do I buy it?*
Map → tap a water → permit type (Kantonspatent / Pacht / privat / Schonrevier / unklar) → buy or enquire (cantonal web shop & app, lessee directory, fisheries office).

- Scope: **ZH + BE** · UI in **DE / EN / FR**
- Stack: **Next.js 16 (App Router) + React 19 + TypeScript + MapLibre GL 6**
- Hosting: **Vercel** — team *Innoveto*, project [`visplaner-ch`](https://vercel.com/innoveto/visplaner-ch), region `fra1`
  - Production: https://visplaner-ch.vercel.app (deploys from `main`)
  - Every PR gets a Preview Deployment (Vercel bot comments the URL on the PR)
- **Disclaimer:** informational only — not permission to fish, not legal advice, not a digital permit.

## Features
- Map of ~330 waters: ZH lakes, ponds and stream reviers from official cantonal OGD; BE patent lakes and rivers (+ non-patent lakes) from swisstopo geometry and the official BE patent list
- Search by name, filter by canton and permit type; legend toggles; shareable deep links (`?w=<id>&lang=en`)
- Info panel: permit type + plain-language summary, price guide, **buy CTA** (eFJ2 app ZH, BE web shop / «Fischen Bern» app), lessee directory / revier data sheets for Pacht, SaNa note, day-ticket availability, official revier description, enquiry fallback, species/season (secondary), data source + confidence badge (*Amtliche Daten* / *Abgeleitet*)
- Optional overlay of the **official Kanton Bern angling map** (ANGFISCH WMS, proxied via `/api/be-wms`)
- "Why" strip explaining the cantonal fragmentation (dismissible, map stays primary)

## Develop
```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```
`predev`/`prebuild` copy MapLibre's module worker into `public/maplibre/` (Turbopack can't bundle it).

## Data
See [`docs/DATA.md`](docs/DATA.md). Rebuild `public/data/waters.geojson`:
```bash
python3 -m venv .venv && .venv/bin/pip install geopandas shapely
bash scripts/fetch_data.sh && .venv/bin/python scripts/build_data.py
```

## Deploy / PR previews
1. Branch off `main`, push, open a PR → Vercel builds a Preview Deployment and comments the URL.
2. Merge to `main` → Production.
3. `vercel.json` pins `framework: nextjs` + `regions: ["fra1"]` (project was first linked while the repo was Vite).

GitHub Pages (`gh-pages` branch, old Vite MVP) is legacy and no longer updated.

## Docs
- `docs/DATA.md` — sources, mapping rules, caveats
- `docs/PLAN.md` — merged plan · `docs/FEASIBILITY.md` — CH data/legal notes
- `STATUS.md` — live URLs, blockers
