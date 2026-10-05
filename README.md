# Visplaner CH

Swiss fishing-waters **permit finder** (inspired by [visplanner.nl](https://visplanner.nl/) — fishing map, not visas).

**Job:** What permit do I need for this water, and where do I buy it?

- Scope: **ZH + BE**
- Stack: **Next.js (App Router) + React + TypeScript + MapLibre GL**
- Hosting: **Vercel** (team Innoveto, project `visplaner-ch`) — Git-linked; every PR gets a Preview Deployment, `main` deploys to Production
- Disclaimer: informational only — **not** legal permission / digital patent

## Develop
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Deploy / PR previews
1. Branch off `main`, push, open a PR → Vercel bot comments a Preview URL.
2. Merge to `main` → Production deploy.
3. `vercel.json` pins `framework: nextjs` (the project was first linked while the repo was Vite).

GitHub Pages (`gh-pages` branch, old Vite build) is legacy/interim only.

## Docs
- `docs/PLAN.md` — merged plan
- `docs/FEASIBILITY.md` — CH data/legal notes
- `STATUS.md` — live URLs, blockers
