import { describe, expect, it } from 'vitest'
import { EMPTY_STATE, buildExport, importState, migrate, SCHEMA_VERSION } from '@/lib/storage'
import type { LocalUserState } from '@/lib/storage'

const base: LocalUserState = {
  ...EMPTY_STATE,
  favourites: ['place-ta-van'],
  notes: { 'day:2026-09-26': 'vlastní poznámka' },
  picks: { 'choice-sapa-stay': 'svc-sapa-centre-hotel' },
  bookings: { 'bk-loop': 'requested' },
}

describe('migrace schématu', () => {
  it('z prázdna udělá prázdný stav', () => {
    expect(migrate(null).favourites).toEqual([])
    expect(migrate(undefined).notes).toEqual({})
    expect(migrate('nesmysl').picks).toEqual({})
  })

  it('zahodí poškozené hodnoty místo pádu', () => {
    const out = migrate({ schemaVersion: 1, favourites: ['ok', 42], notes: { a: 5 }, bookings: { x: 'nesmysl' } })
    expect(out.favourites).toEqual(['ok'])
    expect(out.notes).toEqual({})
    expect(out.bookings).toEqual({})
  })

  it('data z novější verze nepřepíše naslepo', () => {
    const out = migrate({ schemaVersion: 99, favourites: ['a'], notes: { b: 'c' } })
    expect(out.schemaVersion).toBe(SCHEMA_VERSION)
    expect(out.favourites).toEqual(['a'])
  })
})

describe('export a import', () => {
  it('export nese jméno aplikace a verzi schématu', () => {
    const env = buildExport(base)
    expect(env.app).toBe('vietnam-complete-guide')
    expect(env.schemaVersion).toBe(SCHEMA_VERSION)
    expect(env.state.favourites).toEqual(['place-ta-van'])
  })

  it('odmítne soubor z jiné aplikace', () => {
    const { report, state } = importState(base, { app: 'jina-appka', schemaVersion: 1, state: EMPTY_STATE }, false)
    expect(report.ok).toBe(false)
    expect(report.error).toMatch(/jiné aplikaci/)
    expect(state).toBe(base)
  })

  it('odmítne novější schéma, než umí přečíst', () => {
    const { report } = importState(base, { app: 'vietnam-complete-guide', schemaVersion: 99, state: EMPTY_STATE }, false)
    expect(report.ok).toBe(false)
    expect(report.error).toMatch(/novější verze/)
  })

  it('odmítne nesmyslný obsah', () => {
    expect(importState(base, 'nic', false).report.ok).toBe(false)
    expect(importState(base, { app: 'vietnam-complete-guide' }, false).report.ok).toBe(false)
  })

  it('slučuje a hlásí konflikty, výchozí je nepřepisovat', () => {
    const incoming = buildExport({
      ...EMPTY_STATE,
      favourites: ['place-lao-chai'],
      notes: { 'day:2026-09-26': 'jiná poznámka', 'day:2026-09-27': 'nová' },
      bookings: { 'bk-loop': 'booked' },
    })
    const { state, report } = importState(base, incoming, false)
    expect(report.ok).toBe(true)
    expect(state.favourites.sort()).toEqual(['place-lao-chai', 'place-ta-van'])
    expect(state.notes['day:2026-09-26']).toBe('vlastní poznámka')
    expect(state.notes['day:2026-09-27']).toBe('nová')
    expect(state.bookings['bk-loop']).toBe('requested')
    expect(report.conflicts.length).toBe(2)
  })

  it('s preferImported přepíše konfliktní hodnoty', () => {
    const incoming = buildExport({ ...EMPTY_STATE, notes: { 'day:2026-09-26': 'jiná' } })
    const { state } = importState(base, incoming, true)
    expect(state.notes['day:2026-09-26']).toBe('jiná')
  })

  it('import nikdy nepřetáhne cizí klíče do našeho stavu', () => {
    const incoming = { app: 'vietnam-complete-guide', schemaVersion: 1, state: { ...EMPTY_STATE, b0: true, b1: false } }
    const { state } = importState(EMPTY_STATE, incoming, false)
    expect(Object.keys(state).sort()).toEqual(['bookings', 'favourites', 'notes', 'picks', 'schemaVersion', 'updatedAt'])
  })
})
