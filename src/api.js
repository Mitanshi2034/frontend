// All calls to our Express backend go through here.
// VITE_API_URL is set in .env locally and in Vercel's project settings in production.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(body?.error || `Request failed with status ${res.status}`)
  }
  return body
}

const json = (method, data) => ({ method, body: JSON.stringify(data) })

export const api = {
  health: () => request('/api/health'),

  // Catalog: search the store and see a product's options
  searchCatalog: (q, limit = 20) => request(`/api/catalog/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  catalogStatus: () => request('/api/catalog/status'),
  getProduct: (storeProductId) => request(`/api/catalog/products/${storeProductId}`),

  // Tracked products
  listTracked: () => request('/api/tracked'),
  addTracked: (storeProductId, optionId) =>
    request('/api/tracked', json('POST', { store_product_id: storeProductId, option_id: optionId })),
  updateTracked: (id, changes) => request(`/api/tracked/${id}`, json('PATCH', changes)),
  removeTracked: (id) => request(`/api/tracked/${id}`, { method: 'DELETE' }),
  history: (id, limit = 500) => request(`/api/tracked/${id}/history?limit=${limit}`),
  scrapeNow: (id) => request(`/api/tracked/${id}/scrape`, { method: 'POST' }),

  // Scheduler visibility and insights
  runs: (limit = 10) => request(`/api/runs?limit=${limit}`),
  stats: () => request('/api/stats'),
  changes: (limit = 30) => request(`/api/changes?limit=${limit}`),
  attempts: ({ limit = 300, outcome, trackedId } = {}) => {
    const q = new URLSearchParams({ limit: String(limit) })
    if (outcome) q.set('outcome', outcome)
    if (trackedId) q.set('tracked_id', String(trackedId))
    return request(`/api/attempts?${q}`)
  },
}

// A plain link (not fetch) so the browser downloads the file using the server's Content-Disposition.
export const exportCsvUrl = `${API_URL}/api/export/scrapes.csv`

export { API_URL }
