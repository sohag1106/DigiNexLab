// Mail module UI — Zoho IMAP inbox + compose/send with quote/invoice PDF attach.
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Avatar, Modal } from '../../components/ui'
import { timeAgo } from '../../lib/format'
import { useToast } from '../../components/Toast'

export default function Mail() {
  const { user } = useAuth()
  const toast = useToast()
  const [inbox, setInbox] = useState({ messages: [], total: 0, unseen: 0 })
  const [current, setCurrent] = useState(null)
  const [compose, setCompose] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notConfigured, setNotConfigured] = useState(false)

  // compose state
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachQuote, setAttachQuote] = useState('')
  const [attachInvoice, setAttachInvoice] = useState('')
  const [quotes, setQuotes] = useState([])
  const [invoices, setInvoices] = useState([])

  async function loadInbox() {
    try {
      const d = await api('/mail/list?limit=40')
      setInbox(d)
      setNotConfigured(false)
    } catch (e) {
      setNotConfigured(true)
      if (!/not configured/i.test(e.message)) toast(e.message, 'error')
    }
  }
  useEffect(() => { loadInbox() }, [])

  async function openMsg(m) {
    try {
      const d = await api(`/mail/read?uid=${m.uid}&seen=1`)
      setCurrent(d.message)
      loadInbox()
    } catch (e) { toast(e.message, 'error') }
  }

  async function send(e) {
    e.preventDefault()
    if (!to.trim()) return toast('Recipient email is required.', 'error')
    if (!subject.trim() && !body.trim()) return toast('Add a subject or message.', 'error')
    setBusy(true)
    try {
      const d = await api('/mail/send', {
        method: 'POST',
        body: { to, subject, html: `<p>${body.replace(/\n/g, '<br>')}</p>`, attachQuoteId: attachQuote || undefined, attachInvoiceId: attachInvoice || undefined },
      })
      toast(d.message, 'success')
      setCompose(false); setTo(''); setSubject(''); setBody(''); setAttachQuote(''); setAttachInvoice('')
    } catch (err) { toast(err.message, 'error') }
    setBusy(false)
  }

  async function openComposeWith(prefix) {
    if (!quotes.length) api('/quotes').then((d) => setQuotes(d.quotes || [])).catch(() => {})
    if (!invoices.length) api('/invoices').then((d) => setInvoices(d.invoices || [])).catch(() => {})
    if (prefix) setSubject(prefix)
    setCompose(true)
  }

  return (
    <div>
      <div className="spread mb">
        <h2 style={{ margin: 0 }}>Email <span className="muted" style={{ fontSize: 14 }}>(@ brightskyit.com)</span></h2>
        <button className="btn btn-primary" onClick={() => openComposeWith('')}>+ Compose</button>
      </div>

      {notConfigured && (
        <div className="alert alert-info mb">
          The mailbox isn’t configured yet. Your Owner needs to set <code>MAIL_USER</code> / <code>MAIL_PASS</code> in Netlify env vars
          (a free <strong>Zoho Mail</strong> mailbox for your domain, using an app password). Sending will use Resend until then.
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        {/* inbox list */}
        <div className="card" style={{ padding: 8 }}>
          <div className="section-title" style={{ padding: '8px 8px 4px' }}>
            <span className="accent" />Inbox
            <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>{inbox.messages.length} shown · {inbox.unseen} unread</span>
          </div>
          {inbox.messages.length === 0 && !notConfigured && <div className="empty">No mail yet.</div>}
          {inbox.messages.map((m) => (
            <button
              key={m.uid}
              onClick={() => openMsg(m)}
              className="row"
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--line)', borderRadius: 0 }}
            >
              <span className={`grow ${m.seen ? '' : ''}`} style={m.seen ? { opacity: .7 } : undefined}>
                {!m.seen && <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--blue)', borderRadius: '50%', marginRight: 6 }} />}
                <span style={{ fontWeight: m.seen ? 500 : 700, display: 'block', fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.subject}</span>
                <span className="muted" style={{ fontSize: 12, display: 'block' }}>{fromName(m.from)} · {timeAgo(m.date)}</span>
              </span>
            </button>
          ))}
        </div>

        {/* read / compose area */}
        <div className="card">
          {!current ? <div className="empty">Select a message to read it, or compose a new one.</div> : (
            <>
              <div className="spread" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{current.subject}</h3>
                  <div className="muted" style={{ fontSize: 13 }}>From: {current.from?.address || '—'} · {current.from?.name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>To: {current.to}</div>
                </div>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 14, fontSize: 14.5, lineHeight: 1.6, minHeight: 180 }}>{current.text}</div>
              <div className="flex mt">
                <button className="btn btn-outline btn-sm" onClick={() => openComposeWith(`Re: ${current.subject}`)}>Reply</button>
              </div>
            </>
          )}
        </div>
      </div>

      {compose && (
        <Modal title="New email" onClose={() => setCompose(false)} width="640px">
          <form onSubmit={send}>
            <div className="field"><label>From</label><input value={`${user.name} · BrightSkyIT mailbox (@brightskyit.com)`} disabled /></div>
            <div className="field"><label>To *</label><input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="client@company.com" /></div>
            <div className="field"><label>Subject</label><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" /></div>
            <div className="field"><label>Message</label><textarea rows="7" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your email…" /></div>

            <div className="grid grid-2">
              <div className="field"><label>Attach quotation (PDF)</label>
                <select value={attachQuote} onChange={(e) => setAttachQuote(e.target.value)}>
                  <option value="">— none —</option>
                  {quotes.map((q) => <option key={q.id} value={q.id}>{q.number} · {q.client_name}</option>)}
                </select>
              </div>
              <div className="field"><label>Attach invoice (PDF)</label>
                <select value={attachInvoice} onChange={(e) => setAttachInvoice(e.target.value)}>
                  <option value="">— none —</option>
                  {invoices.map((v) => <option key={v.id} value={v.id}>{v.number} · {v.client_name}</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-primary btn-block mt" disabled={busy}>{busy ? 'Sending…' : 'Send email'}</button>
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Sends from the BrightSkyIT mailbox (Zoho SMTP, Resend fallback).</p>
          </form>
        </Modal>
      )}
    </div>
  )
}

function fromName(f) {
  if (!f) return ''
  const m = f.match(/^(.*?)\s*<(.*)>$/)
  return m ? (m[1] || m[2]) : f
}
