// Admin dashboard stats
//   GET /api/stats   (owner/admin only)
import { query, ok, fail } from './db.js'
import { authUser } from './_private/auth.js'

export const handler = async (event) => {
  const user = await authUser(event, { query })
  if (!user) return fail('Unauthorized', 401)
  if (user.role !== 'owner' && user.role !== 'admin') return fail('Forbidden', 403)
  if (event.httpMethod !== 'GET') return fail('Method not allowed', 405)

  const [people, jobs, quotes, invoices] = await Promise.all([
    query("SELECT count(*)::int AS n, role FROM users GROUP BY role"),
    query("SELECT count(*)::int AS n, status FROM jobs GROUP BY status"),
    query("SELECT count(*)::int AS n, status FROM quotations GROUP BY status"),
    query("SELECT count(*)::int AS n, status, COALESCE(sum(total),0) AS value FROM invoices GROUP BY status"),
  ])

  const byMember = await query(
    `SELECT u.id, u.name, u.designation, u.role,
            COALESCE(qc.cnt, 0)::int AS quotes,
            COALESCE(ic.cnt, 0)::int AS invoices
     FROM users u
     LEFT JOIN (SELECT created_by, count(*) AS cnt FROM quotations GROUP BY created_by) qc
       ON qc.created_by = u.id
     LEFT JOIN (SELECT created_by, count(*) AS cnt FROM invoices GROUP BY created_by) ic
       ON ic.created_by = u.id
     ORDER BY u.name`
  )

  return ok({ people, jobs, quotes, invoices, byMember })
}
