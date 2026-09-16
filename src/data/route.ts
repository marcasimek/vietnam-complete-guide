import type { RegionId, TransportMode } from '@/model/types'

/**
 * Kostra trasy pro mapu.
 *
 * Dvě skupiny:
 *  - `main`  — hlavní zastávky cesty. Hanoj je JEDEN uzel, i když v ní spíme
 *              třikrát v různých fázích; jinak by se tři body překrývaly.
 *  - `loop`  — Hà Giang Loop. Má vlastní schéma, protože body leží blízko sebe
 *              a v celkové mapě by se popisky slily.
 *
 * Spojnice jsou SCHEMATICKÉ — rovné čáry mezi zastávkami, ne geometrie silnic.
 */
export type LabelPos = 'top' | 'bottom' | 'left' | 'right'

export interface RouteNode {
  id: string
  label: string
  regionId: RegionId
  group: 'main' | 'loop'
  lat: number
  lng: number
  order: number
  nights: number
  /** Krátká poznámka pod popisek v seznamu. */
  note?: string
  dayDates: string[]
  labelPos?: LabelPos
}

export interface RouteSegment {
  id: string
  fromNodeId: string
  toNodeId: string
  group: 'main' | 'loop'
  mode: TransportMode
  label: string
  date: string
  transportLegId?: string
  itemId?: string
}

export const routeNodes: RouteNode[] = [
  // --- hlavní trasa ---------------------------------------------------------
  {
    id: 'rn-hanoi', label: 'Hanoj', regionId: 'hanoi', group: 'main',
    lat: 21.0287, lng: 105.8524, order: 1, nights: 3,
    note: 'Start 19.–21. 9. a poslední noc 5./6. 10. Cestou na jih se přes Hanoj už nejede.',
    dayDates: ['2026-09-19', '2026-09-20', '2026-10-05', '2026-10-06'],
    labelPos: 'right',
  },
  {
    id: 'rn-hagiang', label: 'Hà Giang', regionId: 'ha-giang', group: 'main',
    lat: 22.8233, lng: 104.9836, order: 2, nights: 1,
    note: 'Základna před loopem. Batohy tu zůstávají do 25. 9. — noc po loopu se už nespí tady, ale v Sa Pě.',
    dayDates: ['2026-09-21'], labelPos: 'top',
  },
  {
    id: 'rn-sapa', label: 'Sa Pa', regionId: 'sapa', group: 'main',
    lat: 22.3364, lng: 103.8438, order: 3, nights: 3,
    note: 'Noční bus z Hà Giangu 25. 9. (18:00–23:00) sem přiváží ještě týž večer. Coaster, trek v údolí Mường Hoa. Večer 28. 9. odsud odjíždí přímý noční bus dál.',
    dayDates: ['2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28'], labelPos: 'bottom',
  },
  {
    id: 'rn-tamcoc', label: 'Tam Cốc', regionId: 'ninh-binh', group: 'main',
    lat: 20.2192, lng: 105.9375, order: 4, nights: 3,
    note: 'Tràng An, Hang Múa, kola a bazén.',
    dayDates: ['2026-09-29', '2026-09-30', '2026-10-01'], labelPos: 'bottom',
  },
  {
    id: 'rn-catba', label: 'Cát Bà', regionId: 'cat-ba', group: 'main',
    lat: 20.7250, lng: 107.0470, order: 5, nights: 3,
    note: 'Lan Hạ Bay, kajaky, pláže.',
    dayDates: ['2026-10-02', '2026-10-03', '2026-10-04'], labelPos: 'right',
  },

  // --- Hà Giang Loop --------------------------------------------------------
  {
    id: 'rn-loop-hagiang', label: 'Hà Giang', regionId: 'ha-giang', group: 'loop',
    lat: 22.8233, lng: 104.9836, order: 1, nights: 0,
    note: 'Start i cíl okruhu.', dayDates: ['2026-09-22', '2026-09-25'], labelPos: 'bottom',
  },
  {
    id: 'rn-quanba', label: 'Quản Bạ', regionId: 'ha-giang-loop', group: 'loop',
    lat: 23.0670, lng: 104.9880, order: 2, nights: 0,
    note: 'Heaven Gate a první velký výhled.', dayDates: ['2026-09-22'], labelPos: 'left',
  },
  {
    id: 'rn-yenminh', label: 'Yên Minh', regionId: 'ha-giang-loop', group: 'loop',
    lat: 23.1060, lng: 105.1500, order: 3, nights: 1,
    note: 'První noc na loopu.', dayDates: ['2026-09-22'], labelPos: 'bottom',
  },
  {
    id: 'rn-dongvan', label: 'Đồng Văn', regionId: 'ha-giang-loop', group: 'loop',
    lat: 23.2761, lng: 105.3625, order: 4, nights: 1,
    note: 'Staré tržní město pod skalami.', dayDates: ['2026-09-23'], labelPos: 'top',
  },
  {
    id: 'rn-mapileng', label: 'Mã Pí Lèng', regionId: 'ha-giang-loop', group: 'loop',
    lat: 23.2280, lng: 105.3960, order: 5, nights: 0,
    note: 'Průsmyk nad kaňonem Nho Quế.', dayDates: ['2026-09-24'], labelPos: 'right',
  },
  {
    id: 'rn-meovac', label: 'Mèo Vạc', regionId: 'ha-giang-loop', group: 'loop',
    lat: 23.1600, lng: 105.4110, order: 6, nights: 0,
    note: 'Za průsmykem, odtud dlouhý úsek do Du Già.', dayDates: ['2026-09-24'], labelPos: 'right',
  },
  {
    id: 'rn-dugia', label: 'Du Già', regionId: 'ha-giang-loop', group: 'loop',
    lat: 22.9840, lng: 105.1770, order: 7, nights: 1,
    note: 'Homestay, společná večeře, vodopád.', dayDates: ['2026-09-24'], labelPos: 'bottom',
  },
]

export const routeSegments: RouteSegment[] = [
  { id: 'rs-hanoi-hagiang', group: 'main', fromNodeId: 'rn-hanoi', toNodeId: 'rn-hagiang', mode: 'van', label: 'Denní minivan, cca 6–8 h', date: '2026-09-21', transportLegId: 'leg-hanoi-hagiang', itemId: 'item-20260921-transfer' },
  { id: 'rs-hagiang-loop', group: 'main', fromNodeId: 'rn-hagiang', toNodeId: 'rn-hagiang', mode: 'motorbike', label: 'Loop, 4 dny — viz schéma okruhu níž', date: '2026-09-22', itemId: 'item-20260922-depart' },
  { id: 'rs-hagiang-sapa', group: 'main', fromNodeId: 'rn-hagiang', toNodeId: 'rn-sapa', mode: 'bus', label: 'Noční bus, 18:00 → 23:00', date: '2026-09-25', transportLegId: 'leg-hagiang-sapa', itemId: 'item-20260925-night-bus' },
  { id: 'rs-sapa-tamcoc', group: 'main', fromNodeId: 'rn-sapa', toNodeId: 'rn-tamcoc', mode: 'bus', label: 'Přímý noční bus, 8–9 h', date: '2026-09-28', transportLegId: 'leg-sapa-ninhbinh', itemId: 'item-20260928-night-bus' },
  { id: 'rs-tamcoc-catba', group: 'main', fromNodeId: 'rn-tamcoc', toNodeId: 'rn-catba', mode: 'ferry', label: 'Bus + trajekt, cca 4,5–6 h', date: '2026-10-02', transportLegId: 'leg-ninhbinh-catba', itemId: 'item-20261002-transfer' },
  { id: 'rs-catba-hanoi', group: 'main', fromNodeId: 'rn-catba', toNodeId: 'rn-hanoi', mode: 'ferry', label: 'Loď + silnice, cca 4–5,5 h', date: '2026-10-05', transportLegId: 'leg-catba-hanoi', itemId: 'item-20261005-return' },

  { id: 'rs-l1', group: 'loop', fromNodeId: 'rn-loop-hagiang', toNodeId: 'rn-quanba', mode: 'motorbike', label: 'Den 1 — výjezd do hor', date: '2026-09-22', itemId: 'item-20260922-quan-ba' },
  { id: 'rs-l2', group: 'loop', fromNodeId: 'rn-quanba', toNodeId: 'rn-yenminh', mode: 'motorbike', label: 'Den 1 — do Yên Minh', date: '2026-09-22', itemId: 'item-20260922-yen-minh' },
  { id: 'rs-l3', group: 'loop', fromNodeId: 'rn-yenminh', toNodeId: 'rn-dongvan', mode: 'motorbike', label: 'Den 2 — přes Thẩm Mã', date: '2026-09-23', itemId: 'item-20260923-tham-ma' },
  { id: 'rs-l4', group: 'loop', fromNodeId: 'rn-dongvan', toNodeId: 'rn-mapileng', mode: 'motorbike', label: 'Den 3 — průsmyk', date: '2026-09-24', itemId: 'item-20260924-ma-pi-leng' },
  { id: 'rs-l5', group: 'loop', fromNodeId: 'rn-mapileng', toNodeId: 'rn-meovac', mode: 'motorbike', label: 'Den 3 — Nho Quế', date: '2026-09-24', itemId: 'item-20260924-nho-que' },
  { id: 'rs-l6', group: 'loop', fromNodeId: 'rn-meovac', toNodeId: 'rn-dugia', mode: 'motorbike', label: 'Den 3 — dlouhý úsek do Du Già', date: '2026-09-24', itemId: 'item-20260924-du-gia' },
  { id: 'rs-l7', group: 'loop', fromNodeId: 'rn-dugia', toNodeId: 'rn-loop-hagiang', mode: 'motorbike', label: 'Den 4 — návrat', date: '2026-09-25', itemId: 'item-20260925-return' },
]

export const routeNodeById = new Map(routeNodes.map((n) => [n.id, n]))
export const mainNodes = routeNodes.filter((n) => n.group === 'main')
export const loopNodes = routeNodes.filter((n) => n.group === 'loop')
export const mainSegments = routeSegments.filter((s) => s.group === 'main')
export const loopSegments = routeSegments.filter((s) => s.group === 'loop')
