// Users endpoints
//   GET    /api/users               (owner/admin: list all)
//   POST   /api/users               (owner/admin: invite a new person)
//   PATCH  /api/users/:id           (owner/admin: edit role/designation/name/status;
//                                    any user can edit own designation/name)
//   DELETE /api/users/:id           (owner/admin, owner never removed)
import { query, ok, fail, readBody } from './db.js'
import { authUser, publicUser, hashPassword, randomPassword } from './_private/auth.js'
import { sendEmail } from './_private/email.js'
import { APP_URL } from './_private/auth.js'

export const handler = async (event) => {
  const user = await authUser(event, { query })
  if (!user) return fail('Unauthorized', 401)

  const method = event.httpMethod
  const body = readBody(event)
  const id = (event.path || '').split('/').filter(Boolean).pop()
  const isAdmin = user.role === 'owner' || user.role === 'admin'

  try {
    // GET list — any authenticated member can see teammate names/roles
    // (needed for internal messaging); publicUser strips sensitive fields.
    if (method === 'GET' && (await listIsRequest(event))) {
      return list()
    }

    if (method === 'POST') {
      if (!isAdmin) return fail('Forbidden', 403)
      return create(body)
    }

    if (method === 'PATCH') {
      return update(event, user, body, id)
    }

    if (method === 'DELETE') {
      if (!isAdmin) return fail('Forbidden', 403)
      return remove(id, user)
    }
  } catch (e) {
    console.warn('[users] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
  return fail('Not found', 404)
}

async function listIsRequest(event) {
  const url = new URL(event.url || `http://x${event.path}`)
  return true
}

async function list() {
  const rows = await query(
    `SELECT id, email, name, designation, role, status, must_change_password, created_at
     FROM users ORDER BY created_at DESC`
  )
  return ok({ users: rows.map(publicUser) })
}

async function create(body) {
  const { email, name, designation, role } = body
  if (!email || !name) return fail('Email and name are required.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return fail('A valid email is required.')
  const roleVal = ['staff', 'admin'].includes(role) ? role : 'staff'

  const existing = await query('SELECT id FROM users WHERE lower(email)=lower($1)', [email])
  if (existing.length) return fail('A user with that email already exists.')

  const otp = randomPassword(8)
  const hash = await hashPassword(otp)

  await query(
    `INSERT INTO users (email, name, designation, role, status, password_hash, must_change_password)
     VALUES ($1,$2,$3,$4,'invited',$5,true)`,
    [email.toLowerCase().trim(), name.trim(), designation || null, roleVal, hash]
  )
  const rows = await query('SELECT * FROM users WHERE lower(email)=lower($1)', [email])
  const created = rows[0]

  const link = `${APP_URL}/portal/login`
  await sendEmail({
    to: email,
    subject: 'You’ve been added to BrightSkyIT',
    html: `<h2>Welcome to BrightSkyIT, ${name}!</h2>
      <p>Your account has been created on the BrightSkyIT portal.</p>
      <p><strong>Login email:</strong> ${email}<br/>
         <strong>One-time password:</strong> <code>${otp}</code></p>
      <p>You’ll be asked to set your own password the first time you log in.</p>
      <p><a href="${link}">Open the portal</a></p>`,
  })

  return ok(
    {
      message:
        `${name} invited. A one-time password was emailed to ${email}.`,
      user: publicUser(created),
    },
    201
  )
}

async function update(event, user, body, id) {
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  // "me" refers to the current user
  let targetId = id
  if (id === 'me') targetId = user.id

  if (targetId !== user.id && !isAdmin)
    return fail('Forbidden', 403)

  const fields = []
  const params = []
  let i = 1

  const add = (col, val) => {
    if (val === undefined) return
    fields.push(`${col} = $${i++}`)
    params.push(val)
  }

  if (isAdmin) {
    // Admin may change name, designation, role, status on anyone.
    add('name', body.name)
    add('designation', body.designation === null ? null : body.designation)
    add('role', body.role && ['owner','admin','staff'].includes(body.role) ? body.role : undefined)
    add('status', body.status && ['invited','active','disabled'].includes(body.status) ? body.status : undefined)
  } else {
    // Non-admin may only edit their own name / designation.
    add('name', body.name)
    add('designation', body.designation === null ? null : body.designation)
  }

  if (!fields.length) return fail('Nothing to update.')

  // Guard: prevent demoting/removing the owner.
  const targetRows = await query('SELECT * FROM users WHERE id = $1', [targetId])
  if (!targetRows.length) return fail('User not found', 404)
  const target = targetRows[0]
  if (target.role === 'owner' && body.role && body.role !== 'owner') {
    return fail('The Owner account cannot change role.')
  }
  if (target.role === 'owner' && body.status && body.status === 'disabled') {
    return fail('The Owner account cannot be disabled.')
  }

  // Build SET clause with sequential placeholders, params ordered to match.
  const ordered = []
  let c = 1
  const colSql = fields.map((f) => {
    const m = f.match(/^(\w+) = \$(\d+)$/)
    if (!m) return f
    ordered[c - 1] = params[Number(m[2]) - 1]
    return `${m[1]} = $${c++}`
  }).join(', ')
  ordered.push(targetId)
  await query(`UPDATE users SET ${colSql} WHERE id = $${c}`, ordered)

  const rows = await query('SELECT * FROM users WHERE id = $1', [targetId])
  return ok({ user: publicUser(rows[0]), message: 'Profile updated.' })
}

async function remove(id, me) {
  if (id === 'me') return fail('Cannot delete yourself.', 400)
  const rows = await query('SELECT * FROM users WHERE id = $1', [id])
  if (!rows.length) return fail('User not found', 404)
  if (rows[0].role === 'owner') return fail('The Owner account cannot be deleted.', 400)
  await query('DELETE FROM users WHERE id = $1', [id])
  return ok({ message: 'User removed.' })
}
