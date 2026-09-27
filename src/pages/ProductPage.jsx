import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import ActionsMenu from '../components/ActionsMenu'
import ChangeFeed from '../components/ChangeFeed'
import HistoryCharts from '../components/HistoryCharts'
import OutcomeBadge from '../components/OutcomeBadge'
import PriceChange from '../components/PriceChange'
import PriceInsight from '../components/PriceInsight'
import ScrapeLog from '../components/ScrapeLog'
import { formatDateTime, formatNumber, formatPrice, timeAgo } from '../lib/format'
import { useLiveData } from '../lib/useLiveData'

const FREQUENCY = { 120: 'every 2 hours', 240: 'every 4 hours', 360: 'every 6 hours', 720: 'every 12 hours', 1440: 'once a day' }

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tracked, changes, runActive, refresh, loaded } = useLiveData()
  const product = tracked.find((t) => String(t.id) === id)
  const [history, setHistory] = useState(null)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  // Reload the history whenever this product gets a new check.
  useEffect(() => {
    if (!product) return
    let cancelled = false
    api
      .history(product.id)
      .then((d) => !cancelled && setHistory(d.attempts))
      .catch((err) => !cancelled && setMessage({ kind: 'error', text: `Could not load history: ${err.message}` }))
    return () => {
      cancelled = true
    }
  }, [product?.id, product?.last_attempt_at]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) {
    return loaded ? (
      <div className="page">
        <div className="glass empty-state">
          <h2>Not tracked</h2>
          <p>This product isn’t being tracked (it may have been removed).</p>
          <Link to="/" className="btn">
            Back to overview
          </Link>
        </div>
      </div>
    ) : null
  }

  async function act(fn, okText) {
    setBusy(true)
    setMessage(null)
    try {
      await fn()
      if (okText) setMessage({ kind: 'ok', text: okText, forAttempt: product.last_attempt_at })
      await refresh()
    } catch (err) {
      setMessage({ kind: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const extra = product.last_extra ?? {}
  const discount = product.last_mrp && product.last_price ? Math.round((1 - product.last_price / product.last_mrp) * 100) : null
  const showMessage = message && (message.kind === 'error' || message.forAttempt === product.last_attempt_at)

  return (
    <div className="page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Overview</Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <section className="glass product-hero">
        <div className="hero-main">
          <p className="eyebrow">
            {product.category} · {product.brand} · #{product.store_product_id}
          </p>
          <h1>{product.name}</h1>
          <p className="hero-option">
            {product.option_axis}: <strong>{product.option_label}</strong>
          </p>

          <div className="hero-price">
            <span className="hero-price-value num">{formatPrice(product.last_price)}</span>
            <PriceChange current={product.last_price} previous={product.prev_price} />
          </div>
          <p className="hero-sub">
            {product.last_mrp && (
              <>
                MRP <s className="num">{formatPrice(product.last_mrp)}</s>
                {discount !== null && <span className="save">{discount}% below MRP</span>}
              </>
            )}
          </p>

          <div className="hero-facts">
            <span className={product.last_stock === 0 ? 'fact stock-out' : 'fact'}>
              {product.last_stock === null ? 'Stock unknown' : product.last_stock === 0 ? 'Sold out' : `${formatNumber(product.last_stock)} in stock`}
            </span>
            {extra.delivery && <span className="fact">{extra.delivery}</span>}
            {extra.seller && <span className="fact">Sold by {extra.seller}</span>}
            {extra.rating && <span className="fact">{extra.rating}</span>}
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-actions">
            <button
              type="button"
              className="btn"
              disabled={busy || runActive || !product.is_active}
              onClick={() => act(() => api.scrapeNow(product.id))}
            >
              {runActive ? 'Checking…' : 'Check now'}
            </button>
            <a className="btn btn-quiet" href={product.product_url} target="_blank" rel="noreferrer">
              Open in store
            </a>
            <ActionsMenu
              interval={product.scrape_interval_minutes}
              disabled={busy}
              onInterval={(m) => act(() => api.updateTracked(product.id, { scrape_interval_minutes: m }))}
              onRemove={() => {
                if (window.confirm(`Stop tracking ${product.name} (${product.option_label})? Its history will be deleted.`)) {
                  act(async () => {
                    await api.removeTracked(product.id)
                    navigate('/')
                  })
                }
              }}
            />
          </div>
          <div className="hero-status">
            <OutcomeBadge outcome={product.last_outcome} />
            <span>
              Checked {timeAgo(product.last_attempt_at)}
              <span className="muted"> · {FREQUENCY[product.scrape_interval_minutes] ?? `every ${product.scrape_interval_minutes} min`}</span>
            </span>
            {product.last_outcome === 'failed' && product.last_success_at && (
              <span className="card-warn">Last check failed · price from {formatDateTime(product.last_success_at)}</span>
            )}
          </div>
          <PriceInsight current={product.last_price} low={product.min_price} avg={product.avg_price} high={product.max_price} />
        </div>
      </section>

      {showMessage && <p className={`note ${message.kind === 'error' ? 'note-error' : 'note-ok'}`}>{message.text}</p>}

      <div className="product-grid">
        <section className="glass panel">{history && <HistoryCharts attempts={history} />}</section>
        <aside className="glass side-panel">
          <header className="panel-head">
            <h2>Alerts</h2>
            <span className="hint">
              {product.total_attempts} checks · {product.failed_attempts} failed · {product.retried_attempts} retried
            </span>
          </header>
          <ChangeFeed changes={changes} productId={product.id} limit={8} />
        </aside>
      </div>

      <section className="glass panel">{history && <ScrapeLog attempts={history} />}</section>
    </div>
  )
}
