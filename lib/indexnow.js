import { siteUrl } from './site'

// IndexNow key — public by design; must match the file
// public/{INDEXNOW_KEY}.txt (protocol: www.indexnow.org/documentation).
export const INDEXNOW_KEY = 'd3a7f1c9e5b2486fa1c0d7e39b5f8246'

/**
 * Tell IndexNow participants (Bing, Naver, Seznam, Yandex, Yep — not Google)
 * that these paths changed. Best-effort: indexing notifications must never
 * break publishing, so every failure is swallowed. Skipped on localhost where
 * the key file cannot be verified.
 */
export async function pingIndexNow(paths) {
  const base = siteUrl()
  if (!base.startsWith('http') || base.includes('localhost')) return

  const urlList = paths.map((p) => base + (p.startsWith('/') ? p : '/' + p))
  if (!urlList.length) return

  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(base).hostname,
        key: INDEXNOW_KEY,
        urlList,
      }),
      keepalive: true,
    })
  } catch {
    // notification is best-effort
  }
}
