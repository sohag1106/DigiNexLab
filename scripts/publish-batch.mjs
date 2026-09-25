// Publish the next batch of generated city articles.
//
//   node scripts/publish-batch.mjs [count]
//
// Defaults to +5 (the pacing guideline: ~5 new pages/week is what Google
// indexes readily; dumping 100 at once is the doorway-page pattern).
// `0` regenerates the sitemap for the current LIVE_COUNT without publishing.
//  - bumps LIVE_COUNT in src/pages/public/serial-block.js
//  - rewrites public/sitemap.xml with every URL that actually exists
//  - prints the URLs that just went live
//
// Run `npm run build` afterwards to prerender the new pages.

import { writeFileSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const serialPath = join(root, 'src/pages/public/serial-block.js')
const sitemapPath = join(root, 'public/sitemap.xml')
const BASE = 'https://brightskyit.com'

// ——— bump LIVE_COUNT ———
const serial = readFileSync(serialPath, 'utf8')
const m = serial.match(/export const LIVE_COUNT = (\d+)/)
if (!m) { console.error('LIVE_COUNT not found in', serialPath); process.exit(1) }
const oldCount = parseInt(m[1], 10)

const info = await import('../src/pages/public/focus-data.js')
const { CITIES } = await import('../src/pages/public/city-data.js')
const { TEAM } = await import('../src/pages/public/team-data.js')
const { POSTS } = await import('../src/pages/public/blog-data.js')

const add = parseInt(process.argv[2] || '5', 10)
if (add < 0 || !Number.isInteger(add)) { console.error('count must be >= 0'); process.exit(1) }
const newCount = Math.min(oldCount + add, info.CITIES_100.length)
writeFileSync(serialPath, serial.replace(/export const LIVE_COUNT = \d+/, `export const LIVE_COUNT = ${newCount}`))
console.log(`LIVE_COUNT: ${oldCount} → ${newCount}`)

// ——— sitemap: every URL that actually exists ———
// POSTS already includes the LIVE_COUNT generated articles (via livePosts()),
// so this never double-lists them. Generated hub URLs are intentionally NOT
// added — a hub page exists only once it is in city-data.js + main.jsx; the
// article CTAs fall back to Muscat/Dubai hubs until then.
//
// Team profile pages carry an <image:image> entry so the founder photo can be
// discovered and ranked in Google Images, not just in web search.
const IMAGE_NS = 'http://www.google.com/schemas/sitemap-image/1.1'
const allUrls = []
const push = (loc, lastmod, priority, images = []) =>
  allUrls.push({ loc, lastmod, priority, images })

push('https://brightskyit.com/', '2026-09-17', '1.0')
for (const t of ['team', 'blog']) push(`${BASE}/${t}/`, '2026-09-17', t === 'blog' ? '0.8' : '0.9')
for (const m of TEAM) {
  push(`${BASE}/team/${m.slug}/`, '2026-09-17', '0.8', [
    {
      loc: `${BASE}${m.photo}`,
      caption: m.photoCaption || `${m.name}, ${m.role} at BrightSkyIT`,
      title: m.photoCaption || `${m.name}, ${m.role} at BrightSkyIT`,
    },
  ])
}
for (const p of POSTS) if (p.slug) push(`${BASE}/blog/${p.slug}/`, p.date, '0.8')
for (const c of CITIES) push(`${BASE}/${c.slug}/`, '2026-09-21', '0.9')

const urlset = allUrls
  .map((u) => {
    const images = (u.images || [])
      .map(
        (im) =>
          `\n    <image:image>\n      <image:loc>${im.loc}</image:loc>\n      <image:title>${im.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</image:title>\n      <image:caption>${im.caption.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</image:caption>\n    </image:image>`
      )
      .join('')
    return `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.loc === 'https://brightskyit.com/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${u.priority}</priority>${images}\n  </url>`
  })
  .join('\n')

writeFileSync(
  sitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="${IMAGE_NS}">\n${urlset}\n</urlset>\n`
)
console.log(`Sitemap: ${allUrls.length} URLs, ${allUrls.reduce((n, u) => n + (u.images?.length || 0), 0)} images`)

// ——— summary ———
const { buildCityArticles } = await import('../src/pages/public/kicker-focus.js')
const liveArticles = buildCityArticles(newCount)
const newlyLive = liveArticles.slice(newCount - add)
console.log('\nNewly live articles:')
for (const a of newlyLive) console.log(`  /blog/${a.slug}/  (${a.title})`)