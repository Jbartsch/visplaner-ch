# STATUS.md — visplaner-ch

**Updated:** 2026-10-05 ~21:00 Europe/Zurich

## Live URL
https://jbartsch.github.io/visplaner-ch/

## Repo URL
https://github.com/Jbartsch/visplaner-ch

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
- [x] Live GitHub Pages preview
