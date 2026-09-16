// Admin "Website Inbox" — every contact-form submission from the public site.
// Read / archive / delete submissions; mailto reply opens the visitor's email.
import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { timeAgo } from '../../../lib/format'
import { Modal, StatusBadge } from '../../../components/ui'
import { useToast } from '../../../components/Toast'

export default function AdminInbox() {
  const toast = useToast()
  const [submissions, setSubmissions] = useState([])
  const [open, setOpen] = useState(null)      // submission being read
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const d = await api('/contact')
      setSubmissions(d.submissions || [])
    } catch (e) {
      toast(e.message || 'Could not load submissions.', 'error')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function setStatus(s, status) {
    try {
      await api(`/contact/${s.id}`, { method: 'PATCH', body: { status } })
      setSubmissions((list) => list.map((x) => (x.id === s.id ? { ...x, status } : x)))
      if (open?.id === s.id) setOpen({ ...s, status })
    } catch (e) {
      toast(e.message || 'Could not update.', 'error')
    }
  }

  async function remove(s) {
    if (!confirm('Delete this submission? This can’t be undone.')) return
    try {
      await api(`/contact/${s.id}`, { method: 'DELETE' })
      toast('Submission deleted.', 'success')
      setOpen(null)
      await load()
    } catch (e) {
      toast(e.message || 'Could not delete.', 'error')
    }
  }

  function openSubmission(s) {
    setOpen(s)
    if (s.status === 'new') setStatus(s, 'read')
  }

  const unread = submissions.filter((s) => s.status === 'new').length
  const shown = submissions.filter((s) => s.status !== 'archived')

  return (
    <div>
      <div className="spread mb">
        <div>
          <h2 style={{ margin: 0 }}>Website Inbox</h2>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            {unread > 0 ? `${unread} new submission${unread === 1 ? '' : 's'}` : 'No new submissions'} · from the public contact form
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 8 }}>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : shown.length === 0 ? (
          <div className="empty" style={{ fontSize: 12.5 }}>No submissions yet. Messages sent from the website contact form will appear here.</div>
        ) : (
          shown.map((s) => {
            const isNew = s.status === 'new'
            return (
              <div
                key={s.id}
                className={`conv-row ${isNew ? 'unread' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => openSubmission(s)}
              >
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="conv-top">
                    <span className="conv-name">{s.name}</span>
                    <span className="muted" style={{ fontSize: 11.5 }}>{timeAgo(s.created_at)}</span>
                  </div>
                  <div className="conv-prev muted">
                    {s.subject || s.message.slice(0, 80)}
                  </div>
                </div>
                {isNew ? <span className="unread-badge">New</span> : <StatusBadge status={s.status} />}
              </div>
            )
          })
        )}
      </div>

      {open && (
        <Modal title="Contact submission" onClose={() => setOpen(null)}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{open.subject || '(No subject)'}</div>
          <div className="muted" style={{ fontSize: 12.5, margin: '2px 0 12px' }}>
            {open.name} · {open.email} · {timeAgo(open.created_at)}
          </div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14.5, lineHeight: 1.6, marginBottom: 16 }}>
            {open.message}
          </div>
          <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href={`mailto:${open.email}?subject=${encodeURIComponent('Re: ' + (open.subject || 'Your enquiry to BrightSkyIT'))}`}>Reply by email</a>
            <button className="btn btn-outline" onClick={() => setStatus(open, 'archived')}>Archive</button>
            {open.status !== 'new' && (
              <button className="btn btn-outline" onClick={() => setStatus(open, 'new')}>Mark unread</button>
            )}
            <button className="btn btn-danger" onClick={() => remove(open)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
