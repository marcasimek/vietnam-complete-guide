import { describe, expect, it } from 'vitest'
import { daysBetween, tripPosition, vietnamToday } from '@/lib/time'

describe('„dnes" se řídí vietnamským datem', () => {
  it('v Praze je ještě večer 25. 9., ve Vietnamu už 26. 9.', () => {
    // 25. 9. 2026 23:00 v Praze = 26. 9. 04:00 v Hanoji
    const praha2300 = new Date('2026-09-25T21:00:00Z')
    expect(vietnamToday(praha2300)).toBe('2026-09-26')
  })

  it('před cestou počítá dny do odletu', () => {
    const pos = tripPosition(new Date('2026-09-11T10:00:00Z'))
    expect(pos.phase).toBe('before')
    if (pos.phase === 'before') {
      expect(pos.daysUntil).toBe(8)
      expect(pos.focusDate).toBe('2026-09-19')
    }
  })

  it('během cesty ukáže správný den', () => {
    const pos = tripPosition(new Date('2026-09-26T03:00:00Z'))
    expect(pos.phase).toBe('during')
    expect(pos.focusDate).toBe('2026-09-26')
  })

  it('po cestě se přepne na poslední den', () => {
    const pos = tripPosition(new Date('2026-11-01T10:00:00Z'))
    expect(pos.phase).toBe('after')
    expect(pos.focusDate).toBe('2026-10-06')
  })

  it('počítá rozdíl dnů i přes přelom měsíce', () => {
    expect(daysBetween('2026-09-30', '2026-10-01')).toBe(1)
    expect(daysBetween('2026-09-19', '2026-10-06')).toBe(17)
  })
})
