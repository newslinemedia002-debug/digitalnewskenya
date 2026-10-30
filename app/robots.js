import { siteUrl } from '@/lib/site'

const PRIVATE = ['/admin', '/dashboard', '/api/']

// Explicit allow groups for the AI answer engines so ChatGPT, Perplexity,
// Claude, Gemini and Google News can crawl and cite the site. Search/retrieval
// crawlers (OAI-SearchBot, PerplexityBot, Claude-SearchBot, Googlebot-News)
// control visibility in AI answers; the training crawlers (GPTBot, ClaudeBot,
// Google-Extended, CCBot) are separate tokens — we allow those too so nothing
// about the newsroom's public articles is hidden from AI systems.
const AI_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'Googlebot-News',
  'Google-Extended',
  'CCBot',
  'Bytespider',
  'Applebot-Extended',
]

// Bing is the #2 engine in Kenya (~2.6%) and DuckDuckGo, Yahoo and Brave all
// lean on its index, so Bingbot coverage is the whole non-Google game.
// Bing's own guidance is that sites must allow Bingbot in robots.txt for
// IndexNow submissions to pay off, so we name the group explicitly rather
// than relying on it falling through to '*'. adidxbot is Bing's ads crawler
// and DuckDuckBot is DuckDuckGo's residual independent crawler. YandexBot is
// Yandex's only crawler — the '*' group would allow it anyway, but naming it
// keeps the intent readable and survives any future default-rule change.
const SEARCH_CRAWLERS = ['Bingbot', 'adidxbot', 'DuckDuckBot', 'Yahoo! Slurp', 'YandexBot']

export default function robots() {
  return {
    rules: [
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE })),
      ...SEARCH_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE })),
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE,
      },
    ],
    sitemap: [`${siteUrl()}/sitemap.xml`, `${siteUrl()}/sitemap-news.xml`],
  }
}
