import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

// Search the store by partial or full name, open a product, pick an option, track it.
export default function SearchPanel({ onTracked }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [catalog, setCatalog] = useState(null)
  const [searching, setSearching] = useState(false)
  const [product, setProduct] = useState(null) // details of the product being looked at
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [optionId, setOptionId] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const latest = useRef(0)

  // Debounced search; ignore responses that arrive out of order.
  useEffect(() => {
    const q = query.trim()
    if (!q) return
    const ticket = ++latest.current
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await api.searchCatalog(q, 12)
        if (ticket !== latest.current) return
        setResults(data.results)
        setCatalog(data.catalog)
        setError(null)
      } catch (err) {
        if (ticket === latest.current) setError(err.message)
      } finally {
        if (ticket === latest.current) setSearching(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  async function openProduct(id) {
    setLoadingProduct(true)
    setError(null)
    setOptionId(null)
    try {
      setProduct(await api.getProduct(id))
    } catch (err) {
      setError(err.message)
      setProduct(null)
    } finally {
      setLoadingProduct(false)
    }
  }

  async function track() {
    setSaving(true)
    setError(null)
    try {
      const created = await api.addTracked(product.store_product_id, optionId)
      setProduct(null)
      setQuery('')
      onTracked(created)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const shown = query.trim() ? results : [] // stale results are hidden once the box is cleared

  return (
    <section className="glass panel search">
      <header className="panel-head">
        <h2>Track a product</h2>
        <span className="hint">960 items in INE's store</span>
      </header>

      {!product && (
        <>
          <label className="field">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              placeholder="Search by name, e.g. “scanner” or “violin nano”"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </label>

          {catalog && catalog.count === 0 && (
            <p className="note">The catalog is still being collected from the store. Try again in a minute.</p>
          )}
          {query.trim() && !searching && shown.length === 0 && catalog?.count > 0 && (
            <p className="note">No product names contain “{query.trim()}”.</p>
          )}

          {shown.length > 0 && (
            <ul className="results">
              {shown.map((r) => (
                <li key={r.store_product_id}>
                  <button type="button" onClick={() => openProduct(r.store_product_id)} disabled={loadingProduct}>
                    <span className="result-name">{r.name}</span>
                    <span className="result-meta">
                      {r.category} · {r.sku}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {product && (
        <div className="picker">
          <button type="button" className="link back" onClick={() => setProduct(null)}>
            Back to results
          </button>
          <h3>{product.name}</h3>
          <p className="result-meta">
            {product.brand} · {product.category} · #{product.store_product_id}
            {product.review_avg ? ` · ${product.review_avg}/5 from ${product.review_count} reviews` : ''}
          </p>
          <p className="picker-desc">{product.description}</p>

          <fieldset className="options">
            <legend>{product.option_axis || 'Option'}</legend>
            {product.options.map((o) => (
              <label key={o.id} className={`chip ${optionId === o.id ? 'chip-on' : ''}`}>
                <input
                  type="radio"
                  name="option"
                  value={o.id}
                  checked={optionId === o.id}
                  onChange={() => setOptionId(o.id)}
                />
                {o.label}
              </label>
            ))}
          </fieldset>

          <button type="button" className="btn btn-primary" disabled={!optionId || saving} onClick={track}>
            {saving ? 'Adding…' : 'Track this option'}
          </button>
          <p className="hint">The first price check starts straight away, then every 2 hours.</p>
        </div>
      )}

      {loadingProduct && <p className="note">Loading product…</p>}
      {error && <p className="note note-error">{error}</p>}
    </section>
  )
}
