// Quotations list — create, download PDF, edit, delete, change status.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, downloadPdf } from '../../lib/api'
import { money, fmtDate } from '../../lib/format'
import { StatusBadge } from '../../components/ui'
import { useToast } from '../../components/Toast'

export default function Quotes() {
  const toast = useToast()
  const [quotes, setQuotes] = useState([])
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setQuotes((await api('/quotes')).quotes || [])
  }
  useEffect(() => { load() }, [])

  async function doPdf(q) {
    setBusyId('pdf-' + q.id)
    try { await downloadPdf(`/quotes/${q.id}/pdf`) } catch (e) { toast(e.message, 'error') }
    setBusyId(null)
  }
  async function doSend(q) {
    setBusyId('send-' + q.id)
    try {
      const d = await api(`/quotes/${q.id}/send`, { method: 'POST', body: {} })
      toast(d.message, 'success'); load()
    } catch (e) { toast(e.message, 'error') }
    setBusyId(null)
  }
  async function setStatus(q, status) {
    setBusyId('st-' + q.id)
    try { await api(`/quotes/${q.id}`, { method: 'PATCH', body: { status } }); toast('Status updated.', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
    setBusyId(null)
  }
  async function doDelete(q) {
    if (!confirm(`Delete quotation ${q.number}?`)) return
    try { await api(`/quotes/${q.id}`, { method: 'DELETE' }); toast('Deleted.', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div className="spread mb">
        <h2 style={{ margin: 0 }}>Quotations</h2>
        <Link to="/portal/quotes/new" className="btn btn-primary">+ New quotation</Link>
      </div>
      <div className="card">
        {quotes.length === 0 ? (
          <div className="empty">No quotations yet. Click “New quotation” to create one.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Number</th><th>Client</th><th>Total</th><th>Status</th><th>Updated</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id}>
                  <td className="mono">{q.number}</td>
                  <td>{q.client_name}</td>
                  <td>{money(q.total, q.currency)}</td>
                  <td><StatusBadge status={q.status} /></td>
                  <td className="muted">{fmtDate(q.updated_at || q.created_at)}</td>
                  <td>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/portal/quotes/${q.id}`} className="btn btn-sm btn-outline">Edit</Link>
                      <button className="btn btn-sm btn-outline" onClick={() => doPdf(q)} disabled={busyId === 'pdf-' + q.id}>PDF</button>
                      {q.client_email && <button className="btn btn-sm btn-outline" onClick={() => doSend(q)} disabled={busyId === 'send-' + q.id}>Email</button>}
                      <select value={q.status} className="btn btn-sm btn-outline" style={{ width: 'auto' }} onChange={(e) => setStatus(q, e.target.value)}>
                        <option value="draft">Draft</option><option value="sent">Sent</option>
                        <option value="accepted">Accepted</option><option value="rejected">Rejected</option>
                      </select>
                      <button className="btn btn-sm btn-danger" onClick={() => doDelete(q)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
