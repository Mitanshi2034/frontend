import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

// Search box on the overview: searches the WHOLE store catalog (960 products), not just what's tracked.
// Already-tracked products are marked and open their page; anything else opens the option picker.
// The typed text is also passed up so the tracked cards below can filter to matches.
export default function StoreSearch({ value, onChange, tracked, onPick }) {
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [loading, setLoading] = useState(false)
  const box = useRef(null)
  const latest = useRef(0)
  const navigate = useNavigate()

  // Debounced catalog search; out-of-order responses are ignored.
  useEffect(() => {
    const q = value.trim()
    if (!q) return
    const ticket = ++latest.current
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await api.searchCatalog(q, 8)
        if (ticket === latest.current) {
          setResults(data.results)
          setActive(-1)
        }
      } catch {
        if (ticket === latest.current) setResults([])
      } finally {
        if (ticket === latest.current) setLoading(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [value])

  // Close when clicking anywhere else.
  useEffect(() => {
    const close = (e) => !box.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const trackedBy = (storeId) => tracked.filter((t) => t.store_product_id === storeId)
  // Products you already track come first (matched locally), then the rest of the store's matches.
  const words = value.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const mineFirst = []
  for (const t of tracked) {
    const text = `${t.name} ${t.brand ?? ''} ${t.category ?? ''} ${t.option_label}`.toLowerCase()
    if (words.length && words.every((w) => text.includes(w)) && !mineFirst.some((m) => m.store_product_id === t.store_product_id)) {
      mineFirst.push({ store_product_id: t.store_product_id, name: t.name, brand: t.brand, category: t.category })
    }
  }
  const shown = value.trim()
    ? [...mineFirst, ...results.filter((r) => !mineFirst.some((m) => m.store_product_id === r.store_product_id))].slice(0, 10)
    : []

  function choose(r) {
    const mine = trackedBy(r.store_product_id)
    setOpen(false)
    if (mine.length === 1) navigate(`/product/${mine[0].id}`)
    else onPick(r.store_product_id) // not tracked yet (or tracked in several options): pick an option
  }

  function onKeyDown(e) {
    if (!open || shown.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      choose(shown[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="store-search" ref={box}>
      <label className="filter-box">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.6 10.6l3.4 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search all 960 store products"
          aria-label="Search all store products"
          role="combobox"
          aria-expanded={open && shown.length > 0}
          aria-controls="store-search-results"
          autoComplete="off"
        />
      </label>

      {open && value.trim() && (
        <div className="search-pop glass" id="store-search-results" role="listbox">
          <p className="search-pop-label">
            {loading && shown.length === 0 ? 'Searching the store…' : shown.length ? 'Your products first, then INE’s store' : `No store product contains “${value.trim()}”`}
          </p>
          {shown.map((r, i) => {
            const mine = trackedBy(r.store_product_id)
            return (
              <button
                key={r.store_product_id}
                type="button"
                role="option"
                aria-selected={i === active}
                className={`search-hit ${i === active ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(r)}
              >
                <span className="search-hit-main">
                  <span className="result-name">{r.name}</span>
                  <span className="result-meta">
                    {r.brand} · {r.category} · #{r.store_product_id}
                  </span>
                </span>
                {mine.length > 0 ? (
                  <span className="hit-tag hit-tracked">
                    Tracked{mine.length > 1 ? ` ×${mine.length}` : ''}
                  </span>
                ) : (
                  <span className="hit-tag hit-add">Track</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
