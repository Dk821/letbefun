// Page text shared by the React pages and scripts/prerender.mjs, so both stay identical.
export const ABOUT = [
  'letbe.fun is a small, hand-built collection of interactive toys, puzzles and thought experiments. Each one is meant to be played in a few minutes and to leave you slightly more curious than before.',
  'It is a static website. There is no server, no database, no account system, and only anonymous, cookie-free page-view analytics (Vercel Web Analytics). Your scores, favorites and saved games live in your browser\'s own storage, and you can wipe them from Settings at any time.',
  'Every game, illustration and dataset here was created for this project. Science-flavored games (like the asteroid lab and the scale of the universe) are simplified for education, so please treat their numbers as approximations.',
  'Built with React, Vite, Tailwind CSS, Framer Motion and Three.js.',
]

// Each block is a heading, a list, or a paragraph (with an optional bold lead-in).
export const PRIVACY = [
  { lead: 'Short version:', text: 'letbe.fun does not collect, send or sell any data. There is no backend.' },
  { id: 'privacy-data', heading: 'What is stored on your device' },
  {
    list: [
      { lead: 'LocalStorage:', text: 'theme, sound preference, favorites, recently played games, best scores and small game progress.' },
      { lead: 'IndexedDB:', text: 'larger items such as discovered elements, custom recipes and your saved decision lists.' },
      { text: 'Passwords typed into the Password Gauntlet are never stored or transmitted. Do not reuse real passwords anywhere in games.' },
    ],
  },
  { id: 'privacy-services', heading: 'Third-party services' },
  { text: 'The only external request the site makes is loading fonts from Google Fonts, which may log your IP address as any web request does. The site also uses Vercel Web Analytics to count anonymous page views; it sets no cookies and does not track you across sites. No other third-party scripts, cookies or trackers are used. If you host a copy yourself you can self-host the fonts.' },
  { id: 'privacy-control', heading: 'Your control' },
  { text: 'Open Settings to export or permanently delete everything stored by this site. Clearing your browser data does the same.' },
]
