import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { days, places, routeNodes, routeSegments, services } from '@/data'
import { loopNodes, loopSegments, mainNodes, mainSegments } from '@/data/route'
import type { RouteNode, RouteSegment } from '@/data/route'
import { formatDayLong, formatDayShort, getRegion } from '@/model/registry'
import { hasTrustedPin, mapsUrl } from '@/lib/geo'
import { Icon } from '@/components/Icon'
import type { IconName } from '@/components/Icon'
import { SchematicMap } from '@/components/SchematicMap'
import { DetailedMap } from '@/components/DetailedMap'
import { Callout, Section } from '@/components/ui'

const MODE_ICON: Record<string, IconName> = {
  van: 'van', bus: 'bus', car: 'car', train: 'train', boat: 'boat',
  ferry: 'ferry', motorbike: 'motorbike', bicycle: 'bicycle', walk: 'walk',
  plane: 'plane', taxi: 'taxi', 'cable-car': 'cable-car',
}

type Layer = 'stay' | 'food' | 'points'

export function MapPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const dayFilter = params.get('den')
  const [selected, setSelected] = useState<string | null>(null)
  const [detailed, setDetailed] = useState(false)
  const [layers, setLayers] = useState<Layer[]>(['points'])

  const activeDay = dayFilter ? days.find((d) => d.date === dayFilter) : undefined

  const highlight = useMemo(
    () => (activeDay ? routeNodes.filter((n) => n.dayDates.includes(activeDay.date)).map((n) => n.id) : []),
    [activeDay],
  )

  const toggleLayer = (l: Layer) =>
    setLayers((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]))

  const layerItems = useMemo(() => {
    const out: { id: string; name: string; sub: string; href: string; icon: IconName; region: string; hasPin: boolean }[] = []
    if (layers.includes('points')) {
      for (const p of places) {
        if (activeDay && !days.some((d) => d.date === activeDay.date && d.items.some((i) => i.placeIds?.includes(p.id)))) continue
        out.push({ id: p.id, name: p.name, sub: p.what, href: `/place/${p.id}`, icon: 'pin', region: p.regionId, hasPin: hasTrustedPin(p.geo) })
      }
    }
    for (const s of services) {
      const isStay = s.kind === 'stay'
      const isFood = s.kind === 'eatery' || s.kind === 'bar' || s.kind === 'cafe'
      if (isStay && !layers.includes('stay')) continue
      if (isFood && !layers.includes('food')) continue
      if (!isStay && !isFood) continue
      out.push({
        id: s.id, name: s.name, sub: s.what, href: `/service/${s.id}`,
        icon: isStay ? 'bed' : s.kind === 'bar' ? 'glass' : 'bowl',
        region: s.regionId, hasPin: hasTrustedPin(s.geo),
      })
    }
    return out
  }, [layers, activeDay])

  const onNode = (n: RouteNode) => {
    setSelected(n.id)
    const firstDay = n.dayDates[0]
    if (firstDay) navigate(`/day/${firstDay}`)
  }
  const onSegment = (s: RouteSegment) => {
    setSelected(s.id)
    if (s.transportLegId) navigate(`/transport/${s.transportLegId}`)
    else if (s.itemId) navigate(`/item/${s.itemId}`)
  }

  return (
    <div className="page map">
      <header className="guide__head">
        <p className="section-label">Mapa</p>
        <h1>Kudy a čím jedeme</h1>
      </header>

      <div className="mapfilter">
        <div className="filters__row" role="group" aria-label="Filtr dne">
          <button
            type="button"
            className={`fchip${!dayFilter ? ' fchip--on' : ''}`}
            onClick={() => setParams({}, { replace: true })}
          >
            Celá cesta
          </button>
          {days.map((d) => (
            <button
              key={d.date}
              type="button"
              data-region={d.regionId}
              className={`fchip fchip--region${dayFilter === d.date ? ' fchip--on' : ''}`}
              onClick={() => setParams({ den: d.date }, { replace: true })}
            >
              {formatDayShort(d.date)}
            </button>
          ))}
        </div>
      </div>

      {activeDay ? (
        <Callout tone="info">
          <strong>{formatDayLong(activeDay.date)} — {activeDay.title}.</strong>{' '}
          Zvýrazněné body jsou zastávky tohohle dne. <Link to={`/day/${activeDay.date}`}>Otevřít den</Link>
        </Callout>
      ) : null}

      <div className="mapswitch" role="group" aria-label="Typ mapy">
        <button
          type="button"
          className={`segmented__btn${!detailed ? ' segmented__btn--on' : ''}`}
          onClick={() => setDetailed(false)}
        >
          Schéma (funguje offline)
        </button>
        <button
          type="button"
          className={`segmented__btn${detailed ? ' segmented__btn--on' : ''}`}
          onClick={() => setDetailed(true)}
        >
          Podrobná (potřebuje síť)
        </button>
      </div>

      {detailed ? (
        <DetailedMap
          nodes={routeNodes}
          segments={routeSegments}
          highlightNodeIds={highlight}
          onSelectNode={onNode}
        />
      ) : (
        <>
          <SchematicMap
            nodes={mainNodes}
            segments={mainSegments}
            height={400}
            highlightNodeIds={highlight}
            selectedId={selected}
            onSelectNode={onNode}
            onSelectSegment={onSegment}
            caption="Hlavní zastávky cesty. Hanoj je jeden bod, i když se do ní vracíme třikrát — pořadí ukazují šipky."
          />
          <Section title="Hà Giang Loop" hint="Čtyřdenní okruh má vlastní schéma — v celkové mapě by se body slily.">
            <SchematicMap
              nodes={loopNodes}
              segments={loopSegments}
              height={330}
              highlightNodeIds={highlight}
              selectedId={selected}
              onSelectNode={onNode}
              onSelectSegment={onSegment}
              caption="Okruh z Hà Giangu a zpět, 22.–25. 9."
            />
          </Section>
        </>
      )}

      <Section title="Přesuny v pořadí" hint="Klepnutím se dostaneš na skutečné dopravní varianty.">
        <ul className="seglist">
          {routeSegments.map((s) => {
            const from = routeNodes.find((n) => n.id === s.fromNodeId)
            const to = routeNodes.find((n) => n.id === s.toNodeId)
            const href = s.transportLegId ? `/transport/${s.transportLegId}` : s.itemId ? `/item/${s.itemId}` : '/plan'
            const dim = activeDay && s.date !== activeDay.date
            return (
              <li key={s.id} className={dim ? 'seglist__item seglist__item--dim' : 'seglist__item'}>
                <Link to={href} className="seglist__link">
                  <span className="seglist__icon"><Icon name={MODE_ICON[s.mode] ?? 'van'} size={19} /></span>
                  <span className="seglist__text">
                    <span className="seglist__route">{from?.label} <Icon name="arrow-right" size={13} /> {to?.label}</span>
                    <span className="seglist__meta">{formatDayShort(s.date)} · {s.label}</span>
                  </span>
                  <Icon name="chevron-right" size={17} className="idxrow__chev" />
                </Link>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title="Vrstvy" hint="Zobraz ubytování, jídelny nebo místa. Seznam se propojuje s rejstříkem.">
        <div className="filters__row" role="group" aria-label="Vrstvy mapy">
          {([['points', 'Místa'], ['stay', 'Ubytování'], ['food', 'Jídlo a bary']] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`fchip${layers.includes(id) ? ' fchip--on' : ''}`}
              aria-pressed={layers.includes(id)}
              onClick={() => toggleLayer(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {layerItems.length === 0 ? (
          <p className="small muted">Pro zvolené vrstvy a den tu nic není.</p>
        ) : (
          <ul className="idxlist">
            {layerItems.map((it) => {
              const region = getRegion(it.region as never)
              const url = mapsUrl(undefined, it.name)
              return (
                <li key={it.id} data-region={it.region}>
                  <div className="idxrow idxrow--split">
                    <Link to={it.href} className="idxrow__main">
                      <span className="idxrow__icon"><Icon name={it.icon} size={18} /></span>
                      <span className="idxrow__text">
                        <span className="idxrow__name">{it.name}</span>
                        <span className="idxrow__sum">{it.sub}</span>
                        <span className="idxrow__meta">
                          <span className="chip chip--accent">{region?.name}</span>
                          {!it.hasPin ? <span className="chip chip--amber">pin neověřený</span> : null}
                        </span>
                      </span>
                    </Link>
                    {url ? (
                      <a className="icon-btn" href={url} target="_blank" rel="noreferrer noopener" aria-label={`Otevřít ${it.name} v mapě`}>
                        <Icon name="pin" size={18} />
                      </a>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}
