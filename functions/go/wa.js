// GET /go/wa?c=<city>&p=<page>&t=<prefilled message>
//
// Tracking redirect for every public WhatsApp CTA. Logs the tap (which city,
// which page, which button), then 302s the visitor to the normal
// wa.me/BrightSkyIT click-to-chat link with the same prefilled message.
//
// The customer experience is unchanged — they land in WhatsApp either way —
// but now every tap is measurable: Search Console can never show WhatsApp
// clicks because they leave the site, so this redirect is the funnel's only
// analytics endpoint.
//
// Hard rule: logging must NEVER block or break the redirect. Any DB failure
// is swallowed and the visitor still goes to WhatsApp.

import { query } from '../_shared/db.js'

const CHAT = 'https://wa.me/BrightSkyIT'
const DEFAULT_TEXT = encodeURIComponent(
  "Hi BrightSkyIT! I found you on your website - I'd like a quote."
)

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const city = (url.searchParams.get('c') || '').slice(0, 60)
  const page = (url.searchParams.get('p') || '').slice(0, 200)
  const placement = (url.searchParams.get('s') || '').slice(0, 40)
  const text = url.searchParams.get('t')

  try {
    await query(env,
      `INSERT INTO wa_clicks (city, page, placement, user_agent) VALUES ($1, $2, $3, $4)`,
      [city || null, page || null, placement || null, (request.headers.get('user-agent') || '').slice(0, 300)]
    )
  } catch (e) {
    // Fail open — an unlogged tap beats a lost lead, but never a broken redirect.
    console.error('wa_clicks log failed:', e?.message || e)
  }

  // `text` arrives decoded by searchParams; re-encode for wa.me.
  const href = text ? `${CHAT}?text=${encodeURIComponent(text)}` : `${CHAT}?text=${DEFAULT_TEXT}`
  return Response.redirect(href, 302)
}
