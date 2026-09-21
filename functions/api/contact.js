// /api/contact — public contact form.
// POST (public): store the submission in the DB first, then notify by email
// best-effort — a Resend outage can no longer lose an enquiry.
// GET list (owner/admin) powers the admin "Website Inbox"; PATCH/DELETE for
// individual submissions live in contact/[id].js.
import { query, ok, fail, readBody } from '../_shared/db.js'
import { authUser } from '../_shared/auth.js'
import { sendEmail } from '../_shared/email.js'

export const onRequestPost = async ({ request, env }) => {
  const body = await readBody(request)
  const name = (body.name || '').trim()
  const email = (body.email || '').trim()
  const subject = (body.subject || '').trim()
  const message = (body.message || '').trim()
  const whatsapp = (body.whatsapp || '').trim()
  const phone = (body.phone || '').trim()
  // prefer is an array of channels; normalize to an array of known values.
  let prefer = body.prefer
  if (Array.isArray(prefer)) prefer = prefer.map((s) => String(s).trim()).filter(Boolean)
  else if (typeof prefer === 'string') prefer = [prefer].map((s) => s.trim()).filter(Boolean)
  else prefer = []
  const allowed = new Set(['email', 'whatsapp', 'phone'])
  prefer = prefer.map((s) => s.toLowerCase()).filter((s) => allowed.has(s))
  if (prefer.length === 0) prefer = ['email']
  // At least one contact channel must have a value.
  if (!name || !message) return fail('Name and message are required.')
  if (prefer.includes('email') && (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) return fail('A valid email is required when you choose email.')
  if (prefer.includes('whatsapp') && !whatsapp) return fail('WhatsApp number is required when you choose WhatsApp.')
  if (prefer.includes('phone') && !phone) return fail('Phone number is required when you choose direct call.')
  if (!email && !whatsapp && !phone) return fail('Email, WhatsApp or phone — at least one is required.')

  // Backward: if multi-channel chosen but email missing, still allow — use
  // cheapest identifier as reply email placeholder only when whatsapp/phone present.
  const emailForValidation = email || (whatsapp ? 'noreply@brightskyit.com' : null)
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('A valid email is required.')

  // Store first — the email is a notification, not the record of truth.
  const rows = await query(
    env,
    `INSERT INTO contact_submissions (name, email, subject, message, whatsapp, phone, prefer)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [name, emailForValidation ? email || '' : '', subject || null, message, whatsapp || null, phone || null, prefer.join(',')]
  )

  // Notify the owner's personal inbox — submissions are stored first (below),
  // so a mail outage can never lose an enquiry. CONTACT_TO overrides via env.
  const to = env?.CONTACT_TO || process.env.CONTACT_TO || 'sohagvhi1106@gmail.com'
  const preferLabel = prefer.join(', ')
  // Never let mail problems fail a stored submission.
  sendEmail(env, {
    to,
    subject: `New contact: ${subject || 'Website enquiry'} from ${name} [${preferLabel}]`,
    html: `<p><strong>Name:</strong> ${name}</p>
      <p><strong>Preferred contact:</strong> ${preferLabel}</p>
      <p><strong>Email:</strong> ${email || '—'}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp || '—'}</p>
      <p><strong>Phone (call):</strong> ${phone || '—'}</p>
      <p><strong>Subject:</strong> ${subject || '—'}</p>
      <p><strong>Message:</strong></p><p>${message}</p>`,
    reply_to: email || undefined,
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

