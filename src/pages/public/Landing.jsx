// Public BrightSkyIT agency landing page — dark charcoal + neon blue/magenta.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { api } from '../../lib/api'
import { setMeta } from '../../lib/meta'
import { useToast } from '../../components/Toast'
import SiteNav from './SiteNav'
import { WHATSAPP_URL } from './SiteNav'
import './landing.css'
import heroArt from './hero-art.jsx'

// One-tap contact channels — "choose how you want to talk, then click".
// WhatsApp and email open pre-filled with the project context; the quote
// form below stays for people who want to send full details.
function waQuick(subject) {
  const msg = `Hi BrightSkyIT! I'd like a quote${subject ? ` for ${subject}` : ''}.`
  return 'https://wa.me/BrightSkyIT?text=' + encodeURIComponent(msg)
}
function mailQuick(subject) {
  return (
    'mailto:info@brightskyit.com?subject=' +
    encodeURIComponent(`Quote request${subject ? `: ${subject}` : ''}`) +
    '&body=' +
    encodeURIComponent(
      'Hi BrightSkyIT,\n\nI would like a quote.\n\nProject details:\nTimeline:\nBudget:\n\nThanks!'
    )
  )
}

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
  useEffect(() => {
    setMeta({
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'BrightSkyIT',
        url: 'https://brightskyit.com/',
        logo: 'https://brightskyit.com/logo.png',
        email: 'info@brightskyit.com',
        founder: [
          { '@type': 'Person', name: 'Mohammad Sohag', jobTitle: 'Co-Founder & CEO', url: 'https://brightskyit.com/team/mohammad-sohag' },
          { '@type': 'Person', name: 'Khyruddin Ahmed', jobTitle: 'Co-Founder', url: 'https://brightskyit.com/team/khyruddin-ahmed' },
          { '@type': 'Person', name: 'Al-Mahmud', jobTitle: 'Co-Founder', url: 'https://brightskyit.com/team/al-mahmud' },
        ],
      },
    })
  }, [])
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', phone: '', prefer: ['email'], subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [quoteFor, setQuoteFor] = useState(null) // service title shown in the quote popup, or null

  function togglePrefer(v) {
    setForm((f) => {
      const has = f.prefer.includes(v)
      const next = has ? f.prefer.filter((x) => x !== v) : [...f.prefer, v]
      // At least one must remain checked.
      return { ...f, prefer: next.length ? next : [v] }
    })
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.message) { toast('Please fill in your name and message.', 'error'); return }
    if (form.prefer.includes('email') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      toast('Please provide a valid email.', 'error'); return
    }
    if (form.prefer.includes('whatsapp') && !form.whatsapp.trim()) {
      toast('Please enter your WhatsApp number.', 'error'); return
    }
    if (form.prefer.includes('phone') && !form.phone.trim()) {
      toast('Please enter a phone number for a call.', 'error'); return
    }
    // Nothing selected — shouldn't happen due to toggle guard, but be safe.
    if (!form.prefer.length) { toast('Pick at least one way to reach you.', 'error'); return }
    setSending(true)
    try {
      await api('/contact', { method: 'POST', body: form })
      toast('Thanks — your message has been sent.', 'success')
      setForm({ name: '', email: '', whatsapp: '', phone: '', prefer: ['email'], subject: '', message: '' })
      setQuoteFor(null)
    } catch (err) {
      toast(err.message || 'Could not send your message.', 'error')
    } finally {
      setSending(false)
    }
  }

  function openQuote(serviceTitle) {
    setForm((f) => ({ ...f, subject: serviceTitle ? `${serviceTitle} project` : '' }))
    setQuoteFor(serviceTitle || ' ')
  }

  const quoteForm = (
    <form className="contact-form quote-pop-form" onSubmit={submit}>
      <div className="cf-row">
        <div className="field"><label>Your name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" autoComplete="name" /></div>
        <div className="field"><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Project / Website / Brand" /></div>
      </div>

      {/* How they'd like to be reached — multi-select. */}
      <div className="field prefer-row">
        <label>How should we reply? <span className="muted" style={{ fontWeight: 400 }}>Pick any — we only ask for the one(s) you pick.</span></label>
        <div className="prefer-chips">
          {[
            ['email', '✉ Email'],
            ['whatsapp', '💬 WhatsApp'],
            ['phone', '📞 Call me'],
          ].map(([v, label]) => (
            <label key={v} className={'prefer-chip' + (form.prefer.includes(v) ? ' on' : '')}>
              <input type="checkbox" checked={form.prefer.includes(v)} onChange={() => togglePrefer(v)} hidden />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {form.prefer.includes('email') && (
        <div className="field"><label>Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" autoComplete="email" /></div>
      )}

      {(form.prefer.includes('whatsapp') || form.prefer.includes('phone')) && (
        <div className="cf-row">
          {form.prefer.includes('whatsapp') && (
            <div className="field"><label>WhatsApp number{!form.prefer.includes('email') ? ' *' : ' *'}</label><input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+968 9123 4567" autoComplete="tel" inputMode="tel" /></div>
          )}
          {form.prefer.includes('phone') && (
            <div className="field"><label>{form.prefer.includes('whatsapp') ? 'Phone for calls (if different)' : 'Phone number *'}</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={form.whatsapp || '+968 9123 4567'} autoComplete="tel" inputMode="tel" /></div>
          )}
        </div>
      )}

      <div className="field"><label>Message *</label><textarea rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your goals…" /></div>
      <button className="btn btn-magenta btn-block" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</button>
    </form>
  )

  return (
    <div className="site">
      <SiteNav />

      {/* ---------- hero ---------- */}
      <main>
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
          {/* 4 copies so the track always covers the viewport — the -50% keyframe loops seamlessly */}
          {Array.from({ length: 4 }, (_, c) =>
            ['UI/UX DESIGN', 'WEB DEVELOPMENT', 'BRANDING', 'DIGITAL STRATEGY', 'CONTENT', 'GROWTH', 'PRODUCT'].map((t) => (
              <span key={c + '-' + t}>{t}<em>◆</em></span>
            ))
          )}
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
            <button className="svc-card" key={s.title} style={{ '--i': i }} onClick={() => openQuote(s.title)}>
              <div className="svc-ic">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
              <span className="svc-num">0{i + 1}</span>
            </button>
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
            <Link to="/team" className="about-photo-link" title="Meet the team">
              <img
                className="about-photo"
                src="/about-team.jpg"
                alt="The BrightSkyIT team"
                loading="lazy"
              />
            </Link>
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
            ['Pricing', 'How much does a website cost in Oman?', '/blog/website-cost-oman/'],
            ['Buyer\'s guide', 'How to choose a web design company in Oman', '/blog/how-to-choose-web-design-company-oman/'],
            ['Strategy', 'Why Omani businesses need Arabic + English websites', '/blog/why-omani-businesses-need-bilingual-websites/'],
          ].map(([tag, t, to]) => (
            <Link className="post" key={t} to={to}>
              <span className="post-tag">{tag}</span>
              <h3>{t}</h3>
              <span className="post-more">Read article →</span>
            </Link>
          ))}
          <Link className="post" to="/web-design-muscat/">
            <span className="post-tag">🇴🇲 Muscat</span>
            <h3>Web design in Muscat — websites that win clients</h3>
            <span className="post-more">See how we work in Oman →</span>
          </Link>
        </div>
      </section>

      {/* ---------- contact ---------- */}
      <section className="sec contact" id="contact">
        <div className="contact-in">
          <div className="contact-copy">
            <span className="kicker">Get a quote</span>
            <h2>Let’s build something brilliant together</h2>
            <p>Tell us about your project. We’ll reply within one business day.</p>
            <div className="qa-channels" role="group" aria-label="Choose how to get in touch">
              <a className="qa-card qa-wa" href={waQuick()} target="_blank" rel="noopener noreferrer">
                <span className="qa-ic">💬</span>
                <span className="qa-meta"><b>Chat on WhatsApp</b><em>Instant reply — tap to start</em></span>
                <span className="qa-go">→</span>
              </a>
              <a className="qa-card qa-mail" href={mailQuick()}>
                <span className="qa-ic">✉</span>
                <span className="qa-meta"><b>Email us</b><em>We reply within one business day</em></span>
                <span className="qa-go">→</span>
              </a>
            </div>
            <div className="qa-or">— or send your project details below —</div>
          </div>
          {quoteForm}
        </div>
      </section>
      </main>

      {/* ---------- quote popup ---------- */}
      {quoteFor && (
        <div className="quote-pop" onClick={() => setQuoteFor(null)}>
          <div className="quote-pop-card" onClick={(e) => e.stopPropagation()}>
            <button className="quote-pop-x" onClick={() => setQuoteFor(null)} aria-label="Close">✕</button>
            <span className="kicker">Get a quote</span>
            <h3>{quoteFor.trim() ? quoteFor : 'Let’s build something brilliant'}</h3>
            <p className="muted">Tell us about your project. We’ll reply within one business day.</p>
            <div className="qa-channels" role="group" aria-label="Choose how to get in touch">
              <a className="qa-card qa-wa" href={waQuick(quoteFor.trim())} target="_blank" rel="noopener noreferrer">
                <span className="qa-ic">💬</span>
                <span className="qa-meta"><b>Chat on WhatsApp</b><em>Instant reply — tap to start</em></span>
                <span className="qa-go">→</span>
              </a>
              <a className="qa-card qa-mail" href={mailQuick(quoteFor.trim())}>
                <span className="qa-ic">✉</span>
                <span className="qa-meta"><b>Email us</b><em>We reply within one business day</em></span>
                <span className="qa-go">→</span>
              </a>
            </div>
            {quoteForm}
          </div>
        </div>
      )}

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
              <a href="mailto:info@brightskyit.com">info@brightskyit.com</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp: BrightSkyIT</a>
              <a href="#contact">Start a project</a>
              <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
        <div className="foot-base">© {new Date().getFullYear()} BrightSkyIT · brightskyit.com</div>
      </footer>
    </div>
  )
}
