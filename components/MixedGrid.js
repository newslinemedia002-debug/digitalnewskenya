import StoryCard from './StoryCard'
import WireCard from './WireCard'
import styles from './Stories.module.css'

/** Alternate Newswire articles and wire stories inside a grid. */
export function mixGrid(own, wire) {
  const out = []
  for (let i = 0; i < Math.max(own.length, wire.length); i++) {
    if (own[i]) out.push({ wire: false, item: own[i] })
    if (wire[i]) out.push({ wire: true, item: wire[i] })
  }
  return out
}

/** One entry of a mixed grid — own article or wire story, same card look. */
export function MixedEntry({ entry }) {
  return entry.wire ? (
    <WireCard item={entry.item} />
  ) : (
    <StoryCard article={entry.item} variant="card" />
  )
}

/** Render a mixed grid (default 4 columns; pass a className to override). */
export default function MixedGrid({ entries, className }) {
  if (!entries.length) return null
  return (
    <div className={className || styles.grid4}>
      {entries.map((e) => (
        <MixedEntry key={`${e.wire ? 'w' : 'a'}-${e.item.id}`} entry={e} />
      ))}
    </div>
  )
}
