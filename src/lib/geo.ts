import type { GeoPoint, GeoPrecision } from '@/model/types'

export const PRECISION_LABEL: Record<GeoPrecision, string> = {
  exact: 'ověřený pin',
  approximate: 'přibližná poloha',
  'area-centroid': 'střed oblasti',
  'area-fallback': 'přesný bod neznáme',
}

export const PRECISION_HELP: Record<GeoPrecision, string> = {
  exact: 'Souřadnice odpovídají konkrétnímu objektu.',
  approximate: 'Správná ulice nebo blok, ne přesný vchod.',
  'area-centroid': 'Bod je střed obce nebo oblasti, ne přesné místo.',
  'area-fallback': 'Ověřený pin nemáme. Mapa proto otevře vyhledání názvu, ne falešně přesný bod.',
}

/** Má smysl otevřít konkrétní bod, nebo jen vyhledání? */
export function hasTrustedPin(geo?: GeoPoint): boolean {
  return Boolean(geo && (geo.precision === 'exact' || geo.precision === 'approximate'))
}

/**
 * Odkaz do Google Maps podle dokumentovaného formátu Maps URLs.
 * U nedůvěryhodné polohy otevíráme VYHLEDÁNÍ, ne souřadnice —
 * falešně přesný pin je horší než poctivé hledání.
 */
export function mapsUrl(geo?: GeoPoint, fallbackQuery?: string): string | null {
  if (geo && hasTrustedPin(geo)) {
    return `https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lng}`
  }
  const q = geo?.searchQuery ?? geo?.address ?? fallbackQuery
  if (!q) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

/** Navigace. Bez důvěryhodného pinu navigujeme na textový dotaz. */
export function navigateUrl(geo?: GeoPoint, fallbackQuery?: string): string | null {
  if (geo && hasTrustedPin(geo)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${geo.lat},${geo.lng}`
  }
  const q = geo?.searchQuery ?? geo?.address ?? fallbackQuery
  if (!q) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`
}

/** Apple Maps jako alternativa pro iOS. */
export function appleMapsUrl(geo?: GeoPoint, fallbackQuery?: string): string | null {
  if (geo && hasTrustedPin(geo)) return `https://maps.apple.com/?ll=${geo.lat},${geo.lng}&q=${encodeURIComponent(geo.address ?? geo.searchQuery ?? 'Bod')}`
  const q = geo?.searchQuery ?? geo?.address ?? fallbackQuery
  if (!q) return null
  return `https://maps.apple.com/?q=${encodeURIComponent(q)}`
}

/** Převod na GeoJSON pořadí [lng, lat] — pozor, opačné než knihovní lat/lng. */
export function toGeoJsonPosition(geo: GeoPoint): [number, number] {
  return [geo.lng, geo.lat]
}

/** Zpět z GeoJSON pořadí. */
export function fromGeoJsonPosition(pos: [number, number]): { lat: number; lng: number } {
  return { lat: pos[1], lng: pos[0] }
}
