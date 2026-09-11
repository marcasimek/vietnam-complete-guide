import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PlanPage } from './pages/PlanPage'
import { DayPage } from './pages/DayPage'
import { ItemPage } from './pages/ItemPage'
import { TransportPage } from './pages/TransportPage'
import { ChoicePage } from './pages/ChoicePage'
import { PlacePage } from './pages/PlacePage'
import { ServicePage } from './pages/ServicePage'
import { MapPage } from './pages/MapPage'
import { GuidePage } from './pages/GuidePage'
import { TripPage } from './pages/TripPage'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * Scroll se resetuje jen při přechodu na NOVOU stránku.
 * Návrat zpět (POP) si ponechá pozici — jinak bychom po návratu z mapy
 * ztratili místo v itineráři.
 */
function ScrollManager() {
  const { pathname, key } = useLocation()
  useEffect(() => {
    const nav = (window.history.state as { idx?: number } | null)?.idx
    void nav
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, key])
  return null
}

export function App() {
  return (
    <AppShell>
      <ScrollManager />
      <ErrorBoundary where="obsah stránky">
      <Routes>
        <Route path="/" element={<Navigate to="/plan" replace />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/day/:date" element={<DayPage />} />
        <Route path="/item/:id" element={<ItemPage />} />
        <Route path="/transport/:id" element={<TransportPage />} />
        <Route path="/choice/:id" element={<ChoicePage />} />
        <Route path="/place/:id" element={<PlacePage />} />
        <Route path="/service/:id" element={<ServicePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/trip" element={<TripPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ErrorBoundary>
    </AppShell>
  )
}
