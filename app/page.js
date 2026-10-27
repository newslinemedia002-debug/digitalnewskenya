import Link from 'next/link'
import { createPublicClient, createAdminClient } from '@/lib/supabase/server'
import {
  getFeatured,
  getBreaking,
  getLatest,
  getByCategory,
} from '@/lib/articles'
import { loadWire } from '@/lib/feeds'
import { CATEGORIES, categoryLabel, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, absUrl } from '@/lib/site'
import StoryCard from '@/components/StoryCard'
import WireCard from '@/components/WireCard'
import MixedGrid, { mixGrid } from '@/components/MixedGrid'
import { wireFor } from '@/lib/wirematch'
import FeedList from '@/components/FeedList'
import BreakingStrip from '@/components/BreakingStrip'
import styles from '@/components/Stories.module.css'

export const revalidate = 600

export async function generateMetadata() {
  const supabase = createPublicClient()
  const [featured, breaking] = await Promise.all([
    getFeatured(supabase),
    getBreaking(supabase),
  ])
  const lead = featured || breaking || (await getLatest(supabase, { limit: 1 }))[0] || null

  const title = lead ? lead.title : `${SITE_NAME} — ${SITE_TAGLINE}`
  const description = lead ? lead.excerpt : SITE_DESCRIPTION
  const image = lead ? absUrl(lead.cover_image_url) : null

  const og = {
    title,
    description,
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_KE',
    ...(image ? { images: [{ url: image, width: 1200, height: 675, alt: lead.title }] } : {}),
  }

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: og,
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

function SectionHead({ title, href }) {
  return (
    <div className={styles.sectionLabel}>
      <h2>{title}</h2>
      {href && <Link href={href}>More {title} →</Link>}
    </div>
  )
}

function EmptySection({ label }) {
  return (
    <div className="empty">
      <h3>Nothing published in {label} yet</h3>
      <p>Published stories will appear here as soon as the newsroom files one.</p>
    </div>
  )
}

/** Wall-clock bucket for the hourly lead rotation. Isolated from the
 *  component body so the render stays lint-clean (react-hooks/purity);
 *  ISR re-evaluates it on every revalidation. */
function currentHourBucket() {
  return Math.floor(Date.now() / 3_600_000)
}

export default async function HomePage() {
  const supabase = createPublicClient()
  // Wire feeds bypass the public read path; writeClient is the same Supabase
  // project so the Next.js data-cache keys stay identical and revalidation
  // remains intact.
  const admin = createAdminClient()

  const [
    featured,
    breaking,
    top,
    kenyaOwn,
    worldOwn,
    africaOwn,
    businessOwn,
    techOwn,
    entOwn,
    kenyaFeed,
    worldFeed,
  ] = await Promise.all([
    getFeatured(supabase),
    getBreaking(supabase),
    getLatest(supabase, { limit: 12 }),
    getByCategory(supabase, 'kenya', { limit: 4 }),
    getByCategory(supabase, 'world', { limit: 4 }),
    getByCategory(supabase, 'africa', { limit: 4 }),
    getByCategory(supabase, 'business', { limit: 4 }),
    getByCategory(supabase, 'tech', { limit: 4 }),
    getByCategory(supabase, 'entertainment', { limit: 4 }),
    loadWire(admin, 'kenya', { limit: 24 }),
    loadWire(admin, 'world', { limit: 24 }),
  ])

  // The lead band rotates hourly between Newswire's own lead and the freshest
  // wire stories, so the top of the page never sits on one story for over an
  // hour even when the newsroom hasn't filed anything new.
  const ownLead = featured || top[0] || null
  const leadPool = [...kenyaFeed.slice(0, 3), ...worldFeed.slice(0, 3)]
    .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
  const leadCandidates = [ownLead, ...leadPool].filter(Boolean)
  const lead = leadCandidates[currentHourBucket() % leadCandidates.length]
  const leadIsWire = Boolean(lead && !lead.slug)

  const stackWire = leadPool.filter((w) => w.id !== lead?.id)
  let stackOwn = top.filter((a) => a.id !== breaking?.id && a.id !== (leadIsWire ? null : lead?.id))
  if (leadIsWire && ownLead && !stackOwn.some((a) => a.id === ownLead.id)) {
    stackOwn = [ownLead, ...stackOwn]
  }
  const leftStack = mixGrid(stackOwn.slice(0, 1), stackWire.slice(0, 1))
  const rightStack = mixGrid(stackOwn.slice(1, 4), stackWire.slice(1, 4))
  const grid = stackOwn.slice(4, 9)

  const splitList = (items) => {
    const half = Math.ceil(items.length / 2)
    return [items.slice(0, half), items.slice(half)]
  }
  // Slice the wire so every section shows different stories: first 3 per
  // region rotate through the lead band, next 8 feed the headline wire bands,
  // then the Kenya / World grids, and whatever is left supplies Business.
  const [kenyaA, kenyaB] = splitList(kenyaFeed.slice(3, 11))
  const [worldA, worldB] = splitList(worldFeed.slice(3, 11))
  const kenyaMix = kenyaFeed.slice(11, 15)
  const worldMix = worldFeed.slice(11, 15)
  const businessTail = wireFor('business', [...kenyaFeed.slice(15), ...worldFeed.slice(15)])
  const businessExtra = wireFor('business', [...kenyaFeed, ...worldFeed]).filter(
    (i) => !businessTail.includes(i)
  )
  const businessWire = [...businessTail, ...businessExtra].slice(0, 8)

  // The breaking bar cycles through the top headlines like a ticker: the
  // flagged breaking story first, then recent own stories, then the wire.
  const seenHrefs = new Set()
  const breakingItems = [
    ...(breaking ? [{ href: `/news/${breaking.slug}`, title: breaking.title }] : []),
    ...top
      .filter((a) => a.id !== lead?.id && a.id !== breaking?.id)
      .slice(0, 3)
      .map((a) => ({ href: `/news/${a.slug}`, title: a.title })),
    ...[...kenyaFeed, ...worldFeed]
      .filter((w) => w.id !== lead?.id)
      .slice(0, 5)
      .map((w) => ({ href: `/wire/${w.id}`, title: w.title })),
  ]
    .filter((i) => {
      if (!i.title || seenHrefs.has(i.href)) return false
      seenHrefs.add(i.href)
      return true
    })
    .slice(0, 6)

  const kenyaGrid = mixGrid(kenyaOwn, kenyaMix)
  const worldGrid = mixGrid(worldOwn, worldMix)
  const businessGrid = mixGrid(businessOwn, businessWire)

  const secondarySections = [
    { slug: 'africa', items: africaOwn },
    { slug: 'tech', items: techOwn },
    { slug: 'entertainment', items: entOwn },
  ].filter((s) => s.items.length > 0)

  return (
    <>
      <div className="container">
        {breakingItems.length > 0 && (
          <div style={{ marginTop: 14 }}><BreakingStrip items={breakingItems} /></div>
        )}

        {lead ? (
          <div className={styles.leadGrid3}>
            <div className={styles.colStack}>
              {leftStack.map((e) =>
                e.wire ? (
                  <WireCard key={`w-${e.item.id}`} item={e.item} variant="card" />
                ) : (
                  <StoryCard key={e.item.id} article={e.item} variant="card" />
                )
              )}
            </div>

            <div className={styles.colStack}>
              {leadIsWire ? (
                <WireCard item={lead} variant="lead" />
              ) : (
                <StoryCard article={lead} variant="lead" />
              )}

              <div className={styles.leadAdvert}>
                <a href="/" aria-label="Newsline Media & Training Agency">
                  <img src="/newsline-ad.jpg" alt="Newsline Media & Training Agency — attachment opportunities" loading="lazy" />
                </a>
              </div>
            </div>

            <div className={styles.colStack}>
              {rightStack.length > 0 ? (
                rightStack.map((e) =>
                  e.wire ? (
                    <WireCard key={`w-${e.item.id}`} item={e.item} variant="compact" />
                  ) : (
                    <StoryCard key={e.item.id} article={e.item} variant="compact" />
                  )
                )
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
                  More published stories will appear in this column.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="empty" style={{ marginTop: 24 }}>
            <h3>The newsroom is warming up</h3>
            <p>No stories have been published yet. Sign in to publish the first one.</p>
          </div>
        )}

        {grid.length > 0 && (
          <section aria-label="Top stories">
            <SectionHead title="Top stories" />
    <div className={styles.topRow}>
      <div className={styles.grid5}>
        {grid.map((a) => (
          <StoryCard key={a.id} article={a} variant="card" />
        ))}
      </div>
    </div>
          </section>
        )}

        <section aria-label="Kenyan headlines">
          <SectionHead title="Kenyan headlines" />
          {kenyaFeed.length > 0 ? (
            kenyaB.length > 0 ? (
              <div className={styles.wireSplit}>
                <FeedList items={kenyaA} withThumbs />
                <FeedList items={kenyaB} withThumbs />
              </div>
            ) : (
              <FeedList items={kenyaA} withThumbs />
            )
          ) : (
            <div className="empty">
              <h3>The Kenyan wire is quiet</h3>
              <p>Feed sources could not be reached just now — check the admin panel.</p>
            </div>
          )}
        </section>

        <section aria-label="Kenya">
          <SectionHead title="Kenya" href="/section/kenya" />
          {kenyaGrid.length > 0 ? (
            <MixedGrid entries={kenyaGrid} />
          ) : (
            <EmptySection label="Kenya" />
          )}
        </section>

        <section aria-label="World headlines">
          <SectionHead title="World headlines" />
          {worldFeed.length > 0 ? (
            worldB.length > 0 ? (
              <div className={styles.wireSplit}>
                <FeedList items={worldA} withThumbs />
                <FeedList items={worldB} withThumbs />
              </div>
            ) : (
              <FeedList items={worldA} withThumbs />
            )
          ) : (
            <div className="empty">
              <h3>The world wire is quiet</h3>
              <p>Feed sources could not be reached just now — check the admin panel.</p>
            </div>
          )}
        </section>

        <section aria-label="World">
          <SectionHead title="World" href="/section/world" />
          {worldGrid.length > 0 ? (
            <MixedGrid entries={worldGrid} />
          ) : (
            <EmptySection label="World" />
          )}
        </section>

        <section aria-label="Business">
          <SectionHead title="Business" href="/section/business" />
          {businessGrid.length > 0 ? (
            <MixedGrid entries={businessGrid} />
          ) : (
            <EmptySection label="Business" />
          )}
        </section>

        {secondarySections.map((s) => (
          <section key={s.slug} aria-label={categoryLabel(s.slug)}>
            <SectionHead title={categoryLabel(s.slug)} href={`/section/${s.slug}`} />
            <div className={styles.grid4}>
              {s.items.map((a) => (
                <StoryCard key={a.id} article={a} variant="card" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
