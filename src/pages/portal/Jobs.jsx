// Jobs — everyone can assign work to teammates and track their own.
// "Assigned to me" / "Assigned by me" tabs (admins see all jobs), the assignee
// moves the status along, and both parties post remarks on the job.
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Avatar, Modal, StatusBadge } from '../../components/ui'
import { fmtDate, timeAgo } from '../../lib/format'
import { useToast } from '../../components/Toast'

const EMPTY_FORM = { title: '', description: '', deadline: '', assigned_to: '' }

export default function Jobs() {
  const { user, isAdmin } = useAuth()
  const toast = useToast()
  const [jobs, setJobs] = useState([])
  const [people, setPeople] = useState([])
  const [tab, setTab] = useState(user?.role === 'owner' || user?.role === 'admin' ? 'all' : 'mine')
  const [showAssign, setShowAssign] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [openJob, setOpenJob] = useState(null) // job whose detail/remarks are shown
  const [remarks, setRemarks] = useState([])
  const [remark, setRemark] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    try { setJobs((await api('/jobs')).jobs || []) } catch (e) { toast(e.message || 'Could not load jobs.', 'error') }
  }
  useEffect(() => { load() }, [])
  useEffect(() => {
    api('/users').then((d) => setPeople(d.users || [])).catch(() => {})
  }, [])

  const mine = (j) => j.assigned_to === user.id
  const mineOrAdmin = isAdmin ? jobs : jobs.filter(mine)
  const byMe = jobs.filter((j) => j.assigned_by === user.id)
  const visible = tab === 'all' ? jobs : tab === 'mine' ? mineOrAdmin : byMe

  const canSetStatus = (j) => j.assigned_to === user.id || isAdmin
  const canRemark = (j) => isAdmin || j.assigned_to === user.id || j.assigned_by === user.id

  async function assign(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.assigned_to) return toast('Add a title and choose a person.', 'error')
    setSaving(true)
    try {
      const d = await api('/jobs', { method: 'POST', body: form })
      toast(d.message, 'success')
      setShowAssign(false); setForm(EMPTY_FORM); load()
    } catch (err) { toast(err.message, 'error') }
    setSaving(false)
  }

  async function setJobStatus(job, status) {
    try { await api(`/jobs/${job.id}`, { method: 'PATCH', body: { status } }); toast('Job updated.', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  async function openRemarks(job) {
    setOpenJob(job)
    setRemarks([])
    setRemark('')
    try { setRemarks((await api(`/jobs/${job.id}/remarks`)).remarks || []) } catch (e) { toast(e.message, 'error') }
  }

  async function addRemark(e) {
    e.preventDefault()
    if (!remark.trim()) return
    setSending(true)
    try {
      const d = await api(`/jobs/${openJob.id}/remarks`, { method: 'POST', body: { body: remark } })
      setRemarks((list) => [...list, d.remark])
      setRemark('')
      setJobs((list) => list.map((j) => (j.id === openJob.id ? { ...j, remark_count: (j.remark_count || 0) + 1 } : j)))
    } catch (err) { toast(err.message, 'error') }
    setSending(false)
  }

  const tabBtn = (key, label, count) => (
    <button
      onClick={() => setTab(key)}
      style={{
        padding: '8px 18px', borderRadius: '999px', border: tab === key ? '2px solid var(--magenta)' : '1px solid var(--line)',
        background: tab === key ? 'rgba(214,58,255,.08)' : '#fff', fontWeight: 600, cursor: 'pointer',
      }}
    >{label} <span className="muted">({count})</span></button>
  )

  const jobRows = (list, showAssignee) => (
    <table className="tbl">
      <thead><tr><th>Title</th>{showAssignee && <th>Assignee</th>}<th>Assigned by</th><th>Deadline</th><th>Remarks</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {list.map((j) => (
          <tr key={j.id}>
            <td>{j.title}</td>
            {showAssignee && <td>{j.assignee_name || '—'}</td>}
            <td>{j.assigner_name || '—'}</td>
            <td className="muted">{j.deadline ? fmtDate(j.deadline) : '—'}</td>
            <td><button className="btn btn-sm btn-outline" disabled={!canRemark(j)} onClick={() => openRemarks(j)}>
              💬 {j.remark_count || 0}
            </button></td>
            <td><StatusBadge status={j.status} /></td>
            <td><select
              className="btn btn-sm btn-outline" style={{ width: 'auto' }}
              value={j.status} disabled={!canSetStatus(j)}
              onChange={(e) => setJobStatus(j, e.target.value)}
            >
              <option value="open">Open</option><option value="in_progress">In progress</option><option value="done">Done</option>
            </select></td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div>
      <div className="spread mb">
        <div>
          <h2 style={{ margin: 0 }}>Jobs</h2>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            Assign work to teammates, track progress, and keep updates in the remarks.
          </div>
        </div>
        <button className="btn btn-magenta" onClick={() => setShowAssign(true)}>+ Assign job</button>
      </div>

      <div className="flex mb" style={{ flexWrap: 'wrap' }}>
        {isAdmin && tabBtn('all', 'All jobs', jobs.length)}
        {!isAdmin && tabBtn('mine', 'Assigned to me', mineOrAdmin.length)}
        {!isAdmin && tabBtn('by-me', 'Assigned by me', byMe.length)}
      </div>

      <div className="card">
        {visible.length === 0 ? (
          <div className="empty">{tab === 'by-me' ? 'You haven’t assigned any jobs yet.' : 'No jobs here yet.'}</div>
        ) : (
          jobRows(visible, tab !== 'mine')
        )}
      </div>

      {showAssign && (
        <Modal title="Assign a job" onClose={() => setShowAssign(false)}>
          <form onSubmit={assign}>
            <div className="field"><label>Job title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Build the client onboarding flow" /></div>
            <div className="field"><label>Description</label><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details of what needs to be done..." /></div>
            <div className="field"><label>Deadline</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <div className="field"><label>Assign to *</label>
              <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Select a member...</option>
                {people.filter((p) => p.status !== 'disabled').map((p) => <option key={p.id} value={p.id}>{p.name} · {p.designation || p.role}</option>)}
              </select>
            </div>
            {form.assigned_to && <div className="alert alert-info">They’ll get an email notification with this job.</div>}
            <button className="btn btn-primary btn-block mt" disabled={saving}>{saving ? 'Assigning...' : 'Assign & notify'}</button>
          </form>
        </Modal>
      )}

      {openJob && (
        <Modal title={openJob.title} onClose={() => setOpenJob(null)}>
          <div className="muted" style={{ fontSize: 13.5, marginBottom: 10 }}>
            {canRemark(openJob) ? 'Updates from you and your teammate on this job.' : 'Updates on this job.'}
          </div>
          {openJob.description && (
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 14.5, lineHeight: 1.6, marginBottom: 12 }}>{openJob.description}</div>
          )}
          <div className="flex mb" style={{ gap: 18, fontSize: 13 }}>
            <span>Assignee: <b>{openJob.assignee_name || '—'}</b></span>
            <span>Deadline: <b>{openJob.deadline ? fmtDate(openJob.deadline) : '—'}</b></span>
          </div>

          <div className="section-title" style={{ marginBottom: 10 }}><span className="accent" />Remarks</div>
          {remarks.length === 0 && <div className="muted" style={{ fontSize: 13.5, marginBottom: 12 }}>No remarks yet.</div>}
          {remarks.map((r) => (
            <div key={r.id} className="fcomment">
              <Avatar name={r.author_name || '?'} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fcom-head">
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.author_name || 'Someone'}</span>
                  <span className="muted" style={{ fontSize: 11.5 }}>{timeAgo(r.created_at)}</span>
                </div>
                <div className="fcom-body">{r.body}</div>
              </div>
            </div>
          ))}

          {canRemark(openJob) && (
            <form onSubmit={addRemark} className="flex mt">
              <input
                style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 13px' }}
                placeholder="Add a remark..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
              <button className="btn btn-primary" disabled={sending || !remark.trim()}>{sending ? '...' : 'Add'}</button>
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}
