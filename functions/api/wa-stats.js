// GET /api/wa-stats — WhatsApp CTA analytics for the admin portal.
// Reads the wa_clicks table written by the /go/wa redirect. Owner/admin only.
import { query, ok, fail } from '../_shared/db.js'
import { authUser } from '../_shared/auth.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const user = await authUser(env, request, query)
  if (!user) return fail('Sign in required.', 401)
  if (!['owner', 'admin'].includes(user.role)) return fail('Not allowed.', 403)

  // Hard failures here are fine to surface: this is an admin screen, not a
  // customer funnel.
  const [totals] = await query(env,
    `SELECT count(*)::int AS clicks,
            count(*) FILTER (WHERE created_at > now() - interval '7 days')::int  AS last7,
            count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS last30
     FROM wa_clicks`)

  const [forms] = await query(env,
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE created_at > now() - interval '7 days')::int  AS last7,
            count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS last30
     FROM contact_submissions`)

  const byCity = await query(env,
    `SELECT coalesce(city, '(not a city page)') AS city,
            count(*)::int AS clicks,
            max(created_at) AS latest
     FROM wa_clicks
     GROUP BY 1
     ORDER BY clicks DESC, max(created_at) DESC
     LIMIT 20`)

  const byPlacement = await query(env,
    `SELECT coalesce(placement, 'other') AS placement, count(*)::int AS clicks
     FROM wa_clicks
     GROUP BY 1
     ORDER BY clicks DESC`)

  const recent = await query(env,
    `SELECT id, city, page, placement, created_at
     FROM wa_clicks
     ORDER BY created_at DESC
     LIMIT 50`)

  return ok({
    totals,
    forms,
    byCity,
    byPlacement,
    recent,
    since: (await query(env, `SELECT min(created_at) AS first FROM wa_clicks`))[0]?.first,
  })
}
