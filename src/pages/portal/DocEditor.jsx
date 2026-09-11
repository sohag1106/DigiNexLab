// Shared quotation/invoice editor: client info + line items + discount/tax,
// live totals, save, download PDF, send email.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, downloadPdf } from '../../lib/api'
import { money } from '../../lib/format'
import { useToast } from '../../components/Toast'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AED', 'AUD']

export default function DocEditor({ kind, basePath, id, listPath }) {
  const docName = kind === 'invoice' ? 'Invoice' : 'Quotation'
  // The API wraps the record as { quote } / { invoice } — note it's `quote`, not
  // `quotation`, so it can't be derived from `kind` directly.
  const docKey = kind === 'invoice' ? 'invoice' : 'quote'
  const nav = useNavigate()
  const toast = useToast()

  const [client_name, setClientName] = useState('')
  const [client_email, setClientEmail] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [discount, setDiscount] = useState('0')
  const [tax, setTax] = useState('0')
  const [due_date, setDueDate] = useState('')
  const [items, setItems] = useState([{ description: '', qty: 1, rate: 0 }])
  const [number, setNumber] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState('')

  const isEdit = !!id

  useEffect(() => {
    if (id) load()
    // eslint-disable-next-line
  }, [id])

  async function load() {
    try {
      const d = await api(`/${basePath}/${id}`)
      const doc = d[docKey] || d
      setClientName(doc.client_name || '')
      setClientEmail(doc.client_email || '')
      setCurrency(doc.currency || 'USD')
      setDiscount(String(doc.discount ?? 0))
      setTax(String(doc.tax ?? 0))
      setDueDate(doc.due_date ? String(doc.due_date).slice(0, 10) : '')
      setItems((doc.items && doc.items.length ? doc.items : [{ description: '', qty: 1, rate: 0 }]).map((i) => ({
        description: i.description || '', qty: i.qty, rate: i.rate,
      })))
      setNumber(doc.number || '')
      setStatus(doc.status || '')
    } catch (e) {
      toast(e.message, 'error'); nav(listPath)
    }
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0)
    const disc = Number(discount) || 0
    const afterDisc = subtotal - disc
    const taxAmt = (afterDisc * (Number(tax) || 0)) / 100
    return { subtotal, disc, taxAmt, total: afterDisc + taxAmt }
  }, [items, discount, tax])

  function setItem(i, patch) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }
  function addItem() { setItems((arr) => [...arr, { description: '', qty: 1, rate: 0 }]) }
  function removeItem(i) { setItems((arr) => (arr.length === 1 ? arr : arr.filter((_, idx) => idx !== i))) }

  const payload = () => ({
    client_name,
    client_email,
    currency,
    discount: Number(discount) || 0,
    tax: Number(tax) || 0,
    due_date: kind === 'invoice' ? due_date || null : undefined,
    items,
  })

  async function save() {
    if (!client_name.trim()) return toast('Client name is required.', 'error')
    const clean = items.filter((i) => (i.description || '').trim())
    if (!clean.length) return toast('Add at least one line item.', 'error')
    setBusy('save')
    try {
      const method = isEdit ? 'PATCH' : 'POST'
      const path = isEdit ? `/${basePath}/${id}` : `/${basePath}`
      const d = await api(path, { method, body: { ...payload(), items: clean } })
      const saved = d[docKey] || d
      toast(isEdit ? `${docName} saved.` : `${docName} created.`, 'success')
      if (isEdit) load()
      else if (saved?.id) nav(`${listPath}/${saved.id}`)
      else nav(listPath)
    } catch (e) {
      toast(e.message, 'error')
    } finally { setBusy('') }
  }

  async function doPdf() {
    if (!isEdit) { await save(); return }
    setBusy('pdf')
    try { await downloadPdf(`/${basePath}/${id}/pdf`) } catch (e) { toast(e.message, 'error') }
    setBusy('')
  }
  async function doSend() {
    if (!isEdit) { await save(); return }
    if (!client_email) return toast('Add a client email first.', 'error')
    setBusy('send')
    try {
      const d = await api(`/${basePath}/${id}/send`, { method: 'POST', body: {} })
      toast(d.message, 'success'); setStatus('sent')
    } catch (e) { toast(e.message, 'error') }
    setBusy('')
  }

  const labels = kind === 'invoice'
    ? { rate: 'Rate', qty: 'Qty', statuses: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] }
    : { rate: 'Rate', qty: 'Qty', statuses: ['draft', 'sent', 'accepted', 'rejected'] }

  return (
    <div>
      <div className="spread mb">
        <h2 style={{ margin: 0 }}>
          {isEdit ? `Edit ${docName} ${number || ''}` : `New ${docName}`}
        </h2>
        <div className="flex" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {isEdit && (
            <select className="btn btn-sm btn-outline" style={{ width: 'auto' }} value={status} onChange={async (e) => {
              try { await api(`/${basePath}/${id}`, { method: 'PATCH', body: { status: e.target.value } }); setStatus(e.target.value); toast('Status updated.', 'success') }
              catch (err) { toast(err.message, 'error') }
            }}>
              {labels.statuses.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          )}
          <button className="btn btn-outline" onClick={doPdf} disabled={!!busy}>{busy === 'pdf' ? '…' : 'Download PDF'}</button>
          {kind === 'invoice'
            ? <button className="btn btn-magenta" onClick={doSend} disabled={!!busy}>{busy === 'send' ? '…' : 'Email invoice'}</button>
            : <button className="btn btn-magenta" onClick={doSend} disabled={!!busy}>{busy === 'send' ? '…' : 'Email quotation'}</button>}
          <button className="btn btn-primary" onClick={save} disabled={!!busy}>{busy === 'save' ? 'Saving…' : 'Save'}</button>
        </div>
      </div>

      <div className="card mb">
        <div className="grid grid-3">
          <div className="field"><label>Client name *</label><input value={client_name} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Corp" /></div>
          <div className="field"><label>Client email</label><input type="email" value={client_email} onChange={(e) => setClientEmail(e.target.value)} placeholder="billing@acme.com" /></div>
          <div className="field"><label>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {kind === 'invoice' && (
            <div className="field"><label>Due date</label><input type="date" value={due_date} onChange={(e) => setDueDate(e.target.value)} /></div>
          )}
        </div>
      </div>

      <div className="card mb">
        <h3 className="section-title"><span className="accent" />Line items</h3>
        <table className="tbl">
          <thead><tr><th style={{ width: '48%' }}>Description</th><th style={{ width: '10%' }}>Qty</th><th style={{ width: '16%' }}>Rate</th><th style={{ width: '18%' }}>Amount</th><th style={{ width: '40px' }}></th></tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td><input value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="Service / deliverable" /></td>
                <td><input type="number" min="0" value={it.qty} onChange={(e) => setItem(i, { qty: e.target.value })} /></td>
                <td><input type="number" min="0" step="0.01" value={it.rate} onChange={(e) => setItem(i, { rate: e.target.value })} /></td>
                <td>{money((Number(it.qty) || 0) * (Number(it.rate) || 0), currency)}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => removeItem(i)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-sm btn-outline mt" onClick={addItem}>+ Add item</button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <table>
            <tbody>
              <tr><td className="muted" style={{ paddingRight: 20 }}>Subtotal</td><td style={{ textAlign: 'right' }}>{money(totals.subtotal, currency)}</td></tr>
              <tr>
                <td className="muted" style={{ paddingRight: 20 }}>Discount (amount)</td>
                <td><input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ width: 110, textAlign: 'right' }} /></td>
              </tr>
              <tr>
                <td className="muted" style={{ paddingRight: 20 }}>Tax (%)</td>
                <td><input type="number" min="0" value={tax} onChange={(e) => setTax(e.target.value)} style={{ width: 110, textAlign: 'right' }} /></td>
              </tr>
              <tr><td style={{ paddingRight: 20, fontWeight: 700 }}>Total</td><td style={{ textAlign: 'right', fontWeight: 800, fontSize: 18 }}>{money(totals.total, currency)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <button className="btn btn-ghost" style={{ color: 'var(--muted)', borderColor: 'var(--line)', background: '#fff' }} onClick={() => nav(listPath)}>← Back to {kind}s</button>
    </div>
  )
}
