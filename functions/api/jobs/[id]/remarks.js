// /api/jobs/:id/remarks — job remark thread (assigner, assignee, admins).
// GET list, POST add a remark.
import { query, ok, fail, readBody } from '../../../_shared/db.js'
import { authUser } from '../../../_shared/auth.js'

function isAdmin(user) {
  return user.role === 'owner' || user.role === 'admin'
}

export const onRequestGet = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  try {
    const job = await query(env, 'SELECT assigned_to, assigned_by FROM jobs WHERE id = $1', [params.id])
    if (!job.length) return fail('Job not found', 404)
    const involved = job[0].assigned_to === user.id || job[0].assigned_by === user.id
    if (!isAdmin(user) && !involved) return fail('Forbidden', 403)
    const remarks = await query(
      env,
      `SELECT r.*, u.name AS author_name, u.designation AS author_designation
       FROM job_remarks r
       LEFT JOIN users u ON u.id = r.author_id
       WHERE r.job_id = $1
       ORDER BY r.created_at ASC`,
      [params.id]
    )
    return ok({ remarks })
  } catch (e) {
    console.warn('[jobs] remarks error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestPost = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  try {
    const job = await query(env, 'SELECT assigned_to, assigned_by FROM jobs WHERE id = $1', [params.id])
    if (!job.length) return fail('Job not found', 404)
    const involved = job[0].assigned_to === user.id || job[0].assigned_by === user.id
    if (!isAdmin(user) && !involved) return fail('Forbidden', 403)

    const body = await readBody(request)
    const text = (body.body || '').trim()
    if (!text) return fail('Write a remark first.')

    const rows = await query(
      env,
      `INSERT INTO job_remarks (job_id, author_id, body)
       VALUES ($1,$2,$3) RETURNING *`,
      [params.id, user.id, text]
    )
    return ok({ remark: { ...rows[0], author_name: user.name, author_designation: user.designation }, message: 'Remark added.' }, 201)
  } catch (e) {
    console.warn('[jobs] remarks error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
