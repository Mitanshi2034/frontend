import { useState } from 'react'
import { Link } from 'react-router-dom'
import ChangeFeed from '../components/ChangeFeed'
import ProductCard from '../components/ProductCard'
import StoreSearch from '../components/StoreSearch'
import { useLiveData } from '../lib/useLiveData'
import { timeUntil } from '../lib/format'

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
        <h1>Your tracked products</h1>
        <StoreSearch value={filter} onChange={setFilter} tracked={tracked} onPick={(storeProductId) => onTrack(storeProductId)} />
      </section>

      <section className="kpis" aria-label="Summary">
        <div className="kpi">
          <span className="kpi-label">Tracking</span>
          <span className="kpi-value num">{tracked.filter((t) => t.is_active).length}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Checks, last 24 h</span>
          <span className="kpi-value num">{stats?.checks_24h ?? '—'}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Got a price</span>
          <span className="kpi-value num">{successRate === null ? '—' : `${successRate}%`}</span>
        </div>
        <Link to="/status" className="kpi kpi-link">
          <span className="kpi-label">Next scheduled check</span>
          <span className="kpi-value kpi-value-sm">{runActive ? 'Running now' : nextCheck ? `≈ ${timeUntil(nextCheck)}` : '—'}</span>
        </Link>
      </section>

      <div className="overview-grid">
        <section aria-label="Tracked products">
          {loaded && tracked.length === 0 ? (
            <div className="glass empty-state">
              <h2>Nothing tracked yet</h2>
              <button type="button" className="btn btn-primary" onClick={() => onTrack()}>
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
                <button type="button" className="card card-add" onClick={() => onTrack()}>
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
          </header>
          <ChangeFeed changes={changes} limit={9} />
        </aside>
      </div>
    </div>
  )
}
