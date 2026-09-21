// /blog — index of articles, and /blog/:slug — one article.
// Posts are long-form, genuinely useful content that feeds the city pages.
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { POSTS, byPostSlug } from './blog-data'
import { CITIES } from './city-data'
import { Block } from './CityPage'
import { setMeta } from '../../lib/meta'
import SiteNav from './SiteNav'
import './landing.css'

// Group the (many) city articles by country so the index is scannable and
// every article is reachable in a few hops from /blog/. Order: countries with
// the most articles first.
function byRegion(posts) {
  const groups = []
  const ord = {}
  for (const p of posts) {
    if (p.cityCountry) {
      const key = p.cityCountry
      if (!(key in ord)) { ord[key] = groups.length; groups.push({ name: key, posts: [] }) }
      groups[ord[key]].posts.push(p)
    }
  }
  // fall back to "guides" for hand-written posts without a country
  const rest = posts.filter((p) => !p.cityCountry)
  groups.unshift({ name: 'Guides & strategy', posts: rest })
  return groups
}

export function BlogIndex() {
  useEffect(() => {
    setMeta({
      title: 'BrightSkyIT Blog — Website Costs, Design & Digital Strategy in the Gulf',
      description:
        'Practical guides for business owners in Oman and the UAE: what websites really cost, bilingual Arabic/English strategy, and how to win customers online.',
      path: '/blog/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'BrightSkyIT Blog',
        url: 'https://brightskyit.com/blog/',
        description: 'Website costs, design and digital strategy for businesses in Oman and the Gulf.',
        publisher: { '@type': 'Organization', name: 'BrightSkyIT', url: 'https://brightskyit.com/' },
      },
    })
  }, [])

  const groups = byRegion(POSTS)
  return (
    <div className="site team-site">
      <SiteNav />
      <section className="sec">
        <div className="sec-head">
          <span className="kicker">From the blog</span>
          <h1>Ideas &amp; insight</h1>
          <p>Practical guides for business owners in the Gulf and worldwide — pricing, strategy and what actually works online.</p>
        </div>
        {groups.map((g) => (
          <div className="blog-region" key={g.name}>
            <h2 className="blog-region-title">{g.name} <span className="blog-region-count">{g.posts.length}</span></h2>
            <div className="blog-grid blog-grid-2">
              {g.posts.map((p) => (
                <Link to={`/blog/${p.slug}/`} className="post" key={p.slug}>
                  <span className="post-tag">{p.tag}</span>
                  <h2>{p.title}</h2>
                  <p className="post-desc">{p.description}</p>
                  <span className="post-meta">{p.date} · {p.readMins} min read{(p.city ? ` · ${p.city}` : '')}</span>
                  <span className="post-more">Read article →</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const post = byPostSlug(slug)

  useEffect(() => {
    if (!post) return
    setMeta({
      title: `${post.title} | BrightSkyIT`,
      description: post.description,
      path: `/blog/${post.slug}/`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        author: { '@type': 'Person', name: 'Mohammad Sohag', url: 'https://brightskyit.com/team/mohammad-sohag/' },
        publisher: {
          '@type': 'Organization',
          name: 'BrightSkyIT',
          url: 'https://brightskyit.com/',
          logo: { '@type': 'ImageObject', url: 'https://brightskyit.com/logo.png' },
        },
        mainEntityOfPage: `https://brightskyit.com/blog/${post.slug}/`,
      },
    })
  }, [post])

  if (!post) {
    return (
      <div className="site team-site">
        <SiteNav />
        <section className="sec">
          <div className="empty">Article not found.</div>
          <p style={{ textAlign: 'center' }}><Link className="btn btn-outline" to="/blog/">← All articles</Link></p>
        </section>
      </div>
    )
  }

  // Related reading: deterministic same-country picks the factory computed
  // (post.related holds city slugs). Map them to live article links when the
  // city has one, fill any gaps with other posts in the same country, then any.
  const relatedSlugs = (post.related || [])
    .map((cs) => POSTS.find((p) => p.citySlug === cs && p.slug !== post.slug)?.slug)
    .filter(Boolean)
  const fillers = POSTS.filter(
    (p) => p.slug !== post.slug &&
      !relatedSlugs.includes(p.slug) &&
      (post.cityCountry ? p.cityCountry === post.cityCountry : true)
  ).map((p) => p.slug)
  const related = [...relatedSlugs, ...fillers].slice(0, 3).map((s) => byPostSlug(s))
  // If this article's city is one of the 7 live hubs, surface its landing page too.
  const hub = post.city ? CITIES.find((c) => c.city === post.city) : undefined

  return (
    <div className="site team-site" key={post.slug}>
      <SiteNav />
      <article className="sec article">
        <div className="sec-head article-head">
          <span className="post-tag">{post.tag}</span>
          <h1>{post.title}</h1>
          <p className="post-meta">{post.date} · {post.readMins} min read · by BrightSkyIT</p>
        </div>
        <div className="article-body">
          {post.body.map((b, i) => <Block key={i} b={b} cities />)}
        </div>

        <div className="article-next">
          <h2>Keep reading</h2>
          <div className="city-links-row">
            {related.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}/`} className="city-link-card">
                <span className="post-tag">{p.tag}</span>
                <h3>{p.title}</h3>
                <span className="post-more">Read article →</span>
              </Link>
            ))}
            {hub && (
              <Link to={`/${hub.slug}/`} className="city-link-card">
                <span className="post-tag">{post.cityCountry}</span>
                <h3>Web design in {post.city}</h3>
                <span className="post-more">See the {post.city} page →</span>
              </Link>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}