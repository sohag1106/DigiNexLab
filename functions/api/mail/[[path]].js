// /api/mail/* — inbox + send.
// NOTE: IMAP inbox (list/read/seen) is NOT available on Cloudflare Workers
// (outbound TCP blocked). Sending via Resend works.
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'
import { sendEmail } from '../../_shared/email.js'
import { buildPadPDF } from '../../_shared/pad.js'

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const url = new URL(request.url)
  const action = (url.pathname.match(/\/api\/mail\/([^/?]+)/) || [])[1]

  try {
    if (action === 'list') {
      // IMAP unsupported on Workers.
      return fail('Mailbox inbox is not available on Cloudflare (IMAP TCP is blocked).', 501)
    }
    if (action === 'read') {
      return fail('Mailbox inbox is not available on Cloudflare (IMAP TCP is blocked).', 501)
    }
    return fail('Not found', 404)
  } catch (e) {
    console.warn('[mail] error:', e && e.message)
    return fail((e && e.message) || 'Mail error', 500)
  }
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const url = new URL(request.url)
  const action = (url.pathname.match(/\/api\/mail\/([^/?]+)/) || [])[1]

  try {
    if (action === 'seen') {
      const body = await readBody(request)
      return ok({ ok: true }) // no-op on Cloudflare
    }
    if (action === 'send') return send(env, user, request)
    return fail('Not found', 404)
  } catch (e) {
    console.warn('[mail] error:', e && e.message)
    return fail((e && e.message) || 'Mail error', 500)
  }
}

async function send(env, user, request) {
  const body = await readBody(request)
  const { to, subject, html, text, attachQuoteId, attachInvoiceId } = body
  if (!to) return fail('Recipient email is required.')
  if (!subject && !html && !text) return fail('Subject or body is required.')

  const attachments = []
  if (attachQuoteId) {
    const q = await query(env, 'SELECT * FROM quotations WHERE id = $1', [attachQuoteId])
    if (!q.length) return fail('Quotation not found.', 404)
    attachments.push({
      filename: `${q[0].number}.pdf`,
      content: await buildPadPDF({ kind: 'quotation', number: q[0].number, client_name: q[0].client_name, client_email: q[0].client_email, currency: q[0].currency, items: q[0].items, discount: q[0].discount, tax: q[0].tax, total: q[0].total, status: q[0].status, created_at: q[0].created_at, created_by_name: user.name, creator_designation: user.designation }),
    })
  }
  if (attachInvoiceId) {
    const iv = await query(env, 'SELECT * FROM invoices WHERE id = $1', [attachInvoiceId])
    if (!iv.length) return fail('Invoice not found.', 404)
    attachments.push({
      filename: `${iv[0].number}.pdf`,
      content: await buildPadPDF({ kind: 'invoice', number: iv[0].number, client_name: iv[0].client_name, client_email: iv[0].client_email, currency: iv[0].currency, items: iv[0].items, discount: iv[0].discount, tax: iv[0].tax, total: iv[0].total, status: iv[0].status, due_date: iv[0].due_date, created_at: iv[0].created_at, created_by_name: user.name, creator_designation: user.designation }),
    })
  }

  const htmlBody = html || `<p>${String(text || '').replace(/\n/g, '<br>')}</p>`
  const res = await sendEmail(env, {
    to,
    subject: subject || '(no subject)',
    html: htmlBody,
    attachments,
  })
  if (!res.ok) return fail('Could not send: ' + (res.reason || ''), 500)
  return ok({ message: 'Email sent.', id: res.id })
}
