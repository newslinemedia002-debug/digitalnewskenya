# Digital News Kenya — AI SEO Workflow

Replication of the 8-step keyword → mapping → architecture → copy → schema → launch
workflow, adapted from the car-rental example to a Kenyan digital news publisher.
Steps 1–2 are estimates to validate in Google Ads Keyword Planner / Search Console;
steps 3–8 are implemented in this repo (file references included).

---

## Step 1 — Keyword research (seed clusters)

Three seed groups, each with Kenya location modifiers:

| Seed group | Modifier pool |
| --- | --- |
| news / breaking news / daily news | Kenya, Nairobi, East Africa, Africa |
| kenya news, nairobi news, kenyan politics | live, today, latest, online |
| world news, business news, tech news | today, headlines, Kenya |

Volume tiers used below: **H** = high (broad head term), **M** = medium
(section-level), **L** = long-tail / low competition.

## Step 2 — Keyword map

| Keyword | Volume | Intent | Page type | Priority |
| --- | --- | --- | --- | --- |
| kenya news | H | Informational | Homepage `/` | P1 |
| breaking news kenya | H | Informational / fresh | Homepage + `/news/[slug]` (Breaking chip) | P1 |
| news kenya / kenyan news | H | Informational | Homepage | P1 |
| nairobi news | M | Informational | `/section/kenya` | P1 |
| kenya politics news | M | Informational | `/section/kenya` | P2 |
| kenya business news / kenya markets | M | Informational | `/section/business` | P1 |
| kenya technology news / startups kenya | M | Informational | `/section/tech` | P1 |
| africa news | M | Informational | `/section/africa` | P2 |
| world news today | H | Informational | `/section/world` | P2 |
| entertainment news kenya / kenya celebrity | L | Informational | `/section/entertainment` | P3 |
| digital news kenya (brand) | L | Navigational | Homepage / brand meta | P1 |
| news near me / news live now | M | Informational | Homepage (breaking ticker, live wire) | P3 |
| search kenya news | L | Transactional-ish | `/search?q=` (SearchAction sitelinks box) | P2 |

Every P1/P2 keyword above is wired to exactly one page — no page targets two
competing clusters (one H1 per page, section H1 = section label).

## Step 2b — Keywords harvested from live content + Search Console

Batch two, derived from what the newsroom has actually published and from the
queries Google already shows us for. Search Console positions (first 24 h of
data, 29 Oct 2026):

| Live query we already rank for | Position | Verdict |
| --- | --- | --- |
| trump administration kicks out cuban diplomat… | 8.0 | Page 1 — news queries work |
| the new frontier for ads is racist cartoon ai… | 10.0 | Page 1 — wire headlines index fast |
| business news kenya today | 45.0 | Page 5 → target of the new `/section/business` title |
| business kenya | 74.0 | Page 8 → same page, keyword-rich title + intro |
| digital newspaper kenya | 92.0 | Page 10 → brand/head term added to site meta |

New clusters from live headlines, mapped to their target pages:

| Cluster | Example query | Target page |
| --- | --- | --- |
| Kindiki / Ruto / 2027 politics | "kindiki ruto 2027" | `/section/kenya` (title + intro) |
| Nairobi banking — Co-op, KCB, Equity | "co-op bank leads kcb equity" | `/section/business` |
| Nairobi startups & venture funding | "nairobi startups funding" | `/section/tech` + `/section/business` |
| Safaricom (jobs, AI deepfakes, promotions) | "safaricom news" | `/section/tech` |
| ICT / media attachment & training | "ict attachment opportunities kenya" | own articles (`/news/[slug]`) |
| Rugby — Impala Floodlit | "impala floodlit 2026" | own article + `/section/entertainment` |
| Digital literacy programme | "kenya digital literacy programme" | `/section/kenya` / `/section/tech` |
| Kenya–Russia / global markets | "kenya russia economic ties" | `/section/world` + `/section/business` |

Applied in code: `SECTION_SEO` in `lib/site.js` gives every section a
query-shaped `<title>`, meta description, keywords list and an intro paragraph
rendered under the H1.

**Honest note on the `keywords` meta tag:** Google ignores it — it carries no
ranking weight. It is kept for other engines and as documentation. The tags
that actually move rankings are `<title>`, the H1, the intro copy, and having
pages that match intent; those are where this batch is applied.

**What actually closes a page-5 → page-1 gap** (in rough order): exact-match
intent in the title/H1 (done above), more depth than the incumbent (news +
analysis, 600+ words), internal links from the homepage wire bands (already
wired), backlinks from credible Kenyan domains, consistent publishing cadence,
and time — a 1-day-old domain climbs in weeks, not hours.

## Step 3 — Site architecture (implemented)

```
/                              → P1: "kenya news" + brand (lead band, breaking ticker)
/section/kenya                 → P1: "nairobi news", "kenya politics"
/section/world|africa|business|tech|entertainment → one cluster each
/news/[slug]                   → long-tail article queries (NewsArticle schema)
/wire/[id]                     → on-site RSS reads, publisher credited
/search?q=                     → SearchAction target (sitelinks search box)
/feed.xml                      → RSS 2.0 for Google News-style readers
/sitemap.xml  /robots.txt      → crawl surface
/login /dashboard /admin       → blocked in robots.txt
/terms /cookies                → trust/E-E-A-T pages, in sitemap
```

## Step 4 — Content model (CMS equivalent)

`supabase/migrations/00001_init.sql` — `articles`: title, slug, excerpt, content,
category (6 sections), cover image, author, `is_breaking`, status, published/updated
timestamps. Titles + excerpts feed meta descriptions, OG tags and JSON-LD
automatically, so editors get SEO fields for free by filling the normal form.
`00002_wire_items.sql` — `wire_items`: RSS cache (headline, source, image, dates)
for the live wire bands.

## Step 5 — Templates & hierarchy

- Homepage `app/page.js`: `h1` implied by site title, `h2` per section, `h3` on cards.
- Section `app/section/[category]/page.js`: single `h1` = section label; grid `h3`s.
- Article `app/news/[slug]/page.js`: `h1` = headline (Breaking chip when flagged),
  `h2` Related stories; standfirst `p`, semantic `<time>`, breadcrumbs.
- Theme, advert slot and rotating breaking ticker already in components.

## Step 6 — Schema markup (JSON-LD, implemented)

| Schema | Where | File |
| --- | --- | --- |
| NewsMediaOrganization + WebSite + SearchAction | every page | `app/layout.js` |
| NewsArticle (headline, dates, author, publisher, image) | article pages | `app/news/[slug]/page.js` |
| BreadcrumbList | article + section pages | `app/news/[slug]/page.js`, `app/section/[category]/page.js` |
| Article/NewsArticle variant for wire items | wire pages | `app/wire/[id]/page.js` |

Google verification token: `public/google363e6b1edc90e531.html`
(`google-site-verification: google363e6b1edc90e531.html`).

## Step 7 — Copy guidelines (E-E-A-T)

- Titles ≤ 60 chars, unique per page, keyword front-loaded, `| Digital News Kenya` suffix on sections.
- Meta descriptions 140–160 chars, written as promises to the reader, not keyword lists.
- Body copy natural; bylines real names; dates visible and in schema; every wire story
  credits its publisher on `/wire/[id]` (attribution = trust signal).
- No keyword stuffing — section pages use the section label once in H1 and once in copy.

## Step 8 — Launch checklist

1. [ ] DNS points at the host; `NEXT_PUBLIC_SITE_URL` set to the production origin.
2. [ ] Google Search Console property verified via `google363e6b1edc90e531.html` (file is live).
3. [ ] Submit `https://<domain>/sitemap.xml` in Search Console; confirm `robots.txt` allows `/`, blocks `/admin` + `/dashboard`.
4. [ ] Validate JSON-LD in Rich Results Test / schema.org validator (org, website, article, breadcrumbs).
5. [ ] First crawl: check index coverage, core web vitals, and that `/feed.xml` renders.

---

### Deliverables summary

1. Keyword map → Step 2 table.
2. Site structure → Step 3 tree.
3. Page copy → meta titles/descriptions in `app/layout.js`, `app/page.js`,
   `app/section/[category]/page.js`, `app/search/page.js` (edit content in the dashboard,
   SEO fields derive automatically).
4. Schema snippets → Step 6 table (live in the files listed).
5. Launch checklist → Step 8.

## Step 9 — AI visibility (being cited by ChatGPT, Gemini, Perplexity, AI Mode)

- **`/llms.txt`** (`app/llms.txt/route.js`) — Markdown guide to the newsroom in the
  llmstxt.org format: what we cover, section links, RSS and legal pages.
- **`robots.txt`** (`app/robots.js`) — explicit allow groups for the AI crawlers:
  `OAI-SearchBot` + `ChatGPT-User` (ChatGPT search), `PerplexityBot`,
  `Claude-SearchBot`/`Claude-User`, `Googlebot-News`, plus the training crawlers
  (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Bytespider`) so nothing
  public is hidden from AI systems. Private areas stay disallowed for all.
- **Google Preferred Sources button** (`components/PreferredSource.js`, rendered in
  the footer) — Google's official `google-add-preferred-source-btn`; readers who click
  it rank us first in Top Stories and get us highlighted in AI Mode / AI Overviews.
  Eligibility: domain-level sites only, and the property must be opted into Google's
  generative AI features. Fallback link: `google.com/preferences/source?q=digitalnewskenya.co.ke`.
- **No special "AI schema" exists** — Google states AI Overviews/AI Mode use normal
  Search eligibility, so indexability + NewsArticle/Breadcrumb schema (Step 6) is the
  real mechanism. Do not add `nosnippet`/`noimageindex` anywhere.
- **Measuring:** AI traffic lands in Search Console's Web search type; Bing Webmaster
  Tools has an AI Performance report with citation counts.

## Step 10 — Discovery & preview additions (second research pass)

| Addition | Where | Why |
| --- | --- | --- |
| Google News sitemap `/sitemap-news.xml` | `app/sitemap-news.xml/route.js` | Rolling 48-hour window with `news:` publication/title/date tags; declared as a second `Sitemap:` line in `robots.js`, submit in Search Console |
| Robots preview hints | `app/layout.js` metadata | `max-image-preview:large` (Discover/image previews), `max-snippet:-1` (Google chooses snippet length; also applies to AI Overviews/AI Mode input) |
| IndexNow | `lib/indexnow.js` + `public/{key}.txt` | Ping on publish/approve from dashboard + admin actions so Bing, Naver, Seznam, Yandex and Yep learn new URLs instantly (Google does not participate) |
| RSS autodiscovery | `alternates.types` on layout + every page that sets its own `alternates` | `<link rel="alternate" type="application/rss+xml">` in `<head>` for readers/feed readers |
| Descriptive image alt text | StoryCard, WireCard, FeedList, HeadlineRow | Card thumbnails now carry the headline as alt — image SEO + accessibility |

**Deliberately skipped after research:** speakable schema (Assistant-only beta), a web
manifest for Discover (Google says no manifest requirement), blanket VideoObject
markup (only for real watch pages), C2PA (not a ranking factor). Google also states
`llms.txt` is ignored for Google ranking — it stays for other AI systems.

**After deploy:** submit `/sitemap-news.xml` in Search Console → Sitemaps.

