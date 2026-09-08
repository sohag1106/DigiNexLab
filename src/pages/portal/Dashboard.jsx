// Staff/worker dashboard: profile summary + my jobs, my quotes, my invoices.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import { money, fmtDate } from '../../lib/format'
import { StatusBadge } from '../../components/ui'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [jobs, setJobs] = useState([])
  const [quotes, setQuotes] = useState([])
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    api('/jobs').then((d) => setJobs(d.jobs || [])).catch(() => {})
    api('/quotes').then((d) => setQuotes(d.quotes || [])).catch(() => {})
    api('/invoices').then((d) => setInvoices(d.invoices || [])).catch(() => {})
  }, [])

  return (
    <div>
      <div className="grid grid-3 mb">
        <div className="stat">
          <span className="k">Role</span>
          <span className="v" style={{ textTransform: 'capitalize' }}>{user.role}</span>
          <span className="a">{user.designation || '—'}</span>
        </div>
        <div className="stat">
          <span className="k">My jobs</span>
          <span className="v">{jobs.length}</span>
          <span className="a">{jobs.filter((j) => j.status === 'done').length} done</span>
        </div>
        <div className="stat">
          <span className="k">Quotations</span>
          <span className="v">{quotes.length}</span>
          <span className="a">value {money(quotes.reduce((s, q) => s + Number(q.total || 0), 0))}</span>
        </div>
      </div>

      <div className="card mb">
        <h3 className="section-title"><span className="accent" />My assigned jobs</h3>
        {jobs.length === 0 ? (
          <div className="empty">No jobs assigned yet.</div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Title</th><th>Status</th><th>Assigned by</th><th>Created</th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>{j.title}</td>
                  <td><StatusBadge status={j.status} /></td>
                  <td>{j.assigner_name || '—'}</td>
                  <td className="muted">{fmtDate(j.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="section-title"><span className="accent" />My quotations
            <span style={{ marginLeft: 'auto' }}><Link to="/portal/quotes/new" className="btn btn-sm btn-outline">+ New</Link></span>
          </h3>
          {quotes.length === 0 ? (
            <div className="empty">No quotations yet.</div>
          ) : (
            <table className="tbl">
              <thead><tr><th>#</th><th>Client</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {quotes.slice(0, 6).map((q) => (
                  <tr key={q.id}>
                    <td className="mono">{q.number}</td>
                    <td>{q.client_name}</td>
                    <td>{money(q.total, q.currency)}</td>
                    <td><StatusBadge status={q.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h3 className="section-title"><span className="accent" />My invoices
            <span style={{ marginLeft: 'auto' }}><Link to="/portal/invoices/new" className="btn btn-sm btn-outline">+ New</Link></span>
          </h3>
          {invoices.length === 0 ? (
            <div className="empty">No invoices yet.</div>
          ) : (
            <table className="tbl">
              <thead><tr><th>#</th><th>Client</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {invoices.slice(0, 6).map((v) => (
                  <tr key={v.id}>
                    <td className="mono">{v.number}</td>
                    <td>{v.client_name}</td>
                    <td>{money(v.total, v.currency)}</td>
                    <td><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
