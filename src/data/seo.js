// Single source of truth for SEO. Pure JS (no JSX) because it is used both by the
// app at runtime (useSeo) and by the build scripts (sitemap + prerender).
import { GAMES } from './games.meta.js'

export const SITE = 'https://letbe.fun'
export const SITE_NAME = 'letbe.fun'
export const OG_IMAGE = `${SITE}/images/og.png`
export const OG_IMAGE_ALT = 'letbe.fun logo with a smiling game controller'

const HOME_DESCRIPTION = `Play ${GAMES.length} free browser games and curious experiments on letbe.fun. No downloads, no sign-up. Quick puzzles, arcade games and more.`

// Search-friendly <title> per game (the in-app headings keep the short names).
const GAME_TITLES = {
  'infinite-craft': 'Element Alchemy: Free Element Combining Game',
  'password-challenge': 'Password Gauntlet: The Password Rules Game',
  'spend-the-fortune': 'Spend the Fortune: Spend $100 Billion Game',
  'perfect-circle': 'Draw a Perfect Circle: Free Online Test',
  'deep-sea': 'Deep Sea Descent: Scroll to the Ocean Floor',
  'asteroid-impact': 'Asteroid Impact Simulator: Free 3D Calculator',
  'trolley-dilemma': 'Trolley Problem Game: 12 Moral Dilemmas',
  'scale-of-the-universe': 'Scale of the Universe: Interactive Zoom',
  'money-clicker': 'Coin Clicker: Free Online Idle Game',
  'reaction-test': 'Reaction Time Test: How Fast Are You?',
  'color-guess': 'Color Guessing Game: HEX and RGB Quiz',
  'number-guess': 'Number Guessing Game Online',
  'memory-cards': 'Memory Match: Free Card Matching Game',
  'typing-test': 'Typing Speed Test: Check Your WPM',
  'decision-maker': 'Decision Spinner: Random Choice Picker',
  snake: 'Snake Game: Play Free Online',
  'game-2048': '2048: Play the Puzzle Game Free Online',
  minesweeper: 'Minesweeper: Play Free Online',
  'tic-tac-toe': 'Tic-Tac-Toe: Play Against the Computer',
  'whack-a-mole': 'Whack-a-Mole: Free Online Game',
  'simon-says': 'Simon Says: Online Memory Game',
  'sliding-puzzle': 'Sliding Puzzle: Free 8 and 15 Puzzle',
  hangman: 'Hangman: Free Online Word Game',
  'higher-lower': 'Higher or Lower: Free Card Game',
  'click-speed': 'Click Speed Test: Check Your CPS',
  'aim-trainer': 'Aim Trainer: Free Online Aim Test',
  'lights-out': 'Lights Out: Free Online Puzzle Game',
  'flappy-bird': 'Flappy Bird: Play Free in Your Browser',
  'tower-of-hanoi': 'Tower of Hanoi: Play the Puzzle Online',
  'dice-and-coin': 'Online Dice Roller and Coin Flip',
}

const BASE_KEYWORDS = ['free online games', 'browser games', 'no download games', 'letbe.fun']

const absolute = (path) => `${SITE}${path === '/' ? '/' : path}`

const publisher = { '@type': 'Organization', name: SITE_NAME, url: `${SITE}/`, logo: `${SITE}/icon-512.png` }

const gameList = () => ({
  '@type': 'ItemList',
  numberOfItems: GAMES.length,
  itemListElement: GAMES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.title, url: absolute(`/games/${g.slug}`) })),
})

function page({ path, title, description, keywords = [], noindex = false, jsonLd = null }) {
  return {
    path,
    title,
    description,
    keywords: [...keywords, ...BASE_KEYWORDS].join(', '),
    noindex,
    url: absolute(path),
    jsonLd: jsonLd && { '@context': 'https://schema.org', '@graph': jsonLd },
  }
}

export const PAGES = {
  home: page({
    path: '/',
    title: `letbe.fun: ${GAMES.length} Free Browser Games, No Download`,
    description: HOME_DESCRIPTION,
    keywords: ['mini games', 'puzzle games', 'arcade games', 'fun websites'],
    jsonLd: [
      { '@type': 'WebSite', '@id': `${SITE}/#website`, name: SITE_NAME, alternateName: 'letbe fun', url: `${SITE}/`, description: HOME_DESCRIPTION, inLanguage: 'en', publisher },
      gameList(),
    ],
  }),
  explore: page({
    path: '/explore',
    title: 'All Free Online Games | letbe.fun',
    description: `Browse, search and filter all ${GAMES.length} free browser games on letbe.fun: puzzle, arcade, simulation, thought experiments and tools.`,
    jsonLd: [{ '@type': 'CollectionPage', name: 'All games', url: absolute('/explore'), mainEntity: gameList() }],
  }),
  about: page({ path: '/about', title: 'About | letbe.fun', description: 'What letbe.fun is, and why it exists: a small, hand-built collection of free browser games and interactive experiments.' }),
  privacy: page({ path: '/privacy', title: 'Privacy | letbe.fun', description: 'letbe.fun stores your game data only in your browser. Here is exactly what is stored and why.' }),
  favorites: page({ path: '/favorites', title: 'Favorites | letbe.fun', description: 'Games you saved on this device.', noindex: true }),
  recent: page({ path: '/recent', title: 'Recently Played | letbe.fun', description: 'Games you played recently on this device.', noindex: true }),
  settings: page({ path: '/settings', title: 'Settings | letbe.fun', description: 'Theme, sound and local data controls for letbe.fun.', noindex: true }),
  notFound: page({ path: '/404', title: 'Page Not Found | letbe.fun', description: 'This page wandered off.', noindex: true }),
}

export function gameSeo(game) {
  const path = `/games/${game.slug}`
  const description = `${game.tagline} ${game.description}`
  return page({
    path,
    keywords: [game.title.toLowerCase(), `${game.title.toLowerCase()} online`, `${game.category.toLowerCase()} games`],
    title: `${GAME_TITLES[game.slug] || game.title} | letbe.fun`,
    description,
    jsonLd: [
      {
        '@type': ['VideoGame', 'WebApplication'],
        name: game.title,
        url: absolute(path),
        description,
        image: OG_IMAGE,
        genre: game.category,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        gamePlatform: 'Web browser',
        datePublished: game.added,
        inLanguage: 'en',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          ['Home', '/'],
          ['All games', '/explore'],
          [game.title, path],
        ].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: absolute(p) })),
      },
    ],
  })
}
