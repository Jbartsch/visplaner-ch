# Competitive note – Petripass vs. SwissFishingMap and Fishr

_Desk research 2026-10-06 (public websites and store listings only; no accounts created)._

| | SwissFishingMap (swissfishingmap.ch) | Fishr (fishr.ch, iOS/Android) | **Petripass** (this repo) |
|---|---|---|---|
| Core | Water map, catch reports, "buy & sell permits" for public and private sections | Logbook app with water info, rules and permit info per canton | **Answers "which permit here, and where do I buy it"** per water, for all 26 cantons |
| Data sources shown | BE ANGFISCH, ZH, TG (credited) | Crowd + editorial ("submit a water") | Official OGD per canton (ZH, BE, SO, VS, LU, SZ, SH, TG, AG WMS) + swisstopo, **source shown per water** |
| Data honesty | No per-water confidence | No per-water confidence | **Badge per water (official / derived / stub) + coverage per canton** |
| Access | Web app (JS-rendered map page) | App install needed for full use | Web, no install, no login |
| SEO / shareable | Few crawlable pages | App-first | **~14.6k static/ISR pages** (/de,fr,it,en × canton × water) with FAQ + JSON-LD |
| Languages | DE | DE | **DE / FR / IT / EN** |

## Concrete UX wins (implemented in this PR)
1. **Permit-to-buy in one tap:** the water panel shows permit type → the primary official buy button (shop/app) or, for leased water, the lessee list/contact. No hunting through cantonal sites.
2. **Honesty as a feature:** quality badge per water, a canton coverage choropleth on the map, and a coverage grid (26 cells) in the side panel. Stub data is visibly greyed out.
3. **Border waters explained:** Lake Geneva, Lake Constance, Untersee, Maggiore, Lugano, Neuchâtel, Murten, Biel, Zurich, Lucerne, Zug, Walen, Hallwil, Doubs and High Rhine show the competent authority (CIPL, IBKF, concordats) plus a permit hint.
4. **Speed:** a ~400 KB overview loads first; detail geometry is lazy-loaded per canton at zoom ≥ 8.6. No heavy app bundle and no login wall.
5. **Mobile:** the panel is a bottom sheet over a full-height map, with a compact legend.
6. **Search across 26 cantons:** diacritics-insensitive, matches DE/FR/IT/EN names and canton names, and offers canton chips ("Wallis" → canton view).
7. **Crawlable answers:** every canton and water has a static page with a short answer, FAQ and JSON-LD, so the information is findable without the app.
8. **Official overlays:** the BE ANGFISCH and AG Fischereireviere WMS can be toggled on top of our layer, via a CORS proxy.

## Not done yet (ideas)
- Catch log / community features: deliberately out of scope. Competitors have them, but our focus is permit clarity.
- Offline maps / PWA install.
- "Near me" list sorted by distance.
- Direct permit purchase: see docs/MONETIZATION.md.
