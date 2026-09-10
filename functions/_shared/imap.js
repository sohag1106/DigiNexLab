// Cloudflare Pages Functions — IMAP mailbox helpers.
//
// ⚠️ IMPORTANT LIMITATION: Cloudflare Workers & Pages Functions block outbound
// raw TCP connections (only HTTPS to allowed hosts, plus Cloudflare-managed
// services like Workers AI / email). Zoho IMAP (imap.zoho.com:993) is a plain
// TCP protocol, so it CANNOT run inside a Worker.
//
// This means the "Mail inbox" module (list / read / mark-read from the Zoho
// INBOX) is NOT available on Cloudflare. SENDING email via Resend still works.
//
// Options if you need the inbox on Cloudflare:
//   - Move inbox fetching to a small external Node server / a Cloudflare
//     Worker with a TCP-tee (paid), or MITM via Cloudflare Email Routing.
//   - Keep the inbox on your own VPS/small box and call it from the Worker.
//
// These functions throw a clear error so the API reports "unsupported", instead
// of silently failing.

export async function listInbox(env, limit = 40) {
  throw new Error('IMAP inbox is not available on Cloudflare Workers (TCP blocked).')
}

export async function readMessage(env, seq, uid) {
  throw new Error('IMAP inbox is not available on Cloudflare Workers (TCP blocked).')
}

export async function markSeen(env, uid) {
  throw new Error('IMAP inbox is not available on Cloudflare Workers (TCP blocked).')
}
