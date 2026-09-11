import { Fragment } from 'react'
import type { ItineraryItem } from '@/model/types'
import { DAY_PART_LABEL, ItemRow } from './ItemRow'

/**
 * Seznam kroků dne s jemnými předěly podle části dne.
 * Předěl se ukáže jen tam, kde se část dne mění — u dne, kde je všechno
 * „odpoledne", by osm stejných nadpisů jen překáželo.
 */
export function StepList({ items, roomy = false }: { items: ItineraryItem[]; roomy?: boolean }) {
  let lastPart: ItineraryItem['dayPart'] | null = null
  const showParts = new Set(items.map((i) => i.dayPart)).size > 1

  return (
    <ol className={`steps${roomy ? ' steps--roomy' : ''}`}>
      {items.map((item, i) => {
        const newPart = showParts && item.dayPart !== lastPart
        lastPart = item.dayPart
        return (
          <Fragment key={item.id}>
            {newPart ? (
              <li className="steps__part" aria-hidden="true">
                <span>{DAY_PART_LABEL[item.dayPart]}</span>
              </li>
            ) : null}
            <ItemRow item={item} index={i + 1} />
          </Fragment>
        )
      })}
    </ol>
  )
}
