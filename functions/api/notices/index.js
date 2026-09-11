// /api/notices — simple announcement board.
// GET  list notices (newest first), POST create, PATCH /:id edit, DELETE /:id
// Any member can create; only the author or an admin can edit/delete.
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

function segments(request) {
  return new URL(request.url).pathname.replace(/^\/api\/notices\/?/, '').split('/').filter(Boolean)
}

function isModerator(user) {
  return user.role === 'owner' || user.role === 'admin'
}

async function getNotice(env, id) {
  const rows = await query(
    env,
    `SELECT n.*, a.name AS author_name, a.designation AS author_designation
     FROM notices n LEFT JOIN users a ON a.id = n.author_id
     WHERE n.id = $1`,
    [id]
  )
  return rows[0] || null
}

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const seg = segments(request)
  try {
    if (!seg.length) {
      const notices = await query(
        env,
        `SELECT n.*, a.name AS author_name, a.designation AS author_designation
         FROM notices n LEFT JOIN users a ON a.id = n.author_id
         ORDER BY n.created_at DESC`
      )
      return ok({ notices })
    }
    const notice = await getNotice(env, seg[0])
    if (!notice) return fail('Notice not found.', 404)
    return ok({ notice })
  } catch (e) {
    console.warn('[notices] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const seg = segments(request)
  const id = seg[0]
  try {
    const body = await readBody(request)
    const title = (body.title || '').trim()
    const text = (body.body || '').trim()

    if (!id) {
      // CREATE
      if (!title) return fail('Give the notice a title.')
      if (!text) return fail('Notice body is required.')
      const rows = await query(
        env,
        'INSERT INTO notices (title, body, author_id) VALUES ($1,$2,$3) RETURNING *',
        [title, text, user.id]
      )
      return ok({ notice: await getNotice(env, rows[0].id), message: 'Notice posted.' }, 201)
    }

    // EDIT
    const existing = await getNotice(env, id)
    if (!existing) return fail('Notice not found.', 404)
    if (existing.author_id !== user.id && !isModerator(user))
      return fail('Only the author (or an admin) can edit this.', 403)
    const nextTitle = (title || existing.title).trim()
    const nextBody = (text || existing.body).trim()
    await query(
      env,
      'UPDATE notices SET title=$1, body=$2, updated_at=now() WHERE id=$3',
      [nextTitle, nextBody, id]
    )
    return ok({ notice: await getNotice(env, id), message: 'Notice updated.' })
  } catch (e) {
    console.warn('[notices] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestDelete = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const seg = segments(request)
  const id = seg[0]
  if (!id) return fail('Missing notice id.', 400)
  try {
    const existing = await getNotice(env, id)
    if (!existing) return fail('Notice not found.', 404)
    if (existing.author_id !== user.id && !isModerator(user))
      return fail('Only the author (or an admin) can delete this.', 403)
    await query(env, 'DELETE FROM notices WHERE id=$1', [id])
    return ok({ message: 'Notice deleted.' })
  } catch (e) {
    console.warn('[notices] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
