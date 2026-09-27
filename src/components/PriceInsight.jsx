import { formatPrice } from '../lib/format'

// Where today's price sits between the lowest and highest price we've seen,
// the way shopping sites show "low / typical / high".
export default function PriceInsight({ current, low, avg, high }) {
  const c = Number(current)
  const lo = Number(low)
  const hi = Number(high)
  if (!c || !lo || !hi) return null
  const span = hi - lo
  const pos = span > 0 ? (c - lo) / span : 0.5
  const avgPos = span > 0 ? (Number(avg) - lo) / span : 0.5
  const verdict = span === 0 ? 'only one price so far' : pos <= 0.33 ? 'low' : pos >= 0.67 ? 'high' : 'typical'

  return (
    <div className="insight">
      <p className="insight-line">
        Price is <strong className={`verdict verdict-${span === 0 ? 'typical' : verdict}`}>{span === 0 ? 'new' : verdict}</strong>
      </p>
      <div className="insight-track" role="img" aria-label={`Current price ${formatPrice(c)}, lowest ${formatPrice(lo)}, highest ${formatPrice(hi)}`}>
        <span className="insight-band" />
        <span className="insight-avg" style={{ left: `${avgPos * 100}%` }} title={`Average ${formatPrice(avg)}`} />
        <span className="insight-now" style={{ left: `${pos * 100}%` }} />
      </div>
      <div className="insight-scale num">
        <span>
          <em>Lowest</em>
          {formatPrice(lo)}
        </span>
        <span className="insight-mid">
          <em>Average</em>
          {formatPrice(avg)}
        </span>
        <span className="insight-end">
          <em>Highest</em>
          {formatPrice(hi)}
        </span>
      </div>
    </div>
  )
}
