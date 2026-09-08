// Auth endpoints
//   POST /api/auth/login
//   GET  /api/auth/me            (bearer)
//   POST /api/auth/change-password  (bearer, first-login & voluntary)
//   POST /api/auth/forgot
//   POST /api/auth/reset
import { query, ok, fail, readBody } from './db.js'
import {
  hashPassword,
  verifyPassword,
  signToken,
  authUser,
  publicUser,
  randomToken,
} from './_private/auth.js'
import { sendEmail, textHtml } from './_private/email.js'
import { APP_URL } from './_private/auth.js'

export const handler = async (event) => {
  const method = event.httpMethod
  const body = readBody(event)
  const path = (event.path || '').split('/').pop()

  try {
    if (method === 'POST' && path === 'login') {
      return login(body)
    }
    if (method === 'GET' && path === 'me') {
      return me(event)
    }
    if (method === 'POST' && path === 'change-password') {
      return changePassword(event, body)
    }
    if (method === 'POST' && path === 'forgot') {
      return forgot(body)
    }
    if (method === 'POST' && path === 'reset') {
      return reset(body)
    }
    return fail('Not found', 404)
  } catch (e) {
    console.error('[auth] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export { me, publicUser }

// ---------------------------------------------------------------- login
async function login(body) {
  const { email, password } = body
  if (!email || !password) return fail('Email and password are required.')
  const rows = await query('SELECT * FROM users WHERE lower(email) = lower($1)', [
    email,
  ])
  if (!rows.length) return fail('Invalid email or password.', 401)
  const user = rows[0]
  if (user.status === 'disabled') return fail('This account is disabled.', 403)
  const okPass = await verifyPassword(password, user.password_hash)
  if (!okPass) return fail('Invalid email or password.', 401)
  return ok({ token: signToken(user), user: publicUser(user) })
}

async function me(event) {
  const user = await authUser(event, { query })
  if (!user) return fail('Unauthorized', 401)
  return ok({ user: publicUser(user) })
}

async function changePassword(event, body) {
  const user = await authUser(event, { query })
  if (!user) return fail('Unauthorized', 401)
  const { current_password, new_password } = body
  if (!new_password || new_password.length < 8)
    return fail('New password must be at least 8 characters.')
  if (new_password.length > 128)
    return fail('New password is too long.')

  // If forcing change from a one-time password, they must supply current too.
  if (user.must_change_password) {
    if (!current_password)
      return fail('Please enter your current (one-time) password.')
    const okCur = await verifyPassword(current_password, user.password_hash)
    if (!okCur) return fail('Current password is incorrect.', 401)
  } else {
    if (!current_password) return fail('Current password is required.')
    const okCur = await verifyPassword(current_password, user.password_hash)
    if (!okCur) return fail('Current password is incorrect.', 401)
  }

  const hash = await hashPassword(new_password)
  await query(
    `UPDATE users SET password_hash = $1, must_change_password = false, status = 'active'
     WHERE id = $2`,
    [hash, user.id]
  )
  const rows = await query('SELECT * FROM users WHERE id = $1', [user.id])
  return ok({ user: publicUser(rows[0]) })
}

async function forgot(body) {
  const { email } = body
  if (!email) return fail('Email is required.')
  const rows = await query('SELECT * FROM users WHERE lower(email) = lower($1)', [
    email,
  ])
  if (!rows.length)
    return ok({ message: 'If that email exists, a reset link has been sent.' })
  const user = rows[0]
  const token = randomToken(32)
  await query(
    'INSERT INTO password_resets (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, user.id, new Date(Date.now() + 60 * 60 * 1000).toISOString()]
  )
  const link = `${APP_URL}/portal/reset?token=${token}`
  const sent = await sendEmail({
    to: user.email,
    subject: 'BrightSkyIT — Reset your password',
    html: textHtml(
      `Hi ${user.name},\n\nWe received a request to reset your password.\n\nOpen this link within 1 hour to set a new password:\n${link}\n\nIf you didn't request this, you can ignore this email.\n\n— BrightSkyIT`
    ),
  })
  if (!sent.ok) {
    // Don't leak account existence to the caller, but surface the real cause in logs
    // so the owner can see why reset emails aren't arriving (e.g. unverified Resend sender).
    console.error('[mail] forgot: reset email failed to send:', sent.reason)
  }
  return ok({ message: 'If that email exists, a reset link has been sent.' })
}

async function reset(body) {
  const { token, new_password } = body
  if (!token || !new_password) return fail('Token and new password are required.')
  if (new_password.length < 8)
    return fail('New password must be at least 8 characters.')
  const rows = await query(
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
    `UPDATE users SET password_hash = $1, must_change_password = false, status = 'active' WHERE id = $2`,
    [hash, pr.user_id]
  )
  await query('DELETE FROM password_resets WHERE token = $1', [token])
  return ok({ message: 'Password updated. You can now log in.' })
}
