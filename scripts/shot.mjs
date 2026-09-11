/** Rychlý screenshot jedné obrazovky ve viewportu (ne fullPage). */
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
const BASE = process.env.BASE_URL ?? 'http://localhost:4173/vietnam-complete-guide/'
const hash = process.argv[2] ?? '#/plan'
const out = process.argv[3] ?? 'docs/screenshots/_tmp.png'
const w = Number(process.argv[4] ?? 390)
const h = Number(process.argv[5] ?? 844)
const full = process.argv[6] === 'full'
const browser = await chromium.launch(launchOptions)
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 700, hasTouch: w < 700, locale: 'cs-CZ' })
await page.goto(BASE + hash, { waitUntil: 'networkidle' })
await page.waitForTimeout(350)
await page.screenshot({ path: out, fullPage: full })
const hgt = await page.evaluate(() => document.body.scrollHeight)
console.log(`${out} — výška stránky ${hgt}px`)
await browser.close()
