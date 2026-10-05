# PLAN.md — visplaner-ch (merged)

**Date:** 2026-10-05 (Europe/Zurich)  
**For:** Jonas via EddA  
**Inspiration:** [visplanner.nl](https://visplanner.nl/) (Dutch fishing waters map — NOT visas)

## Product wedge (authoritative)

**Core job:** (1) What permit do you need for this spot? (2) Where to buy it?

Pain: CH cantonal fragmentation — Patent / Pacht / Freiangel / mixed rules nobody can track.

**MVP flow:** map → select water → show permit type + notes → **buy / contact link** (eFJ, cantonal shop, Pächter).

**Scope:** ZH + BE only. Strong disclaimer: informational prototype, not legal permission.

Legend may support orientation; primary UX is **permit-needed + purchase path**, not NL-style colour legality.

## Keep from Claude plan
- Vite + React + TS + MapLibre + static GeoJSON
- Fullscreen map-first UI, click → side/bottom info panel
- MOCK DATA banner always visible
- DE/EN toggle
- GitHub Pages under Jbartsch

## Keep / sharpen from Astra
- Panel is the product; map is the entry point
- Data model centers on `permitType` + `buyUrl` / `buyLabel`, not permitted/forbidden
- Cut nationwide waters; ship ~8–12 ZH+BE mock features
- Cut mock “digital patent badge as permission”; optional decorative badge OK if labeled mock
- Species notes secondary / one-liner max

## Data model (GeoJSON feature properties)
```ts
{
  id: string
  name: { de: string; en: string }
  canton: 'ZH' | 'BE'
  waterKind: 'lake' | 'river' | 'canal' | 'reach'
  permitType: 'patent' | 'pacht' | 'freiangel' | 'mixed' | 'unknown'
  permitSummary: { de: string; en: string }
  buyUrl: string        // cantonal shop / eFJ / club / placeholder
  buyLabel: { de: string; en: string }
  notes?: { de: string; en: string }
  speciesHint?: { de: string; en: string }  // optional short
  mock: true
}
```

## Colour semantics (supporting, not primary)
| permitType | colour | meaning |
|---|---|---|
| patent | blue | Cantonal patent waters |
| pacht | amber | Leased / club-managed |
| freiangel | teal | Free angling (conditions apply) |
| mixed | purple | Multiple regimes on same water |
| unknown | grey | Not researched / mock incomplete |

## Mock waters (ship these)
**ZH:** Zürichsee (ZH shore), Greifensee, Pfäffikersee, Limmat (city reach), Rheinfall / Rhine ZH border note  
**BE:** Thunersee, Brienzersee, Bielersee, Aare (Bern city), Wohlensee

Each with realistic-ish buy links (official portals where known, else labeled placeholder).

## Build order (timeboxed)
1. Vite React TS scaffold + MapLibre + base CH view
2. `public/data/waters.geojson` mock polygons
3. Map layers + click handler
4. InfoPanel: permit type, summary, Buy CTA, disclaimer
5. Legend (permit types) + MOCK banner + DE/EN
6. Build static, push GitHub Pages
7. FEASIBILITY.md + STATUS.md

## Non-goals
- Real login / digital patent
- Nationwide coverage
- Legally binding advice
- Catch stats / SaNa flows
- FR/IT (later)

## Auth note
Claude Code OAuth on the box was expired (empty refreshToken). Claude plan produced via OpenRouter `anthropic/claude-sonnet-4.6`. Astra via `openai/gpt-6-astra`. Implementation by executor on box.
