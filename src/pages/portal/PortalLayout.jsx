// Portal shell: guarded layout with sidebar nav + topbar.
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useAuth } from '../../lib/auth'
import { Avatar } from '../../components/ui'

export default function PortalLayout() {
  const { user, loading, logout, isAdmin, refresh } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [title, setTitle] = useState('Portal')

  useEffect(() => {
    const map = [
      [/^\/portal\/app/, 'Dashboard'],
      [/^\/portal\/services/, 'Our Services'],
      [/^\/portal\/profile/, 'My Profile'],
      [/^\/portal\/quotes/, 'Quotations'],
      [/^\/portal\/invoices/, 'Invoices'],
      [/^\/portal\/messages/, 'Messages'],
      [/^\/portal\/mail/, 'Email'],
      [/^\/portal\/admin\/people/, 'Team & People'],
      [/^\/portal\/admin\/work/, 'All Work'],
      [/^\/portal\/admin/, 'Admin Dashboard'],
    ]
    const hit = map.find(([re]) => re.test(loc.pathname))
    if (hit) setTitle(hit[1])
  }, [loc.pathname])

  useEffect(() => {
    if (!loading && !user) nav('/login', { replace: true })
  }, [loading, user, nav])

  if (loading) {
    return (
      <div className="auth-wrap" style={{ color: '#fff' }}>
        <p>Loading…</p>
      </div>
    )
  }
  if (!user) return null

  const initials = user.name ? user.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() : '?'

  return (
    <div className="p-shell">
      <aside className="p-side">
        <div className="brand">
          <img src={logo} alt="BrightSkyIT" />
          <span className="name">BrightSky<em style={{ fontStyle: 'normal', color: 'var(--magenta)' }}>IT</em></span>
        </div>
        <nav>
          <NavLink to="/portal/app" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ic">▦</span><span>Dashboard</span>
          </NavLink>
          <NavLink to="/portal/services" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ic">✦</span><span>Our Services</span>
          </NavLink>
          <NavLink to="/portal/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ic">◉</span><span>My Profile</span>
          </NavLink>
          <NavLink to="/portal/quotes" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ic">◈</span><span>Quotations</span>
          </NavLink>
          <NavLink to="/portal/invoices" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ic">▣</span><span>Invoices</span>
          </NavLink>
          <NavLink to="/portal/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ic">✉</span><span>Messages</span>
          </NavLink>
          <NavLink to="/portal/mail" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ic">@</span><span>Email</span>
          </NavLink>
          {isAdmin && (
            <>
              <div className="muted" style={{ margin: '14px 13px 4px', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }}>Admin</div>
              <NavLink to="/portal/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="ic">⟁</span><span>Admin Dashboard</span>
              </NavLink>
              <NavLink to="/portal/admin/people" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="ic">◫</span><span>Team & People</span>
              </NavLink>
              <NavLink to="/portal/admin/work" className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="ic">☰</span><span>All Work</span>
              </NavLink>
            </>
          )}
        </nav>
        <div className="foot">
          <div className="who">
            {user.name} · {user.designation || 'No designation'}
          </div>
          <span
            className="login"
            onClick={() => { logout(); nav('/login') }}
            style={{ cursor: 'pointer' }}
          >
            Log out
          </span>
        </div>
      </aside>

      <main className="p-main">
        <header className="p-top">
          <div>
            <h1 id="page-title">{title}</h1>
          </div>
          <div className="flex">
            <span className="muted" style={{ fontSize: 13 }}>{user.email}</span>
            <Avatar name={user.name} />
          </div>
        </header>
        <div className="p-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
