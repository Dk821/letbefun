import { writeFileSync } from 'node:fs'
import { GAMES } from '../src/data/games.meta.js'

const SITE = process.env.SITE_URL || 'https://letbe.fun'
const today = new Date().toISOString().slice(0, 10)
const pages = ['', '/explore', '/favorites', '/recent', '/settings', '/about', '/privacy', ...GAMES.map((g) => `/games/${g.slug}`)]
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
writeFileSync(new URL('../public/robots.txt', import.meta.url), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`sitemap.xml written with ${pages.length} URLs`)
