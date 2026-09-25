// WhatsApp CTA helper: every public WhatsApp button points at /go/wa instead
// of wa.me directly. The Pages Function logs the tap (city, page, placement)
// and 302s to the exact same wa.me/BrightSkyIT chat with the same prefilled
// message, so nothing changes for the visitor — but each button now reports
// which page produced the lead.
//
// page: bake in a specific path (articles know their own slug; the value is
//     also correct in prerendered HTML). When omitted, falls back to the
//     current window.location.pathname at render time — prerender's JSDOM
//     sets the real route URL, so static builds get the right page too.

export function waGo({ city = '', placement = '', page, text = '' } = {}) {
  const path = page ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  // On a hub page (/web-design-<city>), infer the city when the caller didn't
  // pass one, so the floating button and nav CTA are attributed per city too.
  const inferred = /^\/(web-design-[a-z0-9-]+)\/?$/.exec(path)?.[1] || ''
  const q = new URLSearchParams()
  if (city || inferred) q.set('c', city || inferred)
  q.set('p', path)
  if (placement) q.set('s', placement)
  if (text) q.set('t', text)
  return `/go/wa?${q.toString()}`
}

export const WA_DEFAULT_TEXT =
  "Hi BrightSkyIT! I found you on your website - I'd like a quote."
