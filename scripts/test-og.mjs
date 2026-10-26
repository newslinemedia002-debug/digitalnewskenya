import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 20000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
})

const feeds = [
  ['Nation Africa', 'https://nation.africa/kenya/rss.xml'],
  ['The Standard', 'https://www.standardmedia.co.ke/rss/headlines.php'],
  ['BBC News', 'https://feeds.bbci.co.uk/news/rss.xml'],
  ['Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml'],
  ['Tuko (GNews)', 'https://news.google.com/rss/search?q=site:tuko.co.ke&hl=en-KE&gl=KE&ceid=KE:en'],
  ['CNN (GNews)', 'https://news.google.com/rss/search?q=site:cnn.com%20when:24h&hl=en-US&gl=US&ceid=US:en'],
  ['KBC', 'https://www.kbc.co.ke/feed/'],
]

async function resolveOgImage(url) {
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 12000)
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
      redirect: 'follow',
    })
    clearTimeout(timer)
    if (!res.ok) return `HTTP ${res.status}`
    const html = await res.text()
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    return m ? 'IMG' : 'no og:image meta'
  } catch (e) {
    return `ERR ${e.message || e.name}`
  }
}

for (const [name, url] of feeds) {
  try {
    const feed = await parser.parseURL(url)
    const items = (feed.items || []).slice(0, 3)
    const results = []
    for (const item of items) {
      const link = item.link || item.guid
      if (!link) { results.push('no link'); continue }
      const r = await resolveOgImage(link)
      results.push(`${r}`)
    }
    console.log(`${name}: ${results.join(' | ')}`)
  } catch (e) {
    console.log(`${name}: PARSE FAIL ${e.message}`)
  }
}
