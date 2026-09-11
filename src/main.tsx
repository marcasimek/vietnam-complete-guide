import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './styles/fonts.css'
import './styles/global.css'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { UserStateProvider } from './state/UserStateContext'
import { initServiceWorker } from './state/swRegistration'

// Registrujeme hned při startu, ne až při otevření sekce Offline.
initServiceWorker()

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Chybí #root')

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary where="celá aplikace">
      <HashRouter>
        <UserStateProvider>
          <App />
        </UserStateProvider>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
)
