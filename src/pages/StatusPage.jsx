import { useLiveData } from '../lib/useLiveData'
import { formatDateTime, formatDuration, timeUntil } from '../lib/format'

const TRIGGERS = { cron: 'Scheduled', manual: 'Manual', cli: 'CLI' }

// Is the scheduler actually running, and how are runs going?
export default function StatusPage() {
  const { runs, stats, runActive } = useLiveData()
  const nextCheck = stats?.last_scheduled_at ? new Date(new Date(stats.last_scheduled_at).getTime() + 120 * 60e3).toISOString() : null
  const rate = stats?.checks_total ? Math.round((stats.ok_total / stats.checks_total) * 100) : null

  return (
    <div className="page">
      <section className="page-head">
        <h1>Scheduler status</h1>
        <span className={`state-pill ${runActive ? 'is-running' : ''}`}>
          <span className="live-dot" aria-hidden="true" />
          {runActive ? 'Running' : 'Idle'}
        </span>
      </section>

      <section className="kpis">
        <div className="kpi">
          <span className="kpi-label">Scheduled runs so far</span>
          <span className="kpi-value num">{stats?.scheduled_runs ?? '—'}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Next scheduled run</span>
          <span className="kpi-value kpi-value-sm">{nextCheck ? `≈ ${timeUntil(nextCheck)}` : '—'}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Checks with a price</span>
          <span className="kpi-value num">{rate === null ? '—' : `${rate}%`}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Average check</span>
          <span className="kpi-value num">{formatDuration(stats?.avg_duration_ms_24h)}</span>
        </div>
      </section>

      <div className="status-grid">
        <section className="glass panel">
          <header className="panel-head">
            <h2>Recent runs</h2>
          </header>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Started</th>
                  <th>Trigger</th>
                  <th>Status</th>
                  <th className="r">Products</th>
                  <th className="r">With a price</th>
                  <th className="r">Took</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className={r.products_failed > 0 ? 'row-failed' : ''}>
                    <td className="num">{formatDateTime(r.started_at)}</td>
                    <td>{TRIGGERS[r.trigger] ?? r.trigger}</td>
                    <td>
                      <span className={`run-state run-${r.status}`}>
                        <span className="run-dot" aria-hidden="true" />
                        {r.status === 'completed' && r.products_total === 0 ? 'nothing due' : r.status}
                      </span>
                    </td>
                    <td className="r num">{r.products_total}</td>
                    <td className="r num">
                      {r.status === 'running' ? '…' : `${r.products_succeeded}/${r.products_total}`}
                    </td>
                    <td className="r num">
                      {r.finished_at ? formatDuration(new Date(r.finished_at) - new Date(r.started_at)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="glass side-panel how">
          <header className="panel-head">
            <h2>How a run works</h2>
          </header>
          <ol>
            <li>
              <strong>Every 2 hours</strong> cron-job.org sends <code>POST /api/cron/scrape</code> with a secret header.
              A second job pings <code>/api/health</code> every 10 minutes so the free server never sleeps.
            </li>
            <li>
              Only <strong>one run at a time</strong>: a second trigger during a run is skipped, not doubled.
            </li>
            <li>
              Each product is opened in a <strong>real browser</strong> (Playwright). The scraper selects the option,
              passes the store’s checks and reads the one real price, not the hidden decoys.
            </li>
            <li>
              Slow or failing pages are retried with a fresh page. When the store <strong>rate-limits</strong> (HTTP
              429) the scraper waits 20s, 45s, then 90s, pauses before the next product, and tries again after a
              2-minute cool-down.
            </li>
            <li>
              Every product gets exactly <strong>one row per run</strong>: success, retried or failed. A failed row
              never stores a price.
            </li>
          </ol>
        </aside>
      </div>
    </div>
  )
}
