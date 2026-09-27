import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

// "Track a product": search the store by partial or full name, open a product,
// pick one option, track it. Opens as a dialog over any page.
export default function TrackModal({ open, onClose, onTracked }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [product, setProduct] = useState(null)
  const [optionId, setOptionId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const dialog = useRef(null)
  const input = useRef(null)
  const latest = useRef(0)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      setTimeout(() => input.current?.focus(), 30)
    }
    if (!open && d.open) d.close()
  }, [open])

  // Debounced search; responses that arrive out of order are ignored.
  useEffect(() => {
    const q = query.trim()
    if (!q) return
    const ticket = ++latest.current
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await api.searchCatalog(q, 10)
        if (ticket === latest.current) {
          setResults(data.results)
          setError(null)
        }
      } catch (err) {
        if (ticket === latest.current) setError(err.message)
      } finally {
        if (ticket === latest.current) setSearching(false)
      }
    }, 220)
    return () => clearTimeout(timer)
  }, [query])

  const shown = query.trim() ? results : []

  function reset() {
    setQuery('')
    setProduct(null)
    setOptionId(null)
    setError(null)
  }

  async function openProduct(id) {
    setBusy(true)
    setError(null)
    try {
      setProduct(await api.getProduct(id))
      setOptionId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function track() {
    setBusy(true)
    setError(null)
    try {
      const created = await api.addTracked(product.store_product_id, optionId)
      reset()
      onTracked(created)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      className="modal glass"
      onClose={() => {
        reset()
        onClose()
      }}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
      aria-labelledby="track-title"
    >
      <div className="modal-inner">
        <header className="modal-head">
          <h2 id="track-title">{product ? 'Choose an option' : 'Track a product'}</h2>
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => dialog.current.close()}>
            Close
          </button>
        </header>

        {!product ? (
          <>
            <input
              ref={input}
              className="modal-search"
              type="search"
              placeholder="Search 960 products by name: “scanner”, “violin nano”…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              aria-label="Search products"
            />
            <ul className="modal-results">
              {shown.map((r) => (
                <li key={r.store_product_id}>
                  <button type="button" onClick={() => openProduct(r.store_product_id)} disabled={busy}>
                    <span className="result-name">{r.name}</span>
                    <span className="result-meta">
                      {r.brand} · {r.category} · #{r.store_product_id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {query.trim() && !searching && shown.length === 0 && !error && (
              <p className="note">No product names contain “{query.trim()}”.</p>
            )}
            {!query.trim() && <p className="note">Type part of a product name. Every word must appear, in any order.</p>}
          </>
        ) : (
          <div className="picker">
            <button type="button" className="link" onClick={() => setProduct(null)}>
              ← Back to results
            </button>
            <h3>{product.name}</h3>
            <p className="result-meta">
              {product.brand} · {product.category} · #{product.store_product_id}
              {product.review_avg ? ` · rated ${product.review_avg}/5 by ${product.review_count} reviewers` : ''}
            </p>
            <p className="picker-desc">{product.description}</p>
            <fieldset className="options">
              <legend>{product.option_axis || 'Option'}</legend>
              {product.options.map((o) => (
                <label key={o.id} className={`chip ${optionId === o.id ? 'chip-on' : ''}`}>
                  <input type="radio" name="option" value={o.id} checked={optionId === o.id} onChange={() => setOptionId(o.id)} />
                  {o.label}
                </label>
              ))}
            </fieldset>
            <button type="button" className="btn btn-primary btn-block" disabled={!optionId || busy} onClick={track}>
              {busy ? 'Adding…' : 'Start tracking'}
            </button>
            <p className="hint">The first price check starts right away, then every 2 hours.</p>
          </div>
        )}
        {error && <p className="note note-error">{error}</p>}
      </div>
    </dialog>
  )
}
