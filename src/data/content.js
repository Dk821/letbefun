// Page text shared by the React pages and scripts/prerender.mjs, so both stay identical.
export const FOOTER_LINKS = [
  ['/about', 'About Us'],
  ['/contact', 'Contact Us'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms and Conditions'],
  ['/disclaimer', 'Disclaimer'],
]

export const ABOUT = [
  'letbe.fun is a small, hand-built collection of interactive toys, puzzles and thought experiments. Each one is meant to be played in a few minutes and to leave you slightly more curious than before.',
  'It is a static website. There is no server, no database, no account system, and only visitor analytics (Vercel Web Analytics and Google Analytics). Your scores, favorites and saved games live in your browser\'s own storage, and you can wipe them from Settings at any time.',
  'Every game, illustration and dataset here was created for this project. Science-flavored games (like the asteroid lab and the scale of the universe) are simplified for education, so please treat their numbers as approximations.',
  'Built with React, Vite, Tailwind CSS, Framer Motion and Three.js.',
]

// Each block is a heading, a list, or a paragraph (with an optional bold lead-in).
export const PRIVACY = [
  { lead: 'Short version:', text: 'your game data stays in your browser and we do not sell it. There is no backend. We use analytics to understand how the site is visited.' },
  { id: 'privacy-data', heading: 'What is stored on your device' },
  {
    list: [
      { lead: 'LocalStorage:', text: 'theme, sound preference, favorites, recently played games, best scores and small game progress.' },
      { lead: 'IndexedDB:', text: 'larger items such as discovered elements, custom recipes and your saved decision lists.' },
      { text: 'Passwords typed into the Password Gauntlet are never stored or transmitted. Do not reuse real passwords anywhere in games.' },
    ],
  },
  { id: 'privacy-services', heading: 'Third-party services' },
  { text: 'The site loads fonts from Google Fonts, which may log your IP address as any web request does. It uses Vercel Web Analytics to count anonymous page views without cookies.' },
  { text: 'The site also uses Google Tag Manager to load Google Analytics. Google Analytics sets cookies and collects information such as the pages you visit, your device and browser, and your approximate location. You can block these cookies in your browser settings.', link: { href: 'https://policies.google.com/technologies/partner-sites', label: 'How Google uses this data' } },
  { id: 'privacy-control', heading: 'Your control' },
  { text: 'Open Settings to export or permanently delete everything stored by this site. Clearing your browser data does the same.' },
]

export const CONTACT = [
  { text: 'letbe.fun is made by madgen.space.' },
  { text: 'For questions, feedback, bug reports or content concerns, contact us through our website:', link: { href: 'https://madgen.space', label: 'madgen.space' } },
  { text: 'If you are reporting a problem with a game, please include the game name, your device and browser, and what happened.' },
]

export const TERMS = [
  { text: 'By using letbe.fun you agree to these terms. If you do not agree, please do not use the site.' },
  { id: 'terms-use', heading: 'Using the site' },
  { text: 'The games on letbe.fun are free to play in your browser and need no account. They are provided for personal entertainment and learning.' },
  { text: 'Do not misuse the site, for example by trying to disrupt it, break its security or use it for anything unlawful.' },
  { id: 'terms-data', heading: 'Your saved data' },
  { text: 'Scores, favorites and game progress are stored in your own browser. They can be lost if you clear your browser data or change device, and we cannot recover them.' },
  { id: 'terms-availability', heading: 'Availability and changes' },
  { text: 'The site is provided as is, without warranties. Games may be changed, added or removed, and the site may be unavailable at times.' },
  { text: 'To the extent permitted by law, we are not liable for any loss or damage resulting from your use of the site.' },
  { text: 'We may update these terms. Continuing to use the site after a change means you accept the updated terms.' },
]

export const DISCLAIMER = [
  { text: 'letbe.fun is an entertainment site. Nothing on it is professional, financial, scientific, security or ethical advice.' },
  { id: 'disclaimer-simulations', heading: 'Simulations and facts' },
  { text: 'Science-themed experiences, such as the asteroid impact lab, the deep sea descent and the scale of the universe, are simplified for education. Treat their numbers and facts as approximations.' },
  { id: 'disclaimer-fiction', heading: 'Fictional content' },
  { text: 'The money in Spend the Fortune is fictional and its prices are rounded and approximate. The scenarios in Trolley Problems are fictional.' },
  { id: 'disclaimer-passwords', heading: 'Passwords' },
  { text: 'Password Gauntlet is a game, not a password strength checker. Never use a real password in it, and do not reuse a password from the game anywhere.' },
  { id: 'disclaimer-links', heading: 'External links' },
  { text: 'We are not responsible for the content or practices of external websites that we link to.' },
]
