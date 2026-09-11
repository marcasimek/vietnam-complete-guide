import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/ui'

export function NotFoundPage() {
  return (
    <div className="page">
      <EmptyState icon="map" title="Tahle adresa v aplikaci není">
        <p>Odkaz mohl vzniknout překlepem nebo pochází ze starší verze plánu.</p>
        <p>Zkus plán cesty, rejstřík nebo mapu.</p>
      </EmptyState>
      <div className="chip-row" style={{ justifyContent: 'center' }}>
        <Link className="btn btn--primary btn--sm" to="/plan">Plán</Link>
        <Link className="btn btn--ghost btn--sm" to="/guide">Průvodce</Link>
        <Link className="btn btn--ghost btn--sm" to="/map">Mapa</Link>
      </div>
    </div>
  )
}
