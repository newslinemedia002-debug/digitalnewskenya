import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createPublicClient, createAdminClient } from '@/lib/supabase/server'
import { getByCategory, LIST_FIELDS } from '@/lib/articles'
import { loadWire } from '@/lib/feeds'
import { wireFor } from '@/lib/wirematch'
import { CATEGORIES, categoryLabel, SITE_NAME, siteUrl } from '@/lib/site'
import MixedGrid, { mixGrid } from '@/components/MixedGrid'
import styles from '@/components/Stories.module.css'

export const revalidate = 600

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }) {
  const { category } = await params
  const label = categoryLabel(category)
  return {
    title: `${label} news — latest ${label} headlines`,
    description: `The latest ${label} stories, analysis and breaking news from Kenya and around the world, live from ${SITE_NAME}.`,
    keywords: [`${label} news`, `${label} news Kenya`, `${label} headlines`, 'Kenya news'],
    alternates: { canonical: `/section/${category}` },
    openGraph: {
      title: `${label} news`,
      description: `The latest ${label} stories, analysis and breaking news from ${SITE_NAME}.`,
      url: `/section/${category}`,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_KE',
    },
  }
}

const PAGE_SIZE = 18

export default async function SectionPage({ params, searchParams }) {
  const { category } = await params
  if (!CATEGORIES.some((c) => c.slug === category)) notFound()

  const sp = await searchParams
  const page = Math.max(1, parseInt(sp?.page || '1', 10) || 1)

  const supabase = createPublicClient()
  const admin = createAdminClient()
  const from = (page - 1) * PAGE_SIZE

  // Sections show Newswire stories AND the live wire: kenya/world read their
  // own region pool, every other tab filters both pools by keyword.
  const wireRegions = category === 'world' ? ['world'] : ['kenya']
  const wirePools = await Promise.all(
    (category === 'kenya' || category === 'world' ? wireRegions : ['kenya', 'world']).map((r) =>
      loadWire(admin, r, { limit: 48 })
    )
  )
  const wireItems = wireFor(category, wirePools.flat()).slice(0, PAGE_SIZE)

  const [{ data }, { count }] = await Promise.all([
    supabase
      .from('articles')
      .select(LIST_FIELDS)
      .eq('status', 'published')
      .eq('category', category)
      .order('published_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .eq('category', category),
  ])

  const articles = data || []
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE))
  const label = categoryLabel(category)
  // Page 1 interleaves the wire; deeper pages stay article-only pagination.
  const entries = page === 1 ? mixGrid(articles, wireItems) : articles.map((a) => ({ wire: false, item: a }))

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl() },
      {
        '@type': 'ListItem',
        position: 2,
        name: label,
        item: `${siteUrl()}/section/${category}`,
      },
    ],
  }

  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <h1 className="sectionTitle" style={{ marginTop: 24 }}>
        {label}
      </h1>

      {entries.length === 0 ? (
        <div className="empty">
          <h3>No {label} stories yet</h3>
          <p>Check the front page, or come back soon — the newsroom is on it.</p>
          <p style={{ marginTop: 12 }}>
            <Link href="/" className="btn btnGhost btnSmall">Back to the front page</Link>
          </p>
        </div>
      ) : (
        <MixedGrid entries={entries} className={styles.grid3} />
      )}

      {totalPages > 1 && (
        <nav className={styles.pager} aria-label="Pagination">
          {page > 1 && (
            <Link href={`/section/${category}?page=${page - 1}`} className="btn btnGhost btnSmall">
              ← Previous
            </Link>
          )}
          <span className={styles.pagerInfo}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/section/${category}?page=${page + 1}`} className="btn btnGhost btnSmall">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
