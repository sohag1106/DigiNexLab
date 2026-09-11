// /api/projects — internal projects with assigned handlers (many-to-many).
// GET  list projects (with handlers), POST create, POST /:id update, DELETE /:id
// Any member can create/list; only the author or an admin can edit/delete.
import { query, ok, fail, readBody } from '../../_shared/db.js'
import { authUser } from '../../_shared/auth.js'

function segments(request) {
  return new URL(request.url).pathname.replace(/^\/api\/projects\/?/, '').split('/').filter(Boolean)
}

const LIST_SQL = `
  SELECT p.id, p.name, p.description, p.created_by, p.created_at, p.updated_at,
         c.name AS created_by_name,
         COALESCE(
           (SELECT jsonb_agg(jsonb_build_object('id', u.id, 'name', u.name, 'designation', u.designation) ORDER BY u.name)
            FROM project_handlers ph JOIN users u ON u.id = ph.user_id
            WHERE ph.project_id = p.id),
           '[]'::jsonb
         ) AS handlers
  FROM projects p
  LEFT JOIN users c ON c.id = p.created_by
`

function isModerator(user) {
  return user.role === 'owner' || user.role === 'admin'
}

async function getProject(env, id) {
  const rows = await query(env, `${LIST_SQL} WHERE p.id = $1`, [id])
  return rows[0] || null
}

async function setHandlers(env, projectId, ids) {
  await query(env, 'DELETE FROM project_handlers WHERE project_id = $1', [projectId])
  const unique = [...new Set((ids || []))].filter(Boolean)
  for (const uid of unique) {
    await query(
      env,
      'INSERT INTO project_handlers (project_id, user_id) VALUES ($1,$2)',
      [projectId, uid]
    )
  }
}

export const onRequestGet = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const seg = segments(request)
  try {
    if (!seg.length) {
      const projects = await query(env, `${LIST_SQL} ORDER BY p.created_at DESC`)
      return ok({ projects })
    }
    const project = await getProject(env, seg[0])
    if (!project) return fail('Project not found.', 404)
    return ok({ project })
  } catch (e) {
    console.warn('[projects] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestPost = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const id = segments(request)[0]
  try {
    const body = await readBody(request)
    const name = (body.name || '').trim()
    const description = (body.description || '').trim()

    if (!id) {
      // CREATE
      if (!name) return fail('Give the project a name.')
      const rows = await query(
        env,
        'INSERT INTO projects (name, description, created_by) VALUES ($1,$2,$3) RETURNING *',
        [name, description || null, user.id]
      )
      const project = rows[0]
      await setHandlers(env, project.id, body.handler_ids)
      return ok({ project: await getProject(env, project.id), message: 'Project created.' }, 201)
    }

    // UPDATE
    const existing = await getProject(env, id)
    if (!existing) return fail('Project not found.', 404)
    if (existing.created_by !== user.id && !isModerator(user))
      return fail('Only the project creator (or an admin) can edit this.', 403)

    const nextName = (name || existing.name).trim()
    const nextDesc = body.description !== undefined ? (description || null) : existing.description
    await query(
      env,
      'UPDATE projects SET name=$1, description=$2, updated_at=now() WHERE id=$3',
      [nextName, nextDesc, id]
    )
    if (body.handler_ids) await setHandlers(env, id, body.handler_ids)
    return ok({ project: await getProject(env, id), message: 'Project updated.' })
  } catch (e) {
    console.warn('[projects] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}

export const onRequestDelete = async ({ env, request }) => {
  const user = await authUser(env, request, query)
  if (!user) return fail('Unauthorized', 401)
  const id = segments(request)[0]
  if (!id) return fail('Missing project id.', 400)
  try {
    const existing = await getProject(env, id)
    if (!existing) return fail('Project not found.', 404)
    if (existing.created_by !== user.id && !isModerator(user))
      return fail('Only the project creator (or an admin) can delete this.', 403)
    await query(env, 'DELETE FROM projects WHERE id=$1', [id])
    return ok({ message: 'Project deleted.' })
  } catch (e) {
    console.warn('[projects] error:', e)
    return fail('Server error: ' + e.message, 500)
  }
}
