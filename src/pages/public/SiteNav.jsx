// Shared public-site navigation bar (landing + team pages).
// Also renders the sitewide floating WhatsApp button — every public page
// uses SiteNav, so this is the one place the CTA needs to live.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { waGo } from '../../lib/wa'

// Click-to-chat: wa.me supports username links, prefilled so the
// conversation starts itself. Routed through the /go/wa tracker so every
// tap records which page and button produced it (see src/lib/wa.js).
export const whatsappHref = (placement) => waGo({ placement })

export function WhatsAppButton() {
  return (
    <a
      className="wa-float"
      href={whatsappHref('floating-button')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with BrightSkyIT on WhatsApp"
      title="Message us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.6.8 5 2.2 7L4 29l7.2-2.1c1.9 1 4 1.6 6.3 1.6h.5c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.9c-2 0-3.9-.6-5.5-1.6l-.4-.2-4.3 1.2 1.2-4.1-.3-.4A9.9 9.9 0 0 1 6.1 15c0-5.5 4.5-9.9 9.9-9.9 5.5 0 9.9 4.4 9.9 9.9s-4.4 9.9-9.9 9.9zm5.5-7.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4z" />
      </svg>
    </a>
  )
}

export default function SiteNav() {
  const [menu, setMenu] = useState(false)
  return (
    <>
      <header className="lnav">
      <div className="lnav-in">
        <Link to="/" className="lnav-brand" aria-label="BrightSkyIT — home">
          <img src={logo} alt="BrightSkyIT logo" />
          <span>BrightSky<em>IT</em></span>
        </Link>
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
          <Link to="/blog/">Blog</Link>
          <a href="/#contact">Contact</a>
          <a className="btn lnv" href="/#contact">Get a Quote</a>
          <a className="btn lnav-wa" href={whatsappHref('nav')} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
        </nav>
      </div>
    </header>
    {/* Outside the header on purpose: backdrop-filter on .lnav makes it the
        containing block for position:fixed, which would pin the float button
        to the header box instead of the viewport. */}
    <WhatsAppButton />
    </>
  )
}
