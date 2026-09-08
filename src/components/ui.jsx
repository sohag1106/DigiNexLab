// Reusable modal wrapper + shared StatusBadge + Avatar.
export function Modal({ title, onClose, children, width }) {
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" style={width ? { maxWidth: width } : undefined} onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose} aria-label="Close">✕</button>
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  )
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${String(status || '').toLowerCase()}`}>{human(status)}</span>
}

function human(s) {
  const map = {
    draft: 'Draft', sent: 'Sent', accepted: 'Accepted', rejected: 'Rejected',
    paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled',
    open: 'Open', in_progress: 'In progress', done: 'Done',
    invited: 'Invited', active: 'Active', disabled: 'Disabled',
    owner: 'Owner', admin: 'Admin', staff: 'Staff',
  }
  return map[s] || s || '—'
}

export function Avatar({ name, size = 34 }) {
  const initials = (name || '?')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--blue), var(--magenta))',
        color: '#fff', fontWeight: 700, fontSize: size * 0.4,
      }}
    >
      {initials}
    </span>
  )
}
