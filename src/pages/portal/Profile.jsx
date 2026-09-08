// My profile: view name/designation/role, edit own info, change password with eye.
import { useState } from 'react'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import PasswordField from '../../components/PasswordField'
import { useToast } from '../../components/Toast'

export default function Profile() {
  const { user, refresh } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(user.name || '')
  const [designation, setDesignation] = useState(user.designation || '')
  const [saving, setSaving] = useState(false)

  const [cur, setCur] = useState('')
  const [np, setNp] = useState('')
  const [np2, setNp2] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  async function saveInfo(e) {
    e.preventDefault()
    if (!name.trim()) return toast('Name cannot be empty.', 'error')
    setSaving(true)
    try {
      await api('/users/me', { method: 'PATCH', body: { name, designation } })
      await refresh()
      toast('Profile updated.', 'success')
    } catch (err) {
      toast(err.message || 'Could not update.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function changePw(e) {
    e.preventDefault()
    setPwMsg('')
    if (!cur) return setPwMsg('Enter your current password.')
    if (np.length < 8) return setPwMsg('New password must be at least 8 characters.')
    if (np !== np2) return setPwMsg('Passwords do not match.')
    setPwBusy(true)
    try {
      await api('/auth/change-password', { method: 'POST', body: { current_password: cur, new_password: np } })
      setCur(''); setNp(''); setNp2('')
      toast('Password changed.', 'success')
    } catch (err) {
      setPwMsg(err.message || 'Could not change password.')
    } finally {
      setPwBusy(false)
    }
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3 className="section-title"><span className="accent" />My details</h3>
        <form onSubmit={saveInfo}>
          <div className="field"><label>Email (login)</label><input value={user.email} disabled /></div>
          <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label>Designation</label><input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Senior Developer" /></div>
          <div className="field"><label>Role</label><input value={user.role} disabled /></div>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>

      <div className="card">
        <h3 className="section-title"><span className="accent" />Change password</h3>
        <form onSubmit={changePw}>
          <PasswordField id="cur" label="Current password" value={cur} onChange={(e) => setCur(e.target.value)} />
          <PasswordField id="np" label="New password" value={np} onChange={(e) => setNp(e.target.value)} autoComplete="new-password" />
          <PasswordField id="np2" label="Confirm new password" value={np2} onChange={(e) => setNp2(e.target.value)} autoComplete="new-password" />
          {pwMsg && <div className={pwMsg[0] === 'P' && pwMsg.includes('must') ? 'alert alert-error' : 'alert alert-success'}>{pwMsg}</div>}
          <button className="btn btn-primary" disabled={pwBusy}>{pwBusy ? 'Updating…' : 'Change password'}</button>
        </form>
      </div>
    </div>
  )
}
