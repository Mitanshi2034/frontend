import { Link } from 'react-router-dom'
import { formatNumber, formatPrice, percentChange, timeAgo } from '../lib/format'

// Notable changes between consecutive checks: the in-app alerts.
const KINDS = {
  price_drop: { label: 'Price drop', tone: 'good' },
  price_rise: { label: 'Price up', tone: 'bad' },
  back_in_stock: { label: 'Back in stock', tone: 'good' },
  sold_out: { label: 'Sold out', tone: 'bad' },
  layout_changed: { label: 'Store layout changed', tone: 'info' },
  structure_changed: { label: 'Page structure changed', tone: 'bad' },
}

function describe(e) {
  switch (e.kind) {
    case 'price_drop':
    case 'price_rise': {
      const pct = percentChange(e.new_value, e.old_value)
      return `${formatPrice(e.old_value)} → ${formatPrice(e.new_value)} (${pct > 0 ? '+' : '−'}${Math.abs(pct).toFixed(1)}%)`
    }
    case 'back_in_stock':
      return `${formatNumber(e.new_value)} available again`
    case 'sold_out':
      return `was ${formatNumber(e.old_value)} in stock`
    case 'layout_changed':
      return `variant ${e.old_value} → ${e.new_value}`
    default:
      return ''
  }
}

export default function ChangeFeed({ changes, limit = 8, productId }) {
  const items = (productId ? changes.filter((c) => c.tracked_product_id === productId) : changes).slice(0, limit)
  if (items.length === 0) return <p className="note">No alerts yet.</p>
  return (
    <ul className="feed">
      {items.map((e, i) => {
        const k = KINDS[e.kind] ?? { label: e.kind, tone: 'info' }
        return (
          <li key={`${e.kind}-${e.tracked_product_id}-${e.attempted_at}-${i}`} className={`feed-item tone-${k.tone}`}>
            <span className="feed-mark" aria-hidden="true" />
            <div className="feed-body">
              <p className="feed-title">
                <strong>{k.label}</strong>
                {!productId && (
                  <>
                    {' · '}
                    <Link to={`/product/${e.tracked_product_id}`}>{e.name}</Link>
                    <span className="muted"> ({e.option_label})</span>
                  </>
                )}
              </p>
              {describe(e) && <p className="feed-detail num">{describe(e)}</p>}
            </div>
            <span className="feed-when muted">{timeAgo(e.attempted_at)}</span>
          </li>
        )
      })}
    </ul>
  )
}
