// Reset password — consumes ?token= from the emailed reset link.
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { api } from '../../lib/api'
import PasswordField from '../../components/PasswordField'
import { useToast } from '../../components/Toast'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const nav = useNavigate()
  const toast = useToast()

  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (!token) return setErr('This reset link is missing its token.')
    if (pw.length < 8) return setErr('Password must be at least 8 characters.')
    if (pw !== pw2) return setErr('Passwords do not match.')
    setBusy(true)
    try {
      await api('/auth/reset', { method: 'POST', body: { token, new_password: pw } })
      toast('Password updated. Please sign in.', 'success')
      nav('/login')
    } catch (e2) {
      setErr(e2.message || 'Could not reset password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          <img src={logo} alt="BrightSkyIT" />
          <span style={{ fontWeight: 800, fontSize: 20 }}>BrightSky<em style={{ fontStyle: 'normal', color: 'var(--magenta)' }}>IT</em></span>
        </div>
        <h2>Choose a new password</h2>
        <p className="lead">Enter a new password for your account.</p>
        <form onSubmit={submit}>
          <PasswordField id="pw" label="New password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
          <PasswordField id="pw2" label="Confirm password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
          {err && <div className="alert alert-error">{err}</div>}
          <button className="btn btn-primary btn-block mt" disabled={busy}>{busy ? 'Saving…' : 'Set password'}</button>
        </form>
        <p className="muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 16 }}>
          <Link to="/login" style={{ color: 'var(--blue)' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  )
}
