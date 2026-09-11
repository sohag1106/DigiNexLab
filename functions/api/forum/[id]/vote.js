// /api/forum/:id/vote — up/down vote with toggle (voting again removes it)
import { query, ok, fail, readBody } from '../../../_shared/db.js'
import { authUser } from '../../../_shared/auth.js'

export const onRequestPost = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const postId = params.id
  try {
    const body = await readBody(request)
    const value = Number(body.value)
    if (value !== 1 && value !== -1) return fail('Vote must be +1 or -1.')

    const post = await query(env, 'SELECT id FROM forum_posts WHERE id = $1', [postId])
    if (!post.length) return fail('Topic not found.', 404)

    const existing = await query(
      env,
      'SELECT id, value FROM forum_votes WHERE post_id = $1 AND user_id = $2',
      [postId, user.id]
    )

    if (existing.length) {
      if (existing[0].value === value) {
        // Same vote again → toggle off
        await query(env, 'DELETE FROM forum_votes WHERE id = $1', [existing[0].id])
      } else {
        // Opposite vote → flip
        await query(env, 'UPDATE forum_votes SET value = $1 WHERE id = $2', [value, existing[0].id])
      }
    } else {
      await query(
        env,
        'INSERT INTO forum_votes (post_id, user_id, value) VALUES ($1,$2,$3)',
        [postId, user.id, value]
      )
    }

    const score = await query(
      env,
      `SELECT COALESCE(sum(v.value)::int, 0) AS votes FROM forum_votes v WHERE v.post_id = $1`,
      [postId]
    )
    const myVote = await query(
      env,
      'SELECT value FROM forum_votes WHERE post_id = $1 AND user_id = $2',
      [postId, user.id]
    )
    return ok({ votes: score[0].votes, my_vote: myVote[0] ? myVote[0].value : 0 })
  } catch (e) {
    console.warn('[forum] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
