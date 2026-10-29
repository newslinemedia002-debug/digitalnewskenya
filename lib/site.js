export const SITE_NAME = 'Digital News Kenya'
export const SITE_TAGLINE = 'Breaking news from Kenya and around the world'
export const SITE_DESCRIPTION =
  'Digital News Kenya brings you breaking news and in-depth coverage from Kenya, Africa and around the world — politics, business, technology, entertainment and more.'

export const CATEGORIES = [
  { slug: 'kenya', label: 'Kenya' },
  { slug: 'world', label: 'World' },
  { slug: 'africa', label: 'Africa' },
  { slug: 'business', label: 'Business' },
  { slug: 'tech', label: 'Technology' },
  { slug: 'entertainment', label: 'Entertainment' },
]

export function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label || 'News'
}

// Per-section SEO copy. Titles/descriptions/keywords are written from what the
// newsroom actually publishes (see docs/SEO-kenya-workflow.md, Step 2b) and
// target the queries Search Console already shows impressions for.
export const SECTION_SEO = {
  kenya: {
    title: 'Kenya News Today — Politics, Nairobi & County Updates',
    description:
      'Kenya news today: politics in Nairobi, county developments, the economy and breaking stories, live from the Digital News Kenya newsroom.',
    keywords: [
      'kenya news today',
      'nairobi news',
      'kenya politics news',
      'kenya breaking news',
      'county news kenya',
      'kindiki news',
    ],
    intro:
      'Politics in Nairobi, county developments, the Kenyan economy and the stories breaking across the country — filed by our newsroom and live from the wire.',
  },
  world: {
    title: 'World News Today — Latest Global Headlines & Analysis',
    description:
      'The latest world news today: global politics, markets and major international stories, updated live on Digital News Kenya.',
    keywords: ['world news today', 'global news', 'world headlines', 'international news today'],
    intro:
      'Global politics, markets and the major international stories, updated live and summarised for readers in Kenya.',
  },
  africa: {
    title: 'Africa News Today — East Africa & Continental Headlines',
    description:
      'Africa news covering East Africa and the wider continent: politics, business, health and culture, from Digital News Kenya.',
    keywords: ['africa news today', 'east africa news', 'african news', 'kenya africa news'],
    intro:
      'East Africa and the wider continent — politics, business, health and culture, with Kenyan context on every story.',
  },
  business: {
    title: 'Kenya Business News — Markets, Banking & Economy Today',
    description:
      'Kenya business news today: banking with Co-op Bank, KCB and Equity, markets, the shilling, startups and the wider economy.',
    keywords: [
      'business news kenya today',
      'kenya business news',
      'business kenya',
      'kenya banking news',
      'nairobi startups',
      'stock market kenya',
    ],
    intro:
      'Banking, markets, startups and the Kenyan economy — Co-op Bank, KCB, Equity, Safaricom and the companies moving the needle.',
  },
  tech: {
    title: 'Kenya Tech News — Startups, Safaricom & Innovation',
    description:
      'Kenya technology news: startups, Safaricom, AI, fintech and innovation from Nairobi’s thriving tech scene.',
    keywords: [
      'kenya tech news',
      'nairobi tech startups',
      'safaricom news',
      'fintech kenya',
      'ai news kenya',
    ],
    intro:
      'Startups, Safaricom, AI, fintech and the Nairobi innovation scene — the technology stories shaping Kenya.',
  },
  entertainment: {
    title: 'Kenya Entertainment News — Music, Film & Celebrity',
    description:
      'Kenya entertainment news: music, film, TV, sport and celebrity updates from Digital News Kenya.',
    keywords: [
      'entertainment news kenya',
      'kenya celebrity news',
      'kenyan music news',
      'kenya film news',
    ],
    intro:
      'Music, film, TV and celebrity — plus the sport and culture moments Kenyans are talking about.',
  },
}

export function sectionSeo(slug) {
  const fallback = categoryLabel(slug)
  return (
    SECTION_SEO[slug] || {
      title: `${fallback} news`,
      description: `The latest ${fallback} stories from Digital News Kenya.`,
      keywords: [`${fallback} news`],
      intro: '',
    }
  )
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
}

export function absUrl(src) {
  if (!src) return null
  if (/^https?:\/\//i.test(src)) return src
  return siteUrl() + (src.startsWith('/') ? src : '/' + src)
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'long',
    timeZone: 'Africa/Nairobi',
  }).format(new Date(iso))
}

export function relativeTime(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) {
    const m = Math.floor(diff / 60)
    return `${m} min ago`
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return h === 1 ? '1 hr ago' : `${h} hrs ago`
  }
  if (diff < 86400 * 7) {
    const d = Math.floor(diff / 86400)
    return d === 1 ? '1 day ago' : `${d} days ago`
  }
  return formatDate(iso)
}
