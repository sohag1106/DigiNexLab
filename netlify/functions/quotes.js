// Quotations endpoints
//   GET    /api/quotes             (own; owner/admin see all)
//   POST   /api/quotes             (create)
//   GET    /api/quotes/:id
//   PATCH  /api/quotes/:id         (update items/status etc.)
//   DELETE /api/quotes/:id
//   GET    /api/quotes/:id/pdf     (branded BrightSkyIT pad PDF)
//   POST   /api/quotes/:id/send    (email the quote to the client)
import { query, ok, fail, readBody, pathSegments } from './db.js'
import { authUser, publicUser } from './_private/auth.js'
import { sendEmail } from './_private/email.js'
import { buildPadPDF } from './_private/pad.js'
import { APP_URL } from './_private/auth.js'

import { computeTotals, nextNumber, normalizeItems } from './_private/doccore.js'

export const handler = async (event) => {
  const user = await authUser(event, { query })
  if (!user) return fail('Unauthorized', 401)

  const method = event.httpMethod
  const body = readBody(event)
  const seg = pathSegments(event) // [id] or [id,'pdf'] or [id,'send'] or []
  const id = seg[0]
  const action = seg[1]
  const isAdmin = user.role === 'owner' || user.role === 'admin'

  try {
    if (method === 'GET' && !id) return list(user, isAdmin)
    if (method === 'GET' && action === 'pdf') return pdf(id, user)
    if (method === 'POST' && action === 'send') return send(id, user)
    if (method === 'POST' && !id) return create(user, body)
    if (method === 'PATCH' && id) return update(id, user, body, isAdmin)
    if (method === 'DELETE' && id) return remove(id, user, isAdmin)
    if (method === 'GET' && id) return one(id, user, isAdmin)
  } catch (e) {
    console.warn('[quotes] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
  return fail('Not found', 404)
}

async function list(user, isAdmin) {
  const where = isAdmin ? '' : 'WHERE q.created_by = $1'
  const rows = await query(
    `SELECT q.*, u.name AS created_by_name FROM quotations q
     LEFT JOIN users u ON u.id = q.created_by ${where} ORDER BY q.created_at DESC`,
    isAdmin ? [] : [user.id]
  )
  return ok({ quotes: rows })
}

async function one(id, user, isAdmin) {
  const row = await getOwned(id, user, isAdmin)
  if (!row) return fail('Quotation not found or forbidden.', 404)
  return ok({ quote: row })
}

async function create(user, body) {
  const client_name = body.client_name || 'Client'
  const client_email = body.client_email || null
  const items = normalizeItems(body.items)
  const currency = body.currency || 'USD'
  const discount = Number(body.discount || 0)
  const tax = Number(body.tax || 0)
  const { total } = computeTotals(items, discount, tax)
  const number = await nextNumber('Q', 'quotations')
  const rows = await query(
    `INSERT INTO quotations (number, client_name, client_email, currency, items, discount, tax, total, created_by, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'draft') RETURNING *`,
    [number, client_name, client_email, currency, items, discount, tax, total, user.id]
  )
  return ok({ quote: rows[0], message: 'Quotation created.' }, 201)
}

async function update(id, user, body, isAdmin) {
  const row = await getOwned(id, user, isAdmin)
  if (!row) return fail('Quotation not found or forbidden.', 404)

  const items = body.items !== undefined ? normalizeItems(body.items) : row.items
  const currency = body.currency || row.currency
  const discount = body.discount !== undefined ? Number(body.discount) : Number(row.discount)
  const tax = body.tax !== undefined ? Number(body.tax) : Number(row.tax)
  const { total } = computeTotals(items, discount, tax)

  const upd = ['total = $1', 'items = $2', 'currency = $3', 'discount = $4', 'tax = $5']
  const params = [total, JSON.stringify(items), currency, discount, tax]
  let c = 6
  const add = (col, val) => {
    if (val === undefined) return
    upd.push(`${col} = $${c++}`)
    params.push(val)
  }
  add('client_name', body.client_name)
  add('client_email', body.client_email === null ? null : body.client_email)
  add('status', body.status !== undefined && ['draft','sent','accepted','rejected'].includes(body.status) ? body.status : undefined)
  add('updated_at', new Date().toISOString())

  params.push(id)
  await query(`UPDATE quotations SET ${upd.join(', ')} WHERE id = $${c}`, params)
  const rows = await query('SELECT * FROM quotations WHERE id = $1', [id])
  return ok({ quote: rows[0], message: 'Quotation updated.' })
}

async function remove(id, user, isAdmin) {
  const row = await getOwned(id, user, isAdmin)
  if (!row) return fail('Quotation not found or forbidden.', 404)
  await query('DELETE FROM quotations WHERE id = $1', [id])
  return ok({ message: 'Quotation deleted.' })
}

async function pdf(id, user) {
  const row = await getOwned(id, user, user.role === 'owner' || user.role === 'admin')
  if (!row) return fail('Quotation not found or forbidden.', 404)
  const me = await query('SELECT * FROM users WHERE id = $1', [user.id])
  const buf = await buildPadPDF({
    kind: 'quotation',
    number: row.number,
    client_name: row.client_name,
    client_email: row.client_email,
    currency: row.currency,
    items: row.items,
    discount: row.discount,
    tax: row.tax,
    total: row.total,
    status: row.status,
    created_at: row.created_at,
    created_by_name: me[0] ? me[0].name : '',
    creator_designation: me[0] ? me[0].designation : '',
  })
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${row.number}.pdf"`,
    },
    body: buf.toString('base64'),
    isBase64Encoded: true,
  }
}

async function send(id, user) {
  const row = await getOwned(id, user, user.role === 'owner' || user.role === 'admin')
  if (!row) return fail('Quotation not found or forbidden.', 404)
  if (!row.client_email) return fail('This quotation has no client email.', 400)
  const me = await query('SELECT * FROM users WHERE id = $1', [user.id])
  const buf = await buildPadPDF({
    kind: 'quotation', number: row.number, client_name: row.client_name,
    client_email: row.client_email, currency: row.currency, items: row.items,
    discount: row.discount, tax: row.tax, total: row.total, status: row.status,
    created_at: row.created_at, created_by_name: me[0] ? me[0].name : '',
    creator_designation: me[0] ? me[0].designation : '',
  })
  const res = await sendEmail({
    to: row.client_email,
    subject: `Quotation ${row.number} from BrightSkyIT`,
    html: `<p>Dear ${row.client_name},</p>
      <p>Please find attached quotation <strong>${row.number}</strong> from BrightSkyIT.</p>
      <p>If you have any questions, just reply to this email.</p>
      <p>— BrightSkyIT</p>`,
    attachments: [{ filename: `${row.number}.pdf`, content: buf }],
  })
  if (!res.ok) return fail('Email could not be sent: ' + (res.reason || ''), 500)
  await query(`UPDATE quotations SET status='sent', updated_at=now() WHERE id=$1`, [id])
  const rows = await query('SELECT * FROM quotations WHERE id = $1', [id])
  return ok({ quote: rows[0], message: 'Quotation emailed to ' + row.client_email + '.' })
}

async function getOwned(id, user, isAdmin) {
  const rows = await query('SELECT * FROM quotations WHERE id = $1', [id])
  if (!rows.length) return null
  if (!isAdmin && rows[0].created_by !== user.id) return null
  return rows[0]
}
