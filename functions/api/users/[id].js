// /api/users/:id  — PATCH (edit), DELETE (owner/admin)
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser, publicUser } from '../../_shared/auth.js'

async function update(env, user, body, targetId) {
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  if (targetId === 'me') targetId = user.id

  if (targetId !== user.id && !isAdmin) return fail('Forbidden', 403)

  const fields = []
  const params = []
  let i = 1
  const add = (col, val) => {
    if (val === undefined) return
    fields.push(`${col} = $${i++}`)
    params.push(val)
  }

  if (isAdmin) {
    add('name', body.name)
    add('designation', body.designation === null ? null : body.designation)
    add('role', body.role && ['owner','admin','staff'].includes(body.role) ? body.role : undefined)
    add('status', body.status && ['invited','active','disabled'].includes(body.status) ? body.status : undefined)
  } else {
    add('name', body.name)
    add('designation', body.designation === null ? null : body.designation)
  }

  if (!fields.length) return fail('Nothing to update.')

  const targetRows = await query(env, 'SELECT * FROM users WHERE id = $1', [targetId])
  if (!targetRows.length) return fail('User not found', 404)
  const target = targetRows[0]
  if (target.role === 'owner' && body.role && body.role !== 'owner') {
    return fail('The Owner account cannot change role.')
  }
  if (target.role === 'owner' && body.status && body.status === 'disabled') {
    return fail('The Owner account cannot be disabled.')
  }

  const ordered = []
  let c = 1
  const colSql = fields.map((f) => {
    const m = f.match(/^(\w+) = \$(\d+)$/)
    if (!m) return f
    ordered[c - 1] = params[Number(m[2]) - 1]
    return `${m[1]} = $${c++}`
  }).join(', ')
  ordered.push(targetId)
  await query(env, `UPDATE users SET ${colSql} WHERE id = $${c}`, ordered)

  const rows = await query(env, 'SELECT * FROM users WHERE id = $1', [targetId])
  return ok({ user: publicUser(rows[0]), message: 'Profile updated.' })
}

async function remove(env, id, me) {
  if (id === 'me') return fail('Cannot delete yourself.', 400)
  const rows = await query(env, 'SELECT * FROM users WHERE id = $1', [id])
  if (!rows.length) return fail('User not found', 404)
  if (rows[0].role === 'owner') return fail('The Owner account cannot be deleted.', 400)
  await query(env, 'DELETE FROM users WHERE id = $1', [id])
  return ok({ message: 'User removed.' })
}

export const onRequestPatch = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const body = await readBody(request)
  return update(env, user, body, params.id)
}

export const onRequestDelete = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  if (user.role !== 'owner' && user.role !== 'admin') return fail('Forbidden', 403)
  return remove(env, params.id, user)
}
