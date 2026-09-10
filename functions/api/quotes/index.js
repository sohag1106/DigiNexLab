// /api/quotes  — GET list (own; admin all), POST create
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'
import { computeTotals, nextNumber, normalizeItems } from '../../_shared/doccore.js'

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const where = isAdmin ? '' : 'WHERE q.created_by = $1'
  const rows = await query(
    env,
    `SELECT q.*, u.name AS created_by_name FROM quotations q
     LEFT JOIN users u ON u.id = q.created_by ${where} ORDER BY q.created_at DESC`,
    isAdmin ? [] : [user.id]
  )
  return ok({ quotes: rows })
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const body = await readBody(request)
  const client_name = body.client_name || 'Client'
  const client_email = body.client_email || null
  const items = normalizeItems(body.items)
  const currency = body.currency || 'USD'
  const discount = Number(body.discount || 0)
  const tax = Number(body.tax || 0)
  const { total } = computeTotals(items, discount, tax)
  const number = await nextNumber(env, query, 'Q', 'quotations')
  const rows = await query(
    env,
    `INSERT INTO quotations (number, client_name, client_email, currency, items, discount, tax, total, created_by, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'draft') RETURNING *`,
    [number, client_name, client_email, currency, items, discount, tax, total, user.id]
  )
  return ok({ quote: rows[0], message: 'Quotation created.' }, 201)
}
