// POST /api/invoices/:id/send — email the invoice PDF to the client
import { query, ok, fail, readBody } from '../../../_shared/db.js'
import { authUser } from '../../../_shared/auth.js'
import { sendEmail } from '../../../_shared/email.js'
import { buildPadPDF } from '../../../_shared/pad.js'

export const onRequestPost = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const rows = await query(env, 'SELECT * FROM invoices WHERE id = $1', [params.id])
  if (!rows.length) return fail('Invoice not found.', 404)
  const row = rows[0]
  if (!isAdmin && row.created_by !== user.id) return fail('Forbidden', 403)
  await readBody(request) // consume body (ignored)

  if (!row.client_email) return fail('This invoice has no client email.', 400)
  const me = await query(env, 'SELECT * FROM users WHERE id = $1', [user.id])
  const buf = await buildPadPDF({
    kind: 'invoice', number: row.number, client_name: row.client_name,
    client_email: row.client_email, currency: row.currency, items: row.items,
    discount: row.discount, tax: row.tax, total: row.total, status: row.status,
    due_date: row.due_date, created_at: row.created_at,
    created_by_name: me[0] ? me[0].name : '', creator_designation: me[0] ? me[0].designation : '',
  })
  const res = await sendEmail(env, {
    to: row.client_email,
    subject: `Invoice ${row.number} from BrightSkyIT`,
    html: `<p>Dear ${row.client_name},</p>
      <p>Please find attached invoice <strong>${row.number}</strong> from BrightSkyIT.</p>
      <p>Thank you for your business.</p>
      <p>— BrightSkyIT</p>`,
    attachments: [{ filename: `${row.number}.pdf`, content: buf }],
  })
  if (!res.ok) return fail('Email could not be sent: ' + (res.reason || ''), 500)
  await query(env, `UPDATE invoices SET status='sent', updated_at=now() WHERE id=$1`, [params.id])
  const after = await query(env, 'SELECT * FROM invoices WHERE id = $1', [params.id])
  return ok({ invoice: after[0], message: 'Invoice emailed to ' + row.client_email + '.' })
}
