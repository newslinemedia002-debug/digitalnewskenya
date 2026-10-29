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

export default function robots() {
  return {
    rules: [
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE })),
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE,
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
