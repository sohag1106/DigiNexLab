// POST /api/contact — public contact form -> email (via Resend)
import { ok, fail, readBody } from '../../_shared/db.js'
import { sendEmail } from '../../_shared/email.js'

export const onRequestPost = async ({ request, env }) => {
  const body = await readBody(request)
  const { name, email, subject, message } = body
  if (!name || !email || !message) return fail('Name, email and message are required.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('A valid email is required.')

  const to = env?.CONTACT_TO || env?.FROM_EMAIL || process.env.FROM_EMAIL || 'hello@brightskyit.com'
  const res = await sendEmail(env, {
    to,
    subject: `New contact: ${subject || 'Website enquiry'} from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || '—'}</p>
      <p><strong>Message:</strong></p><p>${message}</p>`,
    reply_to: email,
  })
  if (!res.ok) return fail('Could not send your message: ' + (res.reason || ''), 500)
  return ok({ message: 'Thanks — your message has been sent.' })
}
