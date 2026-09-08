// Internal messaging endpoints
//   GET  /api/messages?with=<user_id>    (thread between me and user)
//   GET  /api/messages/inbox             (all messages addressed to me, with sender info)
//   POST /api/messages                   (send message to a coworker)
//   POST /api/messages/:id/read          (mark read)
import { query, ok, fail, readBody, pathSegments } from './db.js'
import { authUser } from './_private/auth.js'

export const handler = async (event) => {
  const user = await authUser(event, { query })
  if (!user) return fail('Unauthorized', 401)

  const method = event.httpMethod
  const body = readBody(event)
  const seg = pathSegments(event) // [] | ['inbox'] | [id,'read']
  const action = seg[0]
  const id = seg[1]
  const q = event.queryStringParameters || {}

  try {
    if (method === 'GET' && action === 'inbox') return inbox(user)
    if (method === 'GET' && q.with) return thread(user, q.with)
    if (method === 'POST' && action === 'read') return markRead(id, user)
    if (method === 'POST' && !action) return send(user, body)
  } catch (e) {
    console.warn('[messages] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
  return fail('Not found', 404)
}

async function inbox(user) {
  const rows = await query(
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

async function thread(user, withId) {
  const rows = await query(
    `SELECT m.*, s.name AS sender_name FROM messages m
     LEFT JOIN users s ON s.id = m.sender_id
     WHERE (m.sender_id = $1 AND m.recipient_id = $2)
        OR (m.sender_id = $2 AND m.recipient_id = $1)
     ORDER BY m.created_at ASC`,
    [user.id, withId]
  )
  return ok({ messages: rows })
}

async function send(user, body) {
  const { recipient_id, text } = body
  if (!recipient_id) return fail('Choose a recipient.')
  if (!text || !text.trim()) return fail('Message text is required.')
  if (recipient_id === user.id) return fail('You cannot message yourself.')
  const rows = await query(
    `INSERT INTO messages (sender_id, recipient_id, body)
     VALUES ($1,$2,$3) RETURNING *`,
    [user.id, recipient_id, text.trim()]
  )
  return ok({ message: rows[0], text: 'Sent.' }, 201)
}

async function markRead(id, user) {
  const rows = await query(
    `UPDATE messages SET read_at = now()
     WHERE id = $1 AND recipient_id = $2 RETURNING *`,
    [id, user.id]
  )
  return ok({ message: rows[0] || null })
}
