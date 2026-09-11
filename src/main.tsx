import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'
import '@fontsource/be-vietnam-pro/600.css'
import '@fontsource/be-vietnam-pro/700.css'
import './styles/global.css'
import { App } from './App'
import { UserStateProvider } from './state/UserStateContext'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Chybí #root')

createRoot(rootEl).render(
  <StrictMode>
    <HashRouter>
      <UserStateProvider>
        <App />
      </UserStateProvider>
    </HashRouter>
  </StrictMode>,
)
