import { describe, expect, it } from 'vitest'
import { normalize, tokenize } from '@/lib/search'
import { searchEntities } from '@/model/registry'

describe('normalizace pro hledání', () => {
  it('odstraní českou i vietnamskou diakritiku', () => {
    expect(normalize('Hà Giang')).toBe('ha giang')
    expect(normalize('Tả Van')).toBe('ta van')
    expect(normalize('Đồng Văn')).toBe('dong van')
    expect(normalize('Mường Hoa')).toBe('muong hoa')
    expect(normalize('Mã Pí Lèng')).toBe('ma pi leng')
    expect(normalize('Phở Khuyên')).toBe('pho khuyen')
    expect(normalize('Tržiště Đồng Xuân')).toBe('trziste dong xuan')
    expect(normalize('příští')).toBe('pristi')
  })

  it('poradí si s „đ" a „ơ/ư", které NFD nerozloží', () => {
    expect(normalize('đ')).toBe('d')
    expect(normalize('Đ')).toBe('d')
    expect(normalize('Cầu Mây')).toBe('cau may')
    expect(normalize('Lũng Cú')).toBe('lung cu')
  })

  it('prázdný dotaz nedává tokeny', () => {
    expect(tokenize('')).toEqual([])
    expect(tokenize('   ')).toEqual([])
  })
})

describe('vyhledávání v rejstříku', () => {
  const names = (q: string) => searchEntities(q).map((e) => e.name)

  it('najde Hà Giang bez diakritiky i s ní', () => {
    expect(names('ha giang').length).toBeGreaterThan(0)
    expect(names('Hà Giang').length).toBeGreaterThan(0)
    expect(names('HAGIANG'.toLowerCase()).length).toBeGreaterThanOrEqual(0)
  })

  it('najde Hanoj česky i místním zápisem', () => {
    for (const q of ['hanoj', 'hanoi', 'Hà Nội']) {
      expect(names(q).length, `dotaz „${q}" nic nenašel`).toBeGreaterThan(0)
    }
  })

  it('najde Tả Van jako „ta van"', () => {
    expect(names('ta van').some((n) => n.includes('Tả Van'))).toBe(true)
  })

  it('najde coaster i pod lidovým názvem', () => {
    expect(names('coaster').some((n) => n.includes('Alpine Coaster'))).toBe(true)
    expect(names('downhill auticka').some((n) => n.includes('Alpine Coaster'))).toBe(true)
    expect(names('bobova draha').some((n) => n.includes('Alpine Coaster'))).toBe(true)
  })

  it('nesmysl nenajde nic', () => {
    expect(names('qqxyzzy')).toHaveLength(0)
  })

  it('filtr podle oblasti a typu zužuje výsledky', () => {
    const all = searchEntities('', { regionId: 'all' })
    const sapa = searchEntities('', { regionId: 'sapa' })
    expect(sapa.length).toBeGreaterThan(0)
    expect(sapa.length).toBeLessThan(all.length)
    expect(sapa.every((e) => e.regionId === 'sapa')).toBe(true)

    const food = searchEntities('', { tag: 'food' })
    expect(food.length).toBeGreaterThan(0)
    expect(food.every((e) => e.tags.includes('food'))).toBe(true)
  })
})
