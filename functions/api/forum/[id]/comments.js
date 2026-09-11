// /api/forum/:id/comments — add a comment (POST), delete yours (DELETE ?id=)
import { query, ok, fail, readBody } from '../../../_shared/db.js'
import { authUser } from '../../../_shared/auth.js'

const isAdmin = (u) => u.role === 'owner' || u.role === 'admin'

export const onRequestPost = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const postId = params.id
  try {
    const post = await query(env, 'SELECT id FROM forum_posts WHERE id = $1', [postId])
    if (!post.length) return fail('Topic not found.', 404)
    const body = await readBody(request)
    const text = (body.body || '').trim()
    if (!text) return fail('Write a comment first.')

    const rows = await query(
      env,
      `INSERT INTO forum_comments (post_id, author_id, body)
       VALUES ($1,$2,$3) RETURNING *`,
      [postId, user.id, text]
    )
    return ok({ comment: rows[0], message: 'Comment added.' }, 201)
  } catch (e) {
    console.warn('[forum] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestDelete = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const postId = params.id
  const commentId = new URL(request.url).searchParams.get('id')
  try {
    if (!commentId) return fail('Missing comment id.')
    const rows = await query(
      env,
      `DELETE FROM forum_comments
       WHERE id = $1 AND post_id = $2 AND ($3 OR author_id = $4)
       RETURNING *`,
      [commentId, postId, isAdmin(user), user.id]
    )
    if (!rows.length) return fail('Not found or you cannot delete this comment.', 404)
    return ok({ message: 'Comment deleted.' })
  } catch (e) {
    console.warn('[forum] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
