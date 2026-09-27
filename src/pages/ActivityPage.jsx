import { useEffect, useState } from 'react'
import { api } from '../api'
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
        <h1>Activity</h1>
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
    </div>
  )
}
