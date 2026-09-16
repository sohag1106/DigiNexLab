// /api/contact — public contact form.
// POST (public): store the submission in the DB first, then notify by email
// best-effort — a Resend outage can no longer lose an enquiry.
// GET list / PATCH status / DELETE — owner/admin only (admin "Website Inbox").
import { query, ok, fail, readBody } from '../_shared/db.js'
import { authUser } from '../_shared/auth.js'
import { sendEmail } from '../_shared/email.js'

export const onRequestPost = async ({ request, env }) => {
  const body = await readBody(request)
  const name = (body.name || '').trim()
  const email = (body.email || '').trim()
  const subject = (body.subject || '').trim()
  const message = (body.message || '').trim()

  if (!name || !email || !message) return fail('Name, email and message are required.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('A valid email is required.')

  // Store first — the email is a notification, not the record of truth.
  const rows = await query(
    env,
    `INSERT INTO contact_submissions (name, email, subject, message)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [name, email, subject || null, message]
  )

  const to = env?.CONTACT_TO || env?.FROM_EMAIL || process.env.FROM_EMAIL || 'hello@brightskyit.com'
  // Never let mail problems fail a stored submission.
  sendEmail(env, {
    to,
    subject: `New contact: ${subject || 'Website enquiry'} from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || '—'}</p>
      <p><strong>Message:</strong></p><p>${message}</p>`,
    reply_to: email,
  }).catch((e) => console.warn('[contact] email failed:', e))

  return ok({ message: 'Thanks — your message has been sent.', id: rows[0]?.id })
}

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  if (user.role !== 'owner' && user.role !== 'admin') return fail('Forbidden', 403)
  try {
    const submissions = await query(
      env,
      `SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 500`
    )
    return ok({ submissions })
  } catch (e) {
    console.warn('[contact] list error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestPatch = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  if (user.role !== 'owner' && user.role !== 'admin') return fail('Forbidden', 403)
  if (!params.id) return fail('Missing submission id.', 400)
  const body = await readBody(request)
  const status = ['new', 'read', 'archived'].includes(body.status) ? body.status : null
  if (!status) return fail('Status must be new, read or archived.')
  try {
    const rows = await query(
      env,
      'UPDATE contact_submissions SET status=$1 WHERE id=$2 RETURNING *',
      [status, params.id]
    )
    if (!rows.length) return fail('Submission not found.', 404)
    return ok({ submission: rows[0], message: 'Updated.' })
  } catch (e) {
    console.warn('[contact] patch error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestDelete = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  if (user.role !== 'owner' && user.role !== 'admin') return fail('Forbidden', 403)
  if (!params.id) return fail('Missing submission id.', 400)
  try {
    const rows = await query(env, 'DELETE FROM contact_submissions WHERE id=$1 RETURNING id', [params.id])
    if (!rows.length) return fail('Submission not found.', 404)
    return ok({ message: 'Submission deleted.' })
  } catch (e) {
    console.warn('[contact] delete error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
