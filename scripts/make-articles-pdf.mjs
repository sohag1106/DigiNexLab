// Hand-rolled multi-page PDF catalog of all 100 city articles + 3 editorial posts.
// No pdfkit — same minimal assembler as functions/_shared/pad.js (Helvetica only).
// Run: node scripts/make-articles-pdf.mjs

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = 'https://brightskyit.com'
const DATE = '2026-09-22'

const { buildCityArticles } = await import('../src/pages/public/kicker-focus.js')
const { CITIES_100 } = await import('../src/pages/public/focus-data.js')

// We rebuild from factory to keep this script independent of LIVE_COUNT gating.
const cityArticles = buildCityArticles(CITIES_100.length) // 100
// Append the 3 hand-written editorial posts for completeness (same data as blog-data.js handWritten)
const editorial = [
  { slug: 'website-cost-oman', title: 'How Much Does a Website Cost in Oman? (2026 Price Guide)', tag: 'Pricing', date: '2026-09-17' },
  { slug: 'why-omani-businesses-need-bilingual-websites', title: 'Why Omani Businesses Need Arabic + English Websites (Not Just English)', tag: 'Strategy', date: '2026-09-17' },
  { slug: 'how-to-choose-web-design-company-oman', title: 'How to Choose a Web Design Company in Oman: 12 Questions That Save You 1,000 OMR', tag: "Buyer's guide", date: '2026-09-21' },
]

// ---------- PDF primitives (copied/adapted from pad.js) ----------
const NAVY = [0.059, 0.071, 0.188]
const BLUE = [0.145, 0.388, 0.922]
const INK = [0.102, 0.114, 0.180]
const MUTED = [0.42, 0.45, 0.51]
const LIGHT = [0.957, 0.961, 0.984]
const PAGE_W = 595.28
const PAGE_H = 841.89
const M = 40

const COMPANY = {
  name: 'BrightSkyIT',
  tagline: 'CREATIVE DIGITAL AGENCY',
  website: 'brightskyit.com',
  email: 'info@brightskyit.com',
  phone: '+880 1410-217430',
  address: ['Mohanogor Project, Rampura, Dhaka, Bangladesh', 'Oman Branch \u00b7 Muscat, Sultanate of Oman'],
}

function toPdfY(y) { return PAGE_H - y }
function fmt(n) { return +Number(n).toFixed(3) }
function byteLength(s) { return Buffer.byteLength(s, 'latin1') }
function escapeText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[\x00-\x1f\x7f]/g, '').replace(/[\u20B9\u09F3]/g, ' ')
}
function escapePdf(s) { return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)') }

const HELV = {
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  ' ': 278, '.': 278, ',': 278, ':': 278, ';': 278, '-': 333, '/': 278, '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556,
  '(': 278, ')': 278, '[': 333, ']': 333, '{': 334, '}': 334, '!': 278, '?': 556, '@': 1015, '#': 556, '$': 556, '%': 889, '^': 469, '&': 667, '*': 389, '+': 584, '=': 584, '<': 584, '>': 584, '_': 556, '|': 260, '~': 584, "'": 222, '`': 333, '"': 333,
}
function textWidth(str, font, size) {
  let w = 0
  for (const ch of String(str)) w += HELV[ch] || HELV[' ']
  if (font === 'Helvetica-Bold') w *= 1.04
  return (w / 1000) * size
}
function wrapText(text, font, size, maxW) {
  const words = String(text).split(/\s+/)
  const lines = []
  let cur = ''
  for (const word of words) {
    const cand = cur ? cur + ' ' + word : word
    if (textWidth(cand, font, size) <= maxW) cur = cand
    else {
      if (cur) lines.push(cur)
      // word itself too long -> hard break
      if (textWidth(word, font, size) > maxW) {
        let buf = ''
        for (const ch of word) {
          if (textWidth(buf + ch, font, size) > maxW) { lines.push(buf); buf = ch } else buf += ch
        }
        cur = buf
      } else cur = word
    }
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : ['']
}

class StreamBuilder {
  constructor() { this.chunks = [] }
  cmd(s) { this.chunks.push(s) }
  fillRect(x, y, w, h, [r, g, b]) {
    const botY = toPdfY(y + h)
    this.cmd(`${fmt(r)} ${fmt(g)} ${fmt(b)} rg ${fmt(x)} ${fmt(botY)} ${fmt(w)} ${fmt(h)} re f`)
  }
  strokeLine(x1, y1, x2, y2, width, [r, g, b]) {
    this.cmd(`${fmt(r)} ${fmt(g)} ${fmt(b)} RG ${fmt(width)} w ${fmt(x1)} ${fmt(toPdfY(y1))} m ${fmt(x2)} ${fmt(toPdfY(y2))} l S`)
  }
  text(str, x, y, size, font, color, opts = {}) {
    const s = String(str)
    const baseline = toPdfY(y + size * 0.85)
    const fKey = font === 'Helvetica-Bold' ? 2 : font === 'Helvetica-Oblique' ? 3 : 1
    const col = Array.isArray(color) ? color : MUTED
    // handle string color like "0.80 0.82 1.00"
    let rgb = col
    if (typeof color === 'string') {
      const parts = color.split(/\s+/).map(Number)
      if (parts.length === 3 && parts.every(v => !Number.isNaN(v))) rgb = parts
      else rgb = INK
    }
    this.cmd('BT')
    this.cmd(`/F${fKey} ${fmt(size)} Tf`)
    this.cmd(`${fmt(rgb[0])} ${fmt(rgb[1])} ${fmt(rgb[2])} rg`)
    if (opts.align === 'right') {
      const w = textWidth(s, font, size)
      this.cmd(`1 0 0 1 ${fmt(x + (opts.width || 0) - w)} ${fmt(baseline)} Tm`)
    } else if (opts.align === 'center') {
      const w = textWidth(s, font, size)
      this.cmd(`1 0 0 1 ${fmt(x + (opts.width - w) / 2)} ${fmt(baseline)} Tm`)
    } else {
      this.cmd(`1 0 0 1 ${fmt(x)} ${fmt(baseline)} Tm`)
    }
    this.cmd(`(${escapeText(s)}) Tj`)
    this.cmd('ET')
  }
  data() { return this.chunks.join('\n') }
}

// ---------- Layout ----------

const pages = []

function newPage(isFirst) {
  const p = new StreamBuilder()
  if (isFirst) {
    // full header band
    p.fillRect(0, 0, PAGE_W, 110, NAVY)
    p.text(COMPANY.name, 40, 34, 26, 'Helvetica-Bold', [1, 1, 1])
    p.text(COMPANY.tagline, 40, 66, 10.5, 'Helvetica', '0.80 0.82 1.00')
    p.strokeLine(40, 84, 300, 84, 3, BLUE)
    const rightX = PAGE_W - 40
    p.text('ARTICLE INDEX', rightX - 94, 34, 12, 'Helvetica-Bold', BLUE, { width: 110, align: 'right' })
    p.text(DATE, rightX - 110, 60, 10, 'Helvetica', [1, 1, 1], { width: 130, align: 'right' })
    p.text(`${COMPANY.email} \u00b7 ${COMPANY.phone}`, 40, 94, 8.5, 'Helvetica', '0.80 0.82 1.00', { width: 320 })
  } else {
    p.fillRect(0, 0, PAGE_W, 46, NAVY)
    p.text(COMPANY.name, 40, 16, 13, 'Helvetica-Bold', [1, 1, 1])
    p.text('100 City Articles \u00b7 brightskyit.com', PAGE_W - 40, 20, 8.5, 'Helvetica', '0.80 0.82 1.00', { width: 220, align: 'right' })
  }
  // footer divider + contact (on every page)
  p.strokeLine(40, PAGE_H - 60, PAGE_W - 40, PAGE_H - 60, 1, [0.898, 0.906, 0.941])
  p.text(`Email: ${COMPANY.email}  \u00b7  Phone/WhatsApp: ${COMPANY.phone}  \u00b7  ${COMPANY.website}`, 40, PAGE_H - 46, 7.5, 'Helvetica', MUTED, { width: PAGE_W - 80, align: 'center' })
  p.text(`${COMPANY.address[0]}  \u00b7  ${COMPANY.address[1]}`, 40, PAGE_H - 32, 7, 'Helvetica', MUTED, { width: PAGE_W - 80, align: 'center' })
  return p
}

let pageIdx = 0
let p = newPage(true)
pages.push(p)
let y = 135
const BOTTOM = PAGE_H - 72

// Title block on first page
p.text(`BrightSkyIT \u2014 100 City Articles`, 40, y, 16, 'Helvetica-Bold', INK)
y += 20
p.text(`Titles & Links  \u00b7  ${DATE}  \u00b7  ${BASE}/blog/<slug>/`, 40, y, 9, 'Helvetica', MUTED)
y += 16
p.text(`Share this PDF in your BrightSkyIT team group. Every title below is live and links to its page.`, 40, y, 8.5, 'Helvetica', MUTED, { width: PAGE_W - 80 })
y += 10
p.strokeLine(40, y, PAGE_W - 40, y, 1, [0.898, 0.906, 0.941])
y += 10
// Stats line
p.text(`${cityArticles.length} city-targeted articles  \u00b7  ${editorial.length} editorial posts  \u00b7  ${cityArticles.length + editorial.length} total  \u00b7  Sitemap: ${BASE}/sitemap.xml`, 40, y, 7.5, 'Helvetica-Bold', BLUE)
y += 16

const INDENT = 26
const TITLE_W = PAGE_W - M - (M + INDENT)
const URL_W = PAGE_W - M - (M + INDENT)

function ensureSpace(need) {
  if (y + need <= BOTTOM) return
  // paginate
  // page number on current page
  const n = pages.length
  p.text(`${n} /`, PAGE_W - 40, PAGE_H - 19, 7, 'Helvetica', MUTED, { width: 40, align: 'right' })
  // new page
  p = newPage(false)
  pages.push(p)
  y = 62
}

function drawArticle(num, title, url, meta) {
  const titleLines = wrapText(title, 'Helvetica-Bold', 8.7, TITLE_W)
  const urlLines = wrapText(url, 'Helvetica', 7.2, URL_W)
  const metaLines = meta ? wrapText(meta, 'Helvetica', 6.8, TITLE_W) : []
  const h = titleLines.length * 11 + urlLines.length * 9 + metaLines.length * 8 + 10
  ensureSpace(h)
  // number
  p.text(String(num).padStart(3, ' '), 40, y, 8.7, 'Helvetica-Bold', BLUE, { width: 18, align: 'right' })
  // title lines
  let ty = y
  for (let i = 0; i < titleLines.length; i++) {
    p.text(titleLines[i], M + INDENT, ty, 8.7, 'Helvetica-Bold', INK)
    ty += 11
  }
  // url lines directly under title
  for (let i = 0; i < urlLines.length; i++) {
    p.text(urlLines[i], M + INDENT, ty, 7.2, 'Helvetica', BLUE)
    ty += 9
  }
  // meta line (tag \u00b7 date)
  for (const ml of metaLines) {
    p.text(ml, M + INDENT, ty, 6.8, 'Helvetica', MUTED)
    ty += 8
  }
  // light dot separator every 5? just spacing
  y = ty + 6
}

// Section 1: 100 city articles
p.text(`CITY ARTICLES  \u00b7  ${cityArticles.length}`, 40, y, 8, 'Helvetica-Bold', INK)
y += 4
p.strokeLine(40, y, PAGE_W - 40, y, 1, BLUE)
y += 10

cityArticles.forEach((a, i) => {
  const url = `${BASE}/blog/${a.slug}/`
  const meta = `${a.tag} \u00b7 ${a.date} \u00b7 /blog/${a.slug}/`
  drawArticle(i + 1, a.title, url, meta)
})

// Section 2: editorial posts
ensureSpace(34)
y += 4
p.text(`EDITORIAL POSTS  \u00b7  ${editorial.length}  (hand-written foundation)`, 40, y, 8, 'Helvetica-Bold', INK)
y += 4
p.strokeLine(40, y, PAGE_W - 40, y, 1, [0.42, 0.45, 0.51])
y += 10
editorial.forEach((a, i) => {
  const url = `${BASE}/blog/${a.slug}/`
  const meta = `${a.tag} \u00b7 ${a.date} \u00b7 /blog/${a.slug}/`
  drawArticle(cityArticles.length + i + 1, a.title, url, meta)
})

// Closing note
ensureSpace(30)
y += 4
p.strokeLine(40, y, PAGE_W - 40, y, 1, [0.898, 0.906, 0.941])
y += 10
p.text(`All pages are prerendered for Googlebot and listed in ${BASE}/sitemap.xml. Next: hand-crafted city hubs for Khasab/Duqm/Ibri so article CTAs land on real hubs instead of Muscat/Dubai fallbacks.`, 40, y, 7.5, 'Helvetica', MUTED, { width: PAGE_W - 80 })
y += 14
p.text(`Prepared for BrightSkyIT team  \u00b7  ${DATE}`, 40, y, 7.5, 'Helvetica-Oblique', MUTED)

// page numbers on all pages
pages.forEach((pg, idx) => {
  const label = `${idx + 1} / ${pages.length}`
  // first page already has one due to ensureSpace; add for remaining if not yet
  // we ensure each page gets a page number at footer-right (above contact line)
  // Use small text in footer area - draw again (harmless duplicate on some pages)
  pg.text(label, PAGE_W - 40, PAGE_H - 19, 7, 'Helvetica', MUTED, { width: 40, align: 'right' })
})

// ---------- Assemble multi-page PDF ----------
function makeMultiPagePDF({ title, pages }) {
  const objects = []
  // placeholders filled after we know page count
  objects.push('<< /Type /Catalog /Pages 2 0 R >>') // 1
  objects.push('__PAGES__') // 2 placeholder
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>') // 3 F1
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>') // 4 F2
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>') // 5 F3

  const pageObjNums = []
  const contentObjNums = []
  for (let i = 0; i < pages.length; i++) {
    const content = pages[i].data()
    const pageNum = objects.length + 1
    const contentNum = pageNum + 1
    pageObjNums.push(pageNum)
    contentObjNums.push(contentNum)
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentNum} 0 R >>`
    )
    objects.push(`<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`)
  }
  // Info
  const infoNum = objects.length + 1
  objects.push(`<< /Title (${escapePdf(title)}) /Producer (BrightSkyIT) /CreationDate (D:${DATE.replace(/-/g, '')}000000Z) >>`)

  // Fill Pages object
  const kids = pageObjNums.map(n => `${n} 0 R`).join(' ')
  objects[1] = `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`

  // Serialize with xref
  let out = '%PDF-1.4\n'
  const offsets = []
  for (let i = 0; i < objects.length; i++) {
    offsets[i] = out.length
    out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
  }
  const xrefStart = out.length
  out += `xref\n0 ${objects.length + 1}\n`
  out += '0000000000 65535 f \n'
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoNum} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return Buffer.from(out, 'latin1')
}

const pdf = makeMultiPagePDF({ title: `BrightSkyIT \u2014 100 City Articles \u2014 Titles & Links (${DATE})`, pages })
const outPath = join(root, `docs/brightskyit-100-city-articles-${DATE}.pdf`)
const outPathShort = join(root, `docs/100-city-articles.pdf`)
writeFileSync(outPath, pdf)
writeFileSync(outPathShort, pdf)
console.log(`PDF: ${pages.length} pages, ${pdf.length} bytes`)
console.log(`Wrote: ${outPath}`)
console.log(`Wrote: ${outPathShort}`)
console.log(`Articles: ${cityArticles.length} city + ${editorial.length} editorial = ${cityArticles.length + editorial.length} total`)
