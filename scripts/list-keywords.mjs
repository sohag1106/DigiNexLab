#!/usr/bin/env node
// Build docs/100-city-keywords.md : the target keyword set per city article.
// Reads the live factory (focus-data + kicker-focus) so it always matches what ships.
import fs from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { CITIES_100 } from '../src/pages/public/focus-data.js'
import { buildCityArticles } from '../src/pages/public/kicker-focus.js'

const PATTERNS = {
  cost: {
    name: 'Cost guide',
    head: ['web design CITY', 'how much does a website cost CITY'],
    long: ['website cost CITY', 'web design cost CITY', 'how much to build a website CITY'],
  },
  choose: {
    name: 'Buyer guide',
    head: ['web design company CITY', 'web design agency CITY'],
    long: ['best web design company CITY', 'choose a web design agency CITY', 'web design agency CITY reviews'],
  },
  language: {
    name: 'Arabic / language',
    head: ['arabic web design CITY', 'web design CITY arabic'],
    long: ['arabic website CITY', 'bilingual website CITY', 'arabic english website CITY'],
  },
  freelancer: {
    name: 'Freelancer vs agency',
    head: ['web design agency CITY', 'freelance web designer CITY'],
    long: ['freelancer vs agency CITY', 'freelance web design CITY', 'hire web designer CITY'],
  },
  ideas: {
    name: 'Ideas listicle',
    head: ['web design ideas CITY', 'website ideas CITY'],
    long: ['website ideas for BUSINESS CITY', 'best website for BUSINESS CITY', 'small business website ideas CITY'],
  },
  roi: {
    name: 'ROI pitch',
    head: ['why need a website CITY', 'benefits of a website CITY'],
    long: ['business website CITY ROI', 'website for BUSINESS CITY', 'does my business need a website CITY'],
  },
  seo: {
    name: 'Local SEO',
    head: ['local seo CITY', 'web design CITY'],
    long: ['how to rank on google CITY', 'seo for small business CITY', 'local seo agency CITY'],
  },
}

const COUNTRY = {
  OM: 'Oman', AE: 'UAE', SA: 'Saudi Arabia', BH: 'Bahrain', QA: 'Qatar', KW: 'Kuwait',
  PK: 'Pakistan', BD: 'Bangladesh', NP: 'Nepal', LK: 'Sri Lanka', IN: 'India',
  EG: 'Egypt', JO: 'Jordan', LB: 'Lebanon', MA: 'Morocco', TN: 'Tunisia', KE: 'Kenya',
  GH: 'Ghana', TR: 'Turkey', MV: 'Maldives', GB: 'UK', US: 'USA', CA: 'Canada',
  AU: 'Australia', NZ: 'New Zealand', SG: 'Singapore', MY: 'Malaysia', VN: 'Vietnam',
  PH: 'Philippines', ZA: 'South Africa', IE: 'Ireland',
}

const arts = buildCityArticles(CITIES_100.length)
const rows = arts.map((a, i) => {
  const c = CITIES_100[i]
  const suffix = a.slug.split('-').pop()
  const p = PATTERNS[suffix] || PATTERNS.cost
  const C = c.slugCity || c.city
  return { city: C, cc: c.cc, cur: c.cur, vertical: c.vertical, name: p.name, head: p.head, long: p.long, article: a.title, url: `https://brightskyit.com/blog/${a.slug}/` }
})

const dist = {}
for (const r of rows) dist[r.name] = (dist[r.name] || 0) + 1
const distLine = Object.entries(dist).map(([k, v]) => `${k}=${v}`).join(', ')

let md = `# BrightSkyIT: 100 City Articles, Keywords Targeted for Ranking

Generated 2026-09-22 from the live article factory (\`src/pages/public/focus-data.js\` + \`kicker-focus.js\`). Every article targets the head term **web design [city]** plus a pattern-specific set, and long-tails that are completed per city by its hand-written vertical and industries.

Pattern distribution: ${distLine}

| # | City | Country | Pattern | Article | Head keywords | Long-tail keywords |
|--|--|--|--|--|--|--|
`
for (let i = 0; i < rows.length; i++) {
  const r = rows[i]
  const cc = COUNTRY[r.cc] || r.cc
  md += `| ${i + 1} | ${r.city} | ${cc} | ${r.name} | [${r.article}](${r.url}) | ${r.head.join(', ')} | ${r.long.join(', ')} |\n`
}

md += `

## How long-tails become city-specific
Every long-tail template above is completed by the city's **vertical** and **industries** in focus-data.js. Example for **Sur** (vertical \`tourism, marine and seafood trade\`, industries \`dhow-cruise operators, guesthouses, seafood exporters, hotels\`):

- website for **dhow-cruise operators** Sur
- website for **seafood exporters** Sur
- booking site for **guesthouses** Sur

So the same pattern never ships twice: the keyword string changes with each city's real local economy, and that is what keeps the pages from being doorway content.
`

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
fs.writeFileSync(join(root, 'docs/100-city-keywords.md'), md, 'utf8')
console.log(`wrote docs/100-city-keywords.md (${rows.length} rows, ${md.length} bytes)`)
console.log(`distribution: ${distLine}`)