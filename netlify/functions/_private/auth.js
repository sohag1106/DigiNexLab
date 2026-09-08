// Shared auth helpers: JWT signing/verification, password hashing, user payload.
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret'
export const APP_URL = process.env.APP_URL || 'http://localhost:5173'

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10)
}

export function verifyPassword(plain, hash) {
  if (!hash) return false
  return bcrypt.compare(plain, hash)
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email, name: user.name, designation: user.designation },
    SECRET,
    { expiresIn: '12h' }
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
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

// Binds per-request authenticated user from the Authorization header.
// Requires a db context to look up the live user row.
export async function authUser(event, db) {
  const h = event.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const rows = await db.query('SELECT * FROM users WHERE id = $1', [payload.sub])
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
