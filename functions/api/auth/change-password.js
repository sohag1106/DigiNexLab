// POST /api/auth/change-password  (bearer, first-login & voluntary)
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser, publicUser, hashPassword, verifyPassword } from '../../_shared/auth.js'

export const onRequestPost = async ({ request, env }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const body = await readBody(request)
  const { current_password, new_password } = body
  if (!new_password || new_password.length < 8)
    return fail('New password must be at least 8 characters.')
  if (new_password.length > 128) return fail('New password is too long.')

  if (!current_password) return fail('Current password is required.')
  const okCur = await verifyPassword(current_password, user.password_hash)
  if (!okCur) return fail('Current password is incorrect.', 401)

  const hash = await hashPassword(new_password)
  await query(
    env,
    `UPDATE users SET password_hash = $1, must_change_password = false, status = 'active'
     WHERE id = $2`,
    [hash, user.id]
  )
  const rows = await query(env, 'SELECT * FROM users WHERE id = $1', [user.id])
  return ok({ user: publicUser(rows[0]) })
}
