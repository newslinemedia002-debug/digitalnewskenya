// Reports how many published articles lack a cover image, and wire items too.
// Run: node scripts/check-images.mjs
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
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: arts, error } = await admin
  .from('articles')
  .select('id, title, category, status, cover_image_url')
  .eq('status', 'published')
if (error) { console.error(error.message); process.exit(1) }
const noImg = arts.filter((a) => !a.cover_image_url)
console.log(`Published articles: ${arts.length}, without cover image: ${noImg.length}`)
for (const a of noImg) console.log(`  - [${a.category}] ${a.title}`)

const { data: wire } = await admin
  .from('wire_items')
  .select('id, title, region, image_url')
const noWire = (wire || []).filter((w) => !w.image_url)
console.log(`Wire items: ${(wire || []).length}, without image: ${noWire.length}`)
for (const w of noWire.slice(0, 10)) console.log(`  - [${w.region}] ${w.title}`)
