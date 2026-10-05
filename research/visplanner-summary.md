# VISplanner.nl — UX / feature summary (for Swiss MVP mirror)

Source: https://visplanner.nl/ (Nuxt SPA, Sportvisserij Nederland) + Play Store / Sportvisunie docs. Studied 2026-10-05.

## What it is
- Interactive digital fishing-waters map + digital VISpas companion.
- Official replacement for the paper "Lijst van Viswateren".
- With a valid VISpas, the app/site counts as written permission.

## Core UX to mirror at MVP
1. **Map-first fullscreen** — full viewport map of fishing waters.
2. **Color-coded waters** — permitted (dark green / blue when logged in) vs not permitted / restricted; clear legend.
3. **Click water → info panel** — name, rules, local conditions, documents needed.
4. **Permit / badge concept** — digital VISpas shown when logged in (CH: mock Patente badge).
5. **GPS location** (nice-to-have) — show nearby waters and conditions.
6. **Multi-language** — NL has nl/de/en/fr/pl; CH MVP: DE/EN toggle (FR/IT later).
7. **Onboarding** — brand splash ("Vissen. Het is onze natuur"); we can skip heavy onboarding for MVP.
8. **Offline-ish** — open with internet first; CH MVP stays online-only + static GeoJSON.

## Not in CH MVP
- Real login / MySportvisserij equivalent
- Legally binding digital permit
- Full national waters database
- Catch statistics / SaNa certificate flows

## Tech signals from NL site
- Nuxt SPA, PWA-ish, map-centric, mobile-first.
- Our CH stack: Vite + React + TS + MapLibre + GeoJSON static export.
