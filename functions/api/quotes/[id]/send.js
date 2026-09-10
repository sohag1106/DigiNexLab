// POST /api/quotes/:id/send — email the quote PDF to the client
import { query, ok, fail, readBody } from '../../../_shared/db.js'
import { authUser } from '../../../_shared/auth.js'
import { sendEmail } from '../../../_shared/email.js'
import { buildPadPDF } from '../../../_shared/pad.js'

export const onRequestPost = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const rows = await query(env, 'SELECT * FROM quotations WHERE id = $1', [params.id])
  if (!rows.length) return fail('Quotation not found.', 404)
  const row = rows[0]
  if (!isAdmin && row.created_by !== user.id) return fail('Forbidden', 403)
  await readBody(request) // consume body (ignored)

  if (!row.client_email) return fail('This quotation has no client email.', 400)
  const me = await query(env, 'SELECT * FROM users WHERE id = $1', [user.id])
  const buf = await buildPadPDF({
    kind: 'quotation', number: row.number, client_name: row.client_name,
    client_email: row.client_email, currency: row.currency, items: row.items,
    discount: row.discount, tax: row.tax, total: row.total, status: row.status,
    created_at: row.created_at, created_by_name: me[0] ? me[0].name : '',
    creator_designation: me[0] ? me[0].designation : '',
  })
  const res = await sendEmail(env, {
    to: row.client_email,
    subject: `Quotation ${row.number} from BrightSkyIT`,
    html: `<p>Dear ${row.client_name},</p>
      <p>Please find attached quotation <strong>${row.number}</strong> from BrightSkyIT.</p>
      <p>If you have any questions, just reply to this email.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
      <p style="margin:2px 0"><strong>BrightSkyIT</strong> · Creative Digital Agency</p>
      <p style="margin:2px 0">hello@brightskyit.com · brightskyit.com</p>
      <p style="margin:2px 0">${me[0] && me[0].name ? me[0].name + ' · ' : ''}${me[0] && me[0].designation ? me[0].designation + ' · ' : ''}Phone/WhatsApp: +880 1410-217430</p>
      <p style="margin:2px 0;color:#6b7280">Mohanogor Project, Rampura, Dhaka, Bangladesh · Oman Branch — Muscat, Sultanate of Oman</p>
      <p style="margin:2px 0;color:#6b7280">We reply within one business day</p>`,
    attachments: [{ filename: `${row.number}.pdf`, content: buf }],
  })
  if (!res.ok) return fail('Email could not be sent: ' + (res.reason || ''), 500)
  await query(env, `UPDATE quotations SET status='sent', updated_at=now() WHERE id=$1`, [params.id])
  const after = await query(env, 'SELECT * FROM quotations WHERE id = $1', [params.id])
  return ok({ quote: after[0], message: 'Quotation emailed to ' + row.client_email + '.' })
}
