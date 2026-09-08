// Invoices list — create, download PDF, edit, delete, change status.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, downloadPdf } from '../../lib/api'
import { money, fmtDate } from '../../lib/format'
import { StatusBadge } from '../../components/ui'
import { useToast } from '../../components/Toast'

export default function Invoices() {
  const toast = useToast()
  const [invoices, setInvoices] = useState([])
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setInvoices((await api('/invoices')).invoices || [])
  }
  useEffect(() => { load() }, [])

  async function doPdf(v) {
    setBusyId('pdf-' + v.id)
    try { await downloadPdf(`/invoices/${v.id}/pdf`) } catch (e) { toast(e.message, 'error') }
    setBusyId(null)
  }
  async function doSend(v) {
    setBusyId('send-' + v.id)
    try { const d = await api(`/invoices/${v.id}/send`, { method: 'POST', body: {} }); toast(d.message, 'success'); load() }
    catch (e) { toast(e.message, 'error') }
    setBusyId(null)
  }
  async function setStatus(v, status) {
    setBusyId('st-' + v.id)
    try { await api(`/invoices/${v.id}`, { method: 'PATCH', body: { status } }); toast('Status updated.', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
    setBusyId(null)
  }
  async function doDelete(v) {
    if (!confirm(`Delete invoice ${v.number}?`)) return
    try { await api(`/invoices/${v.id}`, { method: 'DELETE' }); toast('Deleted.', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <div className="spread mb">
        <h2 style={{ margin: 0 }}>Invoices</h2>
        <Link to="/portal/invoices/new" className="btn btn-primary">+ New invoice</Link>
      </div>
      <div className="card">
        {invoices.length === 0 ? (
          <div className="empty">No invoices yet. Click “New invoice” to create one.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Number</th><th>Client</th><th>Total</th><th>Status</th><th>Due</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {invoices.map((v) => (
                <tr key={v.id}>
                  <td className="mono">{v.number}</td>
                  <td>{v.client_name}</td>
                  <td>{money(v.total, v.currency)}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td className="muted">{v.due_date ? fmtDate(v.due_date) : '—'}</td>
                  <td>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/portal/invoices/${v.id}`} className="btn btn-sm btn-outline">Edit</Link>
                      <button className="btn btn-sm btn-outline" onClick={() => doPdf(v)} disabled={busyId === 'pdf-' + v.id}>PDF</button>
                      {v.client_email && <button className="btn btn-sm btn-outline" onClick={() => doSend(v)} disabled={busyId === 'send-' + v.id}>Email</button>}
                      <select value={v.status} className="btn btn-sm btn-outline" style={{ width: 'auto' }} onChange={(e) => setStatus(v, e.target.value)}>
                        <option value="draft">Draft</option><option value="sent">Sent</option>
                        <option value="paid">Paid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option>
                      </select>
                      <button className="btn btn-sm btn-danger" onClick={() => doDelete(v)}>✕</button>
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
