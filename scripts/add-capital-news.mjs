// Adds the Capital News feed source to the live feed_sources table.
// Run: node scripts/add-capital-news.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv(file) {
  const out = {}
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

const env = loadEnv(join(root, '.env.local'))
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { error } = await admin
  .from('feed_sources')
  .upsert(
    { name: 'Capital News', url: 'https://capitalfm.co.ke/feed/', region: 'kenya', enabled: true },
    { onConflict: 'url' }
  )
if (error) {
  console.error('FAILED:', error.message)
  process.exit(1)
}
console.log('Capital News feed source added (kenya region, enabled)')
