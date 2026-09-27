import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api'

const POLL_IDLE_MS = 20_000
const POLL_ACTIVE_MS = 4_000 // while a run is in progress, refresh quickly so results appear as they land

const LiveDataContext = createContext(null)

// One place that keeps the dashboard's shared data fresh: tracked products, recent runs,
// stats and the changes feed. Every page reads from here, so they always agree.
export function useLiveDataSource() {
  const [data, setData] = useState({ tracked: [], runs: [], stats: null, changes: [] })
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const [tracked, runs, stats, changes] = await Promise.all([
        api.listTracked(),
        api.runs(20),
        api.stats(),
        api.changes(30),
      ])
      setData({ tracked, runs, stats, changes })
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoaded(true)
    }
  }, [])

  const runActive = data.runs.some((r) => r.status === 'running')

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, runActive ? POLL_ACTIVE_MS : POLL_IDLE_MS)
    return () => clearInterval(timer)
  }, [refresh, runActive])

  return { ...data, loaded, error, refresh, runActive }
}

export const LiveDataProvider = LiveDataContext.Provider

export function useLiveData() {
  return useContext(LiveDataContext)
}
