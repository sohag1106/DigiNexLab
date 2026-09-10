# Migrating BrightSkyIT from Netlify to Cloudflare Pages

This guide covers moving the live site + backend off Netlify (whose production
deploys were paused by credit exhaustion) onto **Cloudflare Pages + Functions**.

- **Hosting / backend:** Cloudflare Pages Functions (repo `functions/`)
- **Database:** Neon Postgres — **unchanged**, still reached via `DATABASE_URL`
- **Email:** Resend — **unchanged** via `RESEND_API_KEY`
- **Frontend:** Vite build → `dist`, SPA served by Pages with `_redirects` fallback

---

## Env variables (set in Cloudflare dashboard, NOT committed)

Cloudflare Dashboard → **Workers & Pages → brightskyit → Settings → Variables and Secrets**:

| Key             | Example                                    |
|-----------------|--------------------------------------------|
| `DATABASE_URL`  | `postgresql://...neon.tech/...` (same as `.env`) |
| `SESSION_SECRET`| your long random string                    |
| `RESEND_API_KEY`| `re_...`                                   |
| `FROM_EMAIL`    | `no-reply@brightskyit.com` (verified Resend sender) |
| `APP_URL`       | e.g. `https://brightskyit.pages.dev`        |
| `CONTACT_TO`    | optional; where contact form mail is sent  |

Set the same values you have in your local `.env`. They are read at runtime from
the function `env` binding.

---

## Build config

- `package.json` `build` = `vite build` → outputs `dist/`.
- `wrangler.toml`: `pages_build_output_dir = "./dist"`, `compatibility_flags = ["nodejs_compat"]`
  (required so `bcryptjs`, `Buffer`, `pdfkit` etc. work).
- `public/_redirects`: SPA fallback `/* /index.html 200`.

---

## Deploy

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name brightskyit
```

Or connect the GitHub repo in the Cloudflare dashboard (**Workers & Pages →
Create → Pages → Connect to Git**) for auto-builds on push; set the same env vars
there.

### First login (owner account)

The database is unchanged but still has no owner seeded. Create it once (works from
this repo; it writes to the same Neon DB):

```bash
# set DATABASE_URL in your shell or .env, then:
SEED_OWNER_EMAIL=you@example.com npm run seed:owner
```

It prints a one-time password; you set a real password on first login.

---

## Local development

```bash
npm run build
npx wrangler pages dev        # serves dist + functions locally (port 8788 by default)
```

Functions read env from the `context.env` binding — locally, put values in a
`.dev.vars` file (git-ignored) for wrangler to load, or run
`npx wrangler pages secret put <KEY>`.

---

## Known limitations on Cloudflare (read these!)

1. **PDF generation (pdfkit) — high risk on free tier.**
   Quote/invoice PDF download and "email PDF" build a PDF with `pdfkit`
   (`functions/_shared/pad.js`). It uses built-in Helvetica fonts (no `.afm`
   loading), which helps, but pdfkit is large and Cloudflare Workers/Pages has
   **module-size and CPU/memory limits** on the free plan. If PDF download or
   email-attach starts failing (500/limit errors), the fix is a **Workers Paid
   plan** or moving PDF generation to a separate service. All other features
   (auth, users, jobs, messages, quotes/invoices CRUD, contact, stats) are unaffected.

2. **Mailbox inbox (Zoho IMAP) — not available on Cloudflare Workers.**
   Cloudflare blocks outbound raw TCP, so fetching the Zoho INBOX
   (`/api/mail/list`, `/read`) cannot run in a Worker. Those endpoints return a
   clear "not available on Cloudflare" error. **Sending mail still works** via
   Resend (`/api/mail/send`). To restore the inbox you'd need a small external
   box/VPS or Cloudflare Email Routing (paid / self-managed).

3. **IMAP inbox** piggybacks on the same TCP limit as above.

Everything else should behave identically to Netlify. See `netlify/` if you ever
need to fall back — it is left intact for reference.
