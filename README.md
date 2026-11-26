# letbe.fun — tiny games and curious experiments

A frontend-only collection of 15 playable browser mini-games. No backend, no accounts, no required external APIs.
Everything is stored in the visitor's own browser (LocalStorage + IndexedDB).

**Stack:** React 19 · Vite · JavaScript · Tailwind CSS v4 · Framer Motion · Three.js (asteroid game only) · React Router · Lucide icons.

## Games

| Route | Game |
| --- | --- |
| `/games/infinite-craft` | Element Alchemy — local recipe dataset + engine, custom recipes saved in IndexedDB |
| `/games/password-challenge` | Password Gauntlet — 14 progressive rules |
| `/games/spend-the-fortune` | Spend a fictional $100B with live balance and receipt |
| `/games/perfect-circle` | Draw a circle on Canvas, scored by radial variance |
| `/games/deep-sea` | Scroll from surface to the Challenger Deep |
| `/games/asteroid-impact` | Three.js globe + simplified, clearly-labeled approximate impact model (2D fallback without WebGL) |
| `/games/trolley-dilemma` | 12 fictional dilemmas; choices tallied locally |
| `/games/scale-of-the-universe` | SVG zoom across 62 orders of magnitude |
| `/games/money-clicker` | Incremental game with autosave |
| `/games/reaction-test` | Random-delay reaction timer, best scores |
| `/games/color-guess` | Guess colors from HEX/RGB (and vice versa) |
| `/games/number-guess` | Higher/lower with 3 difficulty levels |
| `/games/memory-cards` | Pair matching, 3 board sizes, pause, best times |
| `/games/typing-test` | WPM and accuracy |
| `/games/decision-maker` | Random picker; saved lists in IndexedDB |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # sitemap.xml + robots.txt, vite build, then prerenders one HTML file per route
npm run preview    # serve the production build locally
```

Requires Node 18+. No environment variables are needed.

## Project structure

```
src/
  components/        shared UI (cards, share/favorite buttons, error boundary)
  layouts/           MainLayout (header, footer, theme handling)
  pages/             Home, Explore, GamePage, Collection (favorites/recent), Settings, About, Privacy, NotFound
  games/<Name>/      one folder per game, each with index.jsx (lazy-loaded chunk)
  games/registry.js  maps slugs to lazy components (auto-discovered via import.meta.glob)
  hooks/             useGameData, useBestScore, useStopwatch, useCountdown, useInterval, useSound, useIdbCollection, useSeo
  services/storage/  local.js (versioned LocalStorage), idb.js (IndexedDB), store.js (observable stores), index.js
  data/games.meta.js game metadata (single source of truth for routes, SEO, sitemap)
  data/seo.js        titles, descriptions and structured data per page (domain lives in `SITE`)
scripts/gen-sitemap.mjs   runs automatically before `npm run build`
scripts/prerender.mjs     runs automatically after `npm run build`
```

### Adding a game
1. Add an entry to `src/data/games.meta.js` (`folder` = directory name).
2. Create `src/games/<Folder>/index.jsx` with a default-exported component.
3. That's it — routing, directory listing, SEO tags, favorites, recents, related games and the sitemap pick it up.

## Local data

- **LocalStorage** (`dbx:` prefix, `{ v, d }` envelope with schema version): theme, sound, favorites, recents, best scores, small game state.
- **IndexedDB** (`doodlebox` DB): discovered elements, custom recipes, saved decision lists.
- All reads are validated and wrapped in `try/catch`; if storage is blocked or full the app keeps working in memory.
- **Settings → Reset all data** deletes everything; **Export JSON** downloads LocalStorage contents.

## Deploying to Vercel

1. Push the repo to GitHub.
2. In Vercel choose **Add New → Project**, import the repo. Framework preset **Vite** is detected automatically
   (build command `npm run build`, output directory `dist`).
3. Deploy. Every route is prerendered to its own HTML file, so refreshing or deep-linking `/games/perfect-circle` works, and unknown URLs get `404.html` with a real 404 status.
   A new route in `App.jsx` also needs an entry in `data/seo.js` and `scripts/prerender.mjs`.

Or via CLI: `npm i -g vercel && vercel --prod`.

The production domain is `https://www.letbe.fun`; change `SITE` in `src/data/seo.js` if it moves.

## Notes & limitations

- Per-page titles, meta tags and JSON-LD are prerendered at build time and kept in sync client-side by `useSeo`. Dev mode shows only default tags in the initial HTML.
- The only third-party request is Google Fonts. Self-host the fonts to remove it.
- The asteroid model is a deliberate simplification for education; the planet is procedurally generated, not Earth.
