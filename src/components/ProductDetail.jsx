import { useEffect, useState } from 'react'
import { api } from '../api'
import HistoryCharts from './HistoryCharts'
import OutcomeBadge from './OutcomeBadge'
import ScrapeLog from './ScrapeLog'
import { formatDateTime, formatNumber, formatPrice, timeAgo } from '../lib/format'

const INTERVALS = [
  [120, 'Every 2 hours'],
  [240, 'Every 4 hours'],
  [360, 'Every 6 hours'],
  [720, 'Every 12 hours'],
  [1440, 'Once a day'],
]

export default function ProductDetail({ product, runActive, onChanged, onRemoved }) {
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null) // which action is in flight
  const [message, setMessage] = useState(null)

  // Reload the history whenever this product gets a new attempt.
  useEffect(() => {
    let cancelled = false
    api
      .history(product.id)
      .then((data) => !cancelled && (setHistory(data), setError(null)))
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [product.id, product.last_attempt_at])

  async function act(name, fn, success) {
    setBusy(name)
    setMessage(null)
    try {
      await fn()
      // Remember which check the message belongs to, so it disappears once a newer result arrives.
      if (success) setMessage({ kind: 'ok', text: success, forAttempt: product.last_attempt_at })
      onChanged()
    } catch (err) {
      setMessage({ kind: 'error', text: err.message })
    } finally {
      setBusy(null)
    }
  }

  const extra = product.last_extra ?? {}
  const total = product.total_attempts ?? 0
  const good = total - (product.failed_attempts ?? 0)
  const discount = product.last_mrp && product.last_price ? Math.round((1 - product.last_price / product.last_mrp) * 100) : null

  return (
    <section className="glass panel detail">
      <header className="detail-head">
        <div>
          <p className="eyebrow">
            {product.category} · #{product.store_product_id} · {product.sku}
          </p>
          <h2>{product.name}</h2>
          <p className="detail-option">
            {product.option_axis ? `${product.option_axis}: ` : ''}
            <strong>{product.option_label}</strong>
            <a href={product.product_url} target="_blank" rel="noreferrer" className="link">
              View in store
            </a>
          </p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn"
            disabled={!!busy || runActive || !product.is_active}
            onClick={() => act('scrape', () => api.scrapeNow(product.id), 'Checking the price now. This takes about 15 seconds.')}
          >
            {runActive ? 'Checking…' : 'Check now'}
          </button>
          <select
            className="select"
            value={product.scrape_interval_minutes}
            disabled={!!busy}
            aria-label="How often to check"
            onChange={(e) => act('interval', () => api.updateTracked(product.id, { scrape_interval_minutes: Number(e.target.value) }))}
          >
            {INTERVALS.map(([m, label]) => (
              <option key={m} value={m}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-quiet"
            disabled={!!busy}
            onClick={() => act('pause', () => api.updateTracked(product.id, { is_active: !product.is_active }))}
          >
            {product.is_active ? 'Pause' : 'Resume'}
          </button>
          <button
            type="button"
            className="btn btn-quiet btn-danger"
            disabled={!!busy}
            onClick={() => {
              if (window.confirm(`Stop tracking ${product.name} (${product.option_label})? Its history will be deleted.`)) {
                act('remove', async () => {
                  await api.removeTracked(product.id)
                  onRemoved()
                })
              }
            }}
          >
            Remove
          </button>
        </div>
      </header>

      {message && (message.kind === 'error' || message.forAttempt === product.last_attempt_at) && (
        <p className={`note ${message.kind === 'error' ? 'note-error' : 'note-ok'}`}>{message.text}</p>
      )}

      <div className="stats">
        <div className="stat stat-hero">
          <span className="stat-label">Current price</span>
          <span className="stat-value num">{formatPrice(product.last_price)}</span>
          <span className="stat-sub">
            {product.last_mrp && (
              <>
                <s className="num">{formatPrice(product.last_mrp)}</s> MRP{discount !== null && ` · ${discount}% off`}
              </>
            )}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Stock</span>
          <span className="stat-value num">{product.last_stock === null ? '—' : product.last_stock === 0 ? 'Sold out' : formatNumber(product.last_stock)}</span>
          <span className="stat-sub">{extra.delivery ?? ''}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Price range</span>
          <span className="stat-value stat-value-sm num">
            {!product.min_price
              ? '—'
              : Number(product.min_price) === Number(product.max_price)
                ? formatPrice(product.min_price)
                : `${formatPrice(product.min_price)} – ${formatPrice(product.max_price)}`}
          </span>
          <span className="stat-sub">{Number(product.min_price) === Number(product.max_price) ? 'no change yet' : 'lowest – highest seen'}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Checks</span>
          <span className="stat-value num">
            {good}
            <span className="stat-of">/{total}</span>
          </span>
          <span className="stat-sub">
            with data · {product.failed_attempts ?? 0} failed · {product.retried_attempts ?? 0} retried
          </span>
        </div>
      </div>

      <div className="last-check">
        <OutcomeBadge outcome={product.last_outcome} />
        <span>
          Last check {timeAgo(product.last_attempt_at)}
          {product.last_attempt_at && <span className="muted"> ({formatDateTime(product.last_attempt_at)})</span>}
        </span>
        {extra.seller && <span className="muted">Seller: {extra.seller}</span>}
        {extra.rating && <span className="muted">Rating: {extra.rating}</span>}
        {!product.is_active && <span className="pill-paused">Paused</span>}
      </div>

      {error && <p className="note note-error">Could not load history: {error}</p>}
      {history && (
        <>
          <HistoryCharts attempts={history.attempts} />
          <ScrapeLog attempts={history.attempts} />
        </>
      )}
    </section>
  )
}
