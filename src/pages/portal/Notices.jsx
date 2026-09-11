// Notices — a simple announcement board for the team.
// Any member can post; only the author (or an admin) can edit or delete.
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Avatar, Modal } from '../../components/ui'
import { timeAgo } from '../../lib/format'
import { useToast } from '../../components/Toast'

const DEFAULT_FORM = { title: '', body: '' }

export default function Notices() {
  const { user } = useAuth()
  const toast = useToast()
  const [notices, setNotices] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  const isAdmin = user?.role === 'owner' || user?.role === 'admin'

  async function load() {
    try {
      const d = await api('/notices')
      setNotices(d.notices || [])
    } catch (e) {
      toast(e.message || 'Could not load notices.', 'error')
    }
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(DEFAULT_FORM)
    setModalOpen(true)
  }

  function openEdit(n) {
    setEditing(n)
    setForm({ title: n.title, body: n.body })
    setModalOpen(true)
  }

  async function save(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await api(`/notices/${editing.id}`, { method: 'POST', body: form })
        toast('Notice updated.', 'success')
      } else {
        await api('/notices', { method: 'POST', body: form })
        toast('Notice posted.', 'success')
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      toast(err.message || 'Could not save notice.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove(n) {
    if (!confirm('Delete this notice? This can’t be undone.')) return
    try {
      await api(`/notices/${n.id}`, { method: 'DELETE' })
      toast('Notice deleted.', 'success')
      await load()
    } catch (err) {
      toast(err.message || 'Could not delete notice.', 'error')
    }
  }

  const canManage = (n) => isAdmin || n.author_id === user?.id

  return (
    <div>
      <div className="spread mb">
        <div>
          <h2 style={{ margin: 0 }}>Notices</h2>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            Announcements and updates for the whole team.
          </div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New notice</button>
      </div>

      {notices.length === 0 && (
        <div className="card">
          <div className="empty">No notices yet — share the first announcement.</div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {notices.map((n) => (
          <div key={n.id} className="card">
            <div className="spread">
              <div className="flex" style={{ minWidth: 0 }}>
                <Avatar name={n.author_name} size={34} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{n.title}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>
                    {n.author_name || 'Someone'}{n.author_designation ? ` · ${n.author_designation}` : ''} · {timeAgo(n.created_at)}
                  </div>
                </div>
              </div>
              {canManage(n) && (
                <div className="flex">
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(n)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(n)}>Delete</button>
                </div>
              )}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 12, fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink)' }}>
              {n.body}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Edit notice' : 'New notice'} onClose={() => setModalOpen(false)}>
          <form onSubmit={save}>
            <div className="field">
              <label>Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What’s the announcement about?" autoFocus />
            </div>
            <div className="field">
              <label>Message *</label>
              <textarea rows="5" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Share the details with the team…" />
            </div>
            <div className="spread mt">
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !form.title.trim() || !form.body.trim()}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Post notice'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
