import { createClient } from '@supabase/supabase-js'
import { CATEGORIES, siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
)

export default async function sitemap() {
  const base = siteUrl()

  let articles = []
  try {
    const { data } = await supabase
      .from('articles')
      .select('slug, category, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1000)
    articles = data || []
  } catch {
    articles = []
  }

  // Real lastmod values only. Bing treats <lastmod> as a recrawl signal and
  // explicitly ignores changefreq/priority, so we date the pages we can date
  // honestly — the freshest article on the site for the homepage, the
  // freshest article in each section for that section — and leave the
  // undateable static pages blank rather than stamping build time.
  const stamp = (a) => a?.updated_at || a?.published_at || undefined
  const freshest = new Map()
  for (const a of articles) {
    const t = Date.parse(stamp(a) || '') || 0
    for (const key of ['', a.category]) {
      const cur = freshest.get(key)
      if (!cur || t > cur.t) freshest.set(key, { t, a })
    }
  }
  const lastmod = (key) => stamp(freshest.get(key)?.a)

  const staticEntries = [
    { url: base, changeFrequency: 'hourly', priority: 1, lastModified: lastmod('') },
    ...CATEGORIES.map((c) => ({
      url: `${base}/section/${c.slug}`,
      changeFrequency: 'hourly',
      priority: 0.8,
      lastModified: lastmod(c.slug),
    })),
    { url: `${base}/search`, changeFrequency: 'weekly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/cookies`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  return [
    ...staticEntries,
    ...articles.map((a) => ({
      url: `${base}/news/${a.slug}`,
      lastModified: a.updated_at || a.published_at,
      changeFrequency: 'daily',
      priority: 0.7,
    })),
  ]
}
