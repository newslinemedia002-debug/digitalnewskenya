// Read-only diagnosis: which feed sources are enabled, which survive the
// image filter, and what the wire currently stores/displays.
import { readFileSync } from 'node:fs'

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m && !(m[1] in process.env)) {
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1)
    process.env[m[1]] = v
  }
}

const { getFeedSources, fetchRegionFeed, getWireItems } = await import('../lib/feeds.js')
const { createClient } = await import('@supabase/supabase-js')

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

for (const region of ['kenya', 'world']) {
  const sources = await getFeedSources(admin, region)
  console.log(
    `\n[${region}] enabled sources (${sources.length}): ${sources.map((s) => s.name).join(', ')}`
  )

  const t = Date.now()
  const items = await fetchRegionFeed(admin, region, { limit: 12 })
  console.log(`[${region}] fetchRegionFeed -> ${items.length} items in ${Date.now() - t}ms`)
  const bySource = {}
  for (const i of items) bySource[i.source] = (bySource[i.source] || 0) + 1
  console.log(`[${region}] survivors by source:`, JSON.stringify(bySource))

  const stored = await getWireItems(admin, region, { limit: 12 })
  const storedBy = {}
  for (const i of stored) storedBy[i.source] = (storedBy[i.source] || 0) + 1
  console.log(`[${region}] stored/display (${stored.length}):`, JSON.stringify(storedBy))
}
