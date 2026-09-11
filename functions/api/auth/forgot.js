// POST /api/auth/forgot
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { randomToken, appUrl } from '../../_shared/auth.js'
import { sendEmail, textHtml } from '../../_shared/email.js'

export const onRequestPost = async ({ request, env }) => {
  const body = await readBody(request)
  const { email } = body
  if (!email) return fail('Email is required.')
  const rows = await query(env, 'SELECT * FROM users WHERE lower(email) = lower($1)', [
    email,
  ])
  if (!rows.length)
    return ok({ message: 'If that email exists, a reset link has been sent.' })
  const user = rows[0]
  const token = randomToken(32)
  await query(
    env,
    'INSERT INTO password_resets (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, user.id, new Date(Date.now() + 60 * 60 * 1000).toISOString()]
  )
  const link = `${appUrl(env)}/reset?token=${token}`
  const sent = await sendEmail(env, {
    to: user.email,
    subject: 'BrightSkyIT — Reset your password',
    html: textHtml(
      `Hi ${user.name},\n\nWe received a request to reset your password.\n\nOpen this link within 1 hour to set a new password:\n${link}\n\nIf you didn't request this, you can ignore this email.\n\n— BrightSkyIT`
    ),
  })
  if (!sent.ok) {
    console.error('[auth] forgot: reset email failed to send:', sent.reason)
  }
  return ok({ message: 'If that email exists, a reset link has been sent.' })
}
