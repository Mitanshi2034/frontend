import { useCallback, useEffect, useState } from 'react'
import { api, exportCsvUrl } from './api'
import ProductDetail from './components/ProductDetail'
import RunsPanel from './components/RunsPanel'
import SearchPanel from './components/SearchPanel'
import TrackedList from './components/TrackedList'
import { timeAgo } from './lib/format'

const POLL_IDLE_MS = 20_000
const POLL_ACTIVE_MS = 4_000 // while a run is in progress, refresh quickly so new results appear

export default function App() {
  const [tracked, setTracked] = useState([])
  const [runs, setRuns] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [t, r] = await Promise.all([api.listTracked(), api.runs(8)])
      setTracked(t)
      setRuns(r)
      setLoadError(null)
      setSelectedId((current) => (t.some((p) => p.id === current) ? current : (t[0]?.id ?? null)))
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoaded(true)
    }
  }, [])

  const runActive = runs.some((r) => r.status === 'running')

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, runActive ? POLL_ACTIVE_MS : POLL_IDLE_MS)
    return () => clearInterval(timer)
  }, [refresh, runActive])

  const selected = tracked.find((t) => t.id === selectedId) ?? null
  const lastScheduled = runs.find((r) => r.trigger === 'cron')

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <h1>Price Tracker</h1>
            <p className="brand-sub">for INE’s demo store</p>
          </div>
        </div>
        <div className="topbar-right">
          <p className="scheduler">
            <span className={`live-dot ${runActive ? 'is-running' : ''}`} aria-hidden="true" />
            {runActive
              ? 'Checking prices now…'
              : lastScheduled
                ? `Last scheduled check ${timeAgo(lastScheduled.started_at)}`
                : 'Waiting for the first scheduled check'}
          </p>
          <a className="btn btn-primary" href={exportCsvUrl} download>
            Export CSV
          </a>
        </div>
      </header>

      {loadError && (
        <p className="glass banner-error">
          Can’t reach the API ({loadError}). If it was asleep it can take up to a minute to wake up; this page retries on
          its own.
        </p>
      )}

      <main className="layout">
        <div className="col-side">
          <SearchPanel
            onTracked={(created) => {
              setSelectedId(created.id)
              refresh()
            }}
          />
          <TrackedList items={tracked} selectedId={selectedId} onSelect={setSelectedId} />
          <RunsPanel runs={runs} />
        </div>

        <div className="col-main">
          {selected ? (
            <ProductDetail
              key={selected.id}
              product={selected}
              runActive={runActive}
              onChanged={refresh}
              onRemoved={() => setSelectedId(null)}
            />
          ) : (
            loaded && (
              <section className="glass panel empty-state">
                <h2>Pick something to watch</h2>
                <p>
                  Search the store on the left, choose a product and one of its options, and its price and stock will be
                  checked every two hours. Every check, including the failed ones, shows up here.
                </p>
              </section>
            )
          )}
        </div>
      </main>

      <footer className="foot">
        Prices are scraped from INE’s mock store (demo.inelabteamdev.com). Times are shown in your local time zone; the CSV
        uses UTC.
      </footer>
    </div>
  )
}
