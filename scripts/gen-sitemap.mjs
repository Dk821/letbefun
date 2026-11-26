import { writeFileSync } from 'node:fs'
import { GAMES } from '../src/data/games.meta.js'
import { PAGES, SITE, gameSeo } from '../src/data/seo.js'

// Only indexable pages belong in the sitemap. lastmod is set only where we know a real date.
const entries = [
  ...Object.values(PAGES).filter((p) => !p.noindex).map((p) => ({ url: p.url })),
  ...GAMES.map((g) => ({ url: gameSeo(g).url, lastmod: g.added })),
]
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url><loc>${e.url}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
writeFileSync(new URL('../public/robots.txt', import.meta.url), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`sitemap.xml written with ${entries.length} URLs`)
