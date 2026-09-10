// /api/products/:id  — PATCH update / DELETE (creator only)
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

async function getOwned(env, id, user, isAdmin) {
  const rows = await query(env, 'SELECT * FROM products WHERE id = $1', [id])
  if (!rows.length) return null
  if (!isAdmin && rows[0].created_by !== user.id) return null
  return rows[0]
}

export const onRequestPatch = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const row = await getOwned(env, params.id, user, isAdmin)
  if (!row) return fail('Service not found or forbidden.', 404)

  const body = await readBody(request)
  const fields = []
  const values = []
  let c = 1
  const add = (col, val) => {
    if (val === undefined) return
    fields.push(`${col} = $${c++}`)
    values.push(val)
  }
  add('name', body.name !== undefined ? (body.name || '').trim() : undefined)
  add('description', body.description === null ? null : body.description)
  add('category', body.category === null ? null : body.category)
  add('image', body.image === null ? null : body.image)
  if (body.price !== undefined) add('price', Number(body.price) >= 0 ? Number(body.price) : 0)
  if (body.currency !== undefined) add('currency', body.currency || 'USD')

  if (!fields.length) return fail('Nothing to update.')

  values.push(params.id)
  await query(env, `UPDATE products SET ${fields.join(', ')}, updated_at = now() WHERE id = $${c}`, values)
  const rows = await query(env, 'SELECT * FROM products WHERE id = $1', [params.id])
  return ok({ product: rows[0], message: 'Service updated.' })
}

export const onRequestDelete = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const row = await getOwned(env, params.id, user, isAdmin)
  if (!row) return fail('Service not found or forbidden.', 404)
  await query(env, 'DELETE FROM products WHERE id = $1', [params.id])
  return ok({ message: 'Service deleted.' })
}
