# letbe.fun: Project Architecture and Data

_Last updated: 2026-11-28_

A static, frontend-only site with 32 browser mini-games. No backend, no accounts, no environment variables.
Production domain: `https://www.letbe.fun` (made by madgen.space).

---

## 1. Tech stack

| Area | Tool |
| --- | --- |
| UI | React 19, JavaScript (JSX) |
| Build | Vite 8 (target `es2020`) |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4, `src/styles/index.css`, `src/styles/mobile.css` |
| Animation | Framer Motion |
| 3D | Three.js (asteroid game only) |
| Icons | Lucide React |
| Analytics | Google Tag Manager (`GTM-WH3CJ86T`), Vercel Web Analytics |
| Hosting | Vercel |

```bash
npm install
npm run dev       # local dev server, http://localhost:5173
npm run build     # sitemap, Vite build, prerender
npm run preview   # serve the production build
```

---

## 2. Architecture

### Runtime flow

```
index.html            GTM snippet, fonts, early theme script
  └─ src/main.jsx     BrowserRouter + Vercel <Analytics />
      └─ src/App.jsx  ErrorBoundary > Suspense > Routes (lazy pages)
          └─ MainLayout   header, footer, theme, scroll to top
              └─ Page     calls useSeo() (meta tags + page-view event)
                  └─ GamePage > registry.js > games/<Folder>/index.jsx (lazy chunk)
```

### Data flow

```
data/games.meta.js ──┬─> registry.js        (slug -> lazy component)
                     ├─> Home / Explore / GamePage
                     └─> data/seo.js ──┬─> useSeo()          (in the browser)
                                       ├─> gen-sitemap.mjs   (before build)
                                       └─> prerender.mjs     (after build)
data/content.js ─────┬─> About / Privacy / Contact / Terms / Disclaimer, footer
                     └─> prerender.mjs

Game component ─> hooks ─> services/storage ─> LocalStorage / IndexedDB
```

### Build pipeline

| Step | Command | Result |
| --- | --- | --- |
| `prebuild` | `node scripts/gen-sitemap.mjs` | Writes `public/sitemap.xml` and `public/robots.txt` |
| `build` | `vite build` | Bundles the app into `dist/` |
| `postbuild` | `node scripts/prerender.mjs` | Writes one HTML file per route, plus `404.html` (43 pages) |

---

## 3. File structure

```
index.html              entry HTML; seo:start / seo:end markers are replaced at build time
package.json            dependencies and scripts
vite.config.js          React and Tailwind plugins
vercel.json             clean URLs, no trailing slash, long cache for /assets
scripts/
  gen-sitemap.mjs       sitemap and robots.txt
  prerender.mjs         static HTML per route
public/                 icons, logo, images/, site.webmanifest, sitemap.xml, robots.txt
src/
  main.jsx              React entry
  App.jsx               route table
  layouts/MainLayout.jsx
  pages/                Home, Explore, GamePage, Collection, Settings,
                        About, Privacy, Contact, Terms, Disclaimer, NotFound
  components/
    ui.jsx              Loader, ErrorBoundary, FavoriteButton, ShareButton, GameCard, Stat, Section
    TextPage.jsx        layout for text pages
  hooks/index.js        shared hooks
  services/storage/
    local.js            LocalStorage wrapper
    idb.js              IndexedDB wrapper
    store.js            observable stores
    index.js            app stores and actions
  data/
    games.meta.js       game metadata
    seo.js              titles, descriptions, structured data
    content.js          text page content and footer links
  games/
    registry.js         auto-discovers games/*/index.jsx
    <Folder>/index.jsx  one folder per game
  styles/               index.css, mobile.css
```

---

## 4. Routes

| Route | Page | Indexed by search engines |
| --- | --- | --- |
| `/` | Home | Yes |
| `/explore` | All games: search, category filter, sort (kept in the URL as `q`, `category`, `sort`) | Yes |
| `/games/:slug` | Game page: instructions, play, related games | Yes |
| `/about`, `/privacy`, `/contact`, `/terms`, `/disclaimer` | Text pages | Yes |
| `/favorites`, `/recent` | Saved and recently played games | No |
| `/settings` | Theme, sound, export and reset data | No |
| `*` | Not found | No |

---

## 5. Data files

### `src/data/games.meta.js`

The main source for the game list. `CATEGORIES`: Creative, Puzzle, Simulation, Thought, Arcade, Tools.

| Field | Meaning |
| --- | --- |
| `slug` | URL part: `/games/<slug>` |
| `folder` | Directory under `src/games/` |
| `title`, `tagline`, `description` | Display and SEO text |
| `emoji`, `color` | Card and game page styling |
| `startColor` | Optional: highlights the game page Start button in this colour |
| `category` | One of `CATEGORIES` |
| `minutes` | Estimated play time, used by the "Shortest" sort |
| `added` | `YYYY-MM-DD`, used by the "Newest" sort and sitemap `lastmod` |
| `featured` | Optional flag |
| `instructions` | List of "How to play" steps |

`getMeta(slug)` returns one game.

### `src/data/seo.js`

`SITE`, `SITE_NAME`, `OG_IMAGE`, home heading text, per-game titles and descriptions, `PAGES` (one entry per page) and `gameSeo(game)`.
Each entry has `path`, `title`, `description`, `keywords`, `noindex`, `url` and `jsonLd`.

### `src/data/content.js`

`FOOTER_LINKS`, `ABOUT`, `PRIVACY`, `CONTACT`, `TERMS`, `DISCLAIMER`.

### Game datasets and logic

| File | Content |
| --- | --- |
| `games/InfiniteCraft/recipes.js`, `engine.js` | Crafting recipes and combine logic |
| `games/PasswordChallenge/rules.js` | Password rules |
| `games/SpendMoney/items.js` | Purchasable items |
| `games/TrolleyDilemma/scenarios.js` | Dilemma scenarios |
| `games/DeepSea/data.js` | Ocean facts and zones |
| `games/ScaleOfUniverse/data.js` | Objects by size |
| `games/PerfectCircle/score.js` | Circle scoring |
| `games/AsteroidSimulator/physics.js`, `planet.js`, `Globe3D.jsx` | Impact model, procedural planet, 3D globe |
| `games/SpaceImpact/data/` | Modes, difficulties, enemy and boss types, weapons |
| `games/SpaceImpact/engine/` | Canvas game engine (no React), drawing and synthesized audio |
| `games/SpaceImpact/components/` | Canvas, HUD, touch controls and screens |
| `games/BrickBreaker/data/` | Difficulties, 10 levels, Endless row generator, power-up types |
| `games/BrickBreaker/engine/` | Canvas game engine (no React), physics, collisions, drawing and synthesized audio |
| `games/BrickBreaker/components/` | Canvas, HUD, touch controls and screens |

---

## 6. Browser storage

All player data stays in the visitor's browser.

### LocalStorage

- Key prefix `dbx:`, value envelope `{ "v": 1, "d": <data> }`.
- Reads are validated. If storage is blocked or full, data is kept in memory for the session.
- Changes sync between open tabs.

| Key | Data |
| --- | --- |
| `dbx:theme` | `system`, `light` or `dark` (default `dark`) |
| `dbx:sound` | Boolean |
| `dbx:favorites` | List of slugs |
| `dbx:recent` | `[{ slug, at }]`, newest first, max 12 |
| `dbx:game:<slug>:<name>` | Per-game data (below) |

### Per-game keys

| Game slug | Names |
| --- | --- |
| `snake` | `best` (default settings), `best-<speed>-<size>-<walls>`, `options` |
| `game-2048`, `flappy-bird`, `whack-a-mole`, `simon-says`, `higher-lower`, `color-guess`, `perfect-circle` | `best` |
| `minesweeper`, `aim-trainer` | `best` (lower is better) |
| `click-speed` | `best<duration>` |
| `sliding-puzzle` | `best<size>` |
| `tower-of-hanoi` | `best<discs>` |
| `lights-out` | `best`, `solved` |
| `reaction-test` | `best`, `history` |
| `memory-cards`, `number-guess` | `bests` |
| `typing-test` | `bestWpm` |
| `password-challenge` | `bestRules` |
| `deep-sea` | `deepest` |
| `hangman` | `stats` |
| `tic-tac-toe` | `tally` |
| `trolley-dilemma` | `choices` |
| `scale-of-the-universe` | `zoom` |
| `spend-the-fortune` | `qty` |
| `money-clicker` | `save` |
| `space-impact` | `bests`, `stats` (played, destroyed, bestTime, bosses), `difficulty` |
| `brick-breaker` | `bests` (per mode), `stats` (played, highestLevel, bricks, powerups, time), `difficulty`, `control` |

`asteroid-impact` and `dice-and-coin` save no game data.

### IndexedDB

Database `doodlebox` (version 1), object store `items`, keys formatted as `<collection>/<key>`.

| Collection | Used by |
| --- | --- |
| `craft-discovered` | Element Alchemy discoveries |
| `craft-recipes` | Element Alchemy custom recipes |

Settings can export LocalStorage as JSON (IndexedDB is not included) and reset all data in both.

---

## 7. Shared hooks (`src/hooks/index.js`)

| Hook | Purpose |
| --- | --- |
| `useGameData` | Saved per-game value |
| `useBestScore` | Best score, higher or lower wins |
| `useInterval`, `useStopwatch`, `useCountdown` | Timers |
| `useSound` | Synthesized sound effects |
| `useIdbCollection` | IndexedDB collection |
| `useSeo` | Page title and meta tags, sends the page-view event |
| `useKey` | Keyboard listener |

---

## 8. Analytics

- GTM is loaded from `index.html` (script in `<head>`, `noscript` fallback in `<body>`).
- `useSeo` pushes this to `dataLayer` once per path change:

| Field | Example |
| --- | --- |
| `event` | `virtual_page_view` |
| `page_path` | `/games/snake` |
| `page_location` | Full URL |
| `page_title` | Page title |

Setup needed in the GTM and Google Analytics dashboards:

1. Data Layer Variables `page_path`, `page_location`, `page_title`.
2. Custom Event trigger `virtual_page_view`.
3. Google Tag with the `G-` Measurement ID and `send_page_view` = `false`.
4. GA4 Event tag `page_view` using the trigger and variables above.
5. In Enhanced measurement, turn off "Page changes based on browser history events".
6. Test with GTM Preview, then publish.

Third-party requests: Google Fonts, Google Tag Manager / Analytics, Vercel Web Analytics.

---

## 9. Adding content

**New game**
1. Add an entry to `src/data/games.meta.js`.
2. Create `src/games/<Folder>/index.jsx` with a default-exported component. It receives an `onExit` prop that closes the game.
3. Optionally add a search title to `GAME_TITLES` in `src/data/seo.js`.

**New page**
1. Add the route in `src/App.jsx`.
2. Add an entry to `PAGES` in `src/data/seo.js` and call `useSeo` in the page.
3. Add it to `scripts/prerender.mjs`.

---

## 10. Open items

- `FavoriteButton` is defined in `components/ui.jsx` but not rendered anywhere, so visitors cannot add favorites.
- The footer says "Everything stays in your browser", which needs review now that Google Analytics is added.
- No cookie consent banner exists.
- GTM dashboard setup and live tracking are not yet verified.
- `README.md` and `PROJECT_STATUS.md` still describe 15 games.
- No automated tests in the repository.
