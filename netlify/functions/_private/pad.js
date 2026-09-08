// Branded "BrightSkyIT pad" PDF renderer shared by quotations & invoices.
import PDFDocument from 'pdfkit'

// BrightSkyIT brand colors
const NAVY = '#0f1230'
const BLUE = '#2563eb'
const MAGENTA = '#d63aff'
const INK = '#1a1d2e'
const MUTED = '#6b7280'
const LIGHT = '#f4f5fb'
const BORDER = '#e5e7f0'

/**
 * Build the PDF buffer for a quote/invoice.
 * @param {object} doc  { number, kind:'quotation'|'invoice', client_name, client_email, currency, items, discount, tax, total, due_date, status, created_at, created_by_name, creator_designation }
 */
export async function buildPadPDF(doc) {
  const isInvoice = doc.kind === 'invoice'
  const docTitle = isInvoice ? 'INVOICE' : 'QUOTATION'
  const accent = isInvoice ? MAGENTA : BLUE

  const docPdf = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: { Title: `${docTitle} ${doc.number} — BrightSkyIT` },
  })

  const chunks = []
  docPdf.on('data', (c) => chunks.push(c))
  const done = new Promise((resolve, reject) => {
    docPdf.on('end', resolve)
    docPdf.on('error', reject)
  })

  // ---------- header band ----------
  docPdf.rect(0, 0, docPdf.page.width, 110).fill(NAVY)
  docPdf
    .font('Helvetica-Bold')
    .fontSize(26)
    .fillColor('#ffffff')
    .text('BrightSkyIT', 40, 34)
  docPdf
    .font('Helvetica')
    .fontSize(10.5)
    .fillColor('#cbd2ff')
    .text('CREATIVE DIGITAL AGENCY', 40, 66)
  // accent underline
  docPdf
    .moveTo(40, 84)
    .lineTo(300, 84)
    .lineWidth(3)
    .strokeColor(accent)
    .stroke()

  // Right side: doc title + number
  const rightX = docPdf.page.width - 40
  docPdf
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor(accent)
    .text(docTitle, rightX - 90, 34, { width: 110, align: 'right' })
  docPdf
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#ffffff')
    .text(`# ${doc.number}`, rightX - 110, 62, { width: 130, align: 'right' })

  // ---------- meta / billed-to ----------
  let y = 135
  docPdf
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(INK)
    .text(isInvoice ? 'BILLED TO' : 'PREPARED FOR', 40, y)
  y += 16
  docPdf.font('Helvetica').fontSize(11).fillColor(INK)
  docPdf.text(doc.client_name || '—', 40, y)
  if (doc.client_email) {
    y += 14
    docPdf.text(doc.client_email, 40, y)
  }

  // right meta block
  const metaX = rightX - 150
  let my = 135
  const metaLine = (label, value, color = INK, bold = false) => {
    docPdf.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5)
    docPdf.fillColor(MUTED).text(label, metaX, my, { width: 150 })
    docPdf.fillColor(color).text(String(value), metaX + 95, my, { width: 55, align: 'right' })
    my += 14
  }
  metaLine('Date', formatDate(doc.created_at))
  if (isInvoice && doc.due_date) metaLine('Due date', formatDate(doc.due_date))
  metaLine('Currency', doc.currency || 'USD')
  metaLine('Status', humanStatus(doc.status), statusColor(doc.status), true)
  my = 135
  void my

  // ---------- items table ----------
  y = 215
  const tableTop = y
  const tableLeft = 40
  const tableWidth = docPdf.page.width - 80
  const colW = {
    desc: tableWidth * 0.52,
    qty: tableWidth * 0.1,
    rate: tableWidth * 0.19,
    total: tableWidth * 0.19,
  }

  // header row
  docPdf.rect(tableLeft, y, tableWidth, 26).fill(NAVY)
  const th = (text, x, w, align = 'left') => {
    docPdf.font('Helvetica-Bold').fontSize(9).fillColor('#fff')
    docPdf.text(text, x, y + 8, { width: w, align })
  }
  th('DESCRIPTION', tableLeft, colW.desc)
  th('QTY', tableLeft + colW.desc, colW.qty, 'right')
  th('RATE', tableLeft + colW.desc + colW.qty, colW.rate, 'right')
  th('TOTAL', tableLeft + colW.desc + colW.qty + colW.rate, colW.total, 'right')
  y += 26

  // rows
  const items = Array.isArray(doc.items) ? doc.items : []
  items.forEach((it, idx) => {
    if (idx % 2 === 0) docPdf.rect(tableLeft, y, tableWidth, 24).fill(LIGHT)
    const rate = Number(it.rate || 0)
    const qty = Number(it.qty || 0)
    const line = rate * qty
    const cellY = y + 7
    docPdf.font('Helvetica').fontSize(9).fillColor(INK)
    docPdf.text(String(it.description || '-'), tableLeft + 6, cellY, { width: colW.desc })
    docPdf.text(String(qty), tableLeft + colW.desc + 4, cellY, { width: colW.qty - 4, align: 'right' })
    docPdf.text(money(rate, doc.currency), tableLeft + colW.desc + colW.qty, cellY, { width: colW.rate, align: 'right' })
    docPdf.text(money(line, doc.currency), tableLeft + colW.desc + colW.qty + colW.rate, cellY, { width: colW.total, align: 'right' })
    y += 24
  })

  // totals block
  y += 12
  const subTotal = items.reduce((s, it) => s + Number(it.rate || 0) * Number(it.qty || 0), 0)
  const discount = Number(doc.discount || 0)
  const tax = Number(doc.tax || 0)
  const afterDiscount = subTotal - discount
  const taxAmt = (afterDiscount * tax) / 100
  const grand = afterDiscount + taxAmt

  const totalsX = tableLeft + tableWidth * 0.52
  const totalsW = tableWidth * 0.48
  const totalRow = (label, value, bold = false, color = INK) => {
    docPdf.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10)
    docPdf.fillColor(color)
    docPdf.text(label, totalsX, y, { width: totalsW * 0.5 })
    docPdf.text(money(value, doc.currency), totalsX + totalsW * 0.5, y, {
      width: totalsW * 0.5,
      align: 'right',
    })
    y += 18
  }
  totalRow('Subtotal', subTotal)
  if (discount) totalRow('Discount', -discount)
  if (tax) totalRow(`Tax (${tax}%)`, taxAmt)
  // grand total highlight
  docPdf.rect(totalsX, y - 3, totalsW, 24).fill(accent)
  docPdf.font('Helvetica-Bold').fontSize(11).fillColor('#fff')
  docPdf.text('TOTAL', totalsX + 10, y + 4, { width: totalsW * 0.5 })
  docPdf.text(money(grand, doc.currency), totalsX + totalsW * 0.5, y + 4, {
    width: totalsW * 0.5,
    align: 'right',
  })
  y += 26

  // ---------- prepared by + footer ----------
  y += 10
  docPdf.font('Helvetica').fontSize(9.5).fillColor(MUTED)
  docPdf.text(
    `Prepared by ${doc.created_by_name || 'BrightSkyIT'}${doc.creator_designation ? ` · ${doc.creator_designation}` : ''}`,
    40,
    y
  )

  docPdf
    .moveTo(40, docPdf.page.height - 60)
    .lineTo(docPdf.page.width - 40, docPdf.page.height - 60)
    .lineWidth(1)
    .strokeColor(BORDER)
    .stroke()
  docPdf
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(MUTED)
    .text(
      'BrightSkyIT · Creative Digital Agency · brightskyit.com',
      40,
      docPdf.page.height - 46,
      { width: docPdf.page.width - 80, align: 'center' }
    )

  docPdf.end()
  await done
  return Buffer.concat(chunks)
}

function money(n, cur = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹', AED: 'AED ', AUD: 'A$' }
  const sym = symbols[cur] || '$'
  try {
    return sym + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  } catch {
    return sym + Number(n || 0).toFixed(2)
  }
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
  const colors = { draft: INK, sent: BLUE, accepted: '#16a34a', rejected: '#dc2626', paid: '#16a34a', overdue: '#dc2626', cancelled: MUTED }
  return colors[s] || INK
}
