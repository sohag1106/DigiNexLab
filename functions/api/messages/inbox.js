// /api/messages/inbox — conversations view: one row per peer with last message + unread count.
// Lives in its own file so Cloudflare Pages routes /api/messages/inbox here
// (a sub-path is not caught by the sibling index.js).
import { query, ok, fail } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  try {
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
  } catch (e) {
    console.warn('[messages] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
