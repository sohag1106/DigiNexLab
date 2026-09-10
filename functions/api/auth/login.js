// POST /api/auth/login
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { verifyPassword, signToken, publicUser } from '../../_shared/auth.js'

export const onRequestPost = async ({ request, env }) => {
  const body = await readBody(request)
  const { email, password } = body
  if (!email || !password) return fail('Email and password are required.')
  const rows = await query(env, 'SELECT * FROM users WHERE lower(email) = lower($1)', [
    email,
  ])
  if (!rows.length) return fail('Invalid email or password.', 401)
  const user = rows[0]
  if (user.status === 'disabled') return fail('This account is disabled.', 403)
  const okPass = await verifyPassword(password, user.password_hash)
  if (!okPass) return fail('Invalid email or password.', 401)
  return ok({ token: signToken(env, user), user: publicUser(user) })
}
