// Forgot password — requests a reset link by email.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { api } from '../../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(''); setMsg(''); setBusy(true)
    try {
      const data = await api('/auth/forgot', { method: 'POST', body: { email } })
      setMsg(data.message || 'If that email exists, a reset link has been sent.')
    } catch (e2) {
      setErr(e2.message || 'Something went wrong.')
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
        <h2>Reset password</h2>
        <p className="lead">Enter your email and we’ll send you a reset link.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-error">{err}</div>}
          <button className="btn btn-primary btn-block mt" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
        <p className="muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 16 }}>
          <Link to="/login" style={{ color: 'var(--blue)' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  )
}
