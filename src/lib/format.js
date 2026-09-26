// Display helpers. Prices come from the API as strings like "23582.00" (Postgres NUMERIC).

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const plain = new Intl.NumberFormat('en-IN')

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '—'
  return inr.format(Number(value))
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—'
  return plain.format(Number(value))
}

// Axis ticks: ₹23.5k / ₹1.2L keep the chart's left edge narrow.
export function formatPriceShort(value) {
  const n = Number(value)
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(n >= 1_000_000 ? 0 : 1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return `₹${n}`
}

const dateTime = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const timeOnly = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

// Local time for people, e.g. "26 Sept, 20:39"
export function formatDateTime(iso) {
  return iso ? dateTime.format(new Date(iso)) : '—'
}

export function formatAxisTime(ms) {
  const d = new Date(ms)
  const sameDay = new Date().toDateString() === d.toDateString()
  return sameDay ? timeOnly.format(d) : dateTime.format(d)
}

// "just now", "5 min ago", "3 h ago", "2 days ago"
export function timeAgo(iso) {
  if (!iso) return 'never'
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 36) return `${hours} h ago`
  return `${Math.round(hours / 24)} days ago`
}

export function formatDuration(ms) {
  if (ms === null || ms === undefined) return '—'
  return `${(ms / 1000).toFixed(1)}s`
}
