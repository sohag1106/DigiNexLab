// Internal messaging — pick a coworker on the left, chat in a thread.
// Polls the inbox on an interval so new messages appear without a refresh.
import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Avatar, StatusBadge } from '../../components/ui'
import { timeAgo } from '../../lib/format'
import { useToast } from '../../components/Toast'

export default function Messages() {
  const { user } = useAuth()
  const toast = useToast()
  const [people, setPeople] = useState([])
  const [thread, setThread] = useState([])
  const [withUser, setWithUser] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const threadEnd = useRef(null)

  async function loadPeople() {
    try {
      const { users } = await api('/users')
      // non-admin listing is forbidden; fall back gracefully.
      setPeople(users || [])
    } catch {
      setPeople([])
    }
  }

  async function loadThread() {
    if (!withUser) return
    try {
      const { messages } = await api(`/messages?with=${withUser.id}`)
      setThread(messages || [])
    } catch {}
  }

  // Every 12s refresh thread + people.
  useEffect(() => {
    loadPeople()
  }, [])

  useEffect(() => {
    loadThread()
    const t = setInterval(loadThread, 12000)
    return () => clearInterval(t)
    // eslint-disable-next-line
  }, [withUser])

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  async function send(e) {
    e.preventDefault()
    if (!text.trim() || !withUser) return
    setSending(true)
    try {
      await api('/messages', { method: 'POST', body: { recipient_id: withUser.id, text } })
      setText('')
      await loadThread()
    } catch (err) {
      toast(err.message || 'Could not send.', 'error')
    } finally {
      setSending(false)
    }
  }

  // staff cannot list all users; show only those we can message (from an admin list).
  // If list failed, show a message instead.
  return (
    <div className="grid" style={{ gridTemplateColumns: '260px 1fr', alignItems: 'start' }}>
      <div className="card" style={{ padding: 8 }}>
        <div className="section-title" style={{ padding: '8px 8px 4px' }}><span className="accent" />Team</div>
        {people.length === 0 ? (
          <div className="empty" style={{ fontSize: 12.5 }}>You don’t have permission to see the team list (admin-managed).</div>
        ) : (
          people.filter((p) => p.id !== user.id).map((p) => (
            <button
              key={p.id}
              onClick={() => setWithUser(p)}
              className="row"
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--line)', borderRadius: 0 }}
            >
              <Avatar name={p.name} size={32} />
              <span className="grow">
                <span style={{ fontWeight: 600, display: 'block' }}>{p.name}</span>
                <span className="muted" style={{ fontSize: 12 }}>{p.designation || p.role}</span>
              </span>
            </button>
          ))
        )}
      </div>

      <div className="card">
        {!withUser ? (
          <div className="empty">Select a teammate to start messaging.</div>
        ) : (
          <>
            <div className="spread mb" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
              <div className="flex"><Avatar name={withUser.name} size={34} /><span style={{ fontWeight: 700 }}>{withUser.name}</span><span className="muted">{withUser.designation || ''}</span></div>
              <StatusBadge status={withUser.status} />
            </div>
            <div className="chat-thread">
              {thread.length === 0 && <div className="empty">No messages yet — say hi!</div>}
              {thread.map((m) => (
                <div key={m.id} className={`msg ${m.sender_id === user.id ? 'me' : 'other'}`}>
                  <div className="who">
                    {m.sender_id === user.id ? 'You' : m.sender_name} · <span className="muted" style={{ opacity: .6 }}>{timeAgo(m.created_at)}</span>
                  </div>
                  {m.body}
                </div>
              ))}
              <div ref={threadEnd} />
            </div>
            <form onSubmit={send} className="flex mt">
              <input
                style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 13px' }}
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="btn btn-primary" disabled={sending || !text.trim()}>{sending ? '…' : 'Send'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
