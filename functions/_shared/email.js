// Cloudflare Pages Functions — email sending.
// Primary: Resend. Zoho SMTP is not available inside Workers (blocked outbound
// ports), so we route mail through Resend. Reads env from the function bindings.
import { Resend } from 'resend'

export function fromAddr(env) {
  const zoho = env?.MAIL_USER || process.env.MAIL_USER
  const fromEmail = env?.FROM_EMAIL || process.env.FROM_EMAIL
  if (fromEmail) return fromEmail
  if (zoho) return `BrightSkyIT <${zoho}>`
  return 'BrightSkyIT <onboarding@resend.dev>'
}

export async function sendEmail(env, { to, subject, html, attachments = [], from }) {
  const apiKey = env?.RESEND_API_KEY || process.env.RESEND_API_KEY
  const fromEmail = from || fromAddr(env)

  if (!apiKey) {
    console.warn('[mail] Resend API key not configured (set RESEND_API_KEY).')
    return { ok: false, reason: 'no-resend-config' }
  }

  const resend = new Resend(apiKey)
  const withTimeout = (p, ms, what) =>
    Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error(what)), ms)),
    ])

  try {
    const res = await withTimeout(
      resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
        // If any attachment is included, encode the buffers as Buffer -> expected base64.
        attachments: (attachments || []).map((a) => ({
          filename: a.filename,
          content: a.content, // Buffer
        })),
        reply_to: fromEmail.replace(/^.*<|>$/g, ''),
      }),
      8000,
      'Resend request timed out'
    )
    if (res.error) return { ok: false, reason: res.error.message }
    return { ok: true, id: res.data && res.data.id }
  } catch (e) {
    return { ok: false, reason: e.message }
  }
}

// Simplest text->html wrapper for plain sends.
export function textHtml(text) {
  return text
    .split('\n')
    .map((l) => (l.trim() ? `<p>${l}</p>` : '<p style="margin:0">&nbsp;</p>'))
    .join('')
}
