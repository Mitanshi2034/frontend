import { formatDateTime, timeAgo } from '../lib/format'

const TRIGGERS = { cron: 'Scheduled', manual: 'Manual', cli: 'CLI' }

// Recent runs: proof that the scheduler actually fires, and how each run went.
export default function RunsPanel({ runs }) {
  return (
    <section className="glass panel runs">
      <header className="panel-head">
        <h2>Recent runs</h2>
        <span className="hint">scheduled every 2 h via cron-job.org</span>
      </header>
      {runs.length === 0 && <p className="note">No runs yet.</p>}
      <ol className="runs-list">
        {runs.map((r) => (
          <li key={r.id} className={`run run-${r.status}`}>
            <span className="run-dot" aria-hidden="true" />
            <span className="run-when" title={formatDateTime(r.started_at)}>
              {timeAgo(r.started_at)}
            </span>
            <span className="run-trigger">{TRIGGERS[r.trigger] ?? r.trigger}</span>
            <span className="run-result num">
              {r.status === 'running'
                ? 'running…'
                : r.status === 'completed'
                  ? r.products_total === 0
                    ? 'nothing due'
                    : `${r.products_succeeded}/${r.products_total} ok`
                  : r.status}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
