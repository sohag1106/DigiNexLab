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

export function setMeta({ title, description, path = '', image, jsonLd }) {
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
  const url = `${BASE}${path}`
  upsertLink('canonical', url)
  upsertMeta('property', 'og:url', url)
  if (image) {
    const img = image.startsWith('http') ? image : `${BASE}${image}`
    upsertMeta('property', 'og:image', img)
    upsertMeta('name', 'twitter:image', img)
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
