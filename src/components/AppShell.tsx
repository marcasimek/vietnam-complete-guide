import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import type { IconName } from './Icon'

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/plan', label: 'Plán', icon: 'plan' },
  { to: '/map', label: 'Mapa', icon: 'map' },
  { to: '/guide', label: 'Průvodce', icon: 'guide' },
  { to: '/trip', label: 'Moje cesta', icon: 'trip' },
]

/** Které sekce patří pod který tab (kvůli zvýraznění u detailů). */
const TAB_SCOPE: Record<string, string[]> = {
  '/plan': ['/plan', '/day', '/item', '/transport', '/choice', '/place', '/service'],
  '/map': ['/map'],
  '/guide': ['/guide'],
  '/trip': ['/trip'],
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine)

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Přeskočit na obsah</a>
      {offline ? (
        <div className="offline-bar" role="status">
          <Icon name="wifi-off" size={15} />
          Zařízení hlásí offline. Uložený plán funguje, externí odkazy a mapa s dlaždicemi ne.
        </div>
      ) : null}
      <main id="main" className="app-main">{children}</main>
      <nav className="tabbar" aria-label="Hlavní navigace">
        <div className="tabbar__inner">
          {TABS.map((t) => {
            const active = (TAB_SCOPE[t.to] ?? [t.to]).some((p) => pathname === p || pathname.startsWith(`${p}/`))
            return (
              <NavLink key={t.to} to={t.to} className="tab" aria-current={active ? 'page' : undefined}>
                <span className="tab__icon"><Icon name={t.icon} size={23} /></span>
                {t.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
