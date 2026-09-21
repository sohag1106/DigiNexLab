// /web-design-<city> — local landing pages targeting "web design <city>"
// keywords. Each page is genuinely local: real case study, local contact,
// OMR/AED pricing, city-specific FAQ (schema = FAQPage rich results).
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CITIES, byCitySlug } from './city-data'
import { setMeta } from '../../lib/meta'
import SiteNav, { WHATSAPP_URL } from './SiteNav'
import './landing.css'

// Render one long-form content block (shared with BlogPost).
export function Block({ b, cities }) {
  const [type, content] = b
  if (type === 'p') return <p className="art-p">{inline(content)}</p>
  if (type === 'h2') return <h2 className="art-h2">{content}</h2>
  if (type === 'h3') return <h3 className="art-h3">{content}</h3>
  if (type === 'ul')
    return (
      <ul className="art-list">
        {content.map((li, i) => <li key={i}>{inline(li)}</li>)}
      </ul>
    )
  if (type === 'ol')
    return (
      <ol className="art-list">
        {content.map((li, i) => <li key={i}>{inline(li)}</li>)}
      </ol>
    )
  if (type === 'table') {
    // ['table', headRow, row1, row2, …] — every element after the tag is a row,
    // so destructure the whole block, not just [type, content].
    const [, head, ...rows] = b
    return (
      <div className="art-table-wrap">
        <table className="art-table">
          <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => <tr key={i}>{r.map((c) => <td key={c}>{c}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    )
  }
  if (type === 'wa') {
    const { url, label } = content
    return (
      <div className="art-wa">
        <a className="btn" style={{ background: '#25d366', color: '#08351b', fontWeight: 700 }} href={url} target="_blank" rel="noopener noreferrer">💬 {label} →</a>
        <span className="art-wa-note">We reply within one business day with a fixed quote.</span>
      </div>
    )
  }
  if (type === 'cta' && cities) {
    const city = CITIES.find((c) => c.slug === content)
    if (!city) return null
    return (
      <div className="art-cta">
        <h3>Want a price for your project?</h3>
        <p>Fixed quotes in {city.currency}, agreed before we start.</p>
        <Link className="btn btn-primary" to={`/${city.slug}/`}>Web design in {city.city} →</Link>
      </div>
    )
  }
  return null
}

// **bold** inside content strings.
function inline(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))
}

export default function CityPage({ city: cityProp }) {
  const city = cityProp || byCitySlug(window.location.pathname.replace(/^\//, '').replace(/\/$/, ''))
  useEffect(() => {
    if (!city) return
    setMeta({
      title: city.title,
      description: city.description,
      path: `/${city.slug}/`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ProfessionalService',
            name: `BrightSkyIT — Web Design ${city.city}`,
            description: city.description,
            url: `https://brightskyit.com/${city.slug}/`,
            image: 'https://brightskyit.com/og-image.png',
            priceRange: city.currency === 'OMR' ? 'OMR 300 - OMR 1500' : 'AED 3500 - AED 25000',
            areaServed: { '@type': 'City', name: city.city, containedInPlace: { '@type': 'Country', name: city.country } },
            parentOrganization: { '@type': 'Organization', name: 'BrightSkyIT', url: 'https://brightskyit.com/' },
            employee: {
              '@type': 'Person',
              name: city.localContact.name,
              jobTitle: city.localContact.role,
              url: `https://brightskyit.com${city.localContact.profile}`,
            },
          },
          {
            '@type': 'FAQPage',
            mainEntity: city.faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ],
      },
    })
  }, [city])

  if (!city) return null
  return (
    <div className="site team-site">
      <SiteNav />
      <section className="sec city-page">
        <div className="sec-head">
          <span className="kicker">{city.flag} {city.city}, {city.country}</span>
          <h1>{city.h1}</h1>
          <p className="city-tagline">{city.tagline}</p>
        </div>

        {/* local proof first — the trust anchor of the page */}
        <div className="city-proof">
          <div className="city-proof-copy">
            <span className="kicker">Case study</span>
            <h2>{city.proof.heading}</h2>
            <p>{city.proof.body}</p>
            <a className="btn btn-outline" href={city.proof.caseUrl} target="_blank" rel="noopener noreferrer">
              {city.proof.caseLabel}
            </a>
          </div>
          <div className="city-proof-stats">
            <div><b>Live</b><span>client platform in {city.country}</span></div>
            <div><b>5 roles</b><span>portal: complaints → dispatch → billing</span></div>
            <div><b>Web + app</b><span>React site, portal & React Native app</span></div>
          </div>
        </div>

        {/* the market paragraph — genuinely different per city */}
        <div className="city-market">
          <h2>{city.market.heading}</h2>
          {city.market.paragraphs.map((p, i) => <p key={i}>{inline(p)}</p>)}
        </div>

        {/* the local face of the company */}
        <div className="city-contact">
          <img src={city.localContact.photo} alt={`${city.localContact.name} — ${city.localContact.role}`} loading="lazy" />
          <div>
            <span className="kicker">Your local contact</span>
            <h2>{city.localContact.name}</h2>
            <div className="team-role">{city.localContact.role}</div>
            <p>{city.localContact.blurb}</p>
            <Link className="city-contact-link" to={city.localContact.profile}>
              Meet {city.localContact.name.split(' ')[0]} →
            </Link>
          </div>
        </div>

        {/* FAQ — also the FAQPage rich-result source */}
        <div className="city-faq">
          <h2>Questions {city.city} businesses ask us</h2>
          {city.faqs.map((f) => (
            <details key={f.q} className="city-faq-item">
              <summary>{f.q}</summary>
              <p>{inline(f.a)}</p>
            </details>
          ))}
        </div>

        {/* nearby spokes */}
        <div className="city-links">
          <h2>Explore more</h2>
          <div className="city-links-row">
            <Link to="/blog/" className="city-link-card">
              <span className="post-tag">Blog</span>
              <h3>Website costs, pricing & strategy</h3>
              <span className="post-more">Read the guides →</span>
            </Link>
            {CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <Link key={c.slug} to={`/${c.slug}/`} className="city-link-card">
                <span className="post-tag">{c.flag} {c.city}</span>
                <h3>Web design in {c.city}</h3>
                <span className="post-more">See the {c.city} page →</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="team-cta">
          <h2>Want a website that wins {city.city} customers?</h2>
          <p className="muted">Tell us about your project — we reply within one business day.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn btn-magenta" to="/#contact">Get a free quote</Link>
            <a className="btn" style={{ background: '#25d366', color: '#08351b', fontWeight: 700 }} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">💬 WhatsApp — BrightSkyIT</a>
          </div>
        </div>
      </section>
    </div>
  )
}
