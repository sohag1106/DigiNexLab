// /api/messages — internal messaging
// GET  ?with=<id> (thread), /inbox, POST (send), POST :id/read
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const url = new URL(request.url)
  const seg = url.pathname.replace(/^\/api\/messages\/?/, '').split('/').filter(Boolean)
  const action = seg[0]
  const withId = url.searchParams.get('with')

  try {
    if (action === 'inbox') return inbox(env, user)
    if (withId) return thread(env, user, withId)
    if (!action) return ok({ messages: [] })
    return fail('Not found', 404)
  } catch (e) {
    console.warn('[messages] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const url = new URL(request.url)
  const seg = url.pathname.replace(/^\/api\/messages\/?/, '').split('/').filter(Boolean)
  const id = seg[0]
  try {
    if (seg[1] === 'read') return markRead(env, id, user)
    if (!seg.length) {
      const body = await readBody(request)
      return send(env, user, body)
    }
    return fail('Not found', 404)
  } catch (e) {
    console.warn('[messages] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

async function inbox(env, user) {
  const rows = await query(
    env,
    `SELECT m.*,
            s.name AS sender_name, s.designation AS sender_designation,
            r.name AS recipient_name
     FROM messages m
     LEFT JOIN users s ON s.id = m.sender_id
     LEFT JOIN users r ON r.id = m.recipient_id
     WHERE m.recipient_id = $1
     ORDER BY m.created_at DESC LIMIT 200`,
    [user.id]
  )
  return ok({ messages: rows })
}

async function thread(env, user, withId) {
  const rows = await query(
    env,
    `SELECT m.*, s.name AS sender_name FROM messages m
     LEFT JOIN users s ON s.id = m.sender_id
     WHERE (m.sender_id = $1 AND m.recipient_id = $2)
        OR (m.sender_id = $2 AND m.recipient_id = $1)
     ORDER BY m.created_at ASC`,
    [user.id, withId]
  )
  return ok({ messages: rows })
}

async function send(env, user, body) {
  const { recipient_id, text } = body
  if (!recipient_id) return fail('Choose a recipient.')
  if (!text || !text.trim()) return fail('Message text is required.')
  if (recipient_id === user.id) return fail('You cannot message yourself.')
  const rows = await query(
    env,
    `INSERT INTO messages (sender_id, recipient_id, body)
     VALUES ($1,$2,$3) RETURNING *`,
    [user.id, recipient_id, text.trim()]
  )
  return ok({ message: rows[0], text: 'Sent.' }, 201)
}

async function markRead(env, id, user) {
  const rows = await query(
    env,
    `UPDATE messages SET read_at = now()
     WHERE id = $1 AND recipient_id = $2 RETURNING *`,
    [id, user.id]
  )
  return ok({ message: rows[0] || null })
}
