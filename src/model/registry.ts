import type {
  ChoiceGroup, Day, ItineraryItem, Place, RegionId, Service, Source, Tag, TransportLeg,
} from './types'
import {
  choiceGroupById, dayByDate, days, placeById, regionById, serviceById, sourceById, transportLegById,
} from '@/data'
import { scoreMatch, tokenize } from '@/lib/search'

/** Sjednocený typ pro rejstřík — Průvodce, vyhledávání a mapa pracují s tímhle. */
export type EntityKind = 'place' | 'service' | 'transport' | 'choice' | 'day' | 'item'

/** Ikona pro rejstřík — kategorie sama nestačí, hotel a jídelna jsou obojí „service". */
export type IndexIcon =
  | 'pin' | 'bed' | 'bowl' | 'glass' | 'coffee' | 'spa' | 'group' | 'ticket'
  | 'market' | 'bicycle' | 'van' | 'swap' | 'plan' | 'mountain' | 'temple'
  | 'cave' | 'beach' | 'wave' | 'train' | 'plane' | 'walk'

export interface IndexEntry {
  id: string
  kind: EntityKind
  icon: IndexIcon
  name: string
  localName?: string
  aliases: string[]
  regionId: RegionId
  summary: string
  tags: Tag[]
  /** Cesta v aplikaci. */
  href: string
  /** Ve kterých dnech se objevuje. */
  dayDates: string[]
}

// ---------------------------------------------------------------------------
// Kde se co objevuje
// ---------------------------------------------------------------------------

function collectUsage() {
  const placeDays = new Map<string, Set<string>>()
  const serviceDays = new Map<string, Set<string>>()
  const legDays = new Map<string, Set<string>>()
  const choiceDays = new Map<string, Set<string>>()

  const push = (m: Map<string, Set<string>>, key: string, date: string) => {
    const set = m.get(key) ?? new Set<string>()
    set.add(date)
    m.set(key, set)
  }

  for (const day of days) {
    for (const item of day.items) {
      item.placeIds?.forEach((id) => push(placeDays, id, day.date))
      item.serviceIds?.forEach((id) => push(serviceDays, id, day.date))
      if (item.transportLegId) push(legDays, item.transportLegId, day.date)
      for (const cid of item.choiceGroupIds ?? []) {
        push(choiceDays, cid, day.date)
        const group = choiceGroupById.get(cid)
        group?.serviceIds.forEach((sid) => push(serviceDays, sid, day.date))
      }
    }
  }
  return { placeDays, serviceDays, legDays, choiceDays }
}

export const usage = collectUsage()

export function daysForPlace(id: string): string[] { return [...(usage.placeDays.get(id) ?? [])].sort() }
export function daysForService(id: string): string[] { return [...(usage.serviceDays.get(id) ?? [])].sort() }
export function daysForLeg(id: string): string[] { return [...(usage.legDays.get(id) ?? [])].sort() }
export function daysForChoice(id: string): string[] { return [...(usage.choiceDays.get(id) ?? [])].sort() }

// ---------------------------------------------------------------------------
// Rejstřík
// ---------------------------------------------------------------------------

const serviceKindLabel: Record<Service['kind'], string> = {
  stay: 'Ubytování',
  eatery: 'Jídelna',
  bar: 'Bar',
  cafe: 'Kavárna',
  wellness: 'Wellness',
  operator: 'Operátor',
  attraction: 'Atrakce',
  shop: 'Obchod',
  rental: 'Půjčovna',
}

const placeKindLabel: Record<Place['kind'], string> = {
  city: 'Město',
  village: 'Vesnice',
  viewpoint: 'Vyhlídka',
  landmark: 'Místo',
  nature: 'Příroda',
  cave: 'Jeskyně',
  beach: 'Pláž',
  trek: 'Trek',
  market: 'Trh',
  station: 'Nádraží',
  airport: 'Letiště',
  water: 'Voda',
}

export function labelForService(kind: Service['kind']): string { return serviceKindLabel[kind] }
export function labelForPlace(kind: Place['kind']): string { return placeKindLabel[kind] }

const SERVICE_ICON: Record<Service['kind'], IndexIcon> = {
  stay: 'bed', eatery: 'bowl', bar: 'glass', cafe: 'coffee', wellness: 'spa',
  operator: 'group', attraction: 'ticket', shop: 'market', rental: 'bicycle',
}

const PLACE_ICON: Record<Place['kind'], IndexIcon> = {
  city: 'pin', village: 'pin', viewpoint: 'mountain', landmark: 'temple',
  nature: 'mountain', cave: 'cave', beach: 'beach', trek: 'walk',
  market: 'market', station: 'train', airport: 'plane', water: 'wave',
}

function buildIndex(): IndexEntry[] {
  const out: IndexEntry[] = []

  for (const p of placeById.values()) {
    out.push({
      id: p.id, kind: 'place', icon: PLACE_ICON[p.kind], name: p.name, localName: p.localName,
      aliases: p.aliases ?? [], regionId: p.regionId, summary: p.what,
      tags: p.tags ?? [], href: `/place/${p.id}`, dayDates: daysForPlace(p.id),
    })
  }
  for (const s of serviceById.values()) {
    out.push({
      id: s.id, kind: 'service', icon: SERVICE_ICON[s.kind], name: s.name, localName: s.localName,
      aliases: s.aliases ?? [], regionId: s.regionId, summary: s.what,
      tags: s.tags ?? [], href: `/service/${s.id}`, dayDates: daysForService(s.id),
    })
  }
  for (const l of transportLegById.values()) {
    out.push({
      id: l.id, kind: 'transport', icon: 'van', name: `${l.from} → ${l.to}`,
      aliases: [l.from, l.to], regionId: 'transit', summary: l.summary,
      tags: ['transport'], href: `/transport/${l.id}`, dayDates: daysForLeg(l.id),
    })
  }
  for (const c of choiceGroupById.values()) {
    out.push({
      id: c.id, kind: 'choice', icon: 'swap', name: c.title, aliases: [],
      regionId: c.regionId, summary: c.intro, tags: [],
      href: `/choice/${c.id}`, dayDates: daysForChoice(c.id),
    })
  }
  for (const d of days) {
    out.push({
      id: d.date, kind: 'day', icon: 'plan', name: `${formatDayShort(d.date)} — ${d.title}`,
      aliases: [d.title, d.theme], regionId: d.regionId, summary: d.theme,
      tags: [], href: `/day/${d.date}`, dayDates: [d.date],
    })
  }
  return out
}

export const searchIndex = buildIndex()

export interface SearchOptions {
  regionId?: RegionId | 'all'
  tag?: Tag | 'all'
  kind?: EntityKind | 'all'
}

export function searchEntities(query: string, opts: SearchOptions = {}): IndexEntry[] {
  const tokens = tokenize(query)
  const filtered = searchIndex.filter((e) => {
    if (opts.regionId && opts.regionId !== 'all' && e.regionId !== opts.regionId) return false
    if (opts.tag && opts.tag !== 'all' && !e.tags.includes(opts.tag)) return false
    if (opts.kind && opts.kind !== 'all' && e.kind !== opts.kind) return false
    return true
  })
  if (tokens.length === 0) {
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'cs'))
  }
  return filtered
    .map((e) => ({
      e,
      score: scoreMatch(
        [
          { text: e.name, weight: 6 },
          ...(e.localName ? [{ text: e.localName, weight: 5 }] : []),
          ...e.aliases.map((a) => ({ text: a, weight: 4 })),
          { text: e.summary, weight: 1 },
        ],
        tokens,
      ),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.e.name.localeCompare(b.e.name, 'cs'))
    .map((x) => x.e)
}

// ---------------------------------------------------------------------------
// Vyhledání detailu
// ---------------------------------------------------------------------------

export function getDay(date: string): Day | undefined { return dayByDate.get(date) }
export function getPlace(id: string): Place | undefined { return placeById.get(id) }
export function getService(id: string): Service | undefined { return serviceById.get(id) }
export function getLeg(id: string): TransportLeg | undefined { return transportLegById.get(id) }
export function getChoice(id: string): ChoiceGroup | undefined { return choiceGroupById.get(id) }
export function getRegion(id: RegionId) { return regionById.get(id) }
export function getSources(ids?: string[]): Source[] {
  return (ids ?? []).map((id) => sourceById.get(id)).filter((s): s is Source => Boolean(s))
}

export interface ItemLocation { day: Day; item: ItineraryItem }

const itemIndex = new Map<string, ItemLocation>()
for (const day of days) for (const item of day.items) itemIndex.set(item.id, { day, item })

export function getItem(id: string): ItemLocation | undefined { return itemIndex.get(id) }
export const allItems = [...itemIndex.values()]

// ---------------------------------------------------------------------------
// Formátování dat
// ---------------------------------------------------------------------------

const MONTHS_GEN = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince']

export function formatDayShort(date: string): string {
  const [, m, d] = date.split('-')
  return `${Number(d)}. ${Number(m)}.`
}

export function formatDayLong(date: string): string {
  const [, m, d] = date.split('-')
  return `${Number(d)}. ${MONTHS_GEN[Number(m) - 1]}`
}

const WEEKDAY_SHORT: Record<string, string> = {
  pondělí: 'po', úterý: 'út', středa: 'st', čtvrtek: 'čt',
  pátek: 'pá', sobota: 'so', neděle: 'ne',
}
export function weekdayShort(weekday: string): string { return WEEKDAY_SHORT[weekday] ?? weekday.slice(0, 2) }
