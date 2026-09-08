// Public contact form -> email (via Resend).
//   POST /api/contact
import { ok, fail, readBody } from './db.js'
import { sendEmail } from './_private/email.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return fail('Method not allowed', 405)
  const body = readBody(event)
  const { name, email, subject, message } = body
  if (!name || !email || !message) return fail('Name, email and message are required.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('A valid email is required.')

  const res = await sendEmail({
    to: process.env.CONTACT_TO || process.env.FROM_EMAIL || 'hello@brightskyit.com',
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
