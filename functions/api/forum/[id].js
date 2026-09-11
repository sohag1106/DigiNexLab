// /api/forum/:id — one post + its comments, and delete
import { query, ok, fail } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

export const onRequestGet = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const id = params.id
  try {
    const posts = await query(
      env,
      `SELECT p.id, p.title, p.body, p.author_id, p.created_at,
              u.name AS author_name, u.designation AS author_designation,
              COALESCE((SELECT sum(v.value)::int FROM forum_votes v WHERE v.post_id = p.id), 0) AS votes
       FROM forum_posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.id = $1`,
      [id]
    )
    if (!posts.length) return fail('Topic not found.', 404)
    const post = posts[0]
    const comments = await query(
      env,
      `SELECT c.id, c.post_id, c.author_id, c.body, c.created_at,
              u.name AS author_name, u.designation AS author_designation
       FROM forum_comments c
       LEFT JOIN users u ON u.id = c.author_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    )
    const myVote = await query(
      env,
      `SELECT value FROM forum_votes WHERE post_id = $1 AND user_id = $2`,
      [id, user.id]
    )
    return ok({ post: { ...post, comments }, my_vote: myVote[0] ? myVote[0].value : 0 })
  } catch (e) {
    console.warn('[forum] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestDelete = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const id = params.id
  try {
    const isAdmin = user.role === 'owner' || user.role === 'admin'
    const rows = await query(
      env,
      `DELETE FROM forum_posts
       WHERE id = $1 AND ($2 OR author_id = $3)
       RETURNING *`,
      [id, isAdmin, user.id]
    )
    if (!rows.length) return fail('Not found or you cannot delete this topic.', 404)
    return ok({ message: 'Topic deleted.' })
  } catch (e) {
    console.warn('[forum] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
