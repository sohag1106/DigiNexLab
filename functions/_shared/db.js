// Cloudflare Pages Functions — Neon Postgres query helper.
// Reads DATABASE_URL from the function `env` (Cloudflare bindings), not process.env.
import { neon } from '@neondatabase/serverless'

let cached = null

function getSql(env) {
  const connectionString = env?.DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured (set it in Cloudflare >> Functions >> environment variables).')
  }
  if (!cached) cached = neon(connectionString)
  return cached
}

export async function query(env, text, params) {
  const sql = getSql(env)
  const mapped = (params || []).map((p) =>
    typeof p === 'object' && p !== null ? JSON.stringify(p) : p
  )
  return sql(text, mapped)
}

// ---- helpers that need an explicit env param ----
export function ok(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function fail(message, status = 400, extra = {}) {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function readBody(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

// Segment the URL path from a Pages Function that lives at /functions/<x>/<y>.
// The request URL path is like /api/... (after _redirects strips the blades).
export function pathSegments(url) {
  const p = (url?.pathname || '').replace(/^\/api\//, '').replace(/^\/+/, '')
  return p ? p.split('/').filter(Boolean) : []
}
