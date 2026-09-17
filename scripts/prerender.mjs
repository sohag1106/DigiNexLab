// Build-time prerender: render each public route headlessly and write real
// HTML so Googlebot sees the final title, canonical, OG tags and JSON-LD
// without waiting on client JS. Cloudflare Pages serves these files for
// their exact path; everything else falls through to the SPA's index.html.
//
// jsdom never executes <script type="module"> tags from HTML, so the built
// bundle is injected as a classic inline script, then removed again before
// serializing — the output keeps the original module tag so the SPA still
// boots and re-renders on the client.
import { JSDOM } from 'jsdom'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const DIST = 'dist'
const BASE = 'https://brightskyit.com'

// team-data.js is a plain ES module with no DOM references — import directly.
const { TEAM } = await import('../src/pages/public/team-data.js')

const routes = [
  { path: '/', wait: 500 },
  { path: '/team', wait: 500 },
  ...TEAM.map((m) => ({ path: `/team/${m.slug}`, wait: 500 })),
]

const indexHtml = readFileSync(`${DIST}/index.html`, 'utf8')
const bundleName = indexHtml.match(/assets\/index-[^"]+\.js/)?.[0]
if (!bundleName) throw new Error('Could not find the JS bundle in dist/index.html — run vite build first')
const bundle = readFileSync(`${DIST}/${bundleName}`, 'utf8')

for (const { path, wait } of routes) {
  const dom = new JSDOM(indexHtml, {
    url: `${BASE}${path}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }))
      window.scrollTo = () => {}
    },
  })

  const script = dom.window.document.createElement('script')
  script.textContent = bundle
  dom.window.document.body.appendChild(script)
  await new Promise((r) => setTimeout(r, wait))
  script.remove() // keep the SPA's own module tag for client-side boot

  const html = '<!doctype html>\n' + dom.window.document.documentElement.outerHTML
  const file = `${DIST}${path === '/' ? '/index.html' : `${path}/index.html`}`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  console.log(`prerendered ${path}  ->  "${dom.window.document.title}"`)
  dom.window.close()
}
console.log('done')
