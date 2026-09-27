import { Link } from 'react-router-dom'
import OutcomeBadge from './OutcomeBadge'
import PriceChange from './PriceChange'
import Sparkline from './Sparkline'
import { formatNumber, formatPrice, timeAgo } from '../lib/format'

// One tracked product option on the overview grid. The whole card links to its page.
export default function ProductCard({ product: t }) {
  const failedLast = t.last_outcome === 'failed'
  const stock =
    t.last_stock === null || t.last_stock === undefined ? null : t.last_stock === 0 ? 'Sold out' : `${formatNumber(t.last_stock)} in stock`

  return (
    <Link to={`/product/${t.id}`} className="card glass" aria-label={`${t.name}, ${t.option_label}`}>
      <div className="card-top">
        <span className="card-cat">{t.category}</span>
        <OutcomeBadge outcome={t.last_outcome} />
      </div>
      <h3 className="card-name">{t.name}</h3>
      <p className="card-option">
        {t.option_axis}: {t.option_label}
      </p>

      <div className="card-price-row">
        <span className="card-price num">{formatPrice(t.last_price)}</span>
        <PriceChange current={t.last_price} previous={t.prev_price} compact />
      </div>

      <Sparkline points={t.trend ?? []} />

      <div className="card-foot">
        <span className={t.last_stock === 0 ? 'stock-out' : ''}>{stock ?? 'No data yet'}</span>
        <span className="muted">{t.is_active ? `checked ${timeAgo(t.last_attempt_at)}` : 'paused'}</span>
      </div>
      {failedLast && t.last_success_at && (
        <p className="card-warn">Last check failed. Price is from {timeAgo(t.last_success_at)}.</p>
      )}
    </Link>
  )
}
