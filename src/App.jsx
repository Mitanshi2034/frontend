import { useEffect, useState } from 'react'
import { api, API_URL } from './api'

// Step 1 placeholder: proves the frontend can reach the backend and the backend can reach the database.
// The real dashboard (search, tracked products, chart, scrape log, CSV export) replaces this in Step 4.
export default function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.health().then(setHealth).catch((err) => setError(err.message))
  }, [])

  return (
    <div className="container">
      <h1>INE Price Tracker</h1>
      <div className="panel">
        <p className="muted">Backend: {API_URL}</p>
        {error && <p className="status-bad">Backend unreachable: {error}</p>}
        {!health && !error && <p>Checking backend…</p>}
        {health && (
          <p className={health.database === 'ok' ? 'status-ok' : 'status-bad'}>
            API: {health.status} · Database: {health.database}
          </p>
        )}
      </div>
    </div>
  )
}
