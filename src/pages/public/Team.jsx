// /team — the BrightSkyIT team: founders, development and advisors.
// Each card links to a full profile page with animation.
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TEAM, GROUPS } from './team-data'
import { setMeta } from '../../lib/meta'
import './landing.css'

export default function Team() {
  useEffect(() => {
    setMeta({
      title: 'Meet the Team — BrightSkyIT Founders, Engineers & Advisors',
      description:
        'Meet the people behind BrightSkyIT: Co-Founders Mohammad Sohag, Khyruddin Ahmed and Al-Mahmud, development leads Shuvo (BuildNovaTech) and Shaon (SiteSentryLab), and Regional Head Reazul Hasan (Oman).',
      path: '/team',
    })
  }, [])

  return (
    <div className="site team-site">
      <section className="sec team-hero">
        <div className="sec-head">
          <span className="kicker">Our team</span>
          <h1>The people behind BrightSkyIT</h1>
          <p>
            Founders who still ship, engineers who obsess over the details, and advisors
            who keep us grounded in real markets.
          </p>
        </div>

        {GROUPS.map((grp) => {
          const members = TEAM.filter((m) => m.group === grp.key)
          if (!members.length) return null
          return (
            <div className="team-group" key={grp.key}>
              <h2 className="team-group-title">{grp.label}</h2>
              <p className="team-group-blurb">{grp.blurb}</p>
              <div className="team-grid">
                {members.map((m, i) => (
                  <Link
                    to={`/team/${m.slug}`}
                    className="team-card"
                    key={m.slug}
                    style={{ '--i': i }}
                  >
                    <div className="team-avatar">
                      <img src={m.photo} alt={`${m.name} — ${m.role} at BrightSkyIT`} loading="lazy" />
                    </div>
                    <h3>{m.name}</h3>
                    <span className="team-role">{m.role}</span>
                    <p className="team-tagline">{m.tagline}</p>
                    <span className="team-more">View profile →</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        <div className="team-cta">
          <h2>Want this team on your project?</h2>
          <Link className="btn btn-magenta" to="/#contact">Get a quote</Link>
        </div>
      </section>
    </div>
  )
}
