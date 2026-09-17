// /blog — index of articles, and /blog/:slug — one article.
// Posts are long-form, genuinely useful content that feeds the city pages.
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { POSTS, byPostSlug } from './blog-data'
import { Block } from './CityPage'
import { setMeta } from '../../lib/meta'
import SiteNav from './SiteNav'
import './landing.css'

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

  return (
    <div className="site team-site">
      <SiteNav />
      <section className="sec">
        <div className="sec-head">
          <span className="kicker">From the blog</span>
          <h1>Ideas &amp; insight</h1>
          <p>Practical guides for business owners in Oman and the Gulf — pricing, strategy and what actually works online.</p>
        </div>
        <div className="blog-grid blog-grid-2">
          {POSTS.map((p) => (
            <Link to={`/blog/${p.slug}/`} className="post" key={p.slug}>
              <span className="post-tag">{p.tag}</span>
              <h2>{p.title}</h2>
              <p className="post-desc">{p.description}</p>
              <span className="post-meta">{p.date} · {p.readMins} min read</span>
              <span className="post-more">Read article →</span>
            </Link>
          ))}
        </div>
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
            {POSTS.filter((p) => p.slug !== post.slug).map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}/`} className="city-link-card">
                <span className="post-tag">{p.tag}</span>
                <h3>{p.title}</h3>
                <span className="post-more">Read article →</span>
              </Link>
            ))}
            <Link to="/web-design-muscat/" className="city-link-card">
              <span className="post-tag">🇴🇲 Muscat</span>
              <h3>Web design in Muscat, Oman</h3>
              <span className="post-more">See the Muscat page →</span>
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
