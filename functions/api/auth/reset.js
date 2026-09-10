// POST /api/auth/reset  (consumes ?token=)
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { hashPassword } from '../../_shared/auth.js'

export const onRequestPost = async ({ request, env }) => {
  const body = await readBody(request)
  const { token, new_password } = body
  if (!token || !new_password) return fail('Token and new password are required.')
  if (new_password.length < 8)
    return fail('New password must be at least 8 characters.')
  const rows = await query(
    env,
    `SELECT pr.*, u.email FROM password_resets pr
     JOIN users u ON u.id = pr.user_id
     WHERE pr.token = $1`,
    [token]
  )
  if (!rows.length) return fail('Invalid or expired reset token.', 400)
  const pr = rows[0]
  if (new Date(pr.expires_at).getTime() < Date.now())
    return fail('This reset link has expired. Request a new one.', 400)
  const hash = await hashPassword(new_password)
  await query(
    env,
    `UPDATE users SET password_hash = $1, must_change_password = false, status = 'active' WHERE id = $2`,
    [hash, pr.user_id]
  )
  await query(env, 'DELETE FROM password_resets WHERE token = $1', [token])
  return ok({ message: 'Password updated. You can now log in.' })
}
