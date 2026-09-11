// Internal messaging — conversations with live unread badges and fast polling.
// Left: conversation list (last message + unread count). Right: chat thread.
// New messages and unread highlights appear automatically (polled ~4s), no
// manual refresh needed.
import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Avatar, Modal } from '../../components/ui'
import { timeAgo } from '../../lib/format'
import { useToast } from '../../components/Toast'

const POLL_MS = 4000

export default function Messages() {
  const { user } = useAuth()
  const toast = useToast()
  const [conversations, setConversations] = useState([])
  const [people, setPeople] = useState([])     // full team list for "new message"
  const [thread, setThread] = useState([])
  const [withUser, setWithUser] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [newPick, setNewPick] = useState(false)
  const threadEnd = useRef(null)

  async function loadInbox() {
    try {
      const d = await api('/messages/inbox')
      setConversations((d && d.conversations) || [])
    } catch (e) {
      if (!/unauthorized/i.test(e.message)) toast(e.message || 'Could not load messages.', 'error')
    }
  }

  async function loadThread() {
    if (!withUser) return
    try {
      const d = await api(`/messages?with=${withUser.id}`)
      setThread((d && d.messages) || [])
    } catch {}
  }

  // Poll inbox constantly so new messages + unread badges appear live.
  useEffect(() => {
    loadInbox()
    const t = setInterval(loadInbox, POLL_MS)
    return () => clearInterval(t)
  }, [])

  // Poll the open thread, and scroll to the latest message.
  useEffect(() => {
    if (!withUser) return
    loadThread()
    const t = setInterval(loadThread, POLL_MS)
    return () => clearInterval(t)
    // eslint-disable-next-line
  }, [withUser])

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  // Mark every unread incoming message from this peer as read when opening.
  async function selectConversation(peerId) {
    const conv = conversations.find((c) => c.peer_id === peerId)
    setWithUser({ id: peerId, name: conv?.peer_name, designation: conv?.peer_designation, status: conv?.peer_status })
    try {
      await api(`/messages/read-all?with=${peerId}`, { method: 'POST' })
      loadInbox()
    } catch {}
  }

  function isUnread(m) {
    return !m.mine && !m.read_at
  }

  async function send(e) {
    e.preventDefault()
    if (!text.trim() || !withUser) return
    setSending(true)
    try {
      await api('/messages', { method: 'POST', body: { recipient_id: withUser.id, text } })
      setText('')
      await Promise.all([loadThread(), loadInbox()])
    } catch (err) {
      toast(err.message || 'Could not send.', 'error')
    } finally {
      setSending(false)
    }
  }

  async function openNew() {
    if (!people.length) {
      try {
        const d = await api('/users')
        setPeople((d.users || []).filter((p) => p.id !== user.id))
      } catch {
        setPeople([])
      }
    }
    setNewPick(true)
  }

  function pickPerson(p) {
    setNewPick(false)
    setWithUser({ id: p.id, name: p.name, designation: p.designation, status: p.status })
    setThread([])
    loadInbox()
  }

  const totalUnread = conversations.reduce((s, c) => s + (c.unread || 0), 0)

  return (
    <div>
      <div className="spread mb">
        <div>
          <h2 style={{ margin: 0 }}>Messages</h2>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread === 1 ? '' : 's'}` : 'No unread messages'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New message</button>
      </div>

      <div className="grid msg-grid">
        {/* conversations */}
        <div className="card" style={{ padding: 8 }}>
          <div className="section-title" style={{ padding: '8px 8px 4px' }}><span className="accent" />Conversations</div>
          {conversations.length === 0 ? (
            <div className="empty" style={{ fontSize: 12.5 }}>No messages yet. Click “New message” to start a conversation.</div>
          ) : (
            conversations.map((c) => {
              const active = withUser && withUser.id === c.peer_id
              const unread = c.unread > 0
              return (
                <div
                  key={c.peer_id}
                  className={`conv-row ${active ? 'on' : ''} ${unread ? 'unread' : ''}`}
                  onClick={() => selectConversation(c.peer_id)}
                >
                  <Avatar name={c.peer_name || '?'} size={38} />
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="conv-top">
                      <span className="conv-name">{c.peer_name || 'Unknown'}</span>
                      <span className="muted" style={{ fontSize: 11.5 }}>{timeAgo(c.last_at)}</span>
                    </div>
                    <div className="conv-prev muted">{c.last_body}</div>
                  </div>
                  {unread && <span className="unread-badge">{c.unread}</span>}
                </div>
              )
            })
          )}
        </div>

        {/* thread */}
        <div className="card">
          {!withUser ? (
            <div className="empty">Select a conversation to read it, or start a new message.</div>
          ) : (
            <>
              <div className="spread mb" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div className="flex">
                  <Avatar name={withUser.name || '?'} size={34} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{withUser.name || 'Unknown'}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{withUser.designation || (withUser.status === 'active' && 'Online')}</div>
                  </div>
                </div>
              </div>
              <div className="chat-thread">
                {thread.length === 0 && <div className="empty">No messages yet — say hi!</div>}
                {thread.map((m) => {
                  const mine = m.sender_id === user.id
                  const unread = !mine && !m.read_at
                  return (
                    <div
                      key={m.id}
                      className={`msg ${mine ? 'me' : 'other'} ${unread ? 'unread-msg' : ''}`}
                      title={unread ? 'Unread' : undefined}
                    >
                      <div className={`who ${mine ? '' : 'other'}`}>
                        {mine ? 'You' : m.sender_name} · <span style={{ opacity: .55 }}>{timeAgo(m.created_at)}</span>
                        {unread && <span className="unread-dot" />}
                      </div>
                      {m.body}
                    </div>
                  )
                })}
                <div ref={threadEnd} />
              </div>
              <form onSubmit={send} className="flex mt">
                <input
                  style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 13px' }}
                  placeholder={`Message ${withUser.name || ''}…`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="btn btn-primary" disabled={sending || !text.trim()}>{sending ? '…' : 'Send'}</button>
              </form>
            </>
          )}
        </div>
      </div>

      {newPick && (
        <Modal title="New message" onClose={() => setNewPick(false)}>
          <div className="field"><label>Choose a teammate</label></div>
          {people.length === 0 ? (
            <div className="muted" style={{ fontSize: 13 }}>No teammates available to message.</div>
          ) : (
            people.map((p) => (
              <div key={p.id} className="row conv-row pick" onClick={() => pickPerson(p)}>
                <Avatar name={p.name} size={34} />
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{p.designation || p.role}</div>
                </div>
              </div>
            ))
          )}
        </Modal>
      )}
    </div>
  )
}
