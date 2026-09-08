// Admin: invite people (name + designation + role), manage existing accounts.
import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { Avatar, Modal, StatusBadge } from '../../../components/ui'
import { fmtDate } from '../../../lib/format'
import { useToast } from '../../../components/Toast'

export default function AdminPeople() {
  const toast = useToast()
  const [people, setPeople] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ name: '', designation: '', role: 'staff' })
  const [busy, setBusy] = useState(false)

  async function load() {
    setPeople((await api('/users')).users || [])
  }
  useEffect(() => { load() }, [])

  async function addPerson(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const d = await api('/users', { method: 'POST', body: form })
      toast(d.message, 'success')
      setShowAdd(false); setForm({ name: '', designation: '', role: 'staff' }); load()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }

  async function saveEdit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api(`/users/${edit.id}`, { method: 'PATCH', body: { name: edit.name, designation: edit.designation, role: edit.role, status: edit.status } })
      toast('Member updated.', 'success'); setEdit(null); load()
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }

  async function deletePerson(p) {
    if (!confirm(`Remove ${p.name}? This cannot be undone.`)) return
    try { await api(`/users/${p.id}`, { method: 'DELETE' }); toast('Member removed.', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  function remind(p) {
    toast(`${p.name} (${p.email}) can use “Forgot password” at login to get a fresh reset link.`, 'info')
  }

  return (
    <div>
      <div className="spread mb">
        <h2 style={{ margin: 0 }}>Team & People</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add person</button>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Member</th><th>Email</th><th>Designation</th><th>Role</th><th>Status</th><th>Joined</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id}>
                <td><div className="flex"><Avatar name={p.name} size={30} /><span style={{ fontWeight: 600 }}>{p.name}</span></div></td>
                <td className="muted">{p.email}</td>
                <td>{p.designation || '—'}</td>
                <td><StatusBadge status={p.role} /></td>
                <td><StatusBadge status={p.status} /></td>
                <td className="muted">{fmtDate(p.created_at)}</td>
                <td>
                  <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => setEdit({ ...p })}>Edit</button>
                    {p.status === 'invited' && <button className="btn btn-sm btn-outline" onClick={() => remind(p)}>Remind</button>}
                    {p.role !== 'owner' && <button className="btn btn-sm btn-danger" onClick={() => deletePerson(p)}>Remove</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add a person" onClose={() => setShowAdd(false)}>
          <form onSubmit={addPerson}>
            <div className="field"><label>Full name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" /></div>
            <div className="field"><label>Designation</label><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Senior Developer" /></div>
            <div className="field"><label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Staff</option><option value="admin">Admin (also a worker)</option>
              </select>
            </div>
            <div className="field"><label>Login email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@brightskyit.com" /></div>
            <div className="alert alert-info">They’ll receive an email with their login email and a one-time password to change on first sign-in.</div>
            <button className="btn btn-primary btn-block mt" disabled={busy}>{busy ? 'Adding…' : 'Add & send invitation'}</button>
          </form>
        </Modal>
      )}

      {edit && (
        <Modal title={`Edit ${edit.name}`} onClose={() => setEdit(null)}>
          <form onSubmit={saveEdit}>
            <div className="field"><label>Full name</label><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="field"><label>Designation</label><input value={edit.designation || ''} onChange={(e) => setEdit({ ...edit, designation: e.target.value })} /></div>
            <div className="field"><label>Role</label>
              <select value={edit.role} disabled={edit.role === 'owner'} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>
                <option value="staff">Staff</option><option value="admin">Admin (also a worker)</option>
                {edit.role === 'owner' && <option value="owner">Owner</option>}
              </select>
            </div>
            <div className="field"><label>Status</label>
              <select value={edit.status} disabled={edit.role === 'owner'} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                <option value="invited">Invited</option><option value="active">Active</option><option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="spread mt">
              <button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
