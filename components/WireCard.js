import Link from 'next/link'
import { relativeTime } from '@/lib/site'
import styles from './Stories.module.css'

/**
 * Wire story rendered as a grid card (same visual language as StoryCard) so
 * RSS items can sit alongside Newswire's own articles inside section grids.
 * Reads happen ON Newswire at /wire/[id]; the publisher is credited there.
 */
export default function WireCard({ item, variant = 'card' }) {
  const href = `/wire/${item.id}`
  const showImage = variant === 'lead' || variant === 'card'

  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      {showImage && item.image_url && (
        <Link href={href} className={styles.cardMedia} tabIndex={-1} aria-hidden="true">
          <img src={item.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />
        </Link>
      )}
      <h3 className={styles.cardTitle}>
        <Link href={href}>{item.title}</Link>
      </h3>
      {item.excerpt && variant !== 'compact' && variant !== 'small' && (
        <p className={styles.cardExcerpt}>{item.excerpt}</p>
      )}
      <div className={`meta ${styles.metaRow}`}>
        <span className="time">{relativeTime(item.published_at)}</span>
        <span className="sep">|</span>
        <span>{item.source}</span>
      </div>
    </article>
  )
}
