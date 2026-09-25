// Admin "WhatsApp Clicks" — how many people tapped a WhatsApp CTA on the
// public site, from which city, from which page, from which button.
// Data source: the /go/wa redirect (functions/go/wa.js → wa_clicks table).
// Search Console can never see these clicks, so this is the funnel's own
// analytics: WhatsApp taps vs contact-form submissions per week.
import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { timeAgo } from '../../../lib/format'
import { useToast } from '../../../components/Toast'

const PLACE_LABEL = {
  'article-strip': 'Article WhatsApp strip',
  'floating-button': 'Floating button (all pages)',
  nav: 'Top navigation',
  'hub-cta': 'City page bottom CTA',
  'contact-section': 'Landing contact section',
  'quote-popup': 'Quote popup',
  footer: 'Footer',
}

export default function AdminWhatsApp() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/wa-stats')
      .then(setData)
      .catch((e) => toast(e.message || 'Could not load WhatsApp stats.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="empty">Loading...</div>
  if (!data) return <div className="empty">Stats unavailable.</div>

  const t = data.totals || { clicks: 0, last7: 0, last30: 0 }
  const f = data.forms || { total: 0, last7: 0, last30: 0 }
  const maxCity = Math.max(1, ...data.byCity.map((r) => r.clicks))

  return (
    <div>
      <div className="spread mb">
        <div>
          <h2 style={{ margin: 0 }}>WhatsApp Clicks</h2>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            Every tap on a WhatsApp button across the site, logged by the /go/wa redirect.
            {data.since ? ` Tracking since ${new Date(data.since).toLocaleDateString()}.` : ' No clicks logged yet.'}
          </div>
        </div>
      </div>

      <div className="grid grid-3 mb">
        <div className="stat">
          <span className="k">Clicks this week</span>
          <span className="v">{t.last7}</span>
          <span className="a">{f.last7} form submission{f.last7 === 1 ? '' : 's'} in the same week</span>
        </div>
        <div className="stat">
          <span className="k">Clicks last 30 days</span>
          <span className="v">{t.last30}</span>
          <span className="a">{f.last30} form submissions in the same month</span>
        </div>
        <div className="stat">
          <span className="k">All-time clicks</span>
          <span className="v">{t.clicks}</span>
          <span className="a">{f.total} all-time form submissions</span>
        </div>
      </div>

      <div className="grid grid-3 mb">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="section-title"><span className="accent" />Clicks by city</h3>
          {data.byCity.length === 0 ? (
            <div className="empty">No clicks yet. They appear as soon as a visitor taps a WhatsApp button on the site.</div>
          ) : (
            <table className="tbl">
              <thead><tr><th>City</th><th>Clicks</th><th>Share</th><th>Last</th></tr></thead>
              <tbody>
                {data.byCity.map((r) => (
                  <tr key={r.city}>
                    <td>{r.city}</td>
                    <td>{r.clicks}</td>
                    <td style={{ width: '35%' }}>
                      <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)' }}>
                        <div style={{ height: '100%', width: `${(r.clicks / maxCity) * 100}%`, borderRadius: 4, background: '#25d366' }} />
                      </div>
                    </td>
                    <td className="muted">{timeAgo(r.latest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 className="section-title"><span className="accent" />By button</h3>
          {data.byPlacement.length === 0 ? (
            <div className="empty">Nothing yet.</div>
          ) : (
            <table className="tbl">
              <tbody>
                {data.byPlacement.map((r) => (
                  <tr key={r.placement}>
                    <td>{PLACE_LABEL[r.placement] || r.placement}</td>
                    <td style={{ textAlign: 'right' }}>{r.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title"><span className="accent" />Recent clicks</h3>
        {data.recent.length === 0 ? (
          <div className="empty">No clicks logged yet.</div>
        ) : (
          <table className="tbl">
            <thead><tr><th>When</th><th>City</th><th>Page</th><th>Button</th></tr></thead>
            <tbody>
              {data.recent.map((r) => (
                <tr key={r.id}>
                  <td className="muted">{timeAgo(r.created_at)}</td>
                  <td>{r.city || <span className="muted">—</span>}</td>
                  <td style={{ maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={r.page || '/'} target="_blank" rel="noopener noreferrer">{r.page || '—'}</a>
                  </td>
                  <td className="muted">{PLACE_LABEL[r.placement] || r.placement || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
