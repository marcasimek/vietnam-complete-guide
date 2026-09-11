import { describe, expect, it } from 'vitest'
import { formatForFour, formatPriceValue, formatUnit, toCzk } from '@/lib/money'
import { fromGeoJsonPosition, hasTrustedPin, mapsUrl, navigateUrl, toGeoJsonPosition } from '@/lib/geo'
import type { GeoPoint, Price } from '@/model/types'

describe('ceny', () => {
  const p: Price = { currency: 'VND', amount: 250_000, unit: 'per-person', persons: 1, confidence: 'published' }

  it('formátuje pevnou částku i rozsah', () => {
    expect(formatPriceValue(p)).toMatch(/250\s?000 VND/)
    expect(formatPriceValue({ ...p, amount: undefined, min: 270_000, max: 500_000 })).toMatch(/270\s?000.*500\s?000 VND/)
    expect(formatPriceValue({ ...p, amount: undefined })).toBeNull()
  })

  it('přepočte na Kč podle uloženého kurzu a uvede jeho datum', () => {
    const czk = toCzk(p)
    expect(czk).not.toBeNull()
    expect(czk!.rateDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // 250 000 VND * 0,000803 ≈ 201 Kč
    expect(czk!.text).toMatch(/≈ 20[01] Kč/)
  })

  it('koruny se nepřepočítávají samy na sebe', () => {
    expect(toCzk({ ...p, currency: 'CZK' })).toBeNull()
  })

  it('spočítá cenu za naši čtveřici jen u ceny na osobu', () => {
    expect(formatForFour(p)).toMatch(/1\s?000\s?000 VND za čtyři/)
    expect(formatForFour({ ...p, unit: 'per-vehicle' })).toBeNull()
  })

  it('jednotka je vždy popsaná česky', () => {
    expect(formatUnit(p)).toContain('za osobu')
    expect(formatUnit({ ...p, unit: 'per-room-night', persons: 2 })).toContain('za pokoj / noc')
    expect(formatUnit({ ...p, unit: 'per-vehicle', persons: 4 })).toContain('pro 4 osoby')
  })
})

describe('mapové odkazy', () => {
  const exact: GeoPoint = { lat: 22.3364, lng: 103.8438, precision: 'exact' }
  const fallback: GeoPoint = { lat: 22.3364, lng: 103.8438, precision: 'area-fallback', searchQuery: 'Little Sapa Restaurant' }

  it('u ověřeného pinu použije souřadnice', () => {
    expect(mapsUrl(exact)).toContain('query=22.3364,103.8438')
    expect(navigateUrl(exact)).toContain('destination=22.3364,103.8438')
  })

  it('bez ověřeného pinu otevře vyhledání, ne falešný bod', () => {
    const url = mapsUrl(fallback)!
    expect(url).not.toContain('22.3364')
    expect(url).toContain(encodeURIComponent('Little Sapa Restaurant'))
  })

  it('bez jakéhokoli podkladu nevytvoří odkaz', () => {
    expect(mapsUrl(undefined)).toBeNull()
    expect(navigateUrl({ lat: 1, lng: 1, precision: 'area-fallback' })).toBeNull()
  })

  it('rozlišuje důvěryhodný pin od kotvy oblasti', () => {
    expect(hasTrustedPin(exact)).toBe(true)
    expect(hasTrustedPin({ ...exact, precision: 'approximate' })).toBe(true)
    expect(hasTrustedPin({ ...exact, precision: 'area-centroid' })).toBe(false)
    expect(hasTrustedPin(fallback)).toBe(false)
  })

  it('GeoJSON má obrácené pořadí oproti knihovnímu lat/lng', () => {
    expect(toGeoJsonPosition(exact)).toEqual([103.8438, 22.3364])
    expect(fromGeoJsonPosition([103.8438, 22.3364])).toEqual({ lat: 22.3364, lng: 103.8438 })
    // Zpáteční převod nesmí prohodit osy.
    const round = fromGeoJsonPosition(toGeoJsonPosition(exact))
    expect(round.lat).toBe(exact.lat)
    expect(round.lng).toBe(exact.lng)
  })
})
