import { useState } from 'react'
import { Link } from 'react-router-dom'
import OutcomeBadge from './OutcomeBadge'
import { formatDateTime, formatDuration, formatNumber, formatPrice } from '../lib/format'

const FILTERS = ['all', 'success', 'retried', 'failed']
const TRIGGERS = { cron: 'Scheduled', manual: 'Manual', cli: 'CLI' }

// Every scrape attempt for one product, failures included. This table is also the
// accessible "table view" of the charts above it.
export default function ScrapeLog({ attempts, showProduct = false, title = 'Scrape log', actions = null }) {
  const [filter, setFilter] = useState('all')
  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === 'all' ? attempts.length : attempts.filter((a) => a.outcome === f).length]))
  const rows = filter === 'all' ? attempts : attempts.filter((a) => a.outcome === filter)

  return (
    <div className="log">
      <div className="log-head">
        <h3>{title}</h3>
        {actions}
        <div className="segmented" role="tablist" aria-label="Filter by outcome">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className={filter === f ? 'is-on' : ''}
              onClick={() => setFilter(f)}
            >
              {f[0].toUpperCase() + f.slice(1)} <span className="count num">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Checked at</th>
              {showProduct && <th>Product</th>}
              <th>Outcome</th>
              <th className="r">Price</th>
              <th className="r">Stock</th>
              <th className="r" title="Scraper attempts (fresh browser page each) + price re-requests inside the page">Tries</th>
              <th className="r">Took</th>
              <th>Trigger</th>
              <th>What happened</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className={a.outcome === 'failed' ? 'row-failed' : ''}>
                <td className="num" title={new Date(a.attempted_at).toISOString()}>
                  {formatDateTime(a.attempted_at)}
                </td>
                {showProduct && (
                  <td className="cell-product">
                    <Link to={`/product/${a.tracked_product_id}`}>{a.name}</Link>
                    <span className="muted"> · {a.option_label}</span>
                  </td>
                )}
                <td>
                  <OutcomeBadge outcome={a.outcome} />
                </td>
                <td className="r num">{formatPrice(a.price)}</td>
                <td className="r num">{a.stock === null ? '—' : formatNumber(a.stock)}</td>
                <td className="r num">
                  {a.attempts}
                  {a.page_retries > 0 && <span className="muted"> +{a.page_retries}</span>}
                </td>
                <td className="r num">{formatDuration(a.duration_ms)}</td>
                <td>{TRIGGERS[a.trigger] ?? a.trigger}</td>
                <td className="notes">{a.error ? <Notes text={a.error} /> : <span className="muted">Clean run</span>}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={showProduct ? 9 : 8} className="muted empty">
                  No {filter === 'all' ? '' : filter} attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Notes({ text }) {
  const parts = text.split(' | ')
  if (parts.length === 1 && text.length < 70) return <span>{text}</span>
  return (
    <details>
      <summary>{parts[0].length > 70 ? `${parts[0].slice(0, 70)}…` : parts[0]}{parts.length > 1 ? ` (+${parts.length - 1})` : ''}</summary>
      <ul>
        {parts.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </details>
  )
}
