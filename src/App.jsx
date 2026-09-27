import { useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import Logo from './components/Logo'
import TrackModal from './components/TrackModal'
import { exportCsvUrl } from './api'
import ActivityPage from './pages/ActivityPage'
import OverviewPage from './pages/OverviewPage'
import ProductPage from './pages/ProductPage'
import StatusPage from './pages/StatusPage'
import { LiveDataProvider, useLiveDataSource } from './lib/useLiveData'

export default function App() {
  const live = useLiveDataSource()
  // null = closed, true = open on search, a number = open on that store product's options
  const [tracking, setTracking] = useState(null)
  const navigate = useNavigate()

  return (
    <LiveDataProvider value={live}>
      <div className="shell">
        <header className="topbar">
          <div className="topbar-bar">
            <NavLink to="/" className="brand-link" aria-label="pricetrail home">
              <Logo />
            </NavLink>
            <nav className="nav" aria-label="Main">
              <NavLink to="/" end>
                Overview
              </NavLink>
              <NavLink to="/activity">Activity</NavLink>
              <NavLink to="/status">
                Status
                {live.runActive && <span className="nav-live" title="A run is in progress" />}
              </NavLink>
            </nav>
            <div className="topbar-actions">
              <a className="btn btn-outline" href={exportCsvUrl} download>
                Export CSV
              </a>
              <button type="button" className="btn btn-primary" onClick={() => setTracking(true)}>
                Track a product
              </button>
            </div>
          </div>
        </header>

        {live.error && (
          <p className="glass banner-error">
            Can’t reach the API ({live.error}). If the server was asleep it can take up to a minute to wake up; this page
            keeps retrying on its own.
          </p>
        )}

        <main>
          <Routes>
            <Route path="/" element={<OverviewPage onTrack={(storeProductId) => setTracking(storeProductId ?? true)} />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="*" element={<OverviewPage onTrack={(storeProductId) => setTracking(storeProductId ?? true)} />} />
          </Routes>
        </main>

        <footer className="foot">
          <span>Data scraped from INE’s mock store, demo.inelabteamdev.com.</span>
          <span>Times are in your time zone; the CSV export uses UTC.</span>
        </footer>
      </div>

      <TrackModal
        open={tracking !== null}
        productId={typeof tracking === 'number' ? tracking : null}
        onClose={() => setTracking(null)}
        onTracked={(created) => {
          setTracking(null)
          live.refresh()
          navigate(`/product/${created.id}`)
        }}
      />
    </LiveDataProvider>
  )
}
