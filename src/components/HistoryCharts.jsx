import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import OutcomeBadge from './OutcomeBadge'
import { formatAxisTime, formatDateTime, formatNumber, formatPrice, formatPriceShort } from '../lib/format'

// Price and stock are different units, so they get two charts on a shared time axis
// (never one chart with two y-axes). Failed attempts have no data: they break the line
// and are marked with a thin red rule, so gaps in the history are visible, not hidden.

// Evenly spaced, round ticks (1, 2, 2.5 or 5 × 10^n) that cover [lo, hi].
function niceTicks(lo, hi, count = 4) {
  if (hi === lo) {
    const spread = Math.max(Math.abs(hi) * 0.05, 1)
    lo -= spread
    hi += spread
  }
  const raw = (hi - lo) / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw)
  const start = Math.floor(lo / step) * step
  const ticks = []
  for (let v = start; v <= hi + step * 0.001; v += step) ticks.push(Math.round(v * 100) / 100)
  if (ticks.at(-1) < hi) ticks.push(ticks.at(-1) + step)
  return ticks
}

const AXIS = { stroke: 'var(--axis)', tick: { fill: 'var(--ink-muted)', fontSize: 11 }, tickLine: false }

function ChartTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const value = unit === 'price' ? point.price : point.stock
  return (
    <div className="chart-tip">
      <div className="chart-tip-value num">
        {point.outcome === 'failed' ? 'No data' : unit === 'price' ? formatPrice(value) : `${formatNumber(value)} in stock`}
      </div>
      <div className="chart-tip-meta">{formatDateTime(point.attempted_at)}</div>
      <OutcomeBadge outcome={point.outcome} />
    </div>
  )
}

function SeriesChart({ data, dataKey, unit, height, ticks, tickFormatter, failures, showXAxis }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} syncId="history" margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={formatAxisTime}
          hide={!showXAxis}
          minTickGap={48}
          {...AXIS}
        />
        <YAxis domain={[ticks[0], ticks.at(-1)]} ticks={ticks} tickFormatter={tickFormatter} width={52} axisLine={false} {...AXIS} />
        {failures.map((t) => (
          <ReferenceLine key={t} x={t} stroke="var(--critical)" strokeOpacity={0.55} strokeWidth={1} ifOverflow="extendDomain" />
        ))}
        <Tooltip
          content={<ChartTooltip unit={unit} />}
          cursor={{ stroke: 'var(--ink-muted)', strokeWidth: 1 }}
          isAnimationActive={false}
        />
        <Line
          type={unit === 'stock' ? 'stepAfter' : 'linear'}
          dataKey={dataKey}
          stroke="var(--series-1)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          connectNulls={false}
          dot={{ r: 4, fill: 'var(--series-1)', stroke: 'var(--chart-surface)', strokeWidth: 2 }}
          activeDot={{ r: 5, fill: 'var(--series-1)', stroke: 'var(--chart-surface)', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

const RANGES = [
  ['24h', 'Last 24 h', 24 * 3600e3],
  ['3d', '3 days', 3 * 24 * 3600e3],
  ['all', 'All', Infinity],
]

export default function HistoryCharts({ attempts }) {
  const [range, setRange] = useState('all')
  const [openedAt] = useState(() => Date.now()) // ranges are measured from when the page was opened
  const span = RANGES.find(([k]) => k === range)[2]
  const since = openedAt - span

  const all = [...attempts].reverse().map((a) => ({
    t: new Date(a.attempted_at).getTime(),
    attempted_at: a.attempted_at,
    outcome: a.outcome,
    price: a.outcome === 'failed' ? null : Number(a.price),
    stock: a.outcome === 'failed' ? null : a.stock,
  }))
  const data = all.filter((d) => d.t >= since)
  const failures = data.filter((d) => d.outcome === 'failed').map((d) => d.t)
  const prices = data.filter((d) => d.price !== null).map((d) => d.price)
  const stocks = data.filter((d) => d.stock !== null).map((d) => d.stock)

  const priceTicks = prices.length ? niceTicks(Math.min(...prices), Math.max(...prices)) : [0, 1]
  const stockTicks = niceTicks(0, Math.max(4, ...stocks), 3)

  return (
    <div className="charts">
      <div className="charts-head">
        <h3>Price history</h3>
        <div className="segmented" role="tablist" aria-label="Time range">
          {RANGES.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={range === key} className={range === key ? 'is-on' : ''} onClick={() => setRange(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="note chart-empty">No checks in this time range yet.</p>
      ) : prices.length < 2 ? (
        <p className="note chart-empty">
          {prices.length === 1 ? 'One successful check so far. The chart draws itself from the second check on.' : 'No successful checks in this range.'}
        </p>
      ) : (
        <>
          <div className="chart-block">
            <h4 className="chart-title">Price</h4>
            <SeriesChart data={data} dataKey="price" unit="price" height={230} ticks={priceTicks} tickFormatter={formatPriceShort} failures={failures} />
          </div>
          <div className="chart-block">
            <h4 className="chart-title">Stock</h4>
            <SeriesChart data={data} dataKey="stock" unit="stock" height={120} ticks={stockTicks} tickFormatter={formatNumber} failures={failures} showXAxis />
          </div>
          <p className="chart-key">
            <span className="key-line" aria-hidden="true" /> successful check
            <span className="key-rule" aria-hidden="true" /> failed check (no data stored, the line breaks)
          </p>
        </>
      )}
    </div>
  )
}
