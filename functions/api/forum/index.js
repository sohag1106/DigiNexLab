// /api/forum — team forum
// GET  list posts (author, comment count, net votes), POST create a post
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  try {
    const posts = await query(
      env,
      `SELECT p.id, p.title, p.body, p.author_id, p.created_at,
              u.name AS author_name, u.designation AS author_designation,
              (SELECT count(*)::int FROM forum_comments c WHERE c.post_id = p.id) AS comment_count,
              COALESCE((SELECT sum(v.value)::int FROM forum_votes v WHERE v.post_id = p.id), 0) AS votes
       FROM forum_posts p
       LEFT JOIN users u ON u.id = p.author_id
       ORDER BY p.created_at DESC`
    )
    return ok({ posts })
  } catch (e) {
    console.warn('[forum] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  try {
    const body = await readBody(request)
    const title = (body.title || '').trim()
    const text = (body.body || '').trim()
    if (!title) return fail('Give the topic a title.')
    if (!text) return fail('Share a few thoughts — the topic body is required.')

    const rows = await query(
      env,
      `INSERT INTO forum_posts (title, body, author_id) VALUES ($1,$2,$3) RETURNING *`,
      [title, text, user.id]
    )
    return ok({ post: rows[0], message: 'Topic posted.' }, 201)
  } catch (e) {
    console.warn('[forum] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
