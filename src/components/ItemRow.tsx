import { Link } from 'react-router-dom'
import type { ItineraryItem } from '@/model/types'
import { Icon } from './Icon'
import type { IconName } from './Icon'

const KIND_ICON: Record<ItineraryItem['kind'], IconName> = {
  transport: 'van',
  'stay-and-food': 'bed',
  activity: 'sparkle',
  food: 'bowl',
  evening: 'glass',
  walk: 'walk',
  admin: 'ticket',
  rest: 'spa',
  choice: 'swap',
}

/** Přesnější ikona podle tagů, když ji kind sám neurčí dobře. */
function iconFor(item: ItineraryItem): IconName {
  const tags = item.tags ?? []
  if (item.kind === 'activity') {
    if (tags.includes('adrenaline')) return 'coaster'
    if (tags.includes('water')) return 'kayak'
    if (tags.includes('view')) return 'mountain'
    if (tags.includes('culture')) return 'temple'
  }
  if (item.kind === 'walk' && tags.includes('trek')) return 'mountain'
  if (item.kind === 'evening' && tags.includes('wellness')) return 'spa'
  if (item.kind === 'transport' && tags.includes('water')) return 'boat'
  return KIND_ICON[item.kind]
}

const STATUS_LABEL: Record<ItineraryItem['status'], string | null> = {
  main: null,
  optional: 'volitelné',
  backup: 'náhradní',
}

export function ItemRow({ item, index }: { item: ItineraryItem; index: number }) {
  const status = STATUS_LABEL[item.status]
  return (
    <li className="step" data-status={item.status}>
      <Link to={`/item/${item.id}`} className="step__link">
        <span className="step__node" aria-hidden="true">
          <span className="step__num">{index}</span>
        </span>
        <span className="step__icon" aria-hidden="true"><Icon name={iconFor(item)} size={19} /></span>
        <span className="step__body">
          <span className="step__title">{item.title}</span>
          {item.subtitle ? <span className="step__sub">{item.subtitle}</span> : null}
          {(status || item.timeHint) && (
            <span className="step__meta">
              {item.timeHint ? <span className="chip chip--outline">{item.timeHint}</span> : null}
              {status ? <span className={`chip ${item.status === 'backup' ? 'chip--amber' : 'chip--coral'}`}>{status}</span> : null}
            </span>
          )}
        </span>
        <Icon name="chevron-right" size={18} className="step__chev" />
      </Link>
    </li>
  )
}
