# FEASIBILITY.md — Switzerland fishing planner

## Takeaways
1. **No national VISpas equivalent.** Permits are cantonal (Patent) or private (Pacht); Freiangel exists in limited places with conditions.
2. **Fragmentation is the product problem.** 26 regimes + border lakes; users need “what do I buy?” more than a green/red map.
3. **Open geometry exists** (swisstopo hydrology; cantonal GIS). **Fishing-rights attributes do not** as a national layer.
4. **Some cantons publish fishing GIS** (BE Angelfischerei GeoParquet; FR permit waters; TG bans WFS; SO GPKG) — usable later for real status, not in this mock MVP.
5. **Purchase paths are per-canton:** eFJ webshops/apps (TG/SZ/SO…), Uri shop, Valais FCVPA, ZH/BE offices — must deep-link, not invent a national checkout.
6. **SaNa** often required for annual patents; day tickets sometimes exempt — show as note, don’t encode as gate.
7. **Border lakes** (Geneva, Constance, Maggiore) add international rules — out of ZH+BE MVP scope.
8. **Legal risk:** any UI that looks like permission must carry a loud disclaimer; never claim “you may fish here.”
9. **Mock is correct for MVP** if labeled; replacing mock needs multi-canton data partnerships + legal review.
10. **ZH + BE is a good wedge:** dense population, tourist lakes, contrasting patent vs pacht patterns.

## Public vs mock
| Layer | Public? | MVP |
|---|---|---|
| Lake/river outlines | Yes (approx / mock OK) | Mock simplified polygons |
| Permit type per water | Partial cantonal | Mock labeled |
| Buy URL | Official sites exist | Real URLs where known |
| Personal entitlement | Never public | Out of scope |
