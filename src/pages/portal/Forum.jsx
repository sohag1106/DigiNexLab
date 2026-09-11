// Forum — every portal member can share thoughts, comment, and vote on topics.
// Two panels: post list (with vote + comment counts) on the left, the selected
// topic with its comment thread on the right.
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Avatar, Modal } from '../../components/ui'
import { timeAgo } from '../../lib/format'
import { useToast } from '../../components/Toast'

export default function Forum() {
  const { user } = useAuth()
  const toast = useToast()
  const [posts, setPosts] = useState([])
  const [current, setCurrent] = useState(null)
  const [compose, setCompose] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  const isAdmin = user?.role === 'owner' || user?.role === 'admin'
  const isMine = (authorId) => isAdmin || authorId === user?.id

  async function loadPosts() {
    try {
      const d = await api('/forum')
      setPosts(d.posts || [])
    } catch (e) {
      toast(e.message || 'Could not load the forum.', 'error')
    }
  }
  useEffect(() => { loadPosts() }, [])

  async function openPost(p) {
    try {
      const d = await api(`/forum/${p.id}`)
      setCurrent(d.post)
    } catch (e) {
      toast(e.message || 'Could not open that topic.', 'error')
    }
  }

  async function create(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSaving(true)
    try {
      await api('/forum', { method: 'POST', body: { title, body } })
      toast('Topic posted.', 'success')
      setCompose(false); setTitle(''); setBody('')
      setCurrent(null)
      await loadPosts()
    } catch (err) {
      toast(err.message || 'Could not post.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function vote(p, value) {
    try {
      const d = await api(`/forum/${p.id}/vote`, { method: 'POST', body: { value } })
      setPosts((list) => list.map((x) => (x.id === p.id ? { ...x, votes: d.votes } : x)))
      if (current && current.id === p.id) setCurrent({ ...current, votes: d.votes, my_vote: d.my_vote })
    } catch (err) {
      toast(err.message || 'Could not vote.', 'error')
    }
  }

  async function addComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setSending(true)
    try {
      const d = await api(`/forum/${current.id}/comments`, { method: 'POST', body: { body: comment } })
      const c = { ...d.comment, author_name: user.name, author_designation: user.designation }
      setCurrent({ ...current, comments: [...current.comments, c] })
      setComment('')
      setPosts((list) => list.map((x) => (x.id === current.id ? { ...x, comment_count: (x.comment_count || 0) + 1 } : x)))
    } catch (err) {
      toast(err.message || 'Could not add comment.', 'error')
    } finally {
      setSending(false)
    }
  }

  async function deletePost() {
    if (!confirm('Delete this topic? This can’t be undone.')) return
    try {
      await api(`/forum/${current.id}`, { method: 'DELETE' })
      toast('Topic deleted.', 'success')
      setCurrent(null)
      await loadPosts()
    } catch (err) {
      toast(err.message || 'Could not delete.', 'error')
    }
  }

  async function deleteComment(c) {
    if (!confirm('Delete this comment?')) return
    try {
      await api(`/forum/${current.id}/comments?id=${c.id}`, { method: 'DELETE' })
      setCurrent({ ...current, comments: current.comments.filter((x) => x.id !== c.id) })
      setPosts((list) => list.map((x) => (x.id === current.id ? { ...x, comment_count: Math.max(0, (x.comment_count || 0) - 1) } : x)))
    } catch (err) {
      toast(err.message || 'Could not delete comment.', 'error')
    }
  }

  return (
    <div>
      <div className="spread mb">
        <div>
          <h2 style={{ margin: 0 }}>Forum</h2>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            Share thoughts with the team — comment and vote on what matters.
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setCompose(true)}>+ New topic</button>
      </div>

      <div className="grid forum-grid">
        {/* post list */}
        <div className="card" style={{ padding: 8 }}>
          <div className="section-title" style={{ padding: '8px 8px 4px' }}>
            <span className="accent" />Topics
            <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>{posts.length} total</span>
          </div>
          {posts.length === 0 && <div className="empty">No topics yet — start the conversation!</div>}
          {posts.map((p) => (
            <div
              key={p.id}
              className={`frow ${current && current.id === p.id ? 'on' : ''}`}
              onClick={() => openPost(p)}
            >
              <div className="fvotes">
                <button
                  className={`fvot ${p.my_vote === 1 ? 'up on' : 'up'}`}
                  title="Upvote"
                  onClick={(e) => { e.stopPropagation(); vote(p, 1) }}
                >▲</button>
                <span className="fscore">{p.votes}</span>
                <button
                  className={`fvot ${p.my_vote === -1 ? 'down on' : 'down'}`}
                  title="Downvote"
                  onClick={(e) => { e.stopPropagation(); vote(p, -1) }}
                >▼</button>
              </div>
              <div className="grow" style={{ minWidth: 0 }}>
                <span className="ftitle">{p.title}</span>
                <span className="fmeta muted">
                  {p.author_name || 'Someone'} · {timeAgo(p.created_at)} · {p.comment_count} comment{p.comment_count === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* selected topic */}
        <div className="card">
          {!current ? (
            <div className="empty">Select a topic to read it and join the discussion.</div>
          ) : (
            <>
              <div className="spread" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{current.title}</h3>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {current.author_name || 'Someone'} · {timeAgo(current.created_at)}
                  </div>
                </div>
                {isMine(current.author_id) && (
                  <button className="pic danger" title="Delete topic" onClick={deletePost} style={{ border: 'none', width: 30, height: 30 }}>✕</button>
                )}
              </div>

              <div style={{ whiteSpace: 'pre-wrap', marginTop: 14, fontSize: 14.5, lineHeight: 1.6 }}>{current.body}</div>

              <div className="ftopic-votes mt">
                <button className={`fvot big ${current.my_vote === 1 ? 'up on' : 'up'}`} onClick={() => vote(current, 1)}>▲</button>
                <span className="fscore big">{current.votes}</span>
                <button className={`fvot big ${current.my_vote === -1 ? 'down on' : 'down'}`} onClick={() => vote(current, -1)}>▼</button>
              </div>

              <div className="fcomments">
                <div className="section-title" style={{ marginBottom: 10 }}><span className="accent" />Comments</div>
                {current.comments.length === 0 && <div className="muted" style={{ fontSize: 13.5, marginBottom: 12 }}>No comments yet — be the first.</div>}
                {current.comments.map((c) => (
                  <div key={c.id} className="fcomment">
                    <Avatar name={c.author_name || '?'} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fcom-head">
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{c.author_name || 'Someone'}</span>
                        <span className="muted" style={{ fontSize: 11.5 }}>{timeAgo(c.created_at)}</span>
                        {isMine(c.author_id) && (
                          <button className="pic danger" title="Delete" onClick={() => deleteComment(c)} style={{ border: 'none', fontSize: 12 }}>✕</button>
                        )}
                      </div>
                      <div className="fcom-body">{c.body}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={addComment} className="flex mt">
                <input
                  style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 13px' }}
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button className="btn btn-primary" disabled={sending || !comment.trim()}>{sending ? '…' : 'Comment'}</button>
              </form>
            </>
          )}
        </div>
      </div>

      {compose && (
        <Modal title="New topic" onClose={() => setCompose(false)}>
          <form onSubmit={create}>
            <div className="field">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What’s on your mind?" autoFocus />
            </div>
            <div className="field">
              <label>Thoughts *</label>
              <textarea rows="5" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your thoughts with the team…" />
            </div>
            <div className="spread mt">
              <button type="button" className="btn btn-outline" onClick={() => setCompose(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !title.trim() || !body.trim()}>
                {saving ? 'Posting…' : 'Post topic'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
