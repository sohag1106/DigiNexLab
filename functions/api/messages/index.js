// /api/messages — internal messaging
// GET  /inbox (conversations + unread counts), ?with=<id> (thread),
// POST (send), POST :id/read (mark one read), POST read-all?with=<id> (mark conv read)
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
    if (seg[0] === 'read-all') {
      const peerId = url.searchParams.get('with')
      if (!peerId) return fail('Missing peer id.')
      return readAll(env, user, peerId)
    }
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

// Conversations view: one row per peer with last message + unread count.
async function inbox(env, user) {
  const rows = await query(
    env,
    `SELECT m.id, m.body, m.read_at, m.created_at, m.sender_id, m.recipient_id,
            u.name AS peer_name, u.designation AS peer_designation, u.status AS peer_status,
            (CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END) AS peer_id,
            (m.sender_id = $1) AS mine
     FROM messages m
     JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END
     WHERE m.sender_id = $1 OR m.recipient_id = $1
     ORDER BY m.created_at DESC`,
    [user.id]
  )

  const conversations = []
  const seen = new Set()
  for (const r of rows) {
    if (seen.has(r.peer_id)) continue
    seen.add(r.peer_id)
    const peers = rows.filter((x) => x.peer_id === r.peer_id)
    const unread = peers.filter((x) => !x.mine && !x.read_at).length
    conversations.push({
      peer_id: r.peer_id,
      peer_name: r.peer_name,
      peer_designation: r.peer_designation,
      peer_status: r.peer_status,
      last_body: r.body,
      last_at: r.created_at,
      unread,
    })
  }
  return ok({ conversations })
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

async function readAll(env, user, peerId) {
  const rows = await query(
    env,
    `UPDATE messages SET read_at = now()
     WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL
     RETURNING id`,
    [user.id, peerId]
  )
  return ok({ updated: rows.length })
}
