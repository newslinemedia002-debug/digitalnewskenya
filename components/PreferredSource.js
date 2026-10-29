'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './Footer.module.css'

const PUBLISHER_JS = 'https://news.google.com/swg/js/v1/publisher.js'
const PREF_URL = 'https://www.google.com/preferences/source?q=digitalnewskenya.co.ke'
const DOMAIN = 'digitalnewskenya.co.ke'

/**
 * Google's official "Add as preferred source" button (Google Preferred
 * Sources). The publisher script swaps its own button into the tagged div;
 * readers who click it make Digital News Kenya their preference in Top
 * Stories, AI Mode and AI Overviews. If the script is blocked or the domain
 * turns out to be ineligible, we fall back to the plain Google preferences
 * link so the call to action never disappears.
 */
export default function PreferredSource() {
  const btnRef = useRef(null)
  const [buttonLive, setButtonLive] = useState(false)

  useEffect(() => {
    const el = btnRef.current
    if (!el) return

    // The script only finds the tagged element if it exists first, so inject
    // it after mount rather than in the document head.
    if (!document.querySelector(`script[src="${PUBLISHER_JS}"]`)) {
      const s = document.createElement('script')
      s.src = PUBLISHER_JS
      s.async = true
      document.body.appendChild(s)
    }

    // Consider the button live when Google populates our div (or replaces it).
    const check = (node) =>
      node.children.length > 0 || !node.isConnected || Boolean(node.firstElementChild)
    if (check(el)) {
      setButtonLive(true)
      return
    }
    const host = el.parentNode
    if (!host) return
    const mo = new MutationObserver(() => {
      if (check(el)) {
        setButtonLive(true)
        mo.disconnect()
      }
    })
    mo.observe(host, { childList: true, subtree: true })
    const t = setTimeout(() => mo.disconnect(), 10000)
    return () => {
      mo.disconnect()
      clearTimeout(t)
    }
  }, [])

  return (
    <div className={styles.preferred}>
      <p>
        Prefer <strong>{DOMAIN}</strong> in Google Search and AI answers — you&apos;ll see our
        stories first in Top Stories, AI Mode and AI Overviews:
      </p>
      <div ref={btnRef} google-add-preferred-source-btn="" data-lang="en" />
      {!buttonLive && (
        <a className={styles.preferredLink} href={PREF_URL}>
          Add {DOMAIN} as a preferred source →
        </a>
      )}
    </div>
  )
}
