import { useEffect, useState } from 'react'
import { api, exportCsvUrl } from '../api'
import ScrapeLog from '../components/ScrapeLog'
import { useLiveData } from '../lib/useLiveData'

// Every scrape attempt across all products: the complete, honest log.
export default function ActivityPage() {
  const { tracked, stats } = useLiveData()
  const [productId, setProductId] = useState('')
  const [attempts, setAttempts] = useState(null)
  const [error, setError] = useState(null)
  const stamp = stats?.checks_total // refetch whenever a new check lands

  useEffect(() => {
    let cancelled = false
    api
      .attempts({ limit: 1000, trackedId: productId || undefined })
      .then((rows) => {
        if (cancelled) return
        setAttempts(rows)
        setError(null)
      })
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [productId, stamp])

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <h1>Activity</h1>
          <p className="lede">
            Every price check the scraper has made, newest first. Failed checks stay in the log with the reason, and
            store no price.
          </p>
        </div>
        <a className="btn btn-primary" href={exportCsvUrl} download>
          Export CSV
        </a>
      </section>

      <section className="glass panel">
        {error && <p className="note note-error">{error}</p>}
        {attempts && (
          <ScrapeLog
            attempts={attempts}
            showProduct
            title={`${attempts.length} checks`}
            actions={
              <select className="select" value={productId} onChange={(e) => setProductId(e.target.value)} aria-label="Filter by product">
                <option value="">All products</option>
                {tracked.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · {t.option_label}
                  </option>
                ))}
              </select>
            }
          />
        )}
      </section>
      <p className="foot-note">
        The CSV has one row per check: store product ID, product name, option, timestamp (ISO 8601, UTC), price, stock and
        outcome. Failed checks are included with price and stock left empty.
      </p>
    </div>
  )
}
