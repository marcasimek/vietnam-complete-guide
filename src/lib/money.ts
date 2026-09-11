import type { Confidence, Currency, Price, PriceUnit } from '@/model/types'
import { trip } from '@/data/trip'

const UNIT_LABEL: Record<PriceUnit, string> = {
  'per-person': 'za osobu',
  'per-room-night': 'za pokoj / noc',
  'per-vehicle': 'za vozidlo',
  'per-compartment': 'za kupé',
  'per-group': 'za skupinu',
  'per-activity': 'za aktivitu',
  'per-portion': 'za porci',
  'per-shared-dish': 'za společný kotlík',
  'per-day': 'za den',
  'per-hour': 'za hodinu',
  'per-item': 'za kus',
  'per-ride': 'za jízdu',
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  'traveller-plan': 'náš plán',
  verified: 'ověřeno ve zdroji',
  published: 'zveřejněný ceník',
  estimate: 'odhad',
  unverified: 'neověřeno',
}

export const CONFIDENCE_HELP: Record<Confidence, string> = {
  'traveller-plan': 'Co chceme my. Není to potvrzená rezervace ani ověřený provozní údaj.',
  verified: 'Údaj potvrzený přímo v uvedeném zdroji. Neznamená, že je pro náš termín volno.',
  published: 'Cena nebo řád zveřejněný poskytovatelem či prodejcem. Dostupnost pro náš termín ověřená není.',
  estimate: 'Náš odhad z dostupných podkladů. Ber jako řádovou orientaci.',
  unverified: 'Nemáme pro to zdroj. Před rozhodnutím je nutné to potvrdit.',
}

export function unitLabel(unit: PriceUnit): string { return UNIT_LABEL[unit] }

function nf(currency: Currency): Intl.NumberFormat {
  return new Intl.NumberFormat('cs-CZ', {
    maximumFractionDigits: currency === 'VND' ? 0 : currency === 'CZK' ? 0 : 2,
  })
}

export function formatAmount(value: number, currency: Currency): string {
  return `${nf(currency).format(value)} ${currency}`
}

/** „250 000 VND" nebo „270 000 – 500 000 VND". Null = částku neznáme. */
export function formatPriceValue(price: Price): string | null {
  const f = nf(price.currency)
  if (typeof price.amount === 'number') return `${f.format(price.amount)} ${price.currency}`
  if (typeof price.min === 'number' && typeof price.max === 'number') {
    return `${f.format(price.min)} – ${f.format(price.max)} ${price.currency}`
  }
  if (typeof price.min === 'number') return `od ${f.format(price.min)} ${price.currency}`
  if (typeof price.max === 'number') return `do ${f.format(price.max)} ${price.currency}`
  return null
}

export interface CzkConversion { text: string; rateDate: string }

/**
 * Přepočet na Kč podle JEDNOHO uloženého kurzu s datem.
 * Kurz se neaktualizuje živě — offline i online se používá stejná hodnota.
 */
export function toCzk(price: Price): CzkConversion | null {
  if (price.currency === 'CZK') return null
  const fx = trip.exchange.find((e) => e.from === price.currency && e.to === 'CZK')
  if (!fx) return null
  const f = nf('CZK')
  const conv = (v: number) => f.format(Math.round(v * fx.rate))
  if (typeof price.amount === 'number') return { text: `≈ ${conv(price.amount)} Kč`, rateDate: fx.checkedOn }
  if (typeof price.min === 'number' && typeof price.max === 'number') {
    return { text: `≈ ${conv(price.min)} – ${conv(price.max)} Kč`, rateDate: fx.checkedOn }
  }
  if (typeof price.min === 'number') return { text: `≈ od ${conv(price.min)} Kč`, rateDate: fx.checkedOn }
  if (typeof price.max === 'number') return { text: `≈ do ${conv(price.max)} Kč`, rateDate: fx.checkedOn }
  return null
}

/** „za osobu · pro 4 osoby" */
export function formatUnit(price: Price): string {
  const parts = [unitLabel(price.unit)]
  if (price.persons && price.unit !== 'per-person' && price.unit !== 'per-portion') {
    parts.push(`pro ${price.persons} ${price.persons < 5 ? 'osoby' : 'osob'}`)
  }
  return parts.join(' · ')
}

/** Cena za celou naši čtveřici tam, kde to dává smysl. */
export function formatForFour(price: Price): string | null {
  if (price.unit !== 'per-person') return null
  const f = nf(price.currency)
  if (typeof price.amount === 'number') return `${f.format(price.amount * 4)} ${price.currency} za čtyři`
  if (typeof price.min === 'number' && typeof price.max === 'number') {
    return `${f.format(price.min * 4)} – ${f.format(price.max * 4)} ${price.currency} za čtyři`
  }
  return null
}
