// Public BrightSkyIT agency landing page — dark charcoal + neon blue/magenta.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { api } from '../../lib/api'
import { useToast } from '../../components/Toast'
import './landing.css'
import heroArt from './hero-art.jsx'

const SERVICES = [
  { icon: '◧', title: 'UI/UX Design', copy: 'Interfaces and journeys people love — wireframes to polished, accessible experience design.' },
  { icon: '⚙', title: 'Web Development', copy: 'Fast, secure, scalable web apps and sites engineered for performance and reliability.' },
  { icon: '◈', title: 'Branding', copy: 'Distinctive identities — logo systems, voice, and guidelines that make you unforgettable.' },
  { icon: '◇', title: 'Digital Strategy', copy: 'Research-backed roadmaps that turn business goals into measurable digital outcomes.' },
  { icon: '✎', title: 'Content & Copy', copy: 'Words and visuals that clarify, convince, and convert across every channel.' },
  { icon: '◉', title: 'Marketing & Growth', copy: 'Campaigns and funnels that spark engagement and drive real growth.' },
]

const WORK = [
  { img: '/sample-0.png', title: 'Fintech Dashboard', tag: 'Product Design' },
  { img: '/sample-2.png', title: 'Brand Identity System', tag: 'Branding' },
  { img: '/sample-2.png', title: 'E-commerce Platform', tag: 'Development' },
  { img: '/sample-0.png', title: 'Marketing Campaign', tag: 'Growth' },
]

export default function Landing() {
  const toast = useToast()
  const [menu, setMenu] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast('Please fill in your name, email and message.', 'error')
      return
    }
    setSending(true)
    try {
      await api('/contact', { method: 'POST', body: form })
      toast('Thanks — your message has been sent.', 'success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast(err.message || 'Could not send your message.', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="site">
      {/* ---------- nav ---------- */}
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
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#blog">Blog</a>
            <a href="#contact">Contact</a>
            <Link className="btn-magenta-sm" to="/login">Login</Link>
            <a className="btn lnv" href="#contact">Get a Quote</a>
          </nav>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="hero" id="top">
        <div className="hero-in">
          <div className="hero-copy">
            <span className="pill">◆ Creative Digital Agency</span>
            <h1>Innovate. Design. Elevate.</h1>
            <p className="hero-sub">
              We craft digital experiences that spark engagement and drive growth.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#work">Explore Our Work</a>
              <a className="btn btn-ghost" href="#contact">Let’s Talk</a>
            </div>
            <div className="hero-stats">
              <div><b>120+</b><span>Projects delivered</span></div>
              <div><b>40+</b><span>Happy clients</span></div>
              <div><b>9y</b><span>In business</span></div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">{heroArt}</div>
        </div>
      </section>

      {/* ---------- marquee ---------- */}
      <section className="marquee">
        <div className="mq-track">
          {['UI/UX DESIGN', 'WEB DEVELOPMENT', 'BRANDING', 'DIGITAL STRATEGY', 'CONTENT', 'GROWTH', 'PRODUCT'].map((t) => (
            <span key={t}>{t}<em>◆</em></span>
          ))}
          {['UI/UX DESIGN', 'WEB DEVELOPMENT', 'BRANDING', 'DIGITAL STRATEGY', 'CONTENT', 'GROWTH', 'PRODUCT'].map((t) => (
            <span key={t + 'b'}>{t}<em>◆</em></span>
          ))}
        </div>
      </section>

      {/* ---------- services ---------- */}
      <section className="sec" id="services">
        <div className="sec-head">
          <span className="kicker">What we do</span>
          <h2>Services built to move the needle</h2>
          <p>End-to-end digital craftsmanship — strategy to launch, and everything in between.</p>
        </div>
        <div className="svc-grid">
          {SERVICES.map((s, i) => (
            <div className="svc-card" key={s.title} style={{ '--i': i }}>
              <div className="svc-ic">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
              <span className="svc-num">0{i + 1}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- featured work ---------- */}
      <section className="sec" id="work">
        <div className="sec-head">
          <span className="kicker">Featured projects</span>
          <h2>Work that speaks for itself</h2>
          <p>A mosaic of recent engagements across product, brand, and growth.</p>
        </div>
        <div className="work-mosaic">
          {WORK.map((w) => (
            <a className="work-item" key={w.title} href="#contact">
              <img src={w.img} alt={w.title} loading="lazy" />
              <div className="work-over">
                <span className="work-tag">{w.tag}</span>
                <h3>{w.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- about ---------- */}
      <section className="sec about" id="about">
        <div className="about-in">
          <div className="about-visual">
            <div className="aurora" aria-hidden="true" />
          </div>
          <div className="about-copy">
            <span className="kicker">About us</span>
            <h2>BrightSkyIT — the bright side of digital</h2>
            <p>
              We’re a tight team of designers, developers and strategists who believe great
              work is honest, human, and beautifully engineered. From a single landing page to
              a full product ecosystem, we partner with you from first sketch to launch — and beyond.
            </p>
            <ul className="about-list">
              <li>Senior, hands-on team — no hand-offs to juniors</li>
              <li>Transparent strategy, clear milestones, on-time delivery</li>
              <li>Support long after launch</li>
            </ul>
            <a className="btn btn-primary" href="#contact">Work with us</a>
          </div>
        </div>
      </section>

      {/* ---------- blog teaser ---------- */}
      <section className="sec" id="blog">
        <div className="sec-head">
          <span className="kicker">From the blog</span>
          <h2>Ideas &amp; insight</h2>
        </div>
        <div className="blog-grid">
          {[
            ['The anatomy of a high-converting landing page', 'Design'],
            ['Designing for performance without losing delight', 'Engineering'],
            ['Why your brand needs a voice, not just a logo', 'Branding'],
          ].map(([t, tag]) => (
            <a className="post" key={t} href="#contact">
              <span className="post-tag">{tag}</span>
              <h3>{t}</h3>
              <span className="post-more">Read article →</span>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- contact ---------- */}
      <section className="sec contact" id="contact">
        <div className="contact-in">
          <div className="contact-copy">
            <span className="kicker">Get a quote</span>
            <h2>Let’s build something brilliant together</h2>
            <p>Tell us about your project. We’ll reply within one business day.</p>
            <div className="contact-chips">
              <span>✉ hello@brightskyit.com</span>
              <span>◆ Based worldwide — remote friendly</span>
            </div>
          </div>
          <form className="contact-form" onSubmit={submit}>
            <div className="cf-row">
              <div className="field"><label>Your name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" /></div>
              <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" /></div>
            </div>
            <div className="field"><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Project / Website / Brand" /></div>
            <div className="field"><label>Message</label><textarea rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your goals…" /></div>
            <button className="btn btn-magenta btn-block" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</button>
          </form>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="foot">
        <div className="foot-in">
          <div className="foot-brand">
            <img src={logo} alt="BrightSkyIT logo" />
            <span>BrightSky<em>IT</em></span>
            <p className="muted">The bright side of digital. Design, development, and growth — done properly.</p>
          </div>
          <div className="foot-cols">
            <div>
              <h4>Company</h4>
              <a href="#about">About</a><a href="#work">Work</a><a href="#blog">Blog</a><Link to="/login">Employee Login</Link>
            </div>
            <div>
              <h4>Services</h4>
              <a href="#services">Design</a><a href="#services">Development</a><a href="#services">Branding</a><a href="#services">Strategy</a>
            </div>
            <div>
              <h4>Contact</h4>
              <a href="mailto:hello@brightskyit.com">hello@brightskyit.com</a>
              <a href="#contact">Start a project</a>
            </div>
          </div>
        </div>
        <div className="foot-base">© {new Date().getFullYear()} BrightSkyIT · brightskyit.com</div>
      </footer>
    </div>
  )
}
