// /api/jobs/:id  — PATCH (owner/admin or assignee)
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

export const onRequestPatch = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)

  const id = params.id
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const existing = await query(env, 'SELECT * FROM jobs WHERE id = $1', [id])
  if (!existing.length) return fail('Job not found', 404)

  const isAssignee = existing[0].assigned_to === user.id
  if (!isAdmin && !isAssignee) return fail('Forbidden', 403)

  const body = await readBody(request)
  const { title, description, status, assigned_to } = body
  const allowed = ['open', 'in_progress', 'done']
  const upd = []
  const paramsArr = []
  let c = 1
  const add = (col, val) => {
    if (val === undefined) return
    upd.push(`${col} = $${c++}`)
    paramsArr.push(val)
  }
  add('title', title !== undefined ? title.trim() : undefined)
  add('description', description !== undefined ? description : undefined)
  add('status', status !== undefined ? (allowed.includes(status) ? status : existing[0].status) : undefined)
  if (isAdmin) add('assigned_to', assigned_to !== undefined ? assigned_to : undefined)

  if (!upd.length) return fail('Nothing to update.')
  paramsArr.push(id)
  await query(env, `UPDATE jobs SET ${upd.join(', ')} WHERE id = $${c}`, paramsArr)
  const rows = await query(env, 'SELECT * FROM jobs WHERE id = $1', [id])
  return ok({ job: rows[0], message: 'Job updated.' })
}
