// /team/:slug — one member's profile page, animated in, with Person
// structured data so Google can answer "who is the founder of BrightSkyIT".
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TEAM, bySlug } from './team-data'
import { setMeta } from '../../lib/meta'
import SiteNav from './SiteNav'
import './landing.css'

export default function TeamMember() {
  const { slug } = useParams()
  const member = bySlug(slug)

  useEffect(() => {
    if (!member) return
    setMeta({
      title: `${member.name} — ${member.role}, BrightSkyIT`,
      description: `${member.name} is the ${member.role} at BrightSkyIT. ${member.tagline}`,
      path: `/team/${member.slug}/`,
      image: member.photo,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: member.name,
        jobTitle: member.role,
        description: member.bio,
        image: `https://brightskyit.com${member.photo}`,
        url: `https://brightskyit.com/team/${member.slug}/`,
        worksFor: {
          '@type': 'Organization',
          name: 'BrightSkyIT',
          url: 'https://brightskyit.com/',
        },
      },
    })
  }, [member])

  if (!member) {
    return (
      <div className="site team-site">
        <SiteNav />
        <section className="sec team-hero">
          <div className="empty">Profile not found.</div>
          <p style={{ textAlign: 'center' }}><Link className="btn btn-outline" to="/team">← Back to the team</Link></p>
        </section>
      </div>
    )
  }

  const idx = TEAM.indexOf(member)
  const next = TEAM[(idx + 1) % TEAM.length]

  return (
    <div className="site team-site" key={member.slug}>
      <SiteNav />
      <section className="sec profile-hero">
        <div className="profile-card">
          <div className="profile-photo" style={{ '--i': 0 }}>
            <img src={member.photo} alt={`${member.name} — ${member.role} at BrightSkyIT`} />
          </div>
          <div className="profile-copy" style={{ '--i': 1 }}>
            <span className="kicker">
              {member.group === 'founders' ? 'Founder' : member.group === 'advisors' ? 'Advisor' : 'Team'}
            </span>
            <h1>{member.name}</h1>
            <div className="team-role profile-role">{member.role}</div>
            <p className="profile-tagline">{member.tagline}</p>
            <p className="profile-bio">{member.bio}</p>

            <div className="profile-focus">
              <h2>Focus</h2>
              <ul>
                {member.focus.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>

            {member.links.length > 0 && (
              <div className="profile-links">
                {member.links.map((l) => (
                  <a key={l.url} className="btn btn-outline" href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}

            <div className="profile-actions">
              <Link className="btn btn-primary" to="/#contact">Work with {member.name.split(' ')[0]}</Link>
              <Link className="btn btn-ghost" to="/team">← All team</Link>
            </div>
          </div>
        </div>

        <Link to={`/team/${next.slug}`} className="profile-next">
          <span className="muted">Next</span>
          <span>{next.name} — {next.role} →</span>
        </Link>
      </section>
    </div>
  )
}
