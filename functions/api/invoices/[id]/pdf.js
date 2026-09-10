// GET /api/invoices/:id/pdf — branded BrightSkyIT pad PDF
import { query, ok, fail } from '../../../_shared/db.js'
import { authUser } from '../../../_shared/auth.js'
import { buildPadPDF } from '../../../_shared/pad.js'

export const onRequestGet = async ({ env, request, params }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const rows = await query(env, 'SELECT * FROM invoices WHERE id = $1', [params.id])
  if (!rows.length) return fail('Invoice not found.', 404)
  const row = rows[0]
  if (!isAdmin && row.created_by !== user.id) return fail('Forbidden', 403)

  const me = await query(env, 'SELECT * FROM users WHERE id = $1', [user.id])
  const buf = await buildPadPDF({
    kind: 'invoice', number: row.number, client_name: row.client_name,
    client_email: row.client_email, currency: row.currency, items: row.items,
    discount: row.discount, tax: row.tax, total: row.total, status: row.status,
    due_date: row.due_date, created_at: row.created_at,
    created_by_name: me[0] ? me[0].name : '', creator_designation: me[0] ? me[0].designation : '',
  })
  return new Response(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${row.number}.pdf"`,
    },
  })
}
