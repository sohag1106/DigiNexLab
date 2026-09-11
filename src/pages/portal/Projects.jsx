// Projects — team projects with multiple assigned handlers.
// Any member can create a project and pick handlers from the team;
// only the creator (or an admin) can edit or delete.
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Avatar, Modal } from '../../components/ui'
import { timeAgo } from '../../lib/format'
import { useToast } from '../../components/Toast'

const DEFAULT_FORM = { name: '', description: '', handler_ids: [] }

export default function Projects() {
  const { user } = useAuth()
  const toast = useToast()
  const [projects, setProjects] = useState([])
  const [people, setPeople] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // project being edited, or null for new
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  const isAdmin = user?.role === 'owner' || user?.role === 'admin'

  async function loadProjects() {
    try {
      const d = await api('/projects')
      setProjects(d.projects || [])
    } catch (e) {
      toast(e.message || 'Could not load projects.', 'error')
    }
  }

  useEffect(() => { loadProjects() }, [])
  useEffect(() => {
    api('/users').then((d) => setPeople(d.users || [])).catch(() => {})
  }, [])

  function openNew() {
    setEditing(null)
    setForm(DEFAULT_FORM)
    setModalOpen(true)
  }

  function openEdit(p) {
    setEditing(p)
    setForm({ name: p.name, description: p.description || '', handler_ids: (p.handlers || []).map((h) => h.id) })
    setModalOpen(true)
  }

  function toggleHandler(id) {
    setForm((f) => ({
      ...f,
      handler_ids: f.handler_ids.includes(id)
        ? f.handler_ids.filter((x) => x !== id)
        : [...f.handler_ids, id],
    }))
  }

  async function save(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await api(`/projects/${editing.id}`, { method: 'POST', body: form })
        toast('Project updated.', 'success')
      } else {
        await api('/projects', { method: 'POST', body: form })
        toast('Project created.', 'success')
      }
      setModalOpen(false)
      await loadProjects()
    } catch (err) {
      toast(err.message || 'Could not save project.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove(p) {
    if (!confirm(`Delete project "${p.name}"? This can’t be undone.`)) return
    try {
      await api(`/projects/${p.id}`, { method: 'DELETE' })
      toast('Project deleted.', 'success')
      await loadProjects()
    } catch (err) {
      toast(err.message || 'Could not delete project.', 'error')
    }
  }

  const canManage = (p) => isAdmin || p.created_by === user?.id

  return (
    <div>
      <div className="spread mb">
        <div>
          <h2 style={{ margin: 0 }}>Projects</h2>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            Track what the team is working on and who’s handling it.
          </div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New project</button>
      </div>

      {projects.length === 0 && (
        <div className="card">
          <div className="empty">No projects yet — create the first one.</div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {projects.map((p) => (
          <div key={p.id} className="card">
            <div className="spread">
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: 17 }}>{p.name}</h3>
                {p.description && (
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--muted)', fontSize: 14, marginTop: 6, lineHeight: 1.55 }}>
                    {p.description}
                  </div>
                )}
                <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
                  {p.created_by_name || 'Someone'} · created {timeAgo(p.created_at)}
                </div>
              </div>
              {canManage(p) && (
                <div className="flex">
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(p)}>Delete</button>
                </div>
              )}
            </div>

            {p.handlers && p.handlers.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <span className="muted" style={{ fontSize: 13 }}>Handled by</span>
                {p.handlers.map((h) => (
                  <span key={h.id} className="flex" style={{ background: 'var(--panel,#f5f6fb)', border: '1px solid var(--line)', borderRadius: 999, padding: '4px 12px 4px 5px', gap: 7 }}>
                    <Avatar name={h.name} size={22} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{h.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit project' : 'New project'} onClose={() => setModalOpen(false)}>
          <form onSubmit={save}>
            <div className="field">
              <label>Project name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Website redesign" autoFocus />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
            </div>
            <div className="field">
              <label>Handled by (whoever is handling it — choose one or more)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {people.length === 0 && <div className="muted" style={{ fontSize: 13 }}>No team members yet.</div>}
                {people.map((p) => {
                  const on = form.handler_ids.includes(p.id)
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => toggleHandler(p.id)}
                      className="flex"
                      style={{
                        border: on ? '1.5px solid var(--magenta)' : '1px solid var(--line)',
                        background: on ? 'rgba(214,58,255,.08)' : '#fff',
                        borderRadius: 999, padding: '4px 12px 4px 5px', gap: 7, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      }}
                    >
                      <Avatar name={p.name} size={22} />
                      {p.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="spread mt">
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !form.name.trim()}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
