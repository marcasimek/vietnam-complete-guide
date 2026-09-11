import { useEffect, useRef, useState } from 'react'
import type { RouteNode, RouteSegment } from '@/data/route'
import { Icon } from './Icon'

/**
 * Podrobná mapa s dlaždicemi OpenStreetMap.
 *
 * Leaflet se načítá až na vyžádání (dynamický import), takže se nepřipojuje
 * k app shellu zbytečně. Dlaždice se NEPŘEDSTAHUJÍ — podmínky provozu
 * standardních dlaždic OSM to zakazují. Offline proto slouží naše schéma.
 */
export function DetailedMap({ nodes, segments, highlightNodeIds = [], onSelectNode }: {
  nodes: RouteNode[]
  segments: RouteSegment[]
  highlightNodeIds?: string[]
  onSelectNode?: (n: RouteNode) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cleanup: (() => void) | undefined
    let cancelled = false

    void (async () => {
      try {
        const L = (await import('leaflet')).default
        await import('leaflet/dist/leaflet.css')
        if (cancelled || !ref.current) return

        const map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true })
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        const nodeById = new Map(nodes.map((n) => [n.id, n]))
        for (const s of segments) {
          const a = nodeById.get(s.fromNodeId)
          const b = nodeById.get(s.toNodeId)
          if (!a || !b) continue
          L.polyline(
            [[a.lat, a.lng], [b.lat, b.lng]],
            { color: s.mode === 'train' ? '#4F6383' : s.mode === 'ferry' ? '#1E7FB8' : s.mode === 'motorbike' ? '#8659C6' : '#0E6B52', weight: 3, opacity: 0.65, dashArray: '6 6' },
          ).addTo(map).bindTooltip(`${a.label} → ${b.label}: ${s.label} (schematická čára, ne skutečná silnice)`)
        }

        for (const n of nodes) {
          const hl = highlightNodeIds.includes(n.id)
          const marker = L.circleMarker([n.lat, n.lng], {
            radius: n.nights > 0 ? 9 : 6,
            color: hl ? '#0E6B52' : '#15231E',
            weight: hl ? 3 : 1.5,
            fillColor: '#159A74',
            fillOpacity: 0.9,
          }).addTo(map)
          marker.bindTooltip(`${n.label}${n.nights ? ` · ${n.nights} ${n.nights === 1 ? 'noc' : 'noci'}` : ''}`)
          marker.on('click', () => onSelectNode?.(n))
        }

        map.fitBounds(L.latLngBounds(nodes.map((n) => [n.lat, n.lng] as [number, number])), { padding: [28, 28] })
        setState('ready')
        cleanup = () => map.remove()
      } catch {
        // Selhání mapy nesmí zamknout zbytek aplikace.
        if (!cancelled) setState('error')
      }
    })()

    return () => { cancelled = true; cleanup?.() }
  }, [nodes, segments, highlightNodeIds, onSelectNode])

  return (
    <div className="dmap">
      <div ref={ref} className="dmap__canvas" aria-label="Podrobná mapa trasy" />
      {state === 'loading' ? <p className="small muted dmap__msg">Načítám mapu…</p> : null}
      {state === 'error' ? (
        <div className="dmap__msg">
          <Icon name="wifi-off" size={18} />
          <p className="small">
            Podrobnou mapu se nepodařilo načíst — potřebuje síť. Přepni na schéma, to funguje i offline.
          </p>
        </div>
      ) : null}
      <p className="xsmall muted smap__note">
        Podklad © přispěvatelé OpenStreetMap. Spojnice mezi zastávkami jsou schematické, ne skutečné silnice.
        Dlaždice se záměrně nestahují dopředu — podmínky provozu OSM to zakazují.
      </p>
    </div>
  )
}
