// /api/products  — GET list (all, with owner name), POST create (own)
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const rows = await query(
    env,
    `SELECT p.*, u.name AS owner_name
     FROM products p
     LEFT JOIN users u ON u.id = p.created_by
     ORDER BY p.created_at DESC`
  )
  return ok({ products: rows })
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const body = await readBody(request)
  const name = (body.name || '').trim()
  if (!name) return fail('A product/service name is required.')

  const rows = await query(
    env,
    `INSERT INTO products (name, description, category, price, currency, image, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      name,
      body.description || null,
      body.category || null,
      Number(body.price) >= 0 ? Number(body.price) : 0,
      body.currency || 'USD',
      body.image || null,
      user.id,
    ]
  )
  return ok({ product: rows[0], message: 'Service added.' }, 201)
}
