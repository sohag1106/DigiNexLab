// Seed the first Owner (super-admin) account.
// Run with: SEED_OWNER_EMAIL=you@example.com npm run seed:owner
// Creates the owner if it doesn't exist, prints the one-time password once,
// and marks the account must_change_password=true.
import { readFileSync, existsSync } from 'fs'
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

function loadEnv() {
  if (!existsSync('.env')) return
  const txt = readFileSync('.env', 'utf8')
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim()
  }
}
loadEnv()

const url = process.env.DATABASE_URL
const email = process.env.SEED_OWNER_EMAIL
if (!url) {
  console.error('DATABASE_URL not set. Copy .env.example -> .env first.')
  process.exit(1)
}
if (!email) {
  console.error('SEED_OWNER_EMAIL not set, e.g. SEED_OWNER_EMAIL=you@example.com')
  process.exit(1)
}

const sql = neon(url)

function randomPassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[(Math.random() * chars.length) | 0]
  return out
}

const password = randomPassword()
const hash = await bcrypt.hash(password, 10)

const rows = await sql('SELECT * FROM users WHERE email = $1', [email])
if (rows.length) {
  console.log(`⚠️  Owner with ${email} already exists — no change made.`)
  process.exit(0)
}

await sql(
  `INSERT INTO users (email, name, designation, role, status, password_hash, must_change_password)
   VALUES ($1, $2, $3, 'owner', 'active', $4, true)`,
  [email, 'BrightSkyIT Owner', 'Owner / Founder', hash]
)

console.log('✅ Owner created.')
console.log('   Email   :', email)
console.log('   Password:', password)
console.log('   (You will set a real password on first login.)')
process.exit(0)
