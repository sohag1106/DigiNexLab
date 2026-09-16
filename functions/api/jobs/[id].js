// /api/jobs/:id — GET one (job + remarks), PATCH (admin, assignee or assigner)
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

function isAdmin(user) {
  return user.role === 'owner' || user.role === 'admin'
}

async function loadJob(env, id) {
  const rows = await query(
    env,
    `SELECT j.*, a.name AS assignee_name, b.name AS assigner_name
     FROM jobs j
     LEFT JOIN users a ON a.id = j.assigned_to
     LEFT JOIN users b ON b.id = j.assigned_by
     WHERE j.id = $1`,
    [id]
  )
  return rows[0] || null
}

export const onRequestGet = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const job = await loadJob(env, params.id)
  if (!job) return fail('Job not found', 404)
  const involved = job.assigned_to === user.id || job.assigned_by === user.id
  if (!isAdmin(user) && !involved) return fail('Forbidden', 403)
  return ok({ job })
}

export const onRequestPatch = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)

  const id = params.id
  const existing = await loadJob(env, id)
  if (!existing) return fail('Job not found', 404)

  const admin = isAdmin(user)
  const isAssignee = existing.assigned_to === user.id
  const isAssigner = existing.assigned_by === user.id
  if (!admin && !isAssignee && !isAssigner) return fail('Forbidden', 403)

  const body = await readBody(request)
  const allowed = ['open', 'in_progress', 'done']
  const upd = []
  const paramsArr = []
  let c = 1
  const add = (col, val) => {
    if (val === undefined) return
    upd.push(`${col} = $${c++}`)
    paramsArr.push(val)
  }

  // Status: the assignee (or admin) moves the job along.
  if (body.status !== undefined && (admin || isAssignee)) {
    add('status', allowed.includes(body.status) ? body.status : existing.status)
  }
  // Job shape (title/description/deadline/reassignment) — assigner or admin.
  if (admin || isAssigner) {
    add('title', body.title !== undefined ? body.title.trim() : undefined)
    add('description', body.description !== undefined ? body.description : undefined)
    if (body.deadline !== undefined) {
      const deadline = body.deadline && /^\d{4}-\d{2}-\d{2}$/.test(body.deadline) ? body.deadline : null
      add('deadline', deadline)
    }
    if (admin) add('assigned_to', body.assigned_to !== undefined ? body.assigned_to : undefined)
    else if (body.assigned_to !== undefined && body.assigned_to) {
      const next = await query(env, 'SELECT status FROM users WHERE id = $1', [body.assigned_to])
      if (next.length && next[0].status !== 'disabled') add('assigned_to', body.assigned_to)
    }
  }

  if (!upd.length) return fail('Nothing to update.')
  paramsArr.push(id)
  await query(env, `UPDATE jobs SET ${upd.join(', ')} WHERE id = $${c}`, paramsArr)
  const rows = await loadJob(env, id)
  return ok({ job: rows, message: 'Job updated.' })
}
