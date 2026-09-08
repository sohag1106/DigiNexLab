// Shared Neon Postgres connection + tiny query helper for Netlify Functions.
// Loads DATABASE_URL from environment (set locally from .env via netlify dev,
// or as Netlify env vars in production).
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL
const sql = connectionString ? neon(connectionString) : null

// Set public / private helpers so we don't import 'pg' needlessly.
export async function query(text, params) {
  if (!sql) {
    throw new Error(
      'DATABASE_URL is not configured. Set it in .env / Netlify env vars.'
    )
  }
  // neon() accepts params as an array. JSON-encode jsonb params for convenience.
  const mapped = (params || []).map((p) =>
    typeof p === 'object' && p !== null ? JSON.stringify(p) : p
  )
  return sql(text, mapped)
}

export { sql }

export function ok(data, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}

export function fail(message, status = 400, extra = {}) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message, ...extra }),
  }
}

export function readBody(event) {
  if (!event.body) return {}
  try {
    return JSON.parse(event.body)
  } catch {
    return {}
  }
}

// Netlify's event.path is the FULL url (e.g. /.netlify/functions/quotes/<id>).
// Return only the segments AFTER the function name so routing math is stable.
export function pathSegments(event) {
  const p = event.path || ''
  const m = p.match(/\/functions\/([^/]+)(.*)$/)
  if (!m) return []
  const rest = (m[2] || '').replace(/^\/+/, '')
  return rest ? rest.split('/').filter(Boolean) : []
}
