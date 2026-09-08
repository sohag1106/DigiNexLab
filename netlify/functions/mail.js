// Mail module: Zoho IMAP inbox + SMTP send, with optional quote/invoice PDF
// attachment. Any authenticated member with a mailbox role can use it.
//   GET  /api/mail/list?limit=40
//   GET  /api/mail/read?uid=<n>&seen=1
//   POST /api/mail/seen   { uid }
//   POST /api/mail/send   { to, subject, html, attachQuoteId?, attachInvoiceId? }
import { query, ok, fail, readBody } from './db.js'
import { authUser } from './_private/auth.js'
import { listInbox, readMessage, markSeen } from './_private/imap.js'
import { sendEmail } from './_private/email.js'
import { buildPadPDF } from './_private/pad.js'

export const handler = async (event) => {
  try {
    return await route(event)
  } catch (e) {
    console.warn('[mail] error:', e && e.message)
    return fail((e && e.message) || 'Mail error', 500)
  }
}

async function route(event) {
  const user = await authUser(event, { query })
  if (!user) return fail('Unauthorized', 401)

  const method = event.httpMethod
  const body = readBody(event)
  const seg = (event.path || '').split('/').filter(Boolean)
  const action = seg[seg.length - 1]
  const q = event.queryStringParameters || {}

  if (method === 'GET' && action === 'list') return list(q)
  if (method === 'GET' && action === 'read') return read(q)
  if (method === 'POST' && action === 'seen') return seen(body)
  if (method === 'POST' && action === 'send') return send(user, body)
  return fail('Not found', 404)
}

async function list(q) {
  const limit = Math.min(parseInt(q.limit || '40', 10) || 40, 100)
  const data = await listInbox(limit)
  return ok(data)
}

async function read(q) {
  const uid = q.uid ? parseInt(q.uid, 10) : null
  const seq = q.seq ? parseInt(q.seq, 10) : null
  const msg = await readMessage(seq, uid)
  if (!msg) return fail('Message not found', 404)
  if (q.seen === '1' && msg.uid) await markSeen(msg.uid)
  return ok({ message: msg })
}

async function seen(body) {
  if (body.uid) await markSeen(parseInt(body.uid, 10))
  return ok({ ok: true })
}

async function send(user, body) {
  const { to, subject, html, text, attachQuoteId, attachInvoiceId } = body
  if (!to) return fail('Recipient email is required.')
  if (!subject && !html && !text) return fail('Subject or body is required.')

  const attachments = []
  if (attachQuoteId) {
    const q = await query('SELECT * FROM quotations WHERE id = $1', [attachQuoteId])
    if (!q.length) return fail('Quotation not found.', 404)
    attachments.push({
      filename: `${q[0].number}.pdf`,
      content: await buildPadPDF({ kind: 'quotation', number: q[0].number, client_name: q[0].client_name, client_email: q[0].client_email, currency: q[0].currency, items: q[0].items, discount: q[0].discount, tax: q[0].tax, total: q[0].total, status: q[0].status, created_at: q[0].created_at, created_by_name: user.name, creator_designation: user.designation }),
    })
  }
  if (attachInvoiceId) {
    const iv = await query('SELECT * FROM invoices WHERE id = $1', [attachInvoiceId])
    if (!iv.length) return fail('Invoice not found.', 404)
    attachments.push({
      filename: `${iv[0].number}.pdf`,
      content: await buildPadPDF({ kind: 'invoice', number: iv[0].number, client_name: iv[0].client_name, client_email: iv[0].client_email, currency: iv[0].currency, items: iv[0].items, discount: iv[0].discount, tax: iv[0].tax, total: iv[0].total, status: iv[0].status, due_date: iv[0].due_date, created_at: iv[0].created_at, created_by_name: user.name, creator_designation: user.designation }),
    })
  }

  const htmlBody = html || `<p>${String(text || '').replace(/\n/g, '<br>')}</p>`
  // Send as the brand address (Zoho mailbox once configured, else the app's
  // from-address), NOT the member's personal email — Resend only allows sending
  // from verified domains, and a personal gmail address would be rejected.
  const fromAddr =
    process.env.MAIL_USER ||
    process.env.FROM_EMAIL ||
    (user.name ? `${user.name} <${user.email}>` : user.email)
  const res = await sendEmail({ to, subject: subject || '(no subject)', html: htmlBody, attachments, from: fromAddr })
  if (!res.ok) return fail('Could not send: ' + (res.reason || ''), 500)
  return ok({ message: 'Email sent.', id: res.id })
}
