// Our Services — a shared showcase of every user's products & services.
// Everyone sees all cards; each user can add their own and edit/delete their own.
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Modal, Avatar } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { timeAgo } from '../../lib/format'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AED']
const CATEGORIES = ['Web Development', 'Design', 'Marketing', 'Mobile', 'Maintenance', 'Other']

const CATEGORY_META = {
  'Web Development': { grad: 'linear-gradient(135deg,#2f6bff,#7c5cff)', icon: '🌐', emoji: '🌐' },
  Design:            { grad: 'linear-gradient(135deg,#d63aff,#7c5cff)', icon: '🎨', emoji: '🎨' },
  Marketing:         { grad: 'linear-gradient(135deg,#0ea5e9,#2f6bff)', icon: '📣', emoji: '📣' },
  Mobile:            { grad: 'linear-gradient(135deg,#10b981,#2f6bff)', icon: '📱', emoji: '📱' },
  Maintenance:       { grad: 'linear-gradient(135deg,#f59e0b,#ef4444)', icon: '🛠️', emoji: '🛠️' },
  Other:             { grad: 'linear-gradient(135deg,#64748b,#2f6bff)', icon: '✦', emoji: '✨' },
}

function defaultCatMeta(cat) {
  return { grad: 'linear-gradient(135deg,#2f6bff,#7c5cff)', icon: '✦', emoji: '✨' }
}

const money = (n, cur = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹', AED: 'AED ' }
  const sym = symbols[cur] || '$'
  try {
    return sym + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  } catch {
    return sym + Number(n || 0).toFixed(2)
  }
}

// Is the "image" actually an emoji? (emoji-lite lets non-designers add icons fast)
function isEmoji(s) {
  if (!s) return false
  const t = s.trim()
  // A single encoded character that isn't a URL path
  return t.length <= 4 && /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u.test(t)
}

function ProductArt({ p, size = 44 }) {
  const meta = CATEGORY_META[p.category] || defaultCatMeta(p.category)
  if (p.image && isEmoji(p.image)) {
    const t = p.image.trim()
    return (
      <span className="p-art" style={{ width: size, height: size, fontSize: size * 0.55, background: meta.grad }}>
        {t}
      </span>
    )
  }
  if (p.image) {
    return <span className="p-art" style={{ width: size, height: size, background: meta.grad }}><img src={p.image} alt="" /></span>
  }
  return (
    <span className="p-art" style={{ width: size, height: size, fontSize: size * 0.5, background: meta.grad }}>
      {meta.emoji}
    </span>
  )
}

const empty = { name: '', description: '', category: '', price: '', currency: 'USD', image: '' }

export default function Products() {
  const { user } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)        // modal open
  const [editing, setEditing] = useState(null)   // product being edited, or null = create
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')

  async function load() {
    try {
      const { products } = await api('/products')
      setItems(products || [])
    } catch {
      setItems([])
    }
  }
  useEffect(() => { load() }, [])

  const isAdmin = user?.role === 'owner' || user?.role === 'admin'
  const canEdit = (p) => isAdmin || p.created_by === user.id

  const cats = useMemo(() => [...new Set(items.map((p) => p.category).filter(Boolean))], [items])
  const q = query.trim().toLowerCase()
  const filtered = items.filter((p) =>
    (!filter || p.category === filter) &&
    (!q || [p.name, p.description, p.category].join(' ').toLowerCase().includes(q))
  )

  function openCreate() { setEditing(null); setForm(empty); setOpen(true) }
  function openEdit(p) {
    setEditing(p)
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: p.category || '',
      price: p.price != null ? String(p.price) : '',
      currency: p.currency || 'USD',
      image: p.image || '',
    })
    setOpen(true)
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast('Give the service a name.', 'error'); return }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category || null,
      price: Number(form.price) || 0,
      currency: form.currency || 'USD',
      image: form.image.trim() || null,
    }
    setSaving(true)
    try {
      if (editing) {
        await api(`/products/${editing.id}`, { method: 'PATCH', body: payload })
        toast('Service updated.', 'success')
      } else {
        await api('/products', { method: 'POST', body: payload })
        toast('Service added.', 'success')
      }
      setOpen(false)
      load()
    } catch (err) {
      toast(err.message || 'Could not save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove(p) {
    if (!confirm(`Delete “${p.name}”? This can’t be undone.`)) return
    try {
      await api(`/products/${p.id}`, { method: 'DELETE' })
      toast('Service deleted.', 'success')
      load()
    } catch (err) {
      toast(err.message || 'Could not delete.', 'error')
    }
  }

  const mine = items.filter((p) => p.created_by === user.id).length

  return (
    <div>
      {/* Page header */}
      <div className="spread mb">
        <div>
          <h2 style={{ margin: 0 }}>Our Services</h2>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            Everything the team offers — yours included, shared so we all sell it.
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add your service</button>
      </div>

      {/* Toolbar: search + categories + ownership counts */}
      <div className="prod-toolbar">
        <div className="prod-search">
          <input
            className="search-input"
            type="search"
            placeholder="Search services (name, description, category)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="prod-filters">
            <button className={`phip ${filter === '' ? 'on' : ''}`} onClick={() => setFilter('')}>All</button>
            {cats.map((c) => (
              <button key={c} className={`phip ${filter === c ? 'on' : ''}`} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="prod-stats">
          <span className="pstat"><b>{items.length}</b> services</span>
          <span className="pstat"><b>{mine}</b> yours</span>
        </div>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="card empty">
          {items.length === 0
            ? 'No services yet — click “Add your service” to list the first one.'
            : query.trim()
              ? `No services match “${query.trim()}”.`
              : 'Nothing in this category yet.'}
        </div>
      ) : (
        <div className="prod-grid">
          {filtered.map((p) => {
            const meta = CATEGORY_META[p.category] || defaultCatMeta(p.category)
            const editable = canEdit(p)
            return (
              <article className="pcard" key={p.id}>
                <div className="pcard-top" style={{ background: meta.grad }}>
                  <ProductArt p={p} />
                  {p.category && <span className="pcat">{meta.emoji} {p.category}</span>}
                  {editable && (
                    <div className="pcard-actions">
                      <button className="pic" title="Edit" onClick={() => openEdit(p)}>✎</button>
                      <button className="pic danger" title="Delete" onClick={() => remove(p)}>✕</button>
                    </div>
                  )}
                </div>
                <div className="pcard-body">
                  <h3 className="ptitle">{p.name}</h3>
                  {p.description ? <p className="pdesc">{p.description}</p> : <p className="pdesc muted">No description yet.</p>}
                  <div className="pcard-foot">
                    <span className="pprice">{money(p.price, p.currency)}</span>
                    <span className="powner" title={p.owner_name || 'Unknown'}>
                      <Avatar name={p.owner_name || '?'} size={22} />
                      <span className="muted">{p.owner_name || 'Team'}</span>
                    </span>
                  </div>
                  <div className="pposted muted">{timeAgo(p.created_at)}</div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      {open && (
        <Modal title={editing ? 'Edit service' : 'Add your service'} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Service / product name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Full-Stack Web Development" autoFocus />
            </div>

            <div className="prod-form-row">
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Choose a category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Price</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What do you provide? Scope, deliverables, turnaround…" />
            </div>

            <div className="field">
              <label>Icon or image (optional)</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="An emoji (🎨) or an image URL" />
              <span className="hint muted">Drop a single emoji for a fast icon, or paste an image URL.</span>
            </div>

            <div className="prod-form-row">
              <div className="field">
                <label>Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="spread mt">
              <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !form.name.trim()}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add service'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
