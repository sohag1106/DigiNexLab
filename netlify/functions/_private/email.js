// Email sending support. Primary: Zoho SMTP (configured brand mailbox).
// Fallback: Resend. This powers invitations, job alerts, quote/invoice sends,
// password resets, and the portal Mail composer.
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

const ZOHO_USER = process.env.MAIL_USER        // e.g. sohag@brightskyit.com
const ZOHO_PASS = process.env.MAIL_PASS        // Zoho app password
const ZOHO_SMTP = process.env.SMTP_HOST || 'smtp.zoho.com'
const FROM_ADDR = process.env.FROM_EMAIL || (ZOHO_USER ? `BrightSkyIT <${ZOHO_USER}>` : 'BrightSkyIT <onboarding@resend.dev>')

let smtpTransporter = null
function getSmtp() {
  if (!ZOHO_USER || !ZOHO_PASS) return null
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: ZOHO_SMTP,
      port: 465,
      secure: true,
      auth: { user: ZOHO_USER, pass: ZOHO_PASS },
    })
  }
  return smtpTransporter
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/**
 * Send an email. attachments are nodemailer-style [{ filename, content (Buffer), contentType }].
 */
export async function sendEmail({ to, subject, html, attachments = [], from }) {
  const smtp = getSmtp()
  if (smtp) {
    try {
      const info = await smtp.sendMail({
        from: from || FROM_ADDR,
        to,
        subject,
        html,
        attachments: (attachments || []).map((a) => ({
          filename: a.filename,
          content: a.content, // Buffer
        })),
        replyTo: from || FROM_ADDR,
      })
      return { ok: true, id: info.messageId }
    } catch (e) {
      console.warn('[mail] smtp send error:', e.message)
      // fall through to Resend if it failed and we have the key
      if (!resend) return { ok: false, reason: e.message }
    }
  }

  if (!resend) {
    console.warn('[mail] no mail transport configured (need MAIL_USER/MAIL_PASS or RESEND_API_KEY)')
    return { ok: false, reason: 'no-mail-config' }
  }
  try {
    const res = await resend.emails.send({
      from: from || FROM_ADDR,
      to,
      subject,
      html,
      attachments: (attachments || []).map((a) => ({
        filename: a.filename,
        content: a.content, // Buffer
      })),
      reply_to: (from || FROM_ADDR).replace(/^.*<|>$/g, ''),
    })
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
