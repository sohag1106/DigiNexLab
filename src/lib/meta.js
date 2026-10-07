// Document meta management for SPA routes: title, description, canonical,
// OG/Twitter tags and per-route JSON-LD. Keeps one json-ld script element
// per key so re-navigations never pile up duplicate structured data.

const BASE = 'https://brightskyit.com'
const JSONLD_ID = 'route-jsonld'

function upsertMeta(attr, key, content) {
  if (content === undefined || content === null) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Canonical URL for a route.
//
// The site serves trailing-slash URLs: Cloudflare Pages answers the slashless
// form of a prerendered directory with a 308 to the slashed one (/team → /team/,
// see public/_redirects). A canonical that pointed at the slashless form would
// therefore point at a redirect, and the sitemap — which lists the slashed form
// — would disagree with the page. Both hang off this one function so every
// route emits a canonical that is byte-identical to its sitemap entry.
export function canonicalUrl(path = '') {
  const clean = path.split('#')[0].split('?')[0]
  if (!clean || clean === '/') return `${BASE}/`
  // A path with no extension is a directory URL — canonicalise it with a
  // trailing slash. Anything with a file extension (rss.xml, a .jpg …) is a
  // real file and must keep its exact form.
  const isFile = /\.[a-z0-9]+$/i.test(clean)
  const withSlash = clean.endsWith('/') ? clean : `${clean}/`
  return `${BASE}${isFile ? clean : withSlash}`
}

// Portal/auth pages are private. robots.txt keeps most crawlers out, but a
// page a crawler does reach (a shared link, a fetch, an agent that renders the
// JS) still has to declare itself unindexable — and robots.txt cannot carry a
// noindex, only a block. Google has to be able to *fetch* a page to honour a
// noindex, so this complements the robots.txt Disallow rather than replacing
// it. Also drops the canonical: these URLs have no canonical form.
export function setNoIndex() {
  let el = document.head.querySelector('meta[name="robots"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', 'robots')
    document.head.appendChild(el)
  }
  el.setAttribute('content', 'noindex, nofollow, noarchive')
  document.head.querySelector('link[rel="canonical"]')?.remove()
}

export function setMeta({ title, description, path = '', image, imageAlt, imageWidth, imageHeight, jsonLd }) {
  if (title) document.title = title
  if (description) {
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:description', description)
    upsertMeta('name', 'twitter:description', description)
  }
  if (title) {
    upsertMeta('property', 'og:title', title)
    upsertMeta('name', 'twitter:title', title)
  }
  const url = canonicalUrl(path)
  upsertLink('canonical', url)
  upsertMeta('property', 'og:url', url)
  if (image) {
    const img = image.startsWith('http') ? image : `${BASE}${image}`
    upsertMeta('property', 'og:image', img)
    upsertMeta('name', 'twitter:image', img)
    // Alt text for the preview image — read by Google Images and by screen
    // readers on shared links. Dimensions are upserted too so route images
    // (e.g. the 900x900 founder headshot) override the static head defaults.
    if (imageAlt) {
      upsertMeta('property', 'og:image:alt', imageAlt)
      upsertMeta('name', 'twitter:image:alt', imageAlt)
    }
    if (imageWidth && imageHeight) {
      upsertMeta('property', 'og:image:width', String(imageWidth))
      upsertMeta('property', 'og:image:height', String(imageHeight))
    }
  }
  // Route-scoped structured data (Person, Article, …). The head's static
  // @graph in index.html stays untouched — this replaces only this element.
  let script = document.getElementById(JSONLD_ID)
  if (!jsonLd) {
    if (script) script.remove()
    return
  }
  if (!script) {
    script = document.createElement('script')
    script.id = JSONLD_ID
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(jsonLd)
}
