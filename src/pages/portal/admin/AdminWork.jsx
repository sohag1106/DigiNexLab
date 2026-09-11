// Admin: see everything every member created — all quotes + invoices + jobs.
import { useEffect, useState } from 'react'
import { api, downloadPdf } from '../../../lib/api'
import { money, fmtDate } from '../../../lib/format'
import { StatusBadge } from '../../../components/ui'
import { useToast } from '../../../components/Toast'

export default function AdminWork() {
  const toast = useToast()
  const [tab, setTab] = useState('quotes')
  const [quotes, setQuotes] = useState([])
  const [invoices, setInvoices] = useState([])
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    api('/quotes').then((d) => setQuotes(d.quotes || [])).catch(() => {})
    api('/invoices').then((d) => setInvoices(d.invoices || [])).catch(() => {})
    api('/jobs').then((d) => setJobs(d.jobs || [])).catch(() => {})
  }, [])

  async function pdf(q, kind) {
    try { await downloadPdf(`/${kind}/${q.id}/pdf`) } catch (e) { toast(e.message, 'error') }
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

  return (
    <div>
      <div className="spread mb">
        <h2 style={{ margin: 0 }}>All work</h2>
        <div className="flex" style={{ flexWrap: 'wrap' }}>
          {tabBtn('quotes', 'Quotations', quotes.length)}
          {tabBtn('invoices', 'Invoices', invoices.length)}
          {tabBtn('jobs', 'Jobs', jobs.length)}
        </div>
      </div>

      {tab === 'quotes' && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th>#</th><th>Client</th><th>Amount</th><th>Status</th><th>Created by</th><th>Updated</th><th>PDF</th></tr></thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id}>
                  <td className="mono">{q.number}</td><td>{q.client_name}</td>
                  <td>{money(q.total, q.currency)}</td><td><StatusBadge status={q.status} /></td>
                  <td>{q.created_by_name || '—'}</td><td className="muted">{fmtDate(q.updated_at)}</td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => pdf(q, 'quotes')}>PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotes.length === 0 && <div className="empty">No quotations yet.</div>}
        </div>
      )}

      {tab === 'invoices' && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th>#</th><th>Client</th><th>Amount</th><th>Status</th><th>Due</th><th>Created by</th><th>PDF</th></tr></thead>
            <tbody>
              {invoices.map((v) => (
                <tr key={v.id}>
                  <td className="mono">{v.number}</td><td>{v.client_name}</td>
                  <td>{money(v.total, v.currency)}</td><td><StatusBadge status={v.status} /></td>
                  <td className="muted">{v.due_date ? fmtDate(v.due_date) : '—'}</td>
                  <td>{v.created_by_name || '—'}</td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => pdf(v, 'invoices')}>PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && <div className="empty">No invoices yet.</div>}
        </div>
      )}

      {tab === 'jobs' && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Title</th><th>Assignee</th><th>Assigned by</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>{j.title}</td><td>{j.assignee_name || '—'}</td><td>{j.assigner_name || '—'}</td>
                  <td><StatusBadge status={j.status} /></td><td className="muted">{fmtDate(j.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobs.length === 0 && <div className="empty">No jobs yet.</div>}
        </div>
      )}
    </div>
  )
}
