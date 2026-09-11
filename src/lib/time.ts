import { trip } from '@/data/trip'
import { days } from '@/data/days'

/**
 * „Dnes" se řídí VIETNAMSKÝM datem, ne časem telefonu v Česku.
 * V Hanoji už je 26. 9., zatímco v Praze je 25. 9. večer — a my chceme
 * ráno otevřít správný den.
 */
export function vietnamToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: trip.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export type TripPosition =
  | { phase: 'before'; today: string; daysUntil: number; focusDate: string }
  | { phase: 'during'; today: string; focusDate: string }
  | { phase: 'after'; today: string; focusDate: string }

export function tripPosition(now: Date = new Date()): TripPosition {
  const today = vietnamToday(now)
  const first = days[0].date
  const last = days[days.length - 1].date
  if (today < first) {
    return { phase: 'before', today, daysUntil: daysBetween(today, first), focusDate: first }
  }
  if (today > last) return { phase: 'after', today, focusDate: last }
  const exact = days.find((d) => d.date === today)
  return { phase: 'during', today, focusDate: exact ? exact.date : first }
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.UTC(+fromIso.slice(0, 4), +fromIso.slice(5, 7) - 1, +fromIso.slice(8, 10))
  const b = Date.UTC(+toIso.slice(0, 4), +toIso.slice(5, 7) - 1, +toIso.slice(8, 10))
  return Math.round((b - a) / 86_400_000)
}

/** Aktuální čas v cíli, pro hlavičku aplikace. */
export function vietnamClock(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    timeZone: trip.timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(now)
}
