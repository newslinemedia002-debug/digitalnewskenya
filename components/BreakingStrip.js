'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './Stories.module.css'

const CYCLE_MS = 4000 // each headline holds for 4s, like the reference video

/**
 * Breaking bar that cycles through several headlines: each item holds for a
 * few seconds, then the next one fades in while the bar itself stays put.
 * Renders statically when only one headline is supplied.
 */
export default function BreakingStrip({ items }) {
  const list = Array.isArray(items) ? items.filter((i) => i?.href && i?.title) : []
  const count = list.length
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (count < 2) return
    const id = setInterval(() => setIndex((i) => i + 1), CYCLE_MS)
    return () => clearInterval(id)
  }, [count])

  if (count === 0) return null
  const current = list[index % count]

  return (
    <Link href={current.href} className={styles.breaking}>
      <span className={styles.breakingLabel}>Breaking</span>
      {/* keyed by position so each swap remounts the title and replays the fade */}
      <span key={index % count} className={styles.breakingTitle}>
        {current.title}
      </span>
    </Link>
  )
}
