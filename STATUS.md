# STATUS.md — visplaner-ch

**Updated:** 2026-10-05 (Europe/Zurich)

## Live URL
- GitHub Pages: https://jbartsch.github.io/visplaner-ch/ *(pending enable after push)*

## Repo URL
- https://github.com/Jbartsch/visplaner-ch *(pending create)*

## Deliverable paths
- `docs/PLAN-claude.md`
- `docs/PLAN-astra.md`
- `docs/PLAN.md`
- `docs/FEASIBILITY.md`
- `STATUS.md` (this file)
- `research/visplanner-summary.md`
- `research/ch-fishing-research.md`
- `research/product-wedge.md`

## What Claude vs Astra contributed
- **Claude (via OpenRouter `anthropic/claude-sonnet-4.6`):** full architecture/build plan — Vite/React/MapLibre stack, file tree, mock colour layers, GitHub Pages deploy steps. *Claude Code OAuth on the box was expired (empty refreshToken), so plan was authored through OpenRouter Claude as stand-in.*
- **Astra (`openai/gpt-6-astra`):** product critique — rejected Dutch-style permitted/forbidden map as primary UX; sharpened to **permit-needed + buy-link**; ZH+BE only; panel-as-product; info-panel schema with `permitType` / `buyUrl`.
- **Merged `PLAN.md` + executor build:** implemented map → water → permit type → buy CTA with MOCK banner, DE/EN, legend for permit types.

## Product wedge (shipped)
1. Check what permit you need  
2. Where to buy it  
Strong disclaimer; not a legal-colour clone of VISplanner.

## Feasibility takeaways (short)
1. No national VISpas — cantonal Patent / Pacht / Freiangel.
2. Fragmentation is the core user pain → purchase-path UX.
3. Open geometry yes; national fishing-rights attributes no.
4. Some cantonal GIS (BE, FR, TG, SO) usable later.
5. Buy links must deep-link cantonal shops / eFJ / clubs.
6. SaNa often needed for annual patents — note only.
7. Border lakes out of ZH+BE MVP.
8. Loud disclaimer mandatory.
9. Mock labeled is correct for prototype speed.
10. ZH+BE good wedge for density + contrasting regimes.

## Blockers
- Claude Code OAuth expired on box — could not run `claude -p` directly; used OpenRouter Claude for PLAN-claude.md and executor for implementation.
- Real cantonal fishing-rights layers not integrated (mock by design).
- Buy URLs point at public portals (placeholders where exact shop deep-links unknown).

## MVP checklist
- [x] Dual plans on disk
- [x] Map-first UI ZH+BE mock waters
- [x] Legend (permit types)
- [x] Info panel: permit + buy link + disclaimer
- [x] MOCK banner
- [x] DE/EN toggle
- [ ] Live preview URL verified after Pages enable
