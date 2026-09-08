// Jobs endpoints
//   GET    /api/jobs            (user: own jobs; owner/admin: all jobs)
//   POST   /api/jobs            (owner/admin: create + assign; emails assignee)
//   PATCH  /api/jobs/:id        (owner/admin or assignee: update status/title)
import { query, ok, fail, readBody } from './db.js'
import { authUser, publicUser } from './_private/auth.js'
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
    if (method === 'GET') return list(user, isAdmin)
    if (method === 'POST') {
      if (!isAdmin) return fail('Forbidden', 403)
      return create(user, body)
    }
    if (method === 'PATCH') return update(user, body, id)
  } catch (e) {
    console.warn('[jobs] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
  return fail('Not found', 404)
}

async function list(user, isAdmin) {
  let rows
  if (isAdmin) {
    rows = await query(
      `SELECT j.*, a.name AS assignee_name, b.name AS assigner_name
       FROM jobs j
       LEFT JOIN users a ON a.id = j.assigned_to
       LEFT JOIN users b ON b.id = j.assigned_by
       ORDER BY j.created_at DESC`
    )
  } else {
    rows = await query(
      `SELECT j.*, a.name AS assignee_name, b.name AS assigner_name
       FROM jobs j
       LEFT JOIN users a ON a.id = j.assigned_to
       LEFT JOIN users b ON b.id = j.assigned_by
       WHERE j.assigned_to = $1
       ORDER BY j.created_at DESC`,
      [user.id]
    )
  }
  return ok({ jobs: rows })
}

async function create(user, body) {
  const { title, description, assigned_to } = body
  if (!title || !title.trim()) return fail('A job title is required.')
  if (!assigned_to) return fail('Choose who the job is assigned to.')

  const assignee = await query('SELECT * FROM users WHERE id = $1', [assigned_to])
  if (!assignee.length) return fail('Assignee not found.', 404)

  const rows = await query(
    `INSERT INTO jobs (title, description, assigned_to, assigned_by, status)
     VALUES ($1,$2,$3,$4,'open') RETURNING *`,
    [title.trim(), description || null, assigned_to, user.id]
  )

  await sendEmail({
    to: assignee[0].email,
    subject: `New job assigned: ${title}`,
    html: `<h2>New job on BrightSkyIT</h2>
      <p>Hi ${assignee[0].name},</p>
      <p><strong>${user.name}</strong> assigned you a job:</p>
      <p><strong>${title}</strong></p>
      ${description ? `<p>${description}</p>` : ''}
      <p><a href="${APP_URL}/portal/app">Open your dashboard</a></p>`,
  })

  return ok(
    {
      message: `Job assigned to ${assignee[0].name}.`,
      job: { ...rows[0], assignee_name: assignee[0].name },
    },
    201
  )
}

async function update(user, body, id) {
  const isAdmin = user.role === 'owner' || user.role === 'admin'
  const existing = await query('SELECT * FROM jobs WHERE id = $1', [id])
  if (!existing.length) return fail('Job not found', 404)

  const isAssignee = existing[0].assigned_to === user.id
  if (!isAdmin && !isAssignee) return fail('Forbidden', 403)

  const { title, description, status, assigned_to } = body
  const allowed = ['open', 'in_progress', 'done']
  const upd = []
  const params = []
  let c = 1
  const add = (col, val) => {
    if (val === undefined) return
    upd.push(`${col} = $${c++}`)
    params.push(val)
  }
  add('title', title !== undefined ? title.trim() : undefined)
  add('description', description !== undefined ? description : undefined)
  add('status', status !== undefined ? (bodyStatus(status, existing[0].status, allowed)) : undefined)
  if (isAdmin) add('assigned_to', assigned_to !== undefined ? assigned_to : undefined)

  if (!upd.length) return fail('Nothing to update.')
  params.push(id)
  await query(`UPDATE jobs SET ${upd.join(', ')} WHERE id = $${c}`, params)
  const rows = await query('SELECT * FROM jobs WHERE id = $1', [id])
  return ok({ job: rows[0], message: 'Job updated.' })
}

function bodyStatus(status, current, allowed) {
  return allowed.includes(status) ? status : current
}
