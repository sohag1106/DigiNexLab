// GET /api/auth/me  (bearer)
import { query, ok, fail } from '../../_shared/db.js'
import { authUser, publicUser } from '../../_shared/auth.js'

export const onRequestGet = async ({ request, env }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  return ok({ user: publicUser(user) })
}
