// /api/messages — internal messaging (base path)
// GET  /api/messages?with=<id> (thread) or empty list
// POST /api/messages (send)
// Sub-routes live in sibling files: inbox.js, read-all.js
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const url = new URL(request.url)
  const withId = url.searchParams.get('with')
  try {
    if (withId) return thread(env, user, withId)
    return ok({ messages: [] })
  } catch (e) {
    console.warn('[messages] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  try {
    const body = await readBody(request)
    return send(env, user, body)
  } catch (e) {
    console.warn('[messages] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
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
