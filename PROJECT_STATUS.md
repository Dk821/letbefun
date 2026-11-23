# letbe.fun — Project Status

_Last updated: 2026-11-23 — rebranded to letbe.fun (dark-first theme, new hero, logo assets)_

Frontend-only mini-games platform (React + Vite + Tailwind v4 + Framer Motion + Three.js). No backend, no accounts, no required external APIs.

---

## 1. Delivery stages

| # | Stage | Status |
|---|-------|--------|
| 1 | Architecture + shared design system (tokens, light/dark theme, fonts, buttons, cards) | ✅ Done |
| 2 | Home page + game directory (Explore: search, category filter, sort) | ✅ Done |
| 3 | All 15 games implemented and playable | ✅ Done |
| 4 | Local persistence (LocalStorage + IndexedDB), favorites, recently played | ✅ Done |
| 5 | Responsive layouts + basic accessibility | ✅ Done (automated audit not yet run) |
| 6 | Performance: lazy routes, lazy games, Three.js isolated chunk | ✅ Done |
| 7 | Testing (headless Chrome smoke tests: all routes + all games, dev & prod builds) | ✅ Done (no real-device / cross-browser testing) |
| 8 | `npm run build` passes | ✅ Done |
| 9 | README + Vercel config | ✅ Done |
| 10 | Git init / GitHub push / Vercel deploy | ⏳ Not done |
| 11 | Accessibility audit (axe-core, WCAG 2 A/AA + best practice, 22 pages × light/dark) | ✅ 0 violations. Lighthouse not run |
| 12 | PNG Open Graph image | ✅ Done (`public/images/og.png`) |
| 13 | Per-game link previews for non-JS crawlers (needs prerendering) | ⏳ Out of scope for now |

---

## 2. Platform modules

| Module | File(s) | Notes |
|--------|---------|-------|
| App shell / routing | `src/App.jsx`, `src/main.jsx`, `src/layouts/MainLayout.jsx` | React Router, lazy pages, skip link, theme handling, error boundary |
| Home | `src/pages/Home.jsx` | Hero, featured, latest experiments, categories |
| Explore | `src/pages/Explore.jsx` | Search, category chips, sort (Newest / A–Z / Shortest); state kept in URL |
| Game page | `src/pages/GamePage.jsx` | Instructions screen → Start → game; Restart (remounts game), How to play, Favorite, Share, related games |
| Favorites / Recent | `src/pages/Collection.jsx` | Backed by LocalStorage |
| Settings | `src/pages/Settings.jsx` | Theme (system/light/dark), sound toggle, data usage, export JSON, reset all data |
| About / Privacy / 404 | `src/pages/About.jsx`, `Privacy.jsx`, `NotFound.jsx` | 404 also handles unknown game slugs, with "Surprise me" |
| Shared UI | `src/components/ui.jsx` | Loader, ErrorBoundary, FavoriteButton, ShareButton (Web Share API + clipboard fallback), GameCard, Stat, Section |
| Game registry | `src/games/registry.js` | Auto-discovers `src/games/*/index.jsx` with `import.meta.glob`; each game is a lazy chunk |
| Game metadata | `src/data/games.meta.js` | Single source of truth: slug, title, category, color, instructions, dates. Used by routes, SEO, sitemap |
| Hooks | `src/hooks/index.js` | `useGameData`, `useBestScore`, `useInterval`, `useStopwatch`, `useCountdown`, `useSound` (WebAudio synth, no files), `useIdbCollection`, `useSeo`, `useKey` |
| SEO | `useSeo` hook, `scripts/gen-sitemap.mjs`, `public/robots.txt`, `public/sitemap.xml` | Title, description, canonical, OG tags per route; sitemap generated before each build |
| Deployment | `vercel.json` | SPA rewrite for nested routes, immutable asset caching |

---

## 3. Data & storage modules

Location: `src/services/storage/`

| File | Purpose |
|------|---------|
| `local.js` | Versioned LocalStorage wrapper. Keys prefixed `dbx:`. Envelope `{ v: 1, d: data }`. Safe JSON parse, validator support, migration hook, in-memory fallback when storage is blocked/full |
| `idb.js` | IndexedDB key-value layer (DB `doodlebox`, store `items`), organised into collections; memory fallback if IndexedDB is unavailable |
| `store.js` | Observable stores persisted to LocalStorage (`createStore`, `useStore`), cross-tab sync via `storage` event, `gameStore` for per-game data |
| `index.js` | App stores: `themeStore`, `soundStore`, `favoritesStore`, `recentStore` (max 12); `toggleFavorite`, `markPlayed`, `resetEverything` |

### What is stored where

| Data | Storage | Key / collection |
|------|---------|------------------|
| Theme, sound | LocalStorage | `dbx:theme`, `dbx:sound` |
| Favorites, recent games | LocalStorage | `dbx:favorites`, `dbx:recent` |
| Reaction best + last 10 | LocalStorage | `dbx:game:reaction-test:best` / `:history` |
| Number Hunt records | LocalStorage | `dbx:game:number-guess:bests` |
| Color Guess best | LocalStorage | `dbx:game:color-guess:best` |
| Memory Match bests (per size) | LocalStorage | `dbx:game:memory-cards:bests` |
| Typing best WPM | LocalStorage | `dbx:game:typing-test:bestWpm` |
| Perfect Circle best | LocalStorage | `dbx:game:perfect-circle:best` |
| Password best rules passed | LocalStorage | `dbx:game:password-challenge:bestRules` |
| Spend the Fortune quantities | LocalStorage | `dbx:game:spend-the-fortune:qty` |
| Coin Clicker save | LocalStorage | `dbx:game:money-clicker:save` |
| Trolley choice tallies | LocalStorage | `dbx:game:trolley-dilemma:choices` |
| Scale zoom position | LocalStorage | `dbx:game:scale-of-the-universe:zoom` |
| Deep Sea deepest depth | LocalStorage | `dbx:game:deep-sea:deepest` |
| Discovered elements | IndexedDB | collection `craft-discovered` |
| Custom crafting recipes | IndexedDB | collection `craft-recipes` |
| Saved decision lists | IndexedDB | collection `decision-lists` |

Nothing sensitive is stored. Passwords typed in the Password Gauntlet are never saved.

### Static datasets (shipped in code)

| Dataset | File | Size |
|---------|------|------|
| Crafting recipes | `src/games/InfiniteCraft/recipes.js` | ~170 recipes, 4 base elements (finite on purpose; unknown combos do nothing) |
| Password rules | `src/games/PasswordChallenge/rules.js` | 14 rules |
| Purchasable items | `src/games/SpendMoney/items.js` | 24 items, $100B fortune |
| Trolley scenarios | `src/games/TrolleyDilemma/scenarios.js` | 12 fictional scenarios |
| Deep sea facts + zones | `src/games/DeepSea/data.js` | 13 facts, 5 zones, max depth 10,935 m |
| Universe objects | `src/games/ScaleOfUniverse/data.js` | 26 objects, 1.6e-35 m to 8.8e26 m |
| Asteroid physics + materials | `src/games/AsteroidSimulator/physics.js` | Simplified impact model, 3 materials |
| Procedural planet | `src/games/AsteroidSimulator/planet.js` | Noise-generated fictional planet "Terra" |

---

## 4. Game modules (15 / 15 playable)

| # | Game (route) | Folder | Key features | Persistence |
|---|--------------|--------|--------------|-------------|
| 1 | Element Alchemy `/games/infinite-craft` | `InfiniteCraft` | Drag or click-click combine, recipe engine, discovery progress, custom recipes, keyboard support | IndexedDB |
| 2 | Password Gauntlet `/games/password-challenge` | `PasswordChallenge` | 14 progressive rules, confirm step, progress bar | Best rules |
| 3 | Spend the Fortune `/games/spend-the-fortune` | `SpendMoney` | Live balance, buy/sell, type quantity, buy max, receipt, reset | Quantities |
| 4 | Perfect Circle `/games/perfect-circle` | `PerfectCircle` | Canvas pointer drawing, radial-variance score, closure/coverage checks, best-fit overlay | Best score |
| 5 | Deep Sea Descent `/games/deep-sea` | `DeepSea` | Depth-colored gradient, creatures, facts, depth meter, darkness overlay | Deepest depth |
| 6 | Asteroid Impact Lab `/games/asteroid-impact` | `AsteroidSimulator` | Three.js globe (lazy chunk), click to aim, presets, size/speed/angle/material, energy, crater, blast radii, quake, frequency; 2D map fallback without WebGL; labelled as approximate | None |
| 7 | Trolley Problems `/games/trolley-dilemma` | `TrolleyDilemma` | 12 scenarios, per-scenario local stats, tendency summary | Choice tallies |
| 8 | Scale of Everything `/games/scale-of-the-universe` | `ScaleOfUniverse` | SVG zoom, wheel/slider/keys, jump-to list, scale bar | Zoom level |
| 9 | Coin Clicker `/games/money-clicker` | `MoneyClicker` | Click/Space, 6 upgrades, auto income, pause, autosave, reset | Full save |
| 10 | Reaction Test `/games/reaction-test` | `ReactionTest` | Random delay, false start, Space key, avg of 5 | Best + history |
| 11 | Color Guess `/games/color-guess` | `ColorGuessing` | Two modes, HEX/RGB, 3 difficulties, 10 rounds, streak | Best score |
| 12 | Number Hunt `/games/number-guess` | `NumberGuessing` | 3 difficulties, higher/lower hints, input validation, history | Best per level |
| 13 | Memory Match `/games/memory-cards` | `MemoryCards` | 3 board sizes, moves, timer, pause | Best per size |
| 14 | Typing Sprint `/games/typing-test` | `TypingTest` | 15/30/60 s, live WPM + accuracy, per-character feedback, paste blocked | Best WPM |
| 15 | Decision Spinner `/games/decision-maker` | `DecisionMaker` | Add/remove options, animated spin, history, saved lists | IndexedDB |

---

## 5. Test results

Headless Chrome (Playwright) against the dev server and the production preview:
- All 10 page routes load without console errors.
- All 15 games start and respond to scripted interaction.
- Deeper flows verified: asteroid presets + globe click/drag, typing finish, memory board, custom recipe persisting after reload, scale wheel/slider extremes, deep-sea bottom, clicker save and reload, favorites round trip, Restart.

### Bugs found and fixed
1. Vite 8 rejected object-style `manualChunks` → removed (lazy loading already splits the bundle).
2. Four `useEffect`s returned non-function values (`destroy is not a function`) → converted to block bodies. This was the likely cause of the "Something went sideways" screen.
3. Password game updated state during render → moved to an effect.
4. Mobile header overlap and Deep Sea fact card overlap → fixed.

### Build output
- Main bundle ~419 kB (137 kB gzip).
- Three.js chunk ~543 kB (135 kB gzip), loaded only on the asteroid game.
- Each other game: 2–13 kB.

---

## 6. Known gaps / next steps

1. `git init`, commit, push to GitHub, connect to Vercel.
2. Run an accessibility and Lighthouse audit (focus order, dark-mode contrast, screen-reader pass) and fix findings.
3. Replace the SVG Open Graph image with a PNG.
4. Replace the placeholder domain `https://letbe.fun` (in `index.html` and `src/hooks/index.js`), or build with `SITE_URL=...`.
5. Test on real phones and in Safari and Firefox.
6. Optional: expand the crafting recipe set; self-host fonts to remove the only third-party request (Google Fonts); prerender per-game pages for link previews.
7. Optional: add an automated test suite (the Playwright smoke scripts currently live outside the repo, in the session scratchpad).
