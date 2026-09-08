// Portal login. If the account has must_change_password (invited with a
// one-time password), route into a forced change-password step before entry.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import PasswordField from '../../components/PasswordField'
import { useToast } from '../../components/Toast'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('') // holds current/one-time password for change step
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [force, setForce] = useState(null) // user object needing password change

  // forced change step
  const [newPass, setNewPass] = useState('')
  const [rePass, setRePass] = useState('')

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const user = await login(email, password)
      if (user.must_change_password) {
        setOtp(password)
        setPassword('')
        setForce(user)
      } else {
        nav('/portal/app')
      }
    } catch (err2) {
      setErr(err2.message || 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  async function changePass(e) {
    e.preventDefault()
    setErr('')
    if (newPass.length < 8) return setErr('New password must be at least 8 characters.')
    if (newPass !== rePass) return setErr('Passwords do not match.')
    if (newPass === otp) return setErr('New password must differ from the current one.')
    setBusy(true)
    try {
      const { user } = await api('/auth/change-password', {
        method: 'POST',
        body: { current_password: otp, new_password: newPass },
      })
      // update session user via login again is not needed; navigate
      setForce(null)
      toast('Password set. Welcome aboard!', 'success')
      nav('/portal/app')
    } catch (err2) {
      setErr(err2.message || 'Could not update password.')
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

        {force ? (
          <>
            <h2>Set your password</h2>
            <p className="lead">Hi {force.name}, please choose a personal password.</p>
            <form onSubmit={changePass}>
              <PasswordField id="newpass" label="New password" value={newPass} onChange={(e) => setNewPass(e.target.value)} autoComplete="new-password" />
              <PasswordField id="repass" label="Confirm password" value={rePass} onChange={(e) => setRePass(e.target.value)} autoComplete="new-password" />
              {err && <div className="alert alert-error">{err}</div>}
              <button className="btn btn-primary btn-block mt" disabled={busy}>{busy ? 'Saving…' : 'Set password & continue'}</button>
            </form>
          </>
        ) : (
          <>
            <h2>Welcome back</h2>
            <p className="lead">Sign in to the BrightSkyIT portal</p>
            <form onSubmit={submit}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="username" />
              </div>
              <PasswordField id="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="spread" style={{ marginTop: 2 }}>
                <Link to="/forgot-password" style={{ color: 'var(--blue)', fontSize: 13.5 }}>Forgot password?</Link>
              </div>
              {err && <div className="alert alert-error">{err}</div>}
              <button className="btn btn-primary btn-block mt" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            </form>
          </>
        )}

        <p className="muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 18 }}>
          <Link to="/" style={{ color: 'var(--blue)' }}>← Back to site</Link>
        </p>
      </div>
    </div>
  )
}
