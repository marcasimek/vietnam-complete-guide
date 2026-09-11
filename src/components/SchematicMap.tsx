import { useMemo, useState } from 'react'
import type { LabelPos, RouteNode, RouteSegment } from '@/data/route'
import type { TransportMode } from '@/model/types'

/**
 * Vlastní schematická mapa — SVG, žádné dlaždice, funguje offline.
 *
 * Poloha uzlů odpovídá skutečným souřadnicím (s korekcí podle zeměpisné šířky),
 * ale SPOJNICE JSOU ROVNÉ ČÁRY. Nejsou to silnice ani treky.
 */

const W = 340

export interface SchematicMapProps {
  nodes: RouteNode[]
  segments: RouteSegment[]
  height?: number
  highlightNodeIds?: string[]
  onSelectNode?: (node: RouteNode) => void
  onSelectSegment?: (segment: RouteSegment) => void
  selectedId?: string | null
  caption?: string
}

const MODE_DASH: Partial<Record<TransportMode, string>> = {
  motorbike: '5 4',
  train: '1 6',
  ferry: '9 5',
  boat: '9 5',
}

const LABEL_OFFSET: Record<LabelPos, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
  top: { dx: 0, dy: -16, anchor: 'middle' },
  bottom: { dx: 0, dy: 23, anchor: 'middle' },
  left: { dx: -21, dy: 4, anchor: 'end' },
  right: { dx: 21, dy: 4, anchor: 'start' },
}

export function SchematicMap({
  nodes, segments, height = 400, highlightNodeIds = [],
  onSelectNode, onSelectSegment, selectedId, caption,
}: SchematicMapProps) {
  const [hover, setHover] = useState<string | null>(null)
  const H = height

  const positions = useMemo(() => {
    const pad = { top: 34, right: 64, bottom: 36, left: 64 }
    const lats = nodes.map((n) => n.lat)
    const lngs = nodes.map((n) => n.lng)
    const minLat = Math.min(...lats), maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
    const midLat = (minLat + maxLat) / 2
    const kx = Math.cos((midLat * Math.PI) / 180)
    const spanX = (maxLng - minLng) * kx || 1
    const spanY = maxLat - minLat || 1
    const innerW = W - pad.left - pad.right
    const innerH = H - pad.top - pad.bottom
    const scale = Math.min(innerW / spanX, innerH / spanY)
    const offX = pad.left + (innerW - spanX * scale) / 2
    const offY = pad.top + (innerH - spanY * scale) / 2
    const out = new Map<string, { x: number; y: number }>()
    for (const n of nodes) {
      out.set(n.id, {
        x: offX + (n.lng - minLng) * kx * scale,
        y: offY + (maxLat - n.lat) * scale,
      })
    }
    return out
  }, [nodes, H])

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  return (
    <div className="smap">
      <svg viewBox={`0 0 ${W} ${H}`} className="smap__svg" role="img" aria-label="Schematická mapa naší trasy">
        <defs>
          <marker id="smap-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
            <path d="M0 1.6 9 5 0 8.4z" fill="currentColor" />
          </marker>
        </defs>

        <g className="smap__segments">
          {segments.map((s) => {
            const a = positions.get(s.fromNodeId)
            const b = positions.get(s.toNodeId)
            if (!a || !b) return null
            const active = selectedId === s.id || hover === s.id
            const from = nodeById.get(s.fromNodeId)
            const to = nodeById.get(s.toNodeId)
            // Smyčka na stejném uzlu (loop z Hà Giangu a zpět) se kreslí jako oblouk.
            const selfLoop = s.fromNodeId === s.toNodeId
            const d = selfLoop
              ? `M ${a.x} ${a.y} c -30 -26, -54 6, -26 22 c 20 11, 34 -6, 26 -22`
              : `M ${a.x} ${a.y} L ${b.x} ${b.y}`
            const label = `Přesun ${from?.label} → ${to?.label}: ${s.label}`
            return (
              <g key={s.id} className={`smap__seg${active ? ' smap__seg--on' : ''}`} data-mode={s.mode}>
                <path d={d} className="smap__line" strokeDasharray={MODE_DASH[s.mode]} markerEnd={selfLoop ? undefined : 'url(#smap-arrow)'} />
                <path
                  d={d}
                  className="smap__hit"
                  onClick={() => onSelectSegment?.(s)}
                  onMouseEnter={() => setHover(s.id)}
                  onMouseLeave={() => setHover(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectSegment?.(s) } }}
                />
              </g>
            )
          })}
        </g>

        <g className="smap__nodes">
          {nodes.map((n) => {
            const p = positions.get(n.id)
            if (!p) return null
            const hl = highlightNodeIds.includes(n.id)
            const active = selectedId === n.id || hover === n.id
            const lp = LABEL_OFFSET[n.labelPos ?? 'top']
            return (
              <g
                key={n.id}
                className={`smap__node${hl ? ' smap__node--hl' : ''}${active ? ' smap__node--on' : ''}`}
                data-region={n.regionId}
                transform={`translate(${p.x} ${p.y})`}
                onClick={() => onSelectNode?.(n)}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                role="button"
                tabIndex={0}
                aria-label={`${n.label}${n.nights ? `, ${n.nights} ${n.nights === 1 ? 'noc' : 'noci'}` : ', bez noclehu'}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectNode?.(n) } }}
              >
                <circle r="16" className="smap__hitdot" />
                <circle r={n.nights > 0 ? 9 : 5.5} className="smap__dot" />
                {n.nights > 0 ? <text className="smap__nights" y="3.2">{n.nights}</text> : null}
                <text className="smap__label" x={lp.dx} y={lp.dy} textAnchor={lp.anchor}>{n.label}</text>
              </g>
            )
          })}
        </g>
      </svg>
      <p className="xsmall muted smap__note">
        {caption ?? 'Spojnice jsou schematické — rovné čáry mezi zastávkami, ne sjízdné silnice ani treky.'}
        {' '}Číslo v kolečku je počet nocí. Klepni na bod nebo na spojnici.
      </p>
    </div>
  )
}
