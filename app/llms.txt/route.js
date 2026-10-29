import { SITE_NAME, SITE_DESCRIPTION, siteUrl, CATEGORIES } from '@/lib/site'

export const dynamic = 'force-dynamic'

// llms.txt (llmstxt.org): a concise Markdown guide to the newsroom so LLM
// agents can understand the site and pick the right pages to cite.
export async function GET() {
  const base = siteUrl()

  const sections = CATEGORIES.map(
    (c) => `- [${c.label} news](${base}/section/${c.slug})`
  ).join('\n')

  const md = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} is a Kenyan digital news publisher based in Nairobi. We publish
original reporting across six sections and carry a live wire of headlines from
BBC, CNN, Citizen Digital, Sky News, Al Jazeera and others, each credited and
linked to its original publisher. Stories are free to read; no account is
needed.

## Sections

${sections}

## Useful pages

- [Front page](${base}/): Breaking ticker, lead story, top stories and the live wire
- [Search](${base}/search): Search all published stories
- [RSS feed](${base}/feed.xml): RSS 2.0 feed of the latest 30 articles
- [Sitemap](${base}/sitemap.xml): Full list of indexed pages
- [Terms and content policy](${base}/terms): Syndication and attribution rules
- [Cookies policy](${base}/cookies): How we use cookies

## Style and facts

- Coverage focus: Kenya, East Africa, Africa and world news
- Language: English (en-KE), times shown in Africa/Nairobi
- Contact and authorship: every article shows its author and publication date
`

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
