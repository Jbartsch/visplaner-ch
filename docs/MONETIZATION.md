# Monetization – groundwork only

Status: **nothing is sold, no payments and no data collection.** The UI has a stubbed
"Buy via Petripass – soon" button next to the official buy links (patent waters only). Clicking it
explains that direct purchase is planned and lets the user "note interest". That flag is stored only in
`localStorage` (`vp-buyvia-interest`) on their device. No backend and no email are involved.

## Options
### 1. Ads (later)
- Contextual, non-tracking ads (tackle shops, guides, fishing schools/SaNa courses) on landing pages,
  never inside the permit/buy panel.
- Requires a cookie/consent review (revDSG) if any third-party ad network is used. Prefer direct deals.
- **No ad slots or placeholders are shipped yet.**

### 2. Direct permit / day-ticket resale ("Buy via Petripass")
- **Cantonal patents:** sold by cantons via their own shops/apps (eFJ webshops ZH/SZ/SG/TG/SO, fischerapp.ch
  for LU/NW/OW/GL, ePêche VS, shop-ajf GR, Guichet unique NE …). Reselling or embedding requires a **partnership or
  reseller agreement with each canton** and/or the platform operators (e.g. the eFJ consortium, fischerapp.ch vendor),
  including data-protection terms (SaNa number, identity), statistics duties and fee handling.
- **Leased waters (Pacht):** cards are issued by the lessees (clubs, Pachtvereinigungen, private holders). This needs
  **individual agreements with Pächter** or an association (e.g. BKFV in BE), plus a payout process.
- **Revenue models:** a service fee per ticket (where legally allowed), affiliate commission from operators, or SaaS for
  small Pächter who lack a webshop (likely the most realistic first step).
- **Legal checks:** cantonal fisheries law (who may issue permits), consumer law/terms, VAT, payment provider KYC.

## Next steps (proposal)
1. Measure intent: count "note interest" clicks with privacy-friendly analytics. Not implemented; needs a decision.
2. Talk to 2–3 Pächter without online sales (pilot) and to one eFJ canton about deep links/affiliate.
3. Only then build checkout. Keep the official buy link always visible.
