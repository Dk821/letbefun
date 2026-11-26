// Runs after `vite build`. Writes one static HTML file per route into dist/, each with its
// own title, meta tags, structured data and readable content, so search engines and
// link-preview bots see real pages without running JavaScript. React replaces #root on load.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { ABOUT, PRIVACY } from '../src/data/content.js'
import { GAMES } from '../src/data/games.meta.js'
import { HOME_H1, HOME_SUBHEADING, OG_IMAGE, OG_IMAGE_ALT, PAGES, SITE_NAME, gameSeo } from '../src/data/seo.js'

const dist = new URL('../dist/', import.meta.url)
const template = readFileSync(new URL('index.html', dist), 'utf8')

const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/
const ROOT = '<div id="root"></div>'
if (!SEO_BLOCK.test(template) || !template.includes(ROOT)) throw new Error('prerender: index.html is missing the seo markers or #root')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const meta = (key, name, content) => `<meta ${key}="${name}" content="${esc(content)}" />`

function head({ title, description, keywords, url, noindex, jsonLd }) {
  return [
    `<title>${esc(title)}</title>`,
    meta('name', 'description', description),
    meta('name', 'keywords', keywords),
    meta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'),
    !noindex && `<link rel="canonical" href="${esc(url)}" />`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:locale', 'en_US'),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', OG_IMAGE),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:type', 'image/png'),
    meta('property', 'og:image:alt', OG_IMAGE_ALT),
    jsonLd && `<script type="application/ld+json" id="ld-json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].filter(Boolean).join('\n    ')
}

const link = (href, text) => `<a href="${href}">${esc(text)}</a>`
const gameLinks = (games) => `<ul>${games.map((g) => `<li>${link(`/games/${g.slug}`, g.title)}: ${esc(g.tagline)}</li>`).join('')}</ul>`
const shell = (heading, content) => `<div class="mx-auto max-w-3xl px-4 py-10">
<h1 class="text-4xl font-extrabold">${esc(heading)}</h1>
${content}
<nav aria-label="Site">${[['/', 'Home'], ['/explore', 'All games'], ['/about', 'About'], ['/privacy', 'Privacy']].map(([h, t]) => link(h, t)).join(' · ')}</nav>
</div>`

const paragraphs = (texts) => texts.map((t) => `<p>${esc(t)}</p>`).join('')
const rich = ({ lead, text }) => `${lead ? `<strong>${esc(lead)}</strong> ` : ''}${esc(text)}`
const privacyHtml = PRIVACY.map((b) => {
  if (b.heading) return `<h2 id="${b.id}">${esc(b.heading)}</h2>`
  if (b.list) return `<ul>${b.list.map((i) => `<li>${rich(i)}</li>`).join('')}</ul>`
  return `<p>${rich(b)}</p>`
}).join('')

function write(file, seo, body) {
  const target = new URL(file, dist)
  mkdirSync(new URL('./', target), { recursive: true })
  // Function replacers keep "$" in game text (e.g. "$100 billion") from being treated as a pattern.
  writeFileSync(target, template.replace(SEO_BLOCK, () => head(seo)).replace(ROOT, () => `<div id="root">${body}</div>`))
}

write('index.html', PAGES.home, shell(Object.values(HOME_H1).join(''), `<p>${esc(HOME_SUBHEADING)}</p>${gameLinks(GAMES)}`))
write('explore/index.html', PAGES.explore, shell('All games', `<p>${esc(PAGES.explore.description)}</p>${gameLinks(GAMES)}`))
write('about/index.html', PAGES.about, shell('About letbe.fun', paragraphs(ABOUT)))
write('privacy/index.html', PAGES.privacy, shell('Privacy', privacyHtml))
for (const [key, heading] of [['favorites', 'Favorites'], ['recent', 'Recently played'], ['settings', 'Settings']]) {
  write(`${key}/index.html`, PAGES[key], shell(heading, `<p>${esc(PAGES[key].description)}</p>`))
}
for (const g of GAMES) {
  const related = GAMES.filter((x) => x.category === g.category && x.slug !== g.slug).slice(0, 6)
  write(
    `games/${g.slug}/index.html`,
    gameSeo(g),
    shell(g.title, `<p>${esc(g.tagline)}</p><p>${esc(g.description)}</p>
<h2>How to play</h2><ol>${g.instructions.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
<h2>More ${esc(g.category.toLowerCase())} games</h2>${gameLinks(related)}`),
  )
}
// Served by Vercel with a real 404 status for any unknown URL; the app then renders NotFound.
write('404.html', PAGES.notFound, shell('Page not found', '<p>This page wandered off.</p>'))

console.log(`prerendered ${GAMES.length + 8} HTML pages`)
