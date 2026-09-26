// All calls to our Express backend go through here.
// VITE_API_URL is set in .env locally and in Vercel's project settings in production.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(body?.error || `Request failed with status ${res.status}`)
  }
  return body
}

export const api = {
  health: () => request('/api/health'),

  // Catalog (Step 2)
  searchCatalog: (q, limit = 20) =>
    request(`/api/catalog/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  catalogStatus: () => request('/api/catalog/status'),
  getProduct: (storeProductId) => request(`/api/catalog/products/${storeProductId}`),
}

export { API_URL }
