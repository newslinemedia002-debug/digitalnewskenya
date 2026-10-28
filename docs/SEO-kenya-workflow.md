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
