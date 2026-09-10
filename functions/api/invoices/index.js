// /api/invoices  — GET list (own; admin all), POST create
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'
import { computeTotals, nextNumber, normalizeItems } from '../../_shared/doccore.js'

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const where = isAdmin ? '' : 'WHERE i.created_by = $1'
  const rows = await query(
    env,
    `SELECT i.*, u.name AS created_by_name FROM invoices i
     LEFT JOIN users u ON u.id = i.created_by ${where} ORDER BY i.created_at DESC`,
    isAdmin ? [] : [user.id]
  )
  return ok({ invoices: rows })
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const body = await readBody(request)
  const items = normalizeItems(body.items)
  const currency = body.currency || 'USD'
  const discount = Number(body.discount || 0)
  const tax = Number(body.tax || 0)
  const { total } = computeTotals(items, discount, tax)
  const number = await nextNumber(env, query, 'INV', 'invoices')
  const rows = await query(
    env,
    `INSERT INTO invoices (number, client_name, client_email, currency, items, discount, tax, total, due_date, created_by, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'draft') RETURNING *`,
    [number, body.client_name || 'Client', body.client_email || null, currency, JSON.stringify(items), discount, tax, total, body.due_date || null, user.id]
  )
  return ok({ invoice: rows[0], message: 'Invoice created.' }, 201)
}
