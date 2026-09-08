// Admin dashboard: KPIs, assign a job (emails assignee), member activity.
import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { money } from '../../../lib/format'
import { Avatar, Modal, StatusBadge } from '../../../components/ui'
import { useToast } from '../../../components/Toast'

export default function AdminDashboard() {
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [people, setPeople] = useState([])
  const [jobs, setJobs] = useState([])
  const [showAssign, setShowAssign] = useState(false)
  const [jobForm, setJobForm] = useState({ title: '', description: '', assigned_to: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    try { setStats(await api('/stats')) } catch {}
    try { setJobs((await api('/jobs')).jobs || []) } catch {}
    try { setPeople((await api('/users')).users || []) } catch {}
  }
  useEffect(() => { load() }, [])

  async function assign(e) {
    e.preventDefault()
    if (!jobForm.title.trim() || !jobForm.assigned_to) return toast('Add a title and choose a person.', 'error')
    setSaving(true)
    try {
      const d = await api('/jobs', { method: 'POST', body: jobForm })
      toast(d.message, 'success')
      setShowAssign(false); setJobForm({ title: '', description: '', assigned_to: '' }); load()
    } catch (err) { toast(err.message, 'error') }
    setSaving(false)
  }

  async function setJobStatus(job, status) {
    try { await api(`/jobs/${job.id}`, { method: 'PATCH', body: { status } }); toast('Job updated.', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  const kpi = stats || { people: [], jobs: [], quotes: [], invoices: [], byMember: [] }
  const staff = people.filter((p) => p.status !== 'disabled').length
  const activeJobs = jobs.filter((j) => j.status !== 'done').length
  const totalQuotes = kpi.quotes.reduce((s, r) => s + Number(r.n), 0)
  const paidInvoices = kpi.invoices.find((r) => r.status === 'paid')
  const totalInvoiceValue = kpi.invoices.reduce((s, r) => s + (r.status !== 'cancelled' ? Number(r.value) : 0), 0)

  return (
    <div>
      <div className="grid grid-3 mb">
        <div className="stat"><span className="k">Active members</span><span className="v">{staff}</span><span className="a">{kpi.people.length} total accounts</span></div>
        <div className="stat"><span className="k">Active jobs</span><span className="v">{activeJobs}</span><span className="a">{jobs.length} total</span></div>
        <div className="stat"><span className="k">Quotations</span><span className="v">{totalQuotes}</span><span className="a">{paidInvoices ? paidInvoices.n + ' paid invoice(s)' : '0 paid'}</span></div>
      </div>
      <div className="grid grid-3 mb">
        <div className="stat"><span className="k">Invoice value (not cancelled)</span><span className="v" style={{ fontSize: 22 }}>{money(totalInvoiceValue)}</span><span className="a">across all members</span></div>
        <div className="stat" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><span className="k">Assign new job</span><div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>Delegate work & notify via email</div></div>
          <button className="btn btn-magenta" onClick={() => setShowAssign(true)}>+ Assign</button>
        </div>
        <div className="stat"><span className="k">Owners / Admins</span><span className="v">{kpi.people.filter((r) => r.role === 'owner' || r.role === 'admin').reduce((s, r) => s + Number(r.n), 0)}</span><span className="a">manage the portal</span></div>
      </div>

      <div className="card mb">
        <h3 className="section-title"><span className="accent" />Member activity</h3>
        <table className="tbl">
          <thead><tr><th>Member</th><th>Role</th><th>Quotes</th><th>Invoices</th></tr></thead>
          <tbody>
            {kpi.byMember.map((m) => (
              <tr key={m.id}><td><div className="flex"><Avatar name={m.name} size={28} /><span>{m.name}</span></div></td>
                <td><StatusBadge status={m.role} /></td><td>{m.quotes}</td><td>{m.invoices}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="section-title"><span className="accent" />All jobs</h3>
        {jobs.length === 0 ? <div className="empty">No jobs yet.</div> : (
          <table className="tbl">
            <thead><tr><th>Title</th><th>Assignee</th><th>Assigned by</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>{j.title}</td><td>{j.assignee_name || '—'}</td><td>{j.assigner_name || '—'}</td>
                  <td><StatusBadge status={j.status} /></td>
                  <td><select className="btn btn-sm btn-outline" style={{ width: 'auto' }} value={j.status} onChange={(e) => setJobStatus(j, e.target.value)}>
                    <option value="open">Open</option><option value="in_progress">In progress</option><option value="done">Done</option>
                  </select></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAssign && (
        <Modal title="Assign a job" onClose={() => setShowAssign(false)}>
          <form onSubmit={assign}>
            <div className="field"><label>Job title *</label><input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="Build the client onboarding flow" /></div>
            <div className="field"><label>Description</label><textarea rows="3" value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Details of what needs to be done…" /></div>
            <div className="field"><label>Assign to *</label>
              <select value={jobForm.assigned_to} onChange={(e) => setJobForm({ ...jobForm, assigned_to: e.target.value })}>
                <option value="">Select a member…</option>
                {people.filter((p) => p.status !== 'disabled').map((p) => <option key={p.id} value={p.id}>{p.name} · {p.designation || p.role}</option>)}
              </select>
            </div>
            {jobForm.assigned_to && <div className="alert alert-info">They’ll get an email notification with this job.</div>}
            <button className="btn btn-primary btn-block mt" disabled={saving}>{saving ? 'Assigning…' : 'Assign & notify'}</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
