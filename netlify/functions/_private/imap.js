// IMAP helpers using imapflow — open/short-lived connections per request.
import { ImapFlow } from 'imapflow'

const IMAP_HOST = process.env.IMAP_HOST || 'imap.zoho.com'
const USER = process.env.MAIL_USER
const PASS = process.env.MAIL_PASS

// Fetch the latest `limit` messages from INBOX with headers + uid list.
export async function listInbox(limit = 40) {
  if (!USER || !PASS) throw new Error('Mailbox not configured (set MAIL_USER / MAIL_PASS).')
  const client = new ImapFlow({ host: IMAP_HOST, port: 993, secure: true, auth: { user: USER, pass: PASS }, logger: false })
  await client.connect()
  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      const status = await client.status('INBOX', { messages: true, unseen: true })
      const total = status.messages || 0
      const from = Math.max(1, total - limit + 1)
      const list = []
      // Fetch in reverse (newest first)
      for (let seq = total; seq >= Math.max(1, total - limit + 1); seq--) {
        if (seq < 1) break
        const msg = await client.fetchOne(seq, {
          envelope: true,
          internalDate: true,
          flags: true,
          uid: true,
          source: false,
        })
        if (!msg) continue
        list.push(toSummary(msg, seq))
      }
      return { total, unseen: status.unseen || 0, messages: list }
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
  }
}

export async function readMessage(seq, uid) {
  if (!USER || !PASS) throw new Error('Mailbox not configured (set MAIL_USER / MAIL_PASS).')
  const client = new ImapFlow({ host: IMAP_HOST, port: 993, secure: true, auth: { user: USER, pass: PASS }, logger: false })
  await client.connect()
  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      let msg
      if (uid) msg = await client.fetchOne(uid, { envelope: true, bodyStructure: true, source: true, flags: true, uid: true, internalDate: true }, { uid: true })
      else msg = await client.fetchOne(seq, { envelope: true, bodyStructure: true, source: true, flags: true, uid: true, internalDate: true })
      if (!msg) return null
      const sr = await client.download(seq, { uid: !!uid })
      await sr.stream.destroy().catch(() => {})
      return toFull(msg, sr.content || '')
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
  }
}

export async function markSeen(uid) {
  if (!USER || !PASS) return
  const client = new ImapFlow({ host: IMAP_HOST, port: 993, secure: true, auth: { user: USER, pass: PASS }, logger: false })
  await client.connect()
  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
    } finally { lock.release() }
  } finally {
    await client.logout()
  }
}

function toSummary(msg, seq) {
  const env = msg.envelope || {}
  const from = (env.from && env.from[0]) ? `${env.from[0].name || ''} <${env.from[0].address}>`.trim() : ''
  return {
    seq,
    uid: msg.uid,
    subject: (env.subject || '(no subject)').slice(0, 200),
    from,
    date: msg.internalDate ? msg.internalDate.toISOString() : null,
    seen: !!(msg.flags && msg.flags.includes('\\Seen')),
  }
}

function toFull(msg, raw) {
  const env = msg.envelope || {}
  const from = (env.from && env.from[0]) ? { name: env.from[0].name, address: env.from[0].address } : null
  const to = (env.to || []).map((t) => `${t.name ? t.name + ' ' : ''}<${t.address}>`).join(', ')
  // basic text extraction: keep it lightweight (raw + headers). Full MIME parsing
  // can be added later; this returns raw source and a text snippet.
  return {
    seq: msg.seq,
    uid: msg.uid,
    subject: env.subject || '(no subject)',
    from,
    to,
    date: msg.internalDate ? msg.internalDate.toISOString() : null,
    seen: !!(msg.flags && msg.flags.includes('\\Seen')),
    text: rawText(raw),
  }
}

// Very small heuristic to pull a readable text body from raw message source.
function rawText(raw) {
  if (!raw) return ''
  const idx = raw.indexOf('\r\n\r\n')
  const body = idx >= 0 ? raw.slice(idx + 4) : raw
  const plainMatch = body.match(/text\/plain[^\r\n]*\r?\n\r?\n([\s\S]*?)(--|$)/)
  if (plainMatch) return plainMatch[1].slice(0, 4000)
  return body.replace(/<[^>]*>/g, '').slice(0, 4000)
}
