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
  {
    img: '/work/qs-oman.png',
    title: 'Quick Solution Oman',
    tag: 'Web + Mobile App',
    desc: 'Facility-management platform for Quick Solution Oman — public site, five-role client portal (complaints, approvals, technician dispatch, billing) and a React Native app. Next.js 16, Prisma, Postgres.',
    url: 'https://www.quicksolutionoman.com/',
    contain: true,
  },
  {
    img: '/work/octopus.png',
    title: 'Octopus Traders',
    tag: 'E-commerce · 3D',
    desc: 'Smart LED mirror configurator — customers pick size, shape, lighting and frame with a live 3D preview and real-time pricing, plus POS and admin tools.',
    url: 'https://octopus-trader.sohagvhi1106.workers.dev/',
  },
  {
    img: '/work/niyaz.jpg',
    title: 'Niyaz International',
    tag: 'Corporate Website',
    desc: 'Company website for an integrated facility-management group — services, project portfolio and team, built on Next.js with Tailwind.',
    url: 'https://www.niyazinternational.com/',
  },
  {
    img: '/work/gym.jpg',
    title: 'How to Gym',
    tag: 'Web App',
    desc: 'Gym exercise tool — guided workouts and an exercise library with multi-role access for members, trainers and gym owners.',
    url: 'https://how-to-gym.sohagvhi1106.workers.dev/',
  },
  {
    img: '/work/cyber.png',
    title: 'Cyber Expert',
    tag: 'Personal Site',
    desc: 'Personal brand website for a cybersecurity expert — services, credentials and contact, hand-built in HTML, CSS and JavaScript.',
    contain: true,
  },
  {
    img: '/work/diginex.png',
    title: 'DigiNex Billing',
    tag: 'Desktop App',
    desc: 'Computer-shop billing suite — products, stock, invoicing, warranties and customer accounts in a native Electron desktop app.',
    contain: true,
  },
  {
    img: '/work/paint.png',
    title: 'National Paint',
    tag: 'Desktop App',
    desc: 'Paint-shop management PC application — product catalog, pricing, quotes and day-to-day sales in a clean retail workflow.',
    contain: true,
  },
  {
    img: '/work/quote.jpg',
    title: 'Quote → Invoice',
    tag: 'Desktop App',
    desc: 'Quotation-to-invoice system for Quick Solution — branded PDF quotes with one-click conversion to final invoices.',
    contain: true,
  },
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
          <p>Real client work — websites, portals, e-commerce, mobile and desktop apps we’ve shipped.</p>
        </div>
        <div className="work-grid">
          {WORK.map((w) => (
            <a
              className="work-card"
              key={w.title}
              href={w.url || '#contact'}
              {...(w.url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <div className={'work-media' + (w.contain ? ' contain' : '')}>
                <img src={w.img} alt={w.title} loading="lazy" />
              </div>
              <div className="work-body">
                <span className="work-tag">{w.tag}</span>
                <h3>{w.title}</h3>
                <p className="work-desc">{w.desc}</p>
                {w.url && <span className="work-link">Visit live site ↗</span>}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- about ---------- */}
      <section className="sec about" id="about">
        <div className="about-in">
          <div className="about-visual">
            <video
              className="about-video"
              src="/about.mp4"
              poster="/about-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="BrightSkyIT showreel"
            >
              Your browser does not support the video tag.
            </video>
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
