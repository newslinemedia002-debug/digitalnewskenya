import { createClient } from '@supabase/supabase-js'
import { SITE_NAME, siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
)

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Google News sitemap: only articles from the last 48 hours, with the
// news: metadata Google expects (publication name/language, original
// publication date, title). Declared in robots.txt; submit it in Search
// Console too. Requirements: developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
export async function GET() {
  const base = siteUrl()
  const since = Date.now() - 48 * 3600 * 1000

  let articles = []
  try {
    const { data } = await supabase
      .from('articles')
      .select('title, slug, published_at, updated_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1000)

    // Filter the 48-hour window here rather than in the query: rows are
    // published through the dashboard and some carry only updated_at, so a
    // published_at >= since filter silently produced an empty sitemap and
    // Search Console reported it as an error.
    articles = (data || []).filter((a) => {
      const t = Date.parse(a.published_at || a.updated_at || '')
      return Number.isFinite(t) && t >= since
    })
  } catch {
    articles = []
  }

  const items = articles
    .map(
      (a) => `  <url>
    <loc>${base}/news/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(SITE_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.published_at || a.updated_at).toISOString()}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  })
}
