// /api/users  — GET list (auth), POST create (owner/admin invite)
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser, publicUser, hashPassword, randomPassword, appUrl } from '../../_shared/auth.js'
import { sendEmail } from '../../_shared/email.js'
import { invitationTemplate } from '../../_shared/email-templates.js'

async function list(env) {
  const rows = await query(
    env,
    `SELECT id, email, name, designation, role, status, must_change_password, created_at
     FROM users ORDER BY created_at DESC`
  )
  return ok({ users: rows.map(publicUser) })
}

async function create(env, user, body) {
  const { email, name, designation, role } = body
  if (!email || !name) return fail('Email and name are required.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return fail('A valid email is required.')
  const roleVal = ['staff', 'admin'].includes(role) ? role : 'staff'

  const existing = await query(env, 'SELECT id FROM users WHERE lower(email)=lower($1)', [email])
  if (existing.length) return fail('A user with that email already exists.')

  const otp = randomPassword(8)
  const hash = await hashPassword(otp)

  await query(
    env,
    `INSERT INTO users (email, name, designation, role, status, password_hash, must_change_password)
     VALUES ($1,$2,$3,$4,'invited',$5,true)`,
    [email.toLowerCase().trim(), name.trim(), designation || null, roleVal, hash]
  )
  const rows = await query(env, 'SELECT * FROM users WHERE lower(email)=lower($1)', [email])
  const created = rows[0]

  const link = `${appUrl(env)}/login`
  const designationLabel = designation && designation.trim() ? designation.trim() : roleVal === 'admin' ? 'Administrator' : 'Team Member'
  await sendEmail(env, {
    to: email,
    subject: `You’ve been added to BrightSkyIT — Welcome, ${name}!`,
    html: invitationTemplate({ name, email, otp, designation: designationLabel, link }),
  })

  return ok(
    {
      message: `${name} invited. A one-time password was emailed to ${email}.`,
      user: publicUser(created),
    },
    201
  )
}

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  return list(env)
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  if (user.role !== 'owner' && user.role !== 'admin') return fail('Forbidden', 403)
  const body = await readBody(request)
  return create(env, user, body)
}
