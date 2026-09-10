// Cloudflare Pages Functions — branded "BrightSkyIT pad" PDF renderer.
//
// NOTE: This deliberately does NOT use pdfkit. pdfkit reads its built-in font
// metrics via `fs.readFileSync(__dirname + '/data/*.afm')`, and `__dirname` /
// `fs` do not exist in the Cloudflare Workers runtime — so any pdfkit PDF
// endpoint crashes with "ReferenceError: __dirname is not defined" (error 1101).
// Instead we hand-roll a minimal, valid single-page A4 PDF using the PDF built-in
// Helvetica fonts (supplied by the viewer, so no font file is bundled). This is
// fast (<< 1ms), tiny, and runs on the free Workers plan.
//
// The layout mirrors the old pdfkit template: navy header band, title + number,
// billed-to / meta block, items table, totals band, prepared-by line and footer.

const NAVY = [0.059, 0.071, 0.188]   // #0f1230
const BLUE = [0.145, 0.388, 0.922]   // #2563eb
const MAGENTA = [0.839, 0.227, 1.0]  // #d63aff
const INK = [0.102, 0.114, 0.180]    // #1a1d2e
const MUTED = [0.42, 0.45, 0.51]     // #6b7280
const LIGHT = [0.957, 0.961, 0.984]  // #f4f5fb
const WHITE = [1, 1, 1]

const PAGE_W = 595.28 // A4 width  (pt)
const PAGE_H = 841.89 // A4 height (pt)
const M = 40          // margin

export async function buildPadPDF(doc) {
  // ---------- resolve document fields ----------
  const isInvoice = doc.kind === 'invoice'
  const docTitle = isInvoice ? 'INVOICE' : 'QUOTATION'
  const accent = isInvoice ? MAGENTA : BLUE

  const currency = doc.currency || 'USD'
  const items = Array.isArray(doc.items) ? doc.items : []

  const subtotal = items.reduce((s, it) => s + Number(it.rate || 0) * Number(it.qty || 0), 0)
  const discount = Number(doc.discount || 0)
  const tax = Number(doc.tax || 0)
  const afterDiscount = subtotal - discount
  const taxAmt = (afterDiscount * tax) / 100
  const grand = afterDiscount + taxAmt

  // ---------- build the content stream ----------
  const p = new StreamBuilder()

  // header band
  p.fillRect(0, 0, PAGE_W, 110, NAVY)
  p.text('BrightSkyIT', 40, 34, 26, 'Helvetica-Bold', WHITE)
  p.text('CREATIVE DIGITAL AGENCY', 40, 66, 10.5, 'Helvetica', '0.80 0.82 1.00')
  p.strokeLine(40, 84, 300, 84, 3, accent)

  const rightX = PAGE_W - 40
  p.text(docTitle, rightX - 94, 34, 18, 'Helvetica-Bold', accent, { width: 110, align: 'right' })
  p.text(`# ${doc.number}`, rightX - 110, 60, 10, 'Helvetica', WHITE, { width: 130, align: 'right' })

  // billed-to / meta
  let y = 135
  p.text(isInvoice ? 'BILLED TO' : 'PREPARED FOR', 40, y, 11, 'Helvetica-Bold', INK)
  y += 17
  p.text(doc.client_name || '—', 40, y, 11, 'Helvetica', INK)
  if (doc.client_email) {
    y += 15
    p.text(doc.client_email, 40, y, 11, 'Helvetica', INK)
  }

  const metaX = rightX - 150
  const metaRows = [
    ['Date', formatDate(doc.created_at), INK, false],
    ...(isInvoice && doc.due_date ? [['Due date', formatDate(doc.due_date), INK, false]] : []),
    ['Currency', currency, INK, false],
    ['Status', humanStatus(doc.status), statusColor(doc.status), true],
  ]
  let my = 135
  for (const [lab, val, col, bold] of metaRows) {
    p.text(lab, metaX, my, 9.5, bold ? 'Helvetica-Bold' : 'Helvetica', MUTED, { width: 94 })
    p.text(val, metaX + 95, my, 9.5, 'Helvetica-Bold', col, { width: 55, align: 'right' })
    my += 14
  }

  // items table
  y = 215
  const tableLeft = 40
  const tableWidth = PAGE_W - 80
  const cDesc = tableWidth * 0.52
  const cQty = tableWidth * 0.1
  const cRate = tableWidth * 0.19
  const cTotal = tableWidth * 0.19

  p.fillRect(tableLeft, y, tableWidth, 26, NAVY)
  p.text('DESCRIPTION', tableLeft, y + 8, 9, 'Helvetica-Bold', WHITE)
  p.text('QTY', tableLeft + cDesc, y + 8, 9, 'Helvetica-Bold', WHITE, { width: cQty, align: 'right' })
  p.text('RATE', tableLeft + cDesc + cQty, y + 8, 9, 'Helvetica-Bold', WHITE, { width: cRate, align: 'right' })
  p.text('TOTAL', tableLeft + cDesc + cQty + cRate, y + 8, 9, 'Helvetica-Bold', WHITE, { width: cTotal, align: 'right' })
  y += 26

  items.forEach((it, idx) => {
    if (idx % 2 === 0) p.fillRect(tableLeft, y, tableWidth, 24, LIGHT)
    const rate = Number(it.rate || 0)
    const qty = Number(it.qty || 0)
    const cellY = y + 7
    p.text(String(it.description || '-'), tableLeft + 6, cellY, 9, 'Helvetica', INK, { width: cDesc - 6 })
    p.text(String(qty), tableLeft + cDesc, cellY, 9, 'Helvetica', INK, { width: cQty, align: 'right' })
    p.text(money(rate, currency), tableLeft + cDesc + cQty, cellY, 9, 'Helvetica', INK, { width: cRate, align: 'right' })
    p.text(money(rate * qty, currency), tableLeft + cDesc + cQty + cRate, cellY, 9, 'Helvetica', INK, { width: cTotal, align: 'right' })
    y += 24
  })

  // totals
  y += 12
  const totalsX = tableLeft + cDesc
  const totalsW = tableWidth * 0.48
  const totalRow = (label, value, bold = false, col = INK) => {
    p.text(label, totalsX, y, 10, bold ? 'Helvetica-Bold' : 'Helvetica', INK, { width: totalsW * 0.5 })
    p.text(money(value, currency), totalsX + totalsW * 0.5, y, 10, bold ? 'Helvetica-Bold' : 'Helvetica', INK, { width: totalsW * 0.5, align: 'right' })
    y += 18
  }
  totalRow('Subtotal', subtotal)
  if (discount) totalRow('Discount', -discount)
  if (tax) totalRow(`Tax (${tax}%)`, taxAmt)
  p.fillRect(totalsX, y - 3, totalsW, 24, accent)
  p.text('TOTAL', totalsX + 10, y + 4, 11, 'Helvetica-Bold', WHITE, { width: totalsW * 0.5 })
  p.text(money(grand, currency), totalsX + totalsW * 0.5, y + 4, 11, 'Helvetica-Bold', WHITE, { width: totalsW * 0.5, align: 'right' })
  y += 30

  // prepared-by
  p.text(
    `Prepared by ${doc.created_by_name || 'BrightSkyIT'}${doc.creator_designation ? ` · ${doc.creator_designation}` : ''}`,
    40, y, 9.5, 'Helvetica', MUTED
  )

  // footer
  p.strokeLine(40, PAGE_H - 60, PAGE_W - 40, PAGE_H - 60, 1, [0.898, 0.906, 0.941])
  p.text('BrightSkyIT · Creative Digital Agency · brightskyit.com', 40, PAGE_H - 46, 8.5, 'Helvetica', MUTED, { width: PAGE_W - 80, align: 'center' })

  return makePDF({ title: `${docTitle} ${doc.number} — BrightSkyIT`, content: p.data() })
}

// ---------------------------------------------------------------------------
// Minimal PDF assembler
// ---------------------------------------------------------------------------

// Collects content-stream graphics commands. Y-origin is the TOP of the page,
// so we convert to PDF's bottom-up coordinate system on write.
function makePDF({ title, content }) {
  const objects = []
  objects.push('<< /Type /Catalog /Pages 2 0 R >>')
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      '/Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>'
  )
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>')
  objects.push(`<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`)
  objects.push(`<< /Title (${escapePdf(title)}) >>`)

  const body = []
  for (let i = 0; i < objects.length; i++) {
    body.push(`${i + 1} 0 obj\n${objects[i]}\nendobj`)
  }

  const offsets = []
  let out = '%PDF-1.4\n'
  objects.forEach((obj, i) => {
    offsets[i] = out.length
    out += `${i + 1} 0 obj\n${obj}\nendobj\n`
  })
  const xrefStart = out.length
  out += `xref\n0 ${objects.length + 1}\n`
  out += '0000000000 65535 f \n'
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return Buffer.from(out, 'latin1')
}

// Stream of drawing commands (top-left origin). Text baseline is placed so that
// the visual top aligns like pdfkit's .text(x, y).
class StreamBuilder {
  constructor() {
    this.chunks = []
  }
  cmd(s) {
    this.chunks.push(s)
  }
  // solid fill rectangle (PDF origin is bottom-left; convert y)
  fillRect(x, y, w, h, [r, g, b]) {
    const topY = toPdfY(y)
    const botY = toPdfY(y + h)
    this.cmd(`${fmt(r)} ${fmt(g)} ${fmt(b)} rg ${fmt(x)} ${fmt(botY)} ${fmt(w)} ${fmt(h)} re f`)
  }
  strokeLine(x1, y1, x2, y2, width, [r, g, b]) {
    this.cmd(
      `${fmt(r)} ${fmt(g)} ${fmt(b)} RG ${fmt(width)} w ${fmt(x1)} ${fmt(toPdfY(y1))} m ${fmt(x2)} ${fmt(toPdfY(y2))} l S`
    )
  }
  // draw text at top-left (x, y); baseline computed from a ~0.85 ascent factor
  text(str, x, y, size, font, color, opts = {}) {
    const s = String(str)
    const baseline = toPdfY(y + size * 0.85)
    const fKey = font === 'Helvetica-Bold' ? 2 : font === 'Helvetica-Oblique' ? 3 : 1
    const col = Array.isArray(color) ? color : parseColor(color)
    this.cmd('BT')
    this.cmd(`/F${fKey} ${fmt(size)} Tf`)
    this.cmd(`${fmt(col[0])} ${fmt(col[1])} ${fmt(col[2])} rg`)
    if (opts.align === 'right') {
      const w = textWidth(s, font, size)
      this.cmd(`1 0 0 1 ${fmt(x + (opts.width || 0) - w)} ${fmt(baseline)} Tm`)
    } else {
      this.cmd(`1 0 0 1 ${fmt(x)} ${fmt(baseline)} Tm`)
    }
    this.cmd(`(${escapeText(s)}) Tj`)
    this.cmd('ET')
  }
  data() {
    return this.chunks.join('\n')
  }
}

// --- tiny helpers ---

// PDF origin is bottom-left; our layout is top-left. y is "distance from top".
function toPdfY(y) {
  return PAGE_H - y
}

// Approximate Helvetica advance widths (per 1000em) scaled to pt at given size.
const HELV = {
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278,
  J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722,
  S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222,
  j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333,
  s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  ' ': 278, '.': 278, ',': 278, ':': 278, ';': 278, '-': 333, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556,
  '7': 556, '8': 556, '9': 556,
  '(': 278, ')': 278, '[': 333, ']': 333, '{': 334, '}': 334, '!': 278, '?': 556,
  '@': 1015, '#': 556, '$': 556, '%': 889, '^': 469, '&': 667, '*': 389,
  '+': 584, '=': 584, '<': 584, '>': 584, '_': 556, '|': 260, '~': 584,
  "'": 222, '`': 333, '"': 333, '…': 1000 /*not exact but enough*/,
}
function textWidth(str, font, size) {
  let w = 0
  for (const ch of str) w += HELV[ch] || HELV[' ']
  // bold is ~4% wider; oblique ~same
  if (font === 'Helvetica-Bold') w *= 1.04
  return (w / 1000) * size
}

// Escape a PDF literal string. PDF strings use \ escaping; also strip characters
// that have no Helvetica WinAnsi glyph rather than emitting junk.
function escapeText(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\x00-\x1f\x7f]/g, '')
    // common currency symbols not in WinAnsi -> ASCII fallback
    .replace(/[৳₹]/g, ' ')
}
function escapePdf(s) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}
function parseColor(c) {
  // "#rrggbb" or "r g b" (0..1) or single float -> grep
  const m = /^#?([0-9a-fA-F]{6})$/.exec(String(c))
  if (m) {
    const n = parseInt(m[1], 16)
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]
  }
  const parts = String(c).split(/\s+/).map(Number)
  if (parts.length === 3 && parts.every((v) => !Number.isNaN(v))) return parts
  return INK
}
function fmt(n) {
  return +Number(n).toFixed(3)
}
function byteLength(s) {
  return Buffer.byteLength(s, 'latin1')
}

function money(n, cur = 'USD') {
  const num = Number(n || 0)
  const symbols = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹', AED: 'AED ', AUD: 'A$' }
  const sym = symbols[cur] || '$'
  let body
  try {
    body = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  } catch {
    body = num.toFixed(2)
  }
  if (sym === '€') return 'EUR ' + body        // € not in WinAnsi
  if (sym === '£') return 'GBP ' + body        // £ not in WinAnsi
  if (sym === '৳' || sym === '₹') return body + ' ' + (cur || '') // non-ASCII currencies -> code
  return sym + body
}

function formatDate(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return String(d).slice(0, 10)
  }
}

function humanStatus(s) {
  const map = {
    draft: 'Draft', sent: 'Sent', accepted: 'Accepted', rejected: 'Rejected',
    paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled',
  }
  return map[s] || s || ''
}

function statusColor(s) {
  const colors = {
    draft: INK, sent: BLUE, accepted: '#16a34a', rejected: '#dc2626',
    paid: '#16a34a', overdue: '#dc2626', cancelled: MUTED,
  }
  return colors[s] || INK
}
