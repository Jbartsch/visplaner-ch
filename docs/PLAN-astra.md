<!-- OpenRouter openai/gpt-6-astra @ 2026-10-05 — critique + wedge realignment -->

# PLAN-astra.md — visplaner-ch

> **Product:** Swiss fishing-waters planning prototype — not a digital permit or legal-permission map.  
> **Core job:** “What permit do I need for this water, and where can I get it?”  
> **Scope:** ZH + BE · Vite + React + TypeScript + MapLibre · static GeoJSON · DE/EN  
> **Build budget:** 1–2 hours, using explicitly labelled mock permit data.

## 1. Executive verdict — keep / cut / sharpen

**Keep Claude’s technical foundation. Replace its product hierarchy.** A fullscreen map and clickable waters are useful; a Dutch-style “permitted / restricted / forbidden” map is the wrong Swiss MVP.

| Keep | Cut | Sharpen |
|---|---|---|
| Map-first, mobile-friendly layout | Nationwide sample waters | ZH + BE only |
| Water selection and detail panel | Green “permitted” claims | Permit arrangement, not permission status |
| Static GeoJSON and MapLibre | Mock patent badge | Prominent purchase or contact action |
| Persistent prototype disclaimer | Species lists | Explain Patent, Pacht and Freiangel |
| DE/EN toggle | FR/IT scaffolding | Translate all essential panel copy |
| GitHub Pages | Legend-first onboarding | Map → water → permit type → next step |

**The panel is the product; the map is the entry point.**

Success means someone can select a demo water, understand the illustrated permit arrangement, and find the appropriate official purchase or enquiry destination. It does **not** mean the prototype establishes whether they may fish there today.

Use neutral blue water styling and a clear selection outline. A small permit-type legend is optional; traffic-light legality colours are out.

## 2. Gaps Claude underweighted

### Cantonal fragmentation is the central problem

- A canton name alone does not determine access to every water within it.
- Patent availability and coverage must be distinguished from leased fishing rights.
- A whole lake or river cannot automatically inherit one permit rule.
- Freiangel is conditional fishing without a patent under applicable rules—not unrestricted fishing.
- SaNa, methods, seasons and other requirements are caveats to surface through verified sources, not a decision engine to build now.

**Implementation consequence:** model a named water **section**, not a claim about an entire hydrological feature.

### Purchase paths need their own treatment

A generic canton homepage is not equivalent to a ticket checkout.

| Situation | Appropriate primary action |
|---|---|
| Verified public patent shop | “Buy permit” / “Patent kaufen” |
| Official information page only | “Permit information” / “Patentinformationen” |
| Pacht with verified contact | “Ask leaseholder about access” |
| Conditional Freiangel scenario | “Check conditions” |
| Mixed arrangements | Choose section or scenario first |
| Unknown arrangement | “Check official guidance” |

Do not assume ZH or BE uses eFJ because other cantons do. Verify each destination independently.

**No invented shops, guessed deep links or promise that a leaseholder sells day tickets.**

### ZH + BE is a deliberate scope boundary

Claude’s national tour adds drawing work and ambiguous jurisdiction without improving the purchase flow. Ship six selectable fixtures across two cantons. Exclude other cantons and cross-border rule handling.

### Mockness needs to be specific

Separate:

- **Geometry provenance:** illustrative outline or sourced GIS.
- **Permit provenance:** mock scenario or source-checked information.
- **Link provenance:** verified shop, official guidance, contact or unavailable.

Real geometry does not make mock permit attributes authoritative. A real official link does not validate the illustrated permit assignment.

## 3. Sharper MVP

### Must-have

1. Map initially fitted to the ZH + BE demo features.
2. Six selectable water sections, with polygons and clickable river lines.
3. Detail panel ordered as:
   1. Water/section name and canton.
   2. **Permit type — explicitly marked as a demo scenario.**
   3. Short explanation of what that arrangement means.
   4. **Purchase, contact or conditions action.**
   5. Notes and source/provenance.
   6. Disclaimer.
4. Safe handling of all five values: `Patent`, `Pacht`, `Freiangel`, `mixed`, `unknown`.
5. A small accessible water list as an alternative to map interaction.
6. Persistent prototype notice plus panel-level disclaimer.
7. DE/EN for core UI and fixture descriptions.
8. Working GitHub Pages deployment.

For `mixed`, show the illustrative options and require selection before displaying an option-specific purchase action. Never choose a patent silently.

### Nice-to-have — only after the complete flow works

- ZH/BE quick filters.
- Small permit-type legend.
- Remember language locally.
- Selected-water URL hash.
- Source-check date in the panel.

### Later

- Real ZH/BE GIS ingestion and reviewed permit mapping.
- Seasonal and method-specific conditions.
- GPS, search and nationwide coverage.
- SaNa guidance beyond brief source-linked notes.
- Accounts, actual permit records, offline support.
- FR/IT.

**Do not spend this build on badges, species, national coverage or GIS automation.**

## 4. Info-panel schema

Keep geometry and panel records separate. GeoJSON carries a stable `waterId`; the application retrieves typed panel data from a local catalogue. This avoids relying on nested properties returned through rendered map features.

```ts
type PermitType =
  | 'Patent'
  | 'Pacht'
  | 'Freiangel'
  | 'mixed'
  | 'unknown';

type Localized = {
  de: string;
  en: string;
};

interface PermitPath {
  permitType: PermitType;

  // Destination for the next step; not necessarily a checkout.
  buyUrl: string | null;
  buyLabel: Localized;
  linkKind: 'shop' | 'information' | 'contact' | 'none';

  notes: Localized[];
}

interface WaterPanel extends PermitPath {
  id: string;
  name: string;
  sectionLabel: Localized;
  canton: 'ZH' | 'BE';
  disclaimer: Localized;

  permitDataKind: 'mock' | 'source-checked';
  geometryKind: 'illustrative' | 'sourced';

  sourceUrl: string | null;
  linkCheckedAt: string | null;

  // Used only when the parent permitType is "mixed".
  options?: Array<PermitPath & {
    id: string;
    label: Localized;
  }>;
}
```

### Rendering rules

- `Patent`: identify the illustrated patent and destination; use “buy” only for a verified purchase route.
- `Pacht`: explain that access must be clarified with the rights holder. A cantonal patent must not be presented as sufficient.
- `Freiangel`: show conditions guidance, not a purchase requirement or “fishing allowed” badge.
- `mixed`: show alternatives first; parent `buyUrl` stays `null`.
- `unknown`: state that the requirement is unconfirmed; offer official guidance if available.
- Missing URL: render an honest “No verified destination yet” message—never a broken button.
- Validate external URLs as HTTPS destinations; use safe external-link attributes.

### Required disclaimer

**DE**

> Prototyp mit Mock-Daten. Nur zur Information — keine Fischereiberechtigung und keine verbindliche Rechtsauskunft. Patentbedarf, Geltungsbereich und aktuelle Vorschriften vor dem Fischen bei der zuständigen Stelle prüfen.

**EN**

> Prototype using mock data. For information only—not fishing permission or authoritative legal guidance. Confirm permit requirements, coverage and current rules with the responsible authority before fishing.

The main heading for mock records should read **“Demo: benötigte Berechtigung”**, not an unqualified **“Du brauchst …”**.

## 5. ZH + BE mock waters to ship

**These are UI fixtures, not researched legal classifications.** Real place names provide orientation; the permit scenarios below are illustrative and must be labelled next to the permit type.

| ID | Selectable fixture | Canton | Mock scenario | Next-step behaviour |
|---|---|---|---|---|
| `zh-greifensee-demo` | Greifensee — illustrative section | ZH | `Patent` | Verified ZH shop if found; otherwise official permit information |
| `zh-zuerichsee-demo` | Zürichsee — illustrative ZH shoreline section | ZH | `mixed` | Choose between mock Patent and conditional Freiangel scenarios |
| `zh-river-lease-demo` | Fictional leased river section, schematic ZH location | ZH | `Pacht` | Explain rights-holder enquiry; no fabricated leaseholder or checkout |
| `be-thunersee-demo` | Thunersee — illustrative section | BE | `Patent` | Verified BE shop if found; otherwise official permit information |
| `be-brienzersee-demo` | Brienzersee — illustrative shoreline section | BE | `Freiangel` | Official conditions guidance; no “buy” CTA |
| `be-aare-demo` | Aare near Bern — illustrative reach | BE | `unknown` | Explain uncertainty and link to official guidance |

For named waters, repeat **“Illustrative scenario; not a verified rule for this location.”** Do not colour a whole lake with a mock permit assignment.

Use tiny hand-authored demo geometries. Do not claim shoreline or jurisdiction accuracy. If sourced geometry is already readily available, use it with attribution; do not spend the build converting new GIS datasets.

**Link gate:** check destinations on official ZH/BE websites during implementation. Record whether each is a shop or an information page. If verification fails, keep `buyUrl: null` and log the gap.

## 6. Timeboxed build checklist — 120 minutes maximum

| Time | Work | Done when |
|---|---|---|
| 0–10 min | Scaffold Vite/React/TS; install MapLibre; set Pages base | App runs locally |
| 10–25 min | Define catalogue and six fixtures; check official destinations | Each fixture has a type, explanation and honest action/fallback |
| 25–45 min | Render geometry; add polygon and river hit layers | All six fixtures selectable |
| 45–70 min | Build detail panel and permit-path branching | Primary flow works for all five types |
| 70–85 min | Add DE/EN, mobile layout, disclaimer and water list | Core content usable without map-only interaction |
| 85–105 min | Smoke test; fix accessibility and error states | Acceptance checks below pass |
| 105–120 min | Deploy Pages; write documentation; test live URL | Published flow works from repository subpath |

### Technical guardrails

- Import `maplibre-gl/dist/maplibre-gl.css` from the installed package.
- Use `import.meta.env.BASE_URL` for public asset paths.
- Use stable feature IDs; clean up MapLibre on unmount.
- Add a wide transparent river hit layer for touch interaction.
- Preserve basemap attribution.
- Handle basemap/data failures visibly; keep the water list usable.
- Give the panel a close button, keyboard support and sensible focus handling.

### Acceptance checks

- [ ] Selecting a fixture reveals permit type and next step immediately.
- [ ] No “permitted”, “you may fish” or simulated valid-permit badge.
- [ ] Mock status is visible beside the permit claim.
- [ ] Shop and information links have different, truthful labels.
- [ ] Pacht does not imply public ticket availability.
- [ ] Freiangel does not imply unrestricted access.
- [ ] Mixed and unknown never default to a patent.
- [ ] Mobile CTA and disclaimer remain reachable.
- [ ] DE/EN works throughout the primary flow.
- [ ] Production build and deployed subpath work.

**If behind:** cut optional map polish and filters. Keep all permit-path behaviours, disclaimers and link validation.

## 7. Deploy — GitHub Pages under Jbartsch

Preferred repository: `Jbartsch/visplaner-ch`, subject to repository access.

- Set Vite `base: '/visplaner-ch/'`.
- Use GitHub Actions to install dependencies, build and publish `dist`.
- Use Node LTS and a committed lockfile.
- Avoid client-side pathname routing; a single page or hash state needs no SPA rewrite.
- Target URL: `https://jbartsch.github.io/visplaner-ch/`.
- Verify assets, map style, attribution and outbound links on the deployed site.
- No custom domain, API keys or backend required for the prototype.

Do not report deployment as complete until the live URL has been checked.

## 8. FEASIBILITY.md / STATUS.md

### FEASIBILITY.md bullets

- A static ZH + BE permit-discovery prototype is feasible in 1–2 hours.
- The timebox covers mock scenarios and curated outbound links—not verified water-by-water permit coverage.
- Hydrological geometry does not establish fishing rights.
- Purchase destinations vary by canton and rights holder; generic shop routing is insufficient.
- Pacht access and conditional Freiangel need explicit treatment.
- Production requires section-level authoritative sources, reuse/licensing checks, update ownership and domain/legal review.
- Restrictions may depend on date, method and user qualifications; no eligibility engine is included.
- Basemap availability is an external dependency; preserve attribution and provide a non-map fallback.

### STATUS.md bullets

Record actual outcomes, not planned completion:

- Implemented features and remaining gaps.
- Six fixture IDs and which behaviours were tested.
- Mock versus sourced geometry and permit attributes.
- Each outbound destination, its purpose and verification date.
- Missing purchase paths or rights-holder contacts.
- Build result, commit SHA, deployment URL and live smoke-test result.
- Known mobile/accessibility issues.
- Explicit statement: no legal permission determination or real digital permit.
- Next milestone: replace one ZH and one BE fixture with source-reviewed, section-specific permit and purchase information.

## 9. Astra contribution — quote for STATUS.md

> “Astra redirected the plan from a Dutch-style legality-colour map to the Swiss product wedge: select a water, understand the relevant permit arrangement, and find the correct purchase or enquiry path. The review narrowed the prototype to ZH and BE, removed mock permit badges and nationwide filler, and made Patent, Pacht, conditional Freiangel, mixed and unknown cases explicit. It also separated mock permit claims from verified external destinations, with clear fallbacks and disclaimers so the prototype demonstrates permit discovery without pretending to establish fishing permission.”