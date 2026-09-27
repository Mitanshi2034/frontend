import { percentChange } from '../lib/format'

// Change since the previous successful check. For a shopper a drop is good news,
// so drops read green and rises read red, always with an arrow and a sign as well.
export default function PriceChange({ current, previous, compact = false }) {
  const pct = percentChange(current, previous)
  if (pct === null) return <span className="delta delta-none">{compact ? 'new' : 'first check'}</span>
  if (Math.abs(pct) < 0.05) return <span className="delta delta-flat">no change</span>
  const down = pct < 0
  return (
    <span className={`delta ${down ? 'delta-down' : 'delta-up'}`} title="Change since the previous successful check">
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
        <path d={down ? 'M5 9L1 3h8z' : 'M5 1l4 6H1z'} fill="currentColor" />
      </svg>
      {down ? '−' : '+'}
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}
