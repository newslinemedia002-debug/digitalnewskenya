import Link from 'next/link'
import { categoryLabel, relativeTime } from '@/lib/site'
import styles from './Stories.module.css'

/**
 * Compact headline row with a side thumbnail — used for the lead band's right
 * column so every story (own article OR wire item) shows an image while the
 * list stays scannable. Reuses the FeedList visual language.
 *
 * entry: { wire: boolean, item } from mixGrid().
 */
export default function HeadlineRow({ entry }) {
  const { wire, item } = entry
  const href = wire ? `/wire/${item.id}` : `/news/${item.slug}`
  const img = wire ? item.image_url : item.cover_image_url
  const time = wire ? item.published_at : item.published_at || item.created_at
  const source = wire ? item.source : categoryLabel(item.category)

  return (
    <li className={styles.feedItem}>
      <Link href={href} className={styles.feedLink}>
        <div className={styles.feedWithThumbSm}>
          <div>
            <div className={styles.feedMeta}>
              <span>{relativeTime(time)}</span>
              <span aria-hidden="true">·</span>
              <span className={styles.feedSource}>{source}</span>
            </div>
            <div className={styles.feedTitle}>{item.title}</div>
          </div>
          {img && (
            <div className={styles.feedThumb}>
              <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>
      </Link>
    </li>
  )
}
