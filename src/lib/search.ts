/**
 * Normalizace pro vyhledávání: bez diakritiky, bez velikosti písmen.
 * Musí fungovat pro češtinu i vietnamštinu — „Hà Giang" se najde jako
 * „ha giang", „Tả Van" jako „ta van", „Hanoj" i „Hanoi".
 *
 * Vietnamské „đ/Đ" NENÍ v Unicode složené z písmene a diakritiky, takže se
 * musí nahradit ručně — NFD ho nerozloží.
 */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/ơ|ờ|ớ|ở|ỡ|ợ/g, 'o')
    .replace(/ư|ừ|ứ|ử|ữ|ự/g, 'u')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Rozdělí dotaz na tokeny; prázdný dotaz vrací prázdné pole. */
export function tokenize(query: string): string[] {
  const n = normalize(query)
  return n ? n.split(' ').filter(Boolean) : []
}

/**
 * Skóre shody. 0 = neshoda.
 * Přesná shoda názvu > začátek slova > výskyt kdekoli.
 */
export function scoreMatch(haystackFields: { text: string; weight: number }[], tokens: string[]): number {
  if (tokens.length === 0) return 0
  const fields = haystackFields.map((f) => ({ n: normalize(f.text), w: f.weight }))
  let total = 0
  for (const token of tokens) {
    let best = 0
    for (const f of fields) {
      if (!f.n) continue
      if (f.n === token) best = Math.max(best, f.w * 3)
      else if (f.n.startsWith(token + ' ') || f.n === token) best = Math.max(best, f.w * 2.5)
      else if (new RegExp(`(^| )${escapeRe(token)}`).test(f.n)) best = Math.max(best, f.w * 2)
      else if (f.n.includes(token)) best = Math.max(best, f.w)
    }
    if (best === 0) return 0 // každý token musí někde sedět
    total += best
  }
  return total
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
