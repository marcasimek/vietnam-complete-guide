/**
 * Datový model aplikace.
 *
 * Zásady (viz zadání §9):
 *  - stabilní textová ID, nikdy odkazování podle indexu pole,
 *  - `null` / stav "neznámo" místo vymyšlené nuly,
 *  - důvěryhodnost údaje, dostupnost a stav rezervace jsou TŘI oddělené věci,
 *  - ke každému faktickému tvrzení patří zdroj + datum kontroly.
 */

/** ISO datum `YYYY-MM-DD` v místním čase cíle (Asia/Ho_Chi_Minh). */
export type IsoDate = string

/** Jak moc věříme konkrétnímu údaji. Pět stavů ze zadání §6. */
export type Confidence =
  /** 1 — plán cestujících (co chceme, ne co je potvrzené) */
  | 'traveller-plan'
  /** 2 — provozní údaj ověřený v uvedeném zdroji */
  | 'verified'
  /** 3 — zveřejněný ceník / jízdní řád, ale bez ověřené dostupnosti pro náš termín */
  | 'published'
  /** 4 — vlastní odhad z dostupných podkladů */
  | 'estimate'
  /** 5 — neověřeno, nutno potvrdit na místě nebo u poskytovatele */
  | 'unverified'

/** Dostupnost pro NÁŠ konkrétní termín — nezávislá na tom, jak věříme ceně. */
export type Availability = 'confirmed-for-our-date' | 'likely' | 'unknown' | 'not-available'

/** Stav rezervace = výhradně to, co jsme sami udělali. Default vždy `todo`. */
export type BookingStatus = 'todo' | 'requested' | 'booked' | 'paid' | 'not-needed' | 'cancelled'

export type Currency = 'VND' | 'USD' | 'CZK' | 'EUR'

/** Jednotka ceny je POVINNÁ — bez ní se cena nesmí zobrazit. */
export type PriceUnit =
  | 'per-person'
  | 'per-room-night'
  | 'per-vehicle'
  | 'per-compartment'
  | 'per-group'
  | 'per-activity'
  | 'per-portion'
  | 'per-shared-dish'
  | 'per-day'
  | 'per-hour'
  | 'per-item'
  | 'per-ride'

export interface Price {
  currency: Currency
  /** Pevná částka. Použij buď `amount`, nebo `min`+`max`. */
  amount?: number
  min?: number
  max?: number
  unit: PriceUnit
  /** Kolika osob se částka týká (u `per-room-night` kolik lůžek pokoj má). */
  persons?: number
  /** Co je v ceně. */
  includes?: string[]
  /** Co v ceně NENÍ — brání dvojímu započtení v rozpočtu. */
  excludes?: string[]
  note?: string
  confidence: Confidence
  /** ID zdroje z rejstříku zdrojů. */
  sourceIds?: string[]
  /** Datum, kdy byl údaj naposledy kontrolován (YYYY-MM-DD). */
  checkedOn?: IsoDate
  /** Odkdy cena platí podle poskytovatele, pokud to zdroj uvádí. */
  effectiveFrom?: IsoDate
}

export type SourceKind =
  | 'official'
  | 'operator'
  | 'authority'
  | 'transport-platform'
  | 'guide'
  | 'review'
  | 'community'
  | 'map'
  | 'traveller'

export interface Source {
  id: string
  title: string
  url?: string
  publisher?: string
  kind: SourceKind
  /** Kdy jsme zdroj naposledy otevřeli / ověřili. */
  checkedOn: IsoDate
  /** Co konkrétně tenhle zdroj podpírá — ne "všechno na kartě". */
  supports: string[]
  note?: string
}

/** Přesnost souřadnic — bod města NENÍ přesná poloha nástupiště. */
export type GeoPrecision =
  /** ověřený pin konkrétního objektu */
  | 'exact'
  /** správná ulice / blok, ne přesný vchod */
  | 'approximate'
  /** jen centrum obce nebo oblasti */
  | 'area-centroid'
  /** pin neznáme; souřadnice je jen kotva oblasti, aby bod šel vykreslit do schématu */
  | 'area-fallback'

export interface GeoPoint {
  /** Pozor: pořadí lat, lng (knihovní). GeoJSON export prohazuje na [lng, lat]. */
  lat: number
  lng: number
  precision: GeoPrecision
  /** Adresa tak, jak ji uvádí zdroj. */
  address?: string
  /** Textový dotaz pro vyhledání v mapě, když nemáme důvěryhodný pin. */
  searchQuery?: string
  sourceIds?: string[]
}

export interface OpeningHours {
  /** Volný, ale krátký zápis; zobrazuj jen když má zdroj. */
  summary: string
  confidence: Confidence
  sourceIds?: string[]
  checkedOn?: IsoDate
}

export type RegionId =
  | 'hanoi'
  | 'ha-giang'
  | 'ha-giang-loop'
  | 'sapa'
  | 'train'
  | 'ninh-binh'
  | 'cat-ba'
  | 'transit'

export interface Region {
  id: RegionId
  name: string
  localName?: string
  /** Krátce: co to je za oblast a proč tam jedeme. */
  blurb: string
  /** Klíč do palety — barva oblasti v UI. */
  accent: string
  center: GeoPoint
}

export type PlaceKind =
  | 'city'
  | 'village'
  | 'viewpoint'
  | 'landmark'
  | 'nature'
  | 'cave'
  | 'beach'
  | 'trek'
  | 'market'
  | 'station'
  | 'airport'
  | 'water'

export interface Place {
  id: string
  kind: PlaceKind
  name: string
  localName?: string
  /** Alternativní zápisy pro vyhledávání ("Hanoi", "Hà Nội", "Hanoj"). */
  aliases?: string[]
  regionId: RegionId
  /** 1–2 věty: co to je. */
  what: string
  /** Proč je to v NAŠEM plánu. */
  whyHere?: string
  geo?: GeoPoint
  /** Typická délka návštěvy. */
  duration?: string
  difficulty?: string
  price?: Price[]
  openingHours?: OpeningHours
  /** Praktické poznámky, každý řádek samostatně. */
  practical?: string[]
  /** Na co si dát pozor / co není zaručené. */
  caveats?: string[]
  sourceIds?: string[]
  /** ID alternativ z rejstříku alternativ. */
  alternativeIds?: string[]
  tags?: Tag[]
  website?: string
}

export type ServiceKind =
  | 'stay'
  | 'eatery'
  | 'bar'
  | 'cafe'
  | 'wellness'
  | 'operator'
  | 'attraction'
  | 'shop'
  | 'rental'

export type Tag =
  | 'food'
  | 'stay'
  | 'transport'
  | 'view'
  | 'trek'
  | 'culture'
  | 'activity'
  | 'evening'
  | 'wellness'
  | 'water'
  | 'shopping'
  | 'budget'
  | 'adrenaline'
  | 'rest'

export interface Service {
  id: string
  kind: ServiceKind
  name: string
  localName?: string
  aliases?: string[]
  regionId: RegionId
  /** 1–2 věty: co to je / co tam děláme. */
  what: string
  /** Proč zrovna tenhle podnik — menu, cenová hladina, poloha, doložená zkušenost. */
  why?: string
  /** U jídelen: co si konkrétně objednat. */
  orderThis?: { dish: string; localName?: string; price?: Price; note?: string }[]
  geo?: GeoPoint
  openingHours?: OpeningHours
  price?: Price[]
  /** Pokoj/vybavení/dojezd — krátké praktické řádky. */
  practical?: string[]
  caveats?: string[]
  /** Např. "cca 350 m od hlavního náměstí" — jen když to má oporu. */
  proximity?: string
  website?: string
  phone?: string
  sourceIds?: string[]
  tags?: Tag[]
  /** Doporučeno jako výchozí volba ve skupině? */
  recommended?: boolean
}

export type TransportMode = 'van' | 'bus' | 'car' | 'train' | 'boat' | 'ferry' | 'motorbike' | 'bicycle' | 'walk' | 'plane' | 'taxi' | 'cable-car'

export interface TransportOption {
  id: string
  mode: TransportMode
  label: string
  /** Skutečný dopravce. */
  operator?: string
  /** Prodejce jízdenek, pokud NENÍ totožný s dopravcem — zadání to chce rozlišit. */
  reseller?: string
  /** Doba ode dveří ke dveřím, ne jen čistá jízda. */
  doorToDoor?: { minHours: number; maxHours: number; note?: string; confidence: Confidence }
  /** Čistá doba jízdy, pokud ji zdroj uvádí odděleně. */
  ridingTime?: { minHours: number; maxHours: number }
  price?: Price[]
  /** Kapacita pro 4 cestující + řidič + zavazadla. */
  capacityNote?: string
  pickup?: { description: string; geo?: GeoPoint }
  dropoff?: { description: string; geo?: GeoPoint }
  schedule?: { summary: string; confidence: Confidence; sourceIds?: string[] }
  availability: Availability
  bookingLeadTime?: string
  bookingUrl?: string
  pros?: string[]
  cons?: string[]
  sourceIds?: string[]
  recommended?: boolean
}

export interface TransportLeg {
  id: string
  from: string
  to: string
  fromPlaceId?: string
  toPlaceId?: string
  date?: IsoDate
  /** Krátce, co ten přesun znamená. */
  summary: string
  options: TransportOption[]
  /** Co dělat, když spoj nepojede / dorazíme pozdě. */
  fallback?: string[]
  practical?: string[]
  sourceIds?: string[]
}

/** Skupina voleb: "kde v Sa Pa spát", "oběd po příjezdu", "večer podle nálady". */
export interface ChoiceGroup {
  id: string
  title: string
  /** Krátce: co se tu rozhoduje. */
  intro: string
  /** `pick-one` = vybíráme jednu; `or` = varianty podle nálady, ne povinný seznam. */
  mode: 'pick-one' | 'or' | 'combine'
  regionId: RegionId
  /** ID služeb (Service) v pořadí doporučení. */
  serviceIds: string[]
  /** Na co při výběru koukat. */
  decisionNotes?: string[]
  openQuestions?: string[]
}

export type ItemKind =
  | 'transport'
  | 'stay-and-food'
  | 'activity'
  | 'food'
  | 'evening'
  | 'walk'
  | 'admin'
  | 'rest'
  | 'choice'

export type DayPart = 'early' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'flexible'

/** Jeden významový řádek v itineráři. VŽDY klikací, vždy vede na detail. */
export interface ItineraryItem {
  id: string
  kind: ItemKind
  /** Titulek přesně tak, jak ho chceme v přehledu. */
  title: string
  /** Jednořádkové doplnění pod titulek v přehledu. */
  subtitle?: string
  /** Pořadí v rámci dne. */
  order: number
  dayPart: DayPart
  /** `main` = hlavní program, `optional` = volitelné, `backup` = náhradní varianta. */
  status: 'main' | 'optional' | 'backup'
  /** Časový rámec jen tam, kde má oporu. */
  timeHint?: string
  /** Odkazy do rejstříků — odtud se skládá detail kroku. */
  transportLegId?: string
  choiceGroupIds?: string[]
  placeIds?: string[]
  serviceIds?: string[]
  /** Delší text detailu (odstavce). */
  detail?: string[]
  practical?: string[]
  caveats?: string[]
  /** Podmínka, za které krok dává smysl ("jen při bezpečném průtoku"). */
  condition?: string
  alternativeIds?: string[]
  sourceIds?: string[]
  tags?: Tag[]
}

export interface Day {
  /** ID = datum, používá se i v URL: /#/day/2026-09-26 */
  date: IsoDate
  /** Pořadové číslo pobytového dne 1..18 */
  index: number
  weekday: string
  regionId: RegionId
  /** "Hà Giang → Sa Pa" */
  title: string
  /** "Přesun + lehký adrenalin" */
  theme: string
  /** Kde spíme tuhle noc. `null` = noc ve vlaku/nikde. */
  night: { label: string; regionId: RegionId; kind: 'hotel' | 'homestay' | 'train' | 'none' } | null
  items: ItineraryItem[]
  /** Poznámka k celému dni — tempo, rezervy, na co pozor. */
  dayNotes?: string[]
  alternativeIds?: string[]
}

export interface Alternative {
  id: string
  title: string
  /** Kdy to použít. */
  condition: string
  /** Co se tím nahrazuje. */
  replaces: string
  /** Kolik nocí / přesunů to stojí. */
  cost: string
  gains: string[]
  losses: string[]
  regionId?: RegionId
  detail?: string[]
  sourceIds?: string[]
}

export interface Flight {
  id: string
  date: string
  code: string
  fromLabel: string
  fromTime: string
  toLabel: string
  toTime: string
  note?: string
}

export interface Traveller {
  id: string
  name: string
  note?: string
}

export interface Trip {
  id: string
  title: string
  subtitle: string
  startDate: IsoDate
  endDate: IsoDate
  timezone: string
  homeTimezone: string
  travellers: Traveller[]
  flights: Flight[]
  /** Verze publikovaného obsahu — používá se pro cache a update flow. */
  contentVersion: string
  contentUpdatedOn: IsoDate
  /** Kurz pro přepočet, s dohledatelným zdrojem a datem. */
  exchange: { from: Currency; to: Currency; rate: number; sourceId: string; checkedOn: IsoDate }[]
}

/** Položka rezervačního checklistu (§12). */
export interface BookingTask {
  id: string
  title: string
  /** Termín / dny, kterých se týká. */
  when: string
  /** Počet osob / pokojů. */
  quantity: string
  /** Kam to patří v itineráři. */
  dayDates?: IsoDate[]
  /** Kdo to poskytuje — kandidáti. */
  providerHint?: string
  how?: string
  leadTime?: string
  priceHint?: Price
  includes?: string[]
  cancellation?: string
  /** Výchozí stav je vždy `todo`. Skutečný stav si drží zařízení lokálně. */
  defaultStatus: BookingStatus
  relatedServiceIds?: string[]
  relatedLegIds?: string[]
}

export type GuideCardCategory =
  | 'entry'
  | 'flights'
  | 'insurance'
  | 'money'
  | 'connectivity'
  | 'health'
  | 'safety'
  | 'rules'
  | 'packing'
  | 'budget'

export interface GuideCard {
  id: string
  category: GuideCardCategory
  title: string
  /** Jedna věta, co z toho plyne. */
  lead: string
  sections: { heading?: string; bullets: string[] }[]
  caveats?: string[]
  sourceIds?: string[]
  tags?: Tag[]
}

export interface PlanBScenario {
  id: string
  title: string
  trigger: string
  steps: string[]
  affectsBookings?: string[]
  losses?: string[]
}

/** Nevyřešené věci — poctivý seznam, ne prázdné karty "ověřit na místě". */
export interface OpenQuestion {
  id: string
  title: string
  detail: string
  /** Konkrétní další krok, ne "zjistit". */
  nextStep: string
  owner?: string
  relatedDayDates?: IsoDate[]
}
