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
  ['KBC', 'https://www.kbc.co.ke/feed/'],
  ['The Standard', 'https://www.standardmedia.co.ke/rss/headlines.php'],
  ['Nation Africa', 'https://nation.africa/kenya/rss.xml'],
  ['Citizen Digital', 'https://citizen.digital/feed.xml'],
  ['Tuko (GNews)', 'https://news.google.com/rss/search?q=site:tuko.co.ke&hl=en-KE&gl=KE&ceid=KE:en'],
  ['Star Kenya (GNews)', 'https://news.google.com/rss/search?q=site:the-star.co.ke&hl=en-KE&gl=KE&ceid=KE:en'],
  ['BBC News', 'https://feeds.bbci.co.uk/news/rss.xml'],
  ['CNN (GNews)', 'https://news.google.com/rss/search?q=site:cnn.com%20when:24h&hl=en-US&gl=US&ceid=US:en'],
  ['Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml'],
  ['Sky News', 'https://feeds.skynews.com/feeds/rss/home.xml'],
]

function rssImage(item) {
  if (item.enclosure?.url) return item.enclosure.url
  const media = item['media:content'] || item['media:thumbnail']
  if (media) {
    if (typeof media === 'string' && /^https?:/.test(media)) return media
    if (media.$?.url) return media.$.url
    if (media.url) return media.url
  }
  const html = item['content:encoded'] || item.content || ''
  const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i)
  return m ? m[1] : null
}

await Promise.all(
  feeds.map(async ([name, url]) => {
    const t = Date.now()
    try {
      const feed = await parser.parseURL(url)
      const items = feed.items || []
      const withImg = items.filter((i) => rssImage(i)).length
      console.log(
        `OK   ${name}: ${items.length} items, ${withImg} with inline image (${Date.now() - t}ms)`
      )
    } catch (e) {
      console.log(`FAIL ${name}: ${e.message} (${Date.now() - t}ms)`)
    }
  })
)
