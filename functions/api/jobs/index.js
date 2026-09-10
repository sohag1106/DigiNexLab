// /api/jobs  — GET list, POST create (owner/admin, emails assignee)
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser, appUrl } from '../../_shared/auth.js'
import { sendEmail } from '../../_shared/email.js'

async function list(env, user, isAdmin) {
  let rows
  if (isAdmin) {
    rows = await query(
      env,
      `SELECT j.*, a.name AS assignee_name, b.name AS assigner_name
       FROM jobs j
       LEFT JOIN users a ON a.id = j.assigned_to
       LEFT JOIN users b ON b.id = j.assigned_by
       ORDER BY j.created_at DESC`
    )
  } else {
    rows = await query(
      env,
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

async function create(env, user, body) {
  const { title, description, assigned_to } = body
  if (!title || !title.trim()) return fail('A job title is required.')
  if (!assigned_to) return fail('Choose who the job is assigned to.')

  const assignee = await query(env, 'SELECT * FROM users WHERE id = $1', [assigned_to])
  if (!assignee.length) return fail('Assignee not found.', 404)

  const rows = await query(
    env,
    `INSERT INTO jobs (title, description, assigned_to, assigned_by, status)
     VALUES ($1,$2,$3,$4,'open') RETURNING *`,
    [title.trim(), description || null, assigned_to, user.id]
  )

  await sendEmail(env, {
    to: assignee[0].email,
    subject: `New job assigned: ${title}`,
    html: `<h2>New job on BrightSkyIT</h2>
      <p>Hi ${assignee[0].name},</p>
      <p><strong>${user.name}</strong> assigned you a job:</p>
      <p><strong>${title}</strong></p>
      ${description ? `<p>${description}</p>` : ''}
      <p><a href="${appUrl(env)}/portal/app">Open your dashboard</a></p>`,
  })

  return ok(
    {
      message: `Job assigned to ${assignee[0].name}.`,
      job: { ...rows[0], assignee_name: assignee[0].name },
    },
    201
  )
}

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  return list(env, user, isAdmin(user))
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  if (!isAdmin(user)) return fail('Forbidden', 403)
  const body = await readBody(request)
  return create(env, user, body)
}

function isAdmin(user) {
  return user.role === 'owner' || user.role === 'admin'
}
