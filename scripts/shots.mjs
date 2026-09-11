/**
 * Vizuální kontrola: projde definované obrazovky ve třech šířkách,
 * uloží screenshoty a vypíše zjištěné problémy (horizontální overflow,
 * malé dotykové cíle, useknuté texty).
 */
import { chromium } from '@playwright/test'

import { existsSync } from 'node:fs'

/**
 * Chromium: použij předinstalované, pokud na téhle mašině je; jinak nech
 * Playwright sáhnout po svém staženém buildu. Skript tak funguje i mimo
 * prostředí, ve kterém projekt vznikal.
 */
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium'
const chromiumPath =
  process.env.CHROMIUM_PATH ?? (existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined)
const launchOptions = chromiumPath ? { executablePath: chromiumPath } : {}
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/vietnam-complete-guide/'
const OUT = process.env.OUT ?? 'docs/screenshots'
const ONLY = process.argv[2]

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false },
]

const SCREENS = [
  { id: 'plan', hash: '#/plan', full: true },
  { id: 'day-0926', hash: '#/day/2026-09-26', full: true },
  { id: 'item-transfer', hash: '#/item/item-20260926-transfer', full: true },
  { id: 'transport', hash: '#/transport/leg-hagiang-sapa', full: true },
  { id: 'choice-stay', hash: '#/choice/choice-sapa-stay', full: true },
  { id: 'choice-evening', hash: '#/choice/choice-sapa-evening', full: true },
  { id: 'item-coaster', hash: '#/item/item-20260926-coaster', full: true },
  { id: 'place-coaster', hash: '#/place/place-alpine-coaster-sapa', full: true },
  { id: 'service-little-sapa', hash: '#/service/svc-little-sapa', full: true },
  { id: 'map', hash: '#/map', full: true },
  { id: 'guide', hash: '#/guide', full: true },
  { id: 'trip', hash: '#/trip', full: true },
  { id: 'notfound', hash: '#/place/neexistuje', full: false },
]

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch(launchOptions)
const problems = []

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: Number(process.env.DPR ?? 1),
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    locale: 'cs-CZ',
    timezoneId: 'Europe/Prague',
  })
  const page = await ctx.newPage()
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push(String(e)))

  for (const s of SCREENS) {
    if (ONLY && s.id !== ONLY) continue
    await page.goto(BASE + s.hash, { waitUntil: 'networkidle' })
    await page.waitForTimeout(320)

    const diag = await page.evaluate(() => {
      const out = { overflow: 0, clipped: [], smallTargets: [] }
      out.overflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
      const tappable = [...document.querySelectorAll('a,button,[role="button"],input,textarea,select')]
      for (const el of tappable) {
        // SVG prvky mají dotykovou plochu danou stroke-width, ne bounding boxem.
        if (el.ownerSVGElement || el.tagName === 'svg') continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        // Rozšířená dotyková plocha přes ::after se do getBoundingClientRect nepromítne.
        const after = getComputedStyle(el, '::after')
        const expanded = after.content !== 'none' && parseFloat(after.height) >= 40
        if (expanded) continue
        if (r.height < 36 || r.width < 26) {
          out.smallTargets.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)}`)
        }
      }
      for (const el of document.querySelectorAll('*')) {
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX === 'hidden') {
          out.clipped.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`)
        }
      }
      out.smallTargets = [...new Set(out.smallTargets)].slice(0, 8)
      out.clipped = [...new Set(out.clipped)].slice(0, 8)
      return out
    })

    if (diag.overflow > 0) problems.push(`[${vp.name}px ${s.id}] horizontální overflow ${diag.overflow}px`)
    if (diag.clipped.length) problems.push(`[${vp.name}px ${s.id}] useknuté: ${diag.clipped.join(', ')}`)
    if (diag.smallTargets.length) problems.push(`[${vp.name}px ${s.id}] malý cíl: ${diag.smallTargets.join(', ')}`)

    // Screenshot je pro vizuální kontrolu, ne archiv — JPEG a strop výšky,
    // ať repozitář nenese desítky megabajtů obrázků.
    const pageHeight = await page.evaluate(() => document.body.scrollHeight)
    const clip = s.full && pageHeight > 4200 ? { x: 0, y: 0, width: vp.width, height: 4200 } : undefined
    await page.screenshot({
      path: `${OUT}/${s.id}-${vp.name}.jpg`,
      type: 'jpeg',
      quality: 82,
      fullPage: s.full && !clip,
      ...(clip ? { clip } : {}),
    })
  }
  if (consoleErrors.length) problems.push(`[${vp.name}px] konzole: ${[...new Set(consoleErrors)].slice(0, 4).join(' | ')}`)
  await ctx.close()
}
await browser.close()

if (problems.length) {
  console.log('NÁLEZY:')
  for (const p of problems) console.log(' -', p)
} else {
  console.log('Bez nálezů.')
}
