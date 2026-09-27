// A tiny price trend for product cards. Failed checks have no price, so they break the line
// instead of being bridged; the latest point gets a dot.
export default function Sparkline({ points = [], width = 132, height = 34 }) {
  const values = points.map((p) => (p.outcome === 'failed' || p.price === null ? null : Number(p.price)))
  const real = values.filter((v) => v !== null)
  if (real.length < 2) {
    return <span className="spark-empty" aria-hidden="true" />
  }
  const lo = Math.min(...real)
  const hi = Math.max(...real)
  const pad = 3
  const x = (i) => pad + (i * (width - pad * 2)) / Math.max(values.length - 1, 1)
  const y = (v) => (hi === lo ? height / 2 : pad + ((hi - v) * (height - pad * 2)) / (hi - lo))

  let d = ''
  let penDown = false
  values.forEach((v, i) => {
    if (v === null) {
      penDown = false
      return
    }
    d += `${penDown ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)} `
    penDown = true
  })
  const lastIndex = values.findLastIndex((v) => v !== null)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="spark" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--series-1)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(lastIndex)} cy={y(values[lastIndex])} r="2.6" fill="var(--series-1)" stroke="var(--chart-surface)" strokeWidth="1.5" />
    </svg>
  )
}
