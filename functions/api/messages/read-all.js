// /api/messages/read-all?with=<peerId> — mark every unread message from a peer as read.
// Own file so Cloudflare Pages routes the deeper path here.
import { query, ok, fail } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const peerId = new URL(request.url).searchParams.get('with')
  if (!peerId) return fail('Missing peer id.')
  try {
    const rows = await query(
      env,
      `UPDATE messages SET read_at = now()
       WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL
       RETURNING id`,
      [user.id, peerId]
    )
    return ok({ updated: rows.length })
  } catch (e) {
    console.warn('[messages] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
