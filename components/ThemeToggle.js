'use client'

import { useEffect, useState } from 'react'
import styles from './Header.module.css'

/**
 * Dark/light theme switch for the header bar. The initial theme is applied by
 * an inline script in app/layout.js (before first paint); this button flips
 * it and remembers the choice in localStorage.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      // storage unavailable (private mode) — the toggle still works for this page
    }
  }

  const nextLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      className={styles.iconBtn}
      onClick={toggle}
      aria-label={nextLabel}
      title={nextLabel}
    >
      {theme === 'dark' ? (
        // sun — clicking switches to light
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="10" y1="1.5" x2="10" y2="3.6" />
            <line x1="10" y1="16.4" x2="10" y2="18.5" />
            <line x1="1.5" y1="10" x2="3.6" y2="10" />
            <line x1="16.4" y1="10" x2="18.5" y2="10" />
            <line x1="4" y1="4" x2="5.5" y2="5.5" />
            <line x1="14.5" y1="14.5" x2="16" y2="16" />
            <line x1="4" y1="16" x2="5.5" y2="14.5" />
            <line x1="14.5" y1="5.5" x2="16" y2="4" />
          </g>
        </svg>
      ) : (
        // moon — clicking switches to dark
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M17 12.2A7.2 7.2 0 0 1 7.8 3 7.2 7.2 0 1 0 17 12.2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
