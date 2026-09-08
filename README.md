# BrightSkyIT — Agency Website + Internal Portal

A high-end creative digital agency website plus a full internal portal (login,
admin panel, quotations/invoices on a branded BrightSkyIT pad, job assignment,
internal messaging) for BrightSkyIT.

## Stack

- **Frontend:** React 18 + Vite (single app: public site + `/portal/*` SPA routes)
- **Backend:** Netlify Functions (REST API under `/.netlify/functions`)
- **Database:** Neon Postgres (serverless)
- **Email:** Resend (invite OTPs, job notifications, quote/invoice sends, contact form)
- **PDF:** pdfkit (branded BrightSkyIT pad for quotations & invoices)

## Local setup

1. `npm install`
2. Copy `.env.example` → `.env` and fill in your real values
   (never commit `.env`).
3. Migrate the database + seed the Owner account:
   - `npm run functions:setup` — creates all tables (idempotent)
   - `npm run seed:owner` — creates the initial Owner login (reads `SEED_OWNER_EMAIL`
     / prints the generated password; see below)
4. Run locally: `netlify dev` (serves both Vite and the functions with the
   proxy) — or `npm run dev` for Vite alone.

## Environment variables

See `.env.example`. Keys: `DATABASE_URL`, `RESEND_API_KEY`, `FROM_EMAIL`,
`SESSION_SECRET`, `APP_URL`. Set the same keys on Netlify.

> **Owners:** `FROM_EMAIL` must be a sender verified in your Resend account
> (e.g. `no-reply@yourdomain.com` after verifying the domain in Resend).
> All invitation / notification / invoice emails are sent from it.

## Seeding the first Owner

Before anyone can log in, create the super-admin. Run:

```
SEED_OWNER_EMAIL=you@example.com npm run seed:owner
```

It sets a random password, prints it once, and marks the account
`must_change_password` so you'll set a real password on first login.

## Deploy

Push to GitHub; Netlify auto-builds (`npm run build` → `dist`). Set the env
vars in Netlify → Site settings → Environment variables.
