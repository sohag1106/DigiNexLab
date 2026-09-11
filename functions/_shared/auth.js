// Cloudflare Pages Functions — shared auth helpers.
// Env-dependent values come from the function `env` (Cloudflare bindings).
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10)
}

export function verifyPassword(plain, hash) {
  if (!hash) return false
  return bcrypt.compare(plain, hash)
}

// Production portal base URL. Cloudflare Pages binding APP_URL provides the
// deployed value; local dev sets APP_URL in .dev.vars to http://localhost:5173.
// The bare fallback is the real site so a missing/mis-set binding can never
// silently ship localhost links in customer emails.
const PROD_URL = 'https://www.brightskyit.com'

export function appUrl(env) {
  return env?.APP_URL || process.env.APP_URL || PROD_URL
}

export function signToken(env, user) {
  const secret = env?.SESSION_SECRET || process.env.SESSION_SECRET || 'dev-insecure-secret'
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      designation: user.designation,
    },
    secret,
    { expiresIn: '12h' }
  )
}

export function verifyToken(env, token) {
  const secret = env?.SESSION_SECRET || process.env.SESSION_SECRET || 'dev-insecure-secret'
  try {
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

// user payload returned to the client (never includes password_hash)
export function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    designation: row.designation,
    role: row.role,
    status: row.status,
    must_change_password: row.must_change_password,
    created_at: row.created_at,
  }
}

// Reads the Bearer token from a Cloudflare Request and looks up the live user.
// `db` must be the shared query helper bound to env.
export async function authUser(env, request, db) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const payload = verifyToken(env, token)
  if (!payload) return null
  const rows = await db(env, 'SELECT * FROM users WHERE id = $1', [payload.sub])
  if (!rows.length || rows[0].status === 'disabled') return null
  return rows[0]
}

export function randomPassword(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[(Math.random() * chars.length) | 0]
  return out
}

export function randomToken(len = 24) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[(Math.random() * chars.length) | 0]
  return out
}
