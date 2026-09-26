import OutcomeBadge from './OutcomeBadge'
import { formatPrice, timeAgo } from '../lib/format'

// Compact list of tracked products (the "master" side of the dashboard).
export default function TrackedList({ items, selectedId, onSelect }) {
  return (
    <section className="glass panel tracked">
      <header className="panel-head">
        <h2>Tracked</h2>
        <span className="hint">{items.length} product option{items.length === 1 ? '' : 's'}</span>
      </header>

      {items.length === 0 && <p className="note">Nothing tracked yet. Search for a product above.</p>}

      <ul className="tracked-list">
        {items.map((t) => {
          const stale = t.last_outcome === 'failed'
          return (
            <li key={t.id}>
              <button
                type="button"
                className={`tracked-row ${selectedId === t.id ? 'is-selected' : ''} ${t.is_active ? '' : 'is-paused'}`}
                onClick={() => onSelect(t.id)}
                aria-current={selectedId === t.id}
                aria-label={`${t.name}, ${t.option_label}, ${formatPrice(t.last_price)}, last check ${t.last_outcome ?? 'not run yet'}`}
              >
                <span className="tracked-main">
                  <span className="tracked-name">{t.name}</span>
                  <span className="tracked-option">{t.option_label}</span>
                </span>
                <span className="tracked-price num">{formatPrice(t.last_price)}</span>
                <span className="tracked-status">
                  <OutcomeBadge outcome={t.last_outcome} />
                  <span className="muted">{t.is_active ? timeAgo(t.last_attempt_at) : 'paused'}</span>
                </span>
                {stale && t.last_success_at && (
                  <span className="tracked-stale">Last check failed. Price shown is from {timeAgo(t.last_success_at)}.</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
