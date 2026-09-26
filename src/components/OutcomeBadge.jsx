// Outcome of a scrape attempt. Colour is never the only signal: each outcome has
// its own shape (dot / broken ring / cross) AND a text label.
const OUTCOMES = {
  success: { label: 'Success', title: 'Correct price and stock on the first try' },
  retried: { label: 'Retried', title: 'Correct price and stock, but only after a retry' },
  failed: { label: 'Failed', title: 'No trustworthy data after all retries; nothing was stored' },
}

export function OutcomeGlyph({ outcome, size = 10 }) {
  const common = { width: size, height: size, viewBox: '0 0 10 10', 'aria-hidden': true, className: `glyph glyph-${outcome}` }
  if (outcome === 'success') {
    return (
      <svg {...common}>
        <circle cx="5" cy="5" r="4" fill="currentColor" />
      </svg>
    )
  }
  if (outcome === 'retried') {
    return (
      <svg {...common}>
        <path d="M8.6 5A3.6 3.6 0 1 1 6.8 1.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (outcome === 'failed') {
    return (
      <svg {...common}>
        <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.6" />
    </svg>
  )
}

export default function OutcomeBadge({ outcome }) {
  const o = OUTCOMES[outcome]
  return (
    <span className={`badge badge-${o ? outcome : 'none'}`} title={o?.title ?? 'This product has not been scraped yet'}>
      <OutcomeGlyph outcome={o ? outcome : 'none'} />
      {o?.label ?? 'Not scraped yet'}
    </span>
  )
}
