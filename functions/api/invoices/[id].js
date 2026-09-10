// /api/invoices/:id  — GET one, PATCH update, DELETE
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'
import { computeTotals, normalizeItems } from '../../_shared/doccore.js'

const STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

async function getOwned(env, id, user, isAdmin) {
  const rows = await query(env, 'SELECT * FROM invoices WHERE id = $1', [id])
  if (!rows.length) return null
  if (!isAdmin && rows[0].created_by !== user.id) return null
  return rows[0]
}

export const onRequestGet = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const row = await getOwned(env, params.id, user, isAdmin)
  if (!row) return fail('Invoice not found or forbidden.', 404)
  return ok({ invoice: row })
}

export const onRequestPatch = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const id = params.id
  const row = await getOwned(env, id, user, isAdmin)
  if (!row) return fail('Invoice not found or forbidden.', 404)

  const body = await readBody(request)
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
  add('due_date', body.due_date !== undefined ? (body.due_date || null) : undefined)
  add('status', body.status !== undefined && STATUSES.includes(body.status) ? body.status : undefined)
  add('updated_at', new Date().toISOString())

  params.push(id)
  await query(env, `UPDATE invoices SET ${upd.join(', ')} WHERE id = $${c}`, params)
  const rows = await query(env, 'SELECT * FROM invoices WHERE id = $1', [id])
  return ok({ invoice: rows[0], message: 'Invoice updated.' })
}

export const onRequestDelete = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const row = await getOwned(env, params.id, user, isAdmin)
  if (!row) return fail('Invoice not found or forbidden.', 404)
  await query(env, 'DELETE FROM invoices WHERE id = $1', [params.id])
  return ok({ message: 'Invoice deleted.' })
}
