import { useState } from 'react'
import { Link } from 'react-router-dom'
import ChangeFeed from '../components/ChangeFeed'
import ProductCard from '../components/ProductCard'
import { useLiveData } from '../lib/useLiveData'
import { formatDateTime, timeUntil, timeAgo } from '../lib/format'

export default function OverviewPage({ onTrack }) {
  const { tracked, stats, changes, loaded, runActive } = useLiveData()
  const [filter, setFilter] = useState('')
  // Every word must appear somewhere in the product's name, option, brand or category.
  const words = filter.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const shown = tracked.filter((t) => {
    const haystack = `${t.name} ${t.option_label} ${t.brand ?? ''} ${t.category ?? ''}`.toLowerCase()
    return words.every((w) => haystack.includes(w))
  })
  const successRate = stats?.checks_24h ? Math.round((stats.ok_24h / stats.checks_24h) * 100) : null
  const nextCheck = stats?.last_scheduled_at ? new Date(new Date(stats.last_scheduled_at).getTime() + 120 * 60e3).toISOString() : null

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <h1>Your tracked products</h1>
          <p className="lede">
            Price and stock from INE’s store, checked every two hours. Every check is recorded, including the ones that
            fail.
          </p>
        </div>
        {tracked.length > 0 && (
          <label className="filter-box">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10.6 10.6l3.4 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search your tracked products"
              aria-label="Search your tracked products"
            />
            {filter && (
              <span className="filter-count num">
                {shown.length}/{tracked.length}
              </span>
            )}
          </label>
        )}
      </section>

      <section className="kpis" aria-label="Summary">
        <div className="kpi">
          <span className="kpi-label">Tracking</span>
          <span className="kpi-value num">{tracked.filter((t) => t.is_active).length}</span>
          <span className="kpi-sub">product options</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Checks, last 24 h</span>
          <span className="kpi-value num">{stats?.checks_24h ?? '—'}</span>
          <span className="kpi-sub">{stats ? `${stats.checks_total} in total since ${formatDateTime(stats.first_check_at)}` : ''}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Got a price</span>
          <span className="kpi-value num">{successRate === null ? '—' : `${successRate}%`}</span>
          <span className="kpi-sub">of checks in the last 24 h</span>
        </div>
        <Link to="/status" className="kpi kpi-link">
          <span className="kpi-label">Next scheduled check</span>
          <span className="kpi-value kpi-value-sm">{runActive ? 'Running now' : nextCheck ? `≈ ${timeUntil(nextCheck)}` : '—'}</span>
          <span className="kpi-sub">{stats?.last_scheduled_at ? `last ${timeAgo(stats.last_scheduled_at)}` : 'waiting for first run'}</span>
        </Link>
      </section>

      <div className="overview-grid">
        <section aria-label="Tracked products">
          {loaded && tracked.length === 0 ? (
            <div className="glass empty-state">
              <h2>Nothing tracked yet</h2>
              <p>Search INE’s store, pick a product and one of its options, and its price will be checked every two hours.</p>
              <button type="button" className="btn btn-primary" onClick={onTrack}>
                Track a product
              </button>
            </div>
          ) : (
            <div className="cards">
              {shown.map((t) => (
                <ProductCard key={t.id} product={t} />
              ))}
              {words.length > 0 && shown.length === 0 && (
                <div className="card card-none">
                  <p>No tracked product matches “{filter.trim()}”.</p>
                  <button type="button" className="link" onClick={() => setFilter('')}>
                    Clear search
                  </button>
                </div>
              )}
              {words.length === 0 && (
                <button type="button" className="card card-add" onClick={onTrack}>
                  <span className="plus" aria-hidden="true" />
                  Track another product
                </button>
              )}
            </div>
          )}
        </section>

        <aside className="glass side-panel" aria-label="Recent changes">
          <header className="panel-head">
            <h2>Recent changes</h2>
            <span className="hint">price, stock, store layout</span>
          </header>
          <ChangeFeed changes={changes} limit={9} />
        </aside>
      </div>
    </div>
  )
}
