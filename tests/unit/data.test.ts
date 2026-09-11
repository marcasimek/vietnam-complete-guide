import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { days } from '@/data/days'
import { places, placeById } from '@/data/places'
import { services, serviceById } from '@/data/services'
import { transportLegs, transportLegById } from '@/data/transport'
import { choiceGroups, choiceGroupById } from '@/data/choices'
import { sources, sourceById } from '@/data/sources'
import { regions, regionById } from '@/data/regions'
import { trip } from '@/data/trip'
import { bookingTasks } from '@/data/bookings'
import { budgetLines } from '@/data/budget'
import { alternatives } from '@/data/alternatives'
import { openQuestions } from '@/data/openQuestions'
import { guideCards } from '@/data/guide'
import { routeNodes, routeSegments } from '@/data/route'
import type { Price } from '@/model/types'

// ---------------------------------------------------------------------------
// Schémata
// ---------------------------------------------------------------------------

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'datum musí být YYYY-MM-DD')
const confidence = z.enum(['traveller-plan', 'verified', 'published', 'estimate', 'unverified'])
const priceUnit = z.enum([
  'per-person', 'per-room-night', 'per-vehicle', 'per-compartment', 'per-group',
  'per-activity', 'per-portion', 'per-shared-dish', 'per-day', 'per-hour', 'per-item', 'per-ride',
])

const priceSchema = z.object({
  currency: z.enum(['VND', 'USD', 'CZK', 'EUR']),
  amount: z.number().positive().optional(),
  min: z.number().positive().optional(),
  max: z.number().positive().optional(),
  unit: priceUnit,
  persons: z.number().int().positive().optional(),
  confidence,
  sourceIds: z.array(z.string()).optional(),
  checkedOn: isoDate.optional(),
}).passthrough()

const geoSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  precision: z.enum(['exact', 'approximate', 'area-centroid', 'area-fallback']),
}).passthrough()

function collectPrices(): { where: string; price: Price }[] {
  const out: { where: string; price: Price }[] = []
  for (const p of places) p.price?.forEach((x) => out.push({ where: `place:${p.id}`, price: x }))
  for (const s of services) {
    s.price?.forEach((x) => out.push({ where: `service:${s.id}`, price: x }))
    s.orderThis?.forEach((o) => { if (o.price) out.push({ where: `service:${s.id}:${o.dish}`, price: o.price }) })
  }
  for (const l of transportLegs) {
    for (const o of l.options) o.price?.forEach((x) => out.push({ where: `leg:${l.id}:${o.id}`, price: x }))
  }
  return out
}

// ---------------------------------------------------------------------------

describe('struktura cesty', () => {
  it('má přesně 18 pobytových dnů bez duplicit a mezer', () => {
    expect(days).toHaveLength(18)
    const dates = days.map((d) => d.date)
    expect(new Set(dates).size).toBe(18)
    expect(dates).toEqual([...dates].sort())
    expect(dates[0]).toBe('2026-09-19')
    expect(dates[17]).toBe('2026-10-06')
    // žádný chybějící kalendářní den
    for (let i = 1; i < dates.length; i += 1) {
      const prev = Date.parse(`${dates[i - 1]}T00:00:00Z`)
      const cur = Date.parse(`${dates[i]}T00:00:00Z`)
      expect(cur - prev).toBe(86_400_000)
    }
  })

  it('má souvislé indexy dnů 1..18', () => {
    expect(days.map((d) => d.index)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1))
  })

  it('má 17 nocí podle uvedeného rozložení', () => {
    const nights = days.filter((d) => d.night !== null)
    expect(nights).toHaveLength(17)

    const byLabel = new Map<string, number>()
    for (const d of nights) byLabel.set(d.night!.label, (byLabel.get(d.night!.label) ?? 0) + 1)
    expect(byLabel.get('Hanoj')).toBe(3)
    expect(byLabel.get('Hà Giang')).toBe(2)
    expect(byLabel.get('Yên Minh')).toBe(1)
    expect(byLabel.get('Đồng Văn')).toBe(1)
    expect(byLabel.get('Du Già')).toBe(1)
    expect(byLabel.get('Sa Pa')).toBe(2)
    expect(byLabel.get('Tam Cốc')).toBe(3)
    expect(byLabel.get('Cát Bà')).toBe(3)
    expect(nights.filter((d) => d.night!.kind === 'train')).toHaveLength(1)
  })

  it('poslední noc je v Hanoji, ne na ostrově', () => {
    const last = days.find((d) => d.date === '2026-10-05')
    expect(last?.night?.label).toBe('Hanoj')
  })

  it('poslední den nemá noc ve Vietnamu a návrat do Prahy je 7. 10.', () => {
    expect(days[17].night).toBeNull()
    const ey155 = trip.flights.find((f) => f.code === 'EY155')
    expect(ey155?.date).toContain('7. 10. 2026')
    expect(ey155?.toTime).toBe('07:05')
  })

  it('extra zaplacená noc 18./19. 9. nezkresluje počet pobytových nocí', () => {
    const extra = budgetLines.find((l) => l.id === 'bd-hanoi-extra-night')
    expect(extra).toBeDefined()
    expect(extra?.category).toBe('extra')
    expect(days.filter((d) => d.night !== null)).toHaveLength(17)
  })
})

describe('kroky itineráře', () => {
  it('má unikátní ID kroků a souvislé pořadí v rámci dne', () => {
    const ids = new Set<string>()
    for (const day of days) {
      expect(day.items.length).toBeGreaterThan(0)
      const orders = day.items.map((i) => i.order)
      expect(orders).toEqual(Array.from({ length: day.items.length }, (_, i) => i + 1))
      for (const item of day.items) {
        expect(ids.has(item.id), `duplicitní ID kroku ${item.id}`).toBe(false)
        ids.add(item.id)
      }
    }
  })

  it('každý krok má použitelný detail — žádný inertní slib klikatelnosti', () => {
    for (const day of days) {
      for (const item of day.items) {
        const hasBody =
          (item.detail?.length ?? 0) > 0 ||
          (item.practical?.length ?? 0) > 0 ||
          Boolean(item.transportLegId) ||
          (item.choiceGroupIds?.length ?? 0) > 0 ||
          (item.placeIds?.length ?? 0) > 0 ||
          (item.serviceIds?.length ?? 0) > 0
        expect(hasBody, `krok ${item.id} (${day.date}) nemá žádný obsah detailu`).toBe(true)
      }
    }
  })

  it('nevydává volitelné aktivity za potvrzené rezervace', () => {
    for (const day of days) {
      for (const item of day.items) {
        if (item.status !== 'main') continue
        expect(item.title.toLowerCase()).not.toMatch(/rezervováno|potvrzeno|zaplaceno/)
      }
    }
    // Rezervační checklist začíná vždy na "k řešení".
    for (const t of bookingTasks) expect(t.defaultStatus).toBe('todo')
  })
})

describe('referenční integrita', () => {
  it('nemá sirotčí odkazy z kroků', () => {
    for (const day of days) {
      for (const item of day.items) {
        if (item.transportLegId) expect(transportLegById.has(item.transportLegId), `chybí leg ${item.transportLegId}`).toBe(true)
        for (const id of item.choiceGroupIds ?? []) expect(choiceGroupById.has(id), `chybí choice ${id}`).toBe(true)
        for (const id of item.placeIds ?? []) expect(placeById.has(id), `chybí place ${id}`).toBe(true)
        for (const id of item.serviceIds ?? []) expect(serviceById.has(id), `chybí service ${id}`).toBe(true)
        for (const id of item.sourceIds ?? []) expect(sourceById.has(id), `chybí source ${id}`).toBe(true)
        expect(regionById.has(day.regionId)).toBe(true)
      }
    }
  })

  it('nemá sirotčí odkazy v rejstřících', () => {
    const checkSources = (ids: string[] | undefined, where: string) => {
      for (const id of ids ?? []) expect(sourceById.has(id), `${where}: chybí source ${id}`).toBe(true)
    }
    for (const p of places) {
      expect(regionById.has(p.regionId), `place ${p.id}: neznámá oblast`).toBe(true)
      checkSources(p.sourceIds, `place ${p.id}`)
      p.price?.forEach((pr) => checkSources(pr.sourceIds, `place ${p.id} cena`))
      checkSources(p.geo?.sourceIds, `place ${p.id} geo`)
    }
    for (const s of services) {
      expect(regionById.has(s.regionId), `service ${s.id}: neznámá oblast`).toBe(true)
      checkSources(s.sourceIds, `service ${s.id}`)
      s.price?.forEach((pr) => checkSources(pr.sourceIds, `service ${s.id} cena`))
      checkSources(s.openingHours?.sourceIds, `service ${s.id} otevírací doba`)
    }
    for (const c of choiceGroups) {
      for (const sid of c.serviceIds) expect(serviceById.has(sid), `choice ${c.id}: chybí service ${sid}`).toBe(true)
    }
    for (const l of transportLegs) {
      checkSources(l.sourceIds, `leg ${l.id}`)
      for (const o of l.options) checkSources(o.sourceIds, `leg ${l.id} varianta ${o.id}`)
      if (l.fromPlaceId) expect(placeById.has(l.fromPlaceId)).toBe(true)
      if (l.toPlaceId) expect(placeById.has(l.toPlaceId)).toBe(true)
    }
    for (const b of budgetLines) checkSources(b.sourceIds, `rozpočet ${b.id}`)
    for (const g of guideCards) checkSources(g.sourceIds, `průvodce ${g.id}`)
    for (const a of alternatives) checkSources(a.sourceIds, `alternativa ${a.id}`)
  })

  it('alternativy odkazované z kroků existují a mají co nabídnout', () => {
    const byId = new Map(alternatives.map((a) => [a.id, a]))
    let linked = 0
    for (const day of days) {
      for (const item of day.items) {
        for (const id of item.alternativeIds ?? []) {
          const alt = byId.get(id)
          expect(alt, `krok ${item.id}: chybí alternativa ${id}`).toBeDefined()
          expect(alt!.condition.length, `${id}: chybí podmínka použití`).toBeGreaterThan(0)
          expect(alt!.replaces.length, `${id}: chybí, co nahrazuje`).toBeGreaterThan(0)
          expect(alt!.cost.length, `${id}: chybí, co to stojí`).toBeGreaterThan(0)
          linked += 1
        }
      }
    }
    // Nestačí mít alternativy v datech — musí být vidět tam, kde se rozhoduje.
    expect(linked, 'žádná alternativa není napojená na krok itineráře').toBeGreaterThanOrEqual(4)
  })

  it('odkazy na dny v checklistu, rozpočtu a otázkách existují', () => {
    const dates = new Set(days.map((d) => d.date))
    for (const t of bookingTasks) for (const d of t.dayDates ?? []) expect(dates.has(d), `${t.id}: neznámé datum ${d}`).toBe(true)
    for (const b of budgetLines) for (const d of b.dayDates ?? []) expect(dates.has(d), `${b.id}: neznámé datum ${d}`).toBe(true)
    for (const q of openQuestions) for (const d of q.relatedDayDates ?? []) expect(dates.has(d), `${q.id}: neznámé datum ${d}`).toBe(true)
    for (const n of routeNodes) for (const d of n.dayDates) expect(dates.has(d), `${n.id}: neznámé datum ${d}`).toBe(true)
    for (const s of routeSegments) expect(dates.has(s.date), `${s.id}: neznámé datum ${s.date}`).toBe(true)
  })

  it('uzly a spojnice mapy na sebe navazují', () => {
    const nodeIds = new Set(routeNodes.map((n) => n.id))
    for (const s of routeSegments) {
      expect(nodeIds.has(s.fromNodeId), `${s.id}: chybí uzel ${s.fromNodeId}`).toBe(true)
      expect(nodeIds.has(s.toNodeId), `${s.id}: chybí uzel ${s.toNodeId}`).toBe(true)
      if (s.itemId) {
        const exists = days.some((d) => d.items.some((i) => i.id === s.itemId))
        expect(exists, `${s.id}: chybí krok ${s.itemId}`).toBe(true)
      }
      if (s.transportLegId) expect(transportLegById.has(s.transportLegId)).toBe(true)
    }
  })

  it('každý přesun mezi oblastmi vede na skutečné dopravní varianty', () => {
    // Smyčka loopu z Hà Giangu a zpět nemá vlastní leg — má vlastní schéma.
    const mainMoves = routeSegments.filter((s) => s.group === 'main' && s.fromNodeId !== s.toNodeId)
    expect(mainMoves.length).toBeGreaterThanOrEqual(7)
    for (const s of mainMoves) {
      expect(s.transportLegId, `${s.id}: přesun bez dopravního detailu`).toBeTruthy()
      const leg = transportLegById.get(s.transportLegId!)
      expect(leg, `${s.id}: chybí leg ${s.transportLegId}`).toBeDefined()
      expect(leg!.options.length, `${leg!.id}: méně než dvě varianty`).toBeGreaterThanOrEqual(2)
      expect(leg!.options.filter((o) => o.recommended).length, `${leg!.id}: musí být právě jedna doporučená varianta`).toBe(1)
      expect(leg!.fallback?.length, `${leg!.id}: chybí plán, když to nevyjde`).toBeGreaterThan(0)
      for (const o of leg!.options) {
        expect(o.doorToDoor, `${leg!.id}/${o.id}: chybí čas ode dveří ke dveřím`).toBeDefined()
        expect(o.pickup, `${leg!.id}/${o.id}: chybí nástup`).toBeDefined()
        expect(o.dropoff, `${leg!.id}/${o.id}: chybí výstup`).toBeDefined()
        expect(o.capacityNote, `${leg!.id}/${o.id}: chybí kapacita pro čtyři se zavazadly`).toBeTruthy()
      }
    }
  })

  it('nemá duplicitní ID napříč rejstříky', () => {
    const all = [
      ...places.map((p) => p.id), ...services.map((s) => s.id),
      ...transportLegs.map((l) => l.id), ...choiceGroups.map((c) => c.id),
      ...sources.map((s) => s.id), ...regions.map((r) => r.id),
    ]
    expect(new Set(all).size).toBe(all.length)
  })
})

describe('ceny a jistota', () => {
  it('každá viditelná cena má měnu, jednotku a typ jistoty', () => {
    const all = collectPrices()
    expect(all.length).toBeGreaterThan(0)
    for (const { where, price } of all) {
      const parsed = priceSchema.safeParse(price)
      expect(parsed.success, `${where}: ${parsed.success ? '' : JSON.stringify(parsed.error.issues)}`).toBe(true)
      const hasValue = price.amount !== undefined || price.min !== undefined || price.max !== undefined
      // Cena bez hodnoty je povolená (neznáme ji), ale musí mít poznámku, co s tím.
      if (!hasValue) expect(price.note, `${where}: cena bez hodnoty musí mít poznámku`).toBeTruthy()
      if (price.min !== undefined && price.max !== undefined) {
        expect(price.min, `${where}: min > max`).toBeLessThanOrEqual(price.max)
      }
    }
  })

  it('netvrdí „ověřeno" tam, kde zdroj nebyl otevřen', () => {
    // Metoda sběru dat (jen vyhledávání) nedovoluje stupeň `verified`.
    for (const { where, price } of collectPrices()) {
      expect(price.confidence, `${where}: příliš silné tvrzení`).not.toBe('verified')
    }
  })

  it('ceny s uvedeným zdrojem mají i datum kontroly', () => {
    for (const { where, price } of collectPrices()) {
      if (price.sourceIds?.length) expect(price.checkedOn, `${where}: chybí datum kontroly`).toBeTruthy()
    }
  })

  it('rozpočtová položka bez ceny to říká, místo aby předstírala nulu', () => {
    for (const l of budgetLines) {
      if (l.min === null && l.max === null) {
        // Neznámá cena musí mít vysvětlení nebo být v balíčku — ne prázdné místo.
        expect(l.note ?? l.includedIn, `${l.id}: chybí vysvětlení, proč cenu neznáme`).toBeTruthy()
      }
      if (l.min !== null && l.max !== null) {
        expect(l.min, `${l.id}: min > max`).toBeLessThanOrEqual(l.max)
      }
      if (l.min !== null || l.max !== null) {
        expect(l.currency, `${l.id}: cena bez měny`).toBeTruthy()
        expect(['per-person', 'total']).toContain(l.basis)
      }
    }
  })

  it('rozpočet nezapočítává balíčky dvakrát', () => {
    const included = budgetLines.filter((l) => l.includedIn)
    expect(included.length).toBeGreaterThan(0)
    for (const l of included) {
      expect(l.min, `${l.id}: položka v balíčku nesmí mít vlastní částku`).toBeNull()
      expect(l.max).toBeNull()
    }
  })

  it('kurz má zdroj a datum', () => {
    for (const fx of trip.exchange) {
      expect(fx.rate).toBeGreaterThan(0)
      expect(sourceById.has(fx.sourceId), `chybí zdroj kurzu ${fx.sourceId}`).toBe(true)
      expect(fx.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

describe('zdroje a geografie', () => {
  it('každý zdroj má datum kontroly a říká, co podpírá', () => {
    for (const s of sources) {
      expect(isoDate.safeParse(s.checkedOn).success, `${s.id}: špatné datum`).toBe(true)
      expect(s.supports.length, `${s.id}: nemá uvedeno, co podpírá`).toBeGreaterThan(0)
      if (s.url) expect(() => new URL(s.url!)).not.toThrow()
    }
  })

  it('souřadnice jsou platné a označené přesností', () => {
    const geos = [
      ...places.map((p) => ({ id: p.id, geo: p.geo })),
      ...services.map((s) => ({ id: s.id, geo: s.geo })),
      ...regions.map((r) => ({ id: r.id, geo: r.center })),
    ]
    for (const { id, geo } of geos) {
      if (!geo) continue
      const parsed = geoSchema.safeParse(geo)
      expect(parsed.success, `${id}: neplatná geometrie`).toBe(true)
      // Sever Vietnamu — kdyby se prohodilo lat/lng, hodnoty spadnou mimo.
      expect(geo.lat, `${id}: lat mimo sever Vietnamu — prohozené lat/lng?`).toBeGreaterThan(19)
      expect(geo.lat, `${id}: lat mimo sever Vietnamu`).toBeLessThan(24)
      expect(geo.lng, `${id}: lng mimo sever Vietnamu`).toBeGreaterThan(102)
      expect(geo.lng, `${id}: lng mimo sever Vietnamu`).toBeLessThan(108)
    }
  })

  it('bod bez ověřeného pinu má čím se vyhledat', () => {
    const all = [...places.map((p) => ({ id: p.id, geo: p.geo })), ...services.map((s) => ({ id: s.id, geo: s.geo }))]
    for (const { id, geo } of all) {
      if (!geo) continue
      if (geo.precision === 'area-fallback') {
        expect(geo.searchQuery ?? geo.address, `${id}: fallback bez vyhledávacího dotazu`).toBeTruthy()
      }
    }
  })

  it('uzly mapy leží v severním Vietnamu', () => {
    for (const n of routeNodes) {
      expect(n.lat).toBeGreaterThan(19)
      expect(n.lat).toBeLessThan(24)
      expect(n.lng).toBeGreaterThan(102)
      expect(n.lng).toBeLessThan(108)
    }
  })
})

describe('referenční den 26. 9.', () => {
  const day = days.find((d) => d.date === '2026-09-26')!

  it('existuje a má čtyři klikací kroky ve správném pořadí', () => {
    expect(day).toBeDefined()
    expect(day.items.map((i) => i.title)).toEqual([
      'Ranní přímý transfer do Sa Pa',
      'Check-in a oběd',
      'Alpine Coaster / downhill autíčka',
      'Večer: hotpot, bar nebo bylinková koupel',
    ])
  })

  it('transfer má doporučenou variantu, alternativy a plán při zrušení', () => {
    const leg = transportLegById.get(day.items[0].transportLegId!)!
    expect(leg.options.length).toBeGreaterThanOrEqual(2)
    expect(leg.options.filter((o) => o.recommended)).toHaveLength(1)
    expect(leg.fallback?.length).toBeGreaterThan(0)
    for (const o of leg.options) {
      expect(o.doorToDoor, `${o.id}: chybí čas ode dveří ke dveřím`).toBeDefined()
      expect(o.capacityNote, `${o.id}: chybí kapacita pro čtyři`).toBeTruthy()
      expect(o.pickup, `${o.id}: chybí nástup`).toBeDefined()
      expect(o.dropoff, `${o.id}: chybí výstup`).toBeDefined()
    }
  })

  it('check-in a oběd vede na ubytování i na levné jídelny', () => {
    const groups = day.items[1].choiceGroupIds!.map((id) => choiceGroupById.get(id)!)
    expect(groups).toHaveLength(2)
    const stay = groups.find((g) => g.id === 'choice-sapa-stay')!
    const food = groups.find((g) => g.id === 'choice-sapa-arrival-lunch')!
    expect(stay.serviceIds.length).toBeGreaterThanOrEqual(2)
    expect(food.serviceIds.length).toBeGreaterThanOrEqual(2)
    // Ubytování musí mít cenu za dvoulůžkový pokoj a noc.
    const withRoomPrice = stay.serviceIds
      .map((id) => serviceById.get(id)!)
      .filter((s) => s.price?.some((p) => p.unit === 'per-room-night' && p.persons === 2))
    expect(withRoomPrice.length).toBeGreaterThanOrEqual(2)
    // Jídelny musí říct, co si objednat.
    for (const id of food.serviceIds) {
      expect(serviceById.get(id)!.orderThis?.length, `${id}: chybí „co si objednat"`).toBeGreaterThan(0)
    }
  })

  it('coaster je jedna entita s aliasy a vysvětleným rozdílem oproti autíčkům', () => {
    const place = placeById.get('place-alpine-coaster-sapa')!
    expect(place.aliases).toContain('downhill autíčka')
    const detail = (days.find((d) => d.date === '2026-09-26')!.items[2].detail ?? []).join(' ')
    expect(detail).toMatch(/kolejnic/i)
    expect(detail).toMatch(/bezkolejov/i)
    expect(place.price?.[0].currency).toBe('VND')
    expect(place.openingHours).toBeDefined()
  })

  it('večerní varianty jsou „nebo", ne povinnost', () => {
    const group = choiceGroupById.get(day.items[3].choiceGroupIds![0])!
    expect(group.mode).toBe('or')
    expect(group.serviceIds.length).toBeGreaterThanOrEqual(3)
  })
})

describe('bezpečnost obsahu', () => {
  it('neobsahuje citlivé osobní údaje ani tajemství', () => {
    const blob = JSON.stringify({ days, places, services, transportLegs, choiceGroups, sources, trip, bookingTasks, guideCards })
    expect(blob).not.toMatch(/\bpasu? číslo\b|\bčíslo pasu\b/i)
    expect(blob).not.toMatch(/booking reference|rezervační kód/i)
    expect(blob).not.toMatch(/gh[pousr]_[A-Za-z0-9]{16,}/)
    expect(blob).not.toMatch(/\+420\s?\d{3}\s?\d{3}\s?\d{3}/)
    expect(blob).not.toMatch(/[A-Za-z0-9._%+-]+@(?!noreply\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)
  })

  it('neobsahuje zakázaný textový balast', () => {
    const blob = JSON.stringify({ days, places, services, guideCards }).toLowerCase()
    for (const phrase of ['vibe cesty', 'tohle bude pecka', 'same people different views', 'proč s námi']) {
      expect(blob, `nalezena fráze „${phrase}"`).not.toContain(phrase)
    }
  })
})
