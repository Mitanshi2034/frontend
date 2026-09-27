import { useEffect, useRef, useState } from 'react'

const INTERVALS = [
  [120, 'Every 2 hours'],
  [240, 'Every 4 hours'],
  [360, 'Every 6 hours'],
  [720, 'Every 12 hours'],
  [1440, 'Once a day'],
]

// The secondary product actions, tucked behind a "more" button so the page stays calm.
export default function ActionsMenu({ interval, onInterval, onRemove, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className="btn btn-icon"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      {open && (
        <div className="menu-pop glass" role="menu">
          <p className="menu-label">Check frequency</p>
          {INTERVALS.map(([minutes, label]) => (
            <button
              key={minutes}
              type="button"
              role="menuitemradio"
              aria-checked={interval === minutes}
              className={`menu-item ${interval === minutes ? 'is-on' : ''}`}
              onClick={() => {
                onInterval(minutes)
                setOpen(false)
              }}
            >
              {label}
              {interval === minutes && <span className="tick" aria-hidden="true" />}
            </button>
          ))}
          <hr />
          <button
            type="button"
            role="menuitem"
            className="menu-item menu-danger"
            onClick={() => {
              setOpen(false)
              onRemove()
            }}
          >
            Stop tracking
          </button>
        </div>
      )}
    </div>
  )
}
