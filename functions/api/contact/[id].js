// /api/contact/:id — PATCH status / DELETE (owner/admin only).
// Lives here because a Pages Function at functions/api/contact/[id].js maps
// to /api/contact/:id, mirroring products/[id].js.
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

export const onRequestPatch = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  if (user.role !== 'owner' && user.role !== 'admin') return fail('Forbidden', 403)
  const body = await readBody(request)
  const status = ['new', 'read', 'archived'].includes(body.status) ? body.status : null
  if (!status) return fail('Status must be new, read or archived.')
  try {
    const rows = await query(
      env,
      'UPDATE contact_submissions SET status=$1 WHERE id=$2 RETURNING *',
      [status, params.id]
    )
    if (!rows.length) return fail('Submission not found.', 404)
    return ok({ submission: rows[0], message: 'Updated.' })
  } catch (e) {
    console.warn('[contact] patch error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestDelete = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  if (user.role !== 'owner' && user.role !== 'admin') return fail('Forbidden', 403)
  try {
    const rows = await query(env, 'DELETE FROM contact_submissions WHERE id=$1 RETURNING id', [params.id])
    if (!rows.length) return fail('Submission not found.', 404)
    return ok({ message: 'Submission deleted.' })
  } catch (e) {
    console.warn('[contact] delete error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
