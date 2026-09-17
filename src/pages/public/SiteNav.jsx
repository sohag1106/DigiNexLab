// Shared public-site navigation bar (landing + team pages).
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

export default function SiteNav() {
  const [menu, setMenu] = useState(false)
  return (
    <header className="lnav">
      <div className="lnav-in">
        <div className="lnav-brand">
          <img src={logo} alt="BrightSkyIT logo" />
          <span>BrightSky<em>IT</em></span>
        </div>
        <button className="lnav-burger" onClick={() => setMenu((m) => !m)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menu
              ? <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>
        <nav className={menu ? 'open' : ''}>
          <a href="/#services">Services</a>
          <a href="/#work">Work</a>
          <Link to="/team">Team</Link>
          <a href="/#about">About</a>
          <a href="/#blog">Blog</a>
          <a href="/#contact">Contact</a>
          <a className="btn lnv" href="/#contact">Get a Quote</a>
        </nav>
      </div>
    </header>
  )
}
